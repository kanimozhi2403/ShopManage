require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function testAll() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const models = [
    "gemini-1.5-flash",
    "gemini-1.5-flash-8b",
    "gemini-2.0-flash",
    "gemini-flash-latest"
  ];

  for (const m of models) {
    try {
      console.log(`Testing ${m}...`);
      const model = genAI.getGenerativeModel({ model: m });
      const result = await model.generateContent("Say 'OK'");
      console.log(`✅ ${m} worked! Response: ${result.response.text()}`);
      process.exit(0); // Stop at first success
    } catch (e) {
      console.log(`❌ ${m} failed: ${e.message}`);
    }
  }
}

testAll();
