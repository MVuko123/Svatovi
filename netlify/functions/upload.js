const fetch = require("node-fetch");

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const cloudName = "dsc3azbea"; // Dodao tvoj Cloudinary cloud name
  const apiKey = "914272864315586"; // Dodao tvoj API ključ
  const uploadPreset = "YOUR_UPLOAD_PRESET"; // Ovo trebaš kreirati u Cloudinary Dashboardu

  const formData = new FormData();
  formData.append("file", event.body);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (response.ok) {
      return {
        statusCode: 200,
        body: JSON.stringify({ url: data.secure_url })
      };
    } else {
      return { statusCode: 500, body: JSON.stringify({ error: "Greška pri slanju slika." }) };
    }
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
