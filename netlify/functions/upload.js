const nodemailer = require('nodemailer');
const fs = require('fs');

exports.handler = async function(event, context) {
  const { files } = event.body;
  
  // Check if files are attached
  if (!files) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No files uploaded." })
    };
  }

  // Create the transporter to send the email (using environment variables for security)
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,  // Use your email stored in environment variables
      pass: process.env.EMAIL_PASS   // Use your email password stored in environment variables
    }
  });

  const attachments = Object.keys(files).map(file => ({
    filename: files[file].name,
    path: files[file].path
  }));

  const mailOptions = {
    from: 'svatovi.juraj@gmail.com',  // Sender's email (your email)
    to: 'svatovi.juraj@gmail.com',    // Recipient's email (can be your own email or someone else)
    subject: 'Wedding File Uploads',
    text: 'Please find the attached files.',
    attachments: attachments
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Files uploaded and email sent!" })
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error sending email." })
    };
  }
};
