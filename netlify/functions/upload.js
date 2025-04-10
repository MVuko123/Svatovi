const nodemailer = require('nodemailer');
const formidable = require('formidable');
const fs = require('fs');

exports.handler = async function(event, context) {
  const form = new formidable.IncomingForm();
  
  // Parse the uploaded files
  return new Promise((resolve, reject) => {
    form.parse(event.body, (err, fields, files) => {
      if (err) {
        reject({ statusCode: 500, body: 'Error parsing form' });
      }
      
      // Create a nodemailer transporter for Gmail (replace with your email details)
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'svatovi.juraj@gmail.com',
          pass: 'A12345678b#' // Use environment variables for better security
        }
      });

      const mailOptions = {
        from: 'svatovi.juraj@gmail.com',
        to: 'svatovi.juraj@gmail.com',
        subject: 'Wedding File Uploads',
        text: 'Please find the attached files.',
        attachments: Object.keys(files).map(key => ({
          filename: files[key].name,
          path: files[key].path
        }))
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          reject({ statusCode: 500, body: 'Error sending email' });
        } else {
          resolve({ statusCode: 200, body: 'Files uploaded successfully!' });
        }
      });
    });
  });
};
