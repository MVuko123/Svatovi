import fetch from "node-fetch";

export async function handler(event) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const cloudName = "dsc3azbea";
  const uploadPreset = "YOUR_UPLOAD_PRESET";

  // Koristimo Buffer umjesto fetch-blob za kompatibilnost
  const fileBuffer = Buffer.from(event.body);

  const formData = new FormData();
  formData.append("file", fileBuffer);
  formData.append("upload_preset", uploadPreset);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
      method: "POST",
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
}
