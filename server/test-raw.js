require('dotenv').config();
const https = require('https');

const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

const data = JSON.stringify({
  contents: [{ parts: [{ text: "Hi" }] }]
});

const options = {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

console.log("Testing raw HTTPS request to:", url.split('=')[0] + "=REDACTED");

const req = https.request(url, options, (res) => {
  console.log(`Status Code: ${res.statusCode}`);
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => {
    console.log("Raw Response:", body);
  });
});

req.on('error', (error) => {
  console.error("Request Error:", error);
});

req.write(data);
req.end();
