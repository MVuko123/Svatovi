const nodemailer = require('nodemailer');
const formidable = require('formidable');
const { parse } = require('querystring'); // for parsing form data

exports.handler = async function(event, context) {
  // Ensure that the method is POST
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Only POST requests are accepted" }),
    };
  }

  // Create a new form to parse incoming data
  const form = new formidable.IncomingForm();

  // Promise that handles the parsing
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

    // Prepare the image attachments
    const attachments = Object.keys(files).map((fileKey) => ({
      filename: files[fileKey].originalFilename,
      path: files[fileKey].filepath,
    }));

    // Create the email options
    const mailOptions = {
      from: 'svatovi.juraj@gmail.com',
      to: 'svatovi.juraj@gmail.com',
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
