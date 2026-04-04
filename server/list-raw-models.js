require('dotenv').config();
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

console.log("Listing all available models for this key...");

https.get(url, (res) => {
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    try {
      const data = JSON.parse(body);
      if (data.models) {
        console.log("✅ Models found:");
        data.models.forEach(m => console.log(` - ${m.name}`));
      } else {
        console.log("❌ No models object found. Response:", body);
      }
    } catch (e) {
      console.log("❌ Parse Error. Raw Response:", body);
    }
  });
}).on('error', (e) => {
  console.error("Request Error:", e);
});
