const fetch = require("node-fetch");

exports.handler = async (event) => {
  // Provjera da zahtjev koristi POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  // Provjera da tijelo zahtjeva postoji
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Bad Request: No file provided" })
    };
  }

  const cloudName = "dsc3azbea";
  const uploadPreset = "YOUR_UPLOAD_PRESET";

  try {
    // Kreiranje FormData za slanje slike
    const formData = new FormData();
    formData.append("file", event.body);
    formData.append("upload_preset", uploadPreset);

    // Slanje podataka na Cloudinary
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data"
      },
      body: formData
    });

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : 500,
      body: JSON.stringify({ message: response.ok ? "Slika uspješno poslana!" : "Greška pri slanju slike." })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
