const nodemailer = require('nodemailer');
const formidable = require('formidable');
const fs = require('fs');

exports.handler = async (event, context) => {
  // Ensure the HTTP method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Only POST requests are accepted" }),
    };
  }

  // Create a new formidable IncomingForm instance
  const form = new formidable.IncomingForm();

  // Return a Promise to handle form parsing
  const parseFormData = new Promise((resolve, reject) => {
    form.parse(event, (err, fields, files) => {
      if (err) {
        reject(err);
      } else {
        resolve({ fields, files });
      }
    });
  });

  try {
    const { fields, files } = await parseFormData;

    // Ensure files were uploaded
    if (!files || Object.keys(files).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No files uploaded." }),
      };
    }

    // Create a transporter to send the email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER, // Set your Gmail user here
        pass: process.env.EMAIL_PASS, // Set your Gmail password here
      },
    });

    // Prepare the attachments array for email
    const attachments = Object.keys(files).map((fileKey) => ({
      filename: files[fileKey].originalFilename,
      path: files[fileKey].filepath,  // Path where the file is saved
    }));

    // Set up the email options
    const mailOptions = {
      from: 'svatovi.juraj@gmail.com', // Sender's email
      to: 'svatovi.juraj@gmail.com',   // Recipient's email
      subject: 'Wedding Picture Uploads',
      text: 'Please find the attached pictures.',
      attachments: attachments,
    };

    // Send the email with the uploaded pictures
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
