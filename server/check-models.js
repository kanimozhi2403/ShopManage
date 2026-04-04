require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function listModels() {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Note: listModels is not on the genAI instance in some versions, 
    // it's a global fetch or on a specific sub-module.
    // In @google/generative-ai, we can try to get them via a specific endpoint call or just try a few names.
    
    console.log("Checking model access for key:", process.env.GEMINI_API_KEY.substring(0, 10) + "...");
    
    const modelsToTry = [
      "gemini-1.5-flash",
      "gemini-1.5-flash-8b",
      "gemini-1.5-pro",
      "gemini-pro",
      "gemini-pro-vision"
    ];

    for (const m of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        // Just a simple prompt to see if it responds
        const result = await model.generateContent("test");
        console.log(`✅ Success with model: ${m}`);
      } catch (e) {
        console.log(`❌ Failed with model: ${m} - ${e.message}`);
      }
    }
  } catch (err) {
    console.error("General Error:", err.message);
  }
}

listModels();
