const nodemailer = require('nodemailer');

exports.handler = async function(event, context) {
  // Check if the method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Only POST requests are accepted' }),
    };
  }

  // Access the multipart form data
  const formData = JSON.parse(event.body); // You should access the form data here
  
  // Ensure files were uploaded
  if (!formData || !formData.files) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "No files uploaded." }),
    };
  }

  const files = formData.files;

  // Create the transporter to send the email
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const attachments = Object.keys(files).map(file => ({
    filename: files[file].name,
    path: files[file].path,
  }));

  const mailOptions = {
    from: 'svatovi.juraj@gmail.com',
    to: 'svatovi.juraj@gmail.com',
    subject: 'Wedding File Uploads',
    text: 'Please find the attached files.',
    attachments: attachments,
  };

  try {
    // Send the email
    await transporter.sendMail(mailOptions);
    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Files uploaded and email sent!" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Error sending email." }),
    };
  }
};
