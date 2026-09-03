const { GoogleGenAI } = require('@google/genai');
const axios = require('axios');
const config = require('../config/env');

let aiClient = null;
if (config.geminiApiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey: config.geminiApiKey });
  } catch (err) {
    console.warn('⚠️ Gagal inisialisasi Google GenAI SDK:', err.message);
  }
}

/**
 * Menghasilkan draft deskripsi produk coffee shop menggunakan Gemini API
 * @param {string} productName
 * @param {string} categoryName
 */
const generateMenuDescription = async (productName, categoryName = 'Coffee') => {
  if (!productName) {
    throw new Error('Nama produk wajib diisi untuk menghasilkan deskripsi.');
  }

  // Jika API Key belum diatur, sediakan deskripsi template coffee shop berkualitas tinggi
  if (!config.geminiApiKey) {
    console.warn('⚠️ GEMINI_API_KEY belum diatur. Menggunakan deskripsi fallback template.');
    return `Nikmati kelezatan istimewa dari ${productName}. Diramu dari bahan-bahan pilihan berkualitas tinggi dalam kategori ${categoryName}, menghadirkan cita rasa yang seimbang, aroma yang memikat, dan kesegaran sempurna untuk menemani hari Anda.`;
  }

  const prompt = `Anda adalah barista ahli dan copywriter menu profesional untuk "Kopi Senja", kedai kopi modern Indonesia.
Tugas Anda: Buat 1 paragraf singkat (2-3 kalimat) deskripsi produk yang menggugah selera, elegan, dan estetik untuk katalog menu.

Nama Menu: "${productName}"
Kategori: "${categoryName}"

Ketentuan:
- Jelaskan aroma, karakter rasa unik, dan kenikmatan minuman/makanan ini.
- Gunakan bahasa Indonesia yang ramah, modern, dan memikat.
- Berikan teks deskripsi murni tanpa judul, tanpa tanda kutip di awal/akhir.`;

  // Coba model Gemini 3.5 / 3.6 Flash
  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.6-flash', 'gemini-3.5-flash', 'gemini-3.7-flash'];

  for (const modelName of candidateModels) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${config.geminiApiKey}`;
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 200,
          },
        },
        { timeout: 10000 }
      );

      const generatedText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText && generatedText.trim()) {
        return generatedText.trim();
      }
    } catch (err) {
      console.warn(`Gagal generate dengan model ${modelName}:`, err.response?.data?.error?.message || err.message);
    }
  }

  // Fallback cadangan jika seluruh model timeout
  return `Nikmati perpaduan rasa istimewa dari ${productName}. Diracik dengan bahan pilihan berkualitas tinggi khas Kopi Senja untuk memberikan cita rasa yang kaya dan menyegarkan.`;
};

module.exports = {
  generateMenuDescription,
};
