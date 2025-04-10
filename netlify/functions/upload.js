const AWS = require('aws-sdk');
const nodemailer = require('nodemailer');
const Busboy = require('busboy');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: "Only POST requests allowed" }) };
  }

  try {
    const busboy = Busboy({ headers: event.headers });
    const fileData = [];

    return new Promise((resolve, reject) => {
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        let buffer = [];
        file.on('data', (data) => buffer.push(data));
        file.on('end', () => fileData.push({ filename, buffer: Buffer.concat(buffer), mimetype }));
      });

      busboy.on('finish', async () => {
        if (fileData.length === 0) {
          return resolve({ statusCode: 400, body: JSON.stringify({ error: "No files uploaded." }) });
        }

        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        const attachments = fileData.map((file) => ({
          filename: file.filename,
          content: file.buffer,
          contentType: file.mimetype,
        }));

        const mailOptions = {
          from: 'svatovi.juraj@gmail.com',
          to: 'svatovi.juraj@gmail.com',
          subject: 'Wedding Picture Uploads',
          text: 'Please find the attached pictures.',
          attachments,
        };

        await transporter.sendMail(mailOptions);
        resolve({ statusCode: 200, body: JSON.stringify({ message: "Pictures uploaded and email sent!" }) });
      });

      busboy.end(Buffer.from(event.body, 'base64'));
    });
  } catch (error) {
    console.error("Error:", error);
    return { statusCode: 500, body: JSON.stringify({ error: `Error: ${error.message}` }) };
  }
};
