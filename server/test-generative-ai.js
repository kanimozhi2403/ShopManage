const genAIModule = require('@google/generative-ai');
console.log('Module keys:', Object.keys(genAIModule));
console.log('GoogleGenAI type:', typeof genAIModule.GoogleGenAI);
try {
  const genAI = new genAIModule.GoogleGenAI('test');
  console.log('Success creating instance');
} catch (e) {
  console.log('Error:', e.message);
}
