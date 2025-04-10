const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Bad Request: No file provided" })
    };
  }

  const cloudName = "dsc3azbea";
  const uploadPreset = "ml_default"; // Zamijeni s točnim upload presetom!

  try {
    // Pretvaramo body u base64 string
    const fileData = event.body;

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        file: `data:image/jpeg;base64,${fileData}`, // Slanje base64 stringa
        upload_preset: uploadPreset
      })
    });

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : 500,
      body: JSON.stringify({ 
        message: response.ok ? "Slika uspješno poslana!" : "Greška pri slanju slike.",
        url: data.secure_url 
      })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
