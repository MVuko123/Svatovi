const nodemailer = require('nodemailer');
const formidable = require('formidable');

exports.handler = async function(event, context) {
  // Create a new promise to handle the form data asynchronously
  const form = new formidable.IncomingForm();

  // The promise will resolve with the form data when it's finished parsing
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
      to: 'svatovi.juraj@gmail.com', // or another recipient email
      subject: 'Wedding Picture Uploads',
      text: 'Please find the attached pictures.',
      attachments: attachments,
    };

    // Send the email with the uploaded images
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
