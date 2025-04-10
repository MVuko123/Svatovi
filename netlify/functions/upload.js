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
  
  // Send the files via email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'youremail@example.com',
      pass: 'yourpassword' // Use environment variables for security
    }
  });

  const attachments = Object.keys(files).map(file => ({
    filename: files[file].name,
    path: files[file].path
  }));

  const mailOptions = {
    from: 'youremail@example.com',
    to: 'youremail@example.com',
    subject: 'Wedding File Uploads',
    text: 'Please find the attached files.',
    attachments: attachments
  };

  try {
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
