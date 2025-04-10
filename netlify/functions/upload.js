const nodemailer = require('nodemailer');
const formidable = require('formidable');
const fs = require('fs');

exports.handler = async (event) => {
  // Ensure the request is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Only POST requests are accepted" }),
    };
  }

  try {
    // Convert event body from Base64 to buffer
    const bodyBuffer = Buffer.from(event.body, "base64");

    // Create a new formidable IncomingForm instance
    const form = new formidable.IncomingForm();

    // Manually parse the form data using formidable
    const parseFormData = new Promise((resolve, reject) => {
      form.parse({ headers: event.headers, body: bodyBuffer }, (err, fields, files) => {
        if (err) {
          reject(err);
        } else {
          resolve({ fields, files });
        }
      });
    });

    const { fields, files } = await parseFormData;

    // Ensure files were uploaded
    if (!files || Object.keys(files).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No files uploaded." }),
      };
    }

    // Create a transporter for sending emails
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare the attachments array for email
    const attachments = Object.keys(files).map((fileKey) => ({
      filename: files[fileKey].originalFilename,
      path: files[fileKey].filepath,
    }));

    // Set up the email options
    const mailOptions = {
      from: 'svatovi.juraj@gmail.com',
      to: 'svatovi.juraj@gmail.com',
      subject: 'Wedding Picture Uploads',
      text: 'Please find the attached pictures.',
      attachments,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Pictures uploaded and email sent!" }),
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error: ${error.message}` }),
    };
  }
};
