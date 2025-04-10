const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" })
    };
  }

  // Provjera je li tijelo zahtjeva prazno
  if (!event.body) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Bad Request: No file provided" })
    };
  }

  const cloudName = "dsc3azbea";
  const uploadPreset = "YOUR_UPLOAD_PRESET";

  try {
    const fileBuffer = Buffer.from(event.body, "base64"); // Pretvaramo tijelo zahtjeva u binarne podatke

    const formData = new FormData();
    formData.append("file", fileBuffer, "image.jpg"); // Dodajemo ime datoteke
    formData.append("upload_preset", uploadPreset);

    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    return {
      statusCode: response.ok ? 200 : 500,
      body: JSON.stringify({ message: response.ok ? "Slika uspješno poslana!" : "Greška pri slanju slike.", url: data.secure_url })
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
