const nodemailer = require('nodemailer');
const formidable = require('formidable');

exports.handler = async function(event, context) {
  // Return an error if the HTTP method is not POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Only POST requests are accepted" }),
    };
  }

  // Create a new formidable IncomingForm instance
  const form = new formidable.IncomingForm();

  // Return a promise that resolves when the form parsing is complete
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

    // Check if files were uploaded
    if (!files || Object.keys(files).length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "No files uploaded." }),
      };
    }

    // Create the transporter to send the email
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Prepare the file attachments (images)
    const attachments = Object.keys(files).map((fileKey) => ({
      filename: files[fileKey].originalFilename,
      path: files[fileKey].filepath,
    }));

    // Create the email options
    const mailOptions = {
      from: 'svatovi.juraj@gmail.com',
      to: 'svatovi.juraj@gmail.com',  // Change to your recipient email if necessary
      subject: 'Wedding Picture Uploads',
      text: 'Please find the attached pictures.',
      attachments: attachments,
    };

    // Send the email with the uploaded files
    await transporter.sendMail(mailOptions);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Pictures uploaded and email sent!" }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: `Error: ${error.message}` }),
    };
  }
};
