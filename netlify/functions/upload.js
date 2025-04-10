const busboy = require('busboy');
const fs = require('fs');
const path = require('path');
const nodemailer = require('nodemailer');
const sendGridMail = require('@sendgrid/mail');

sendGridMail.setApiKey('YOUR_SENDGRID_API_KEY');  // Postavi svoju SendGrid API ključ

const emailTo = 'primatelj@example.com'; // Email na koji šalješ

// Funkcija za slanje emaila
const sendEmailWithAttachments = async (attachments) => {
    const msg = {
        to: emailTo,
        from: 'svatovi.juraj@gmail.com', // Tvoj email iz kojeg šalješ
        subject: 'Slike od korisnika',
        text: 'Ovdje su slike koje je korisnik poslao.',
        attachments: attachments,
    };

    try {
        await sendGridMail.send(msg);
        console.log('Email poslan');
    } catch (error) {
        console.error('Greška prilikom slanja emaila: ', error);
    }
};

module.exports.handler = async (event, context) => {
    return new Promise((resolve, reject) => {
        const bb = busboy({ headers: event.headers });
        let attachments = [];
        
        bb.on('file', (fieldname, file, filename, encoding, mimetype) => {
            const filePath = path.join('/tmp', filename); // Spremi u privremeni direktorij
            const writeStream = fs.createWriteStream(filePath);

            file.pipe(writeStream);

            writeStream.on('close', () => {
                console.log(`Slika ${filename} je spremljena`);

                // Spremi sliku kao privitak za slanje
                attachments.push({
                    filename: filename,
                    type: mimetype,
                    content: fs.readFileSync(filePath).toString('base64'),
                    disposition: 'attachment',
                });
            });
        });

        bb.on('finish', async () => {
            if (attachments.length > 0) {
                // Ako postoje privitci (slike), pošaljemo email
                await sendEmailWithAttachments(attachments);
                resolve({
                    statusCode: 200,
                    body: JSON.stringify({ message: 'Slike su poslane putem emaila!' }),
                });
            } else {
                resolve({
                    statusCode: 400,
                    body: JSON.stringify({ error: 'Nema slika za slanje!' }),
                });
            }
        });

        bb.on('error', (error) => {
            console.error('Greška u uploadu: ', error);
            reject({
                statusCode: 500,
                body: JSON.stringify({ error: 'Greška u obradi datoteka.' }),
            });
        });

        // Početak obrade zahtjeva
        bb.end(event.body);
    });
};
