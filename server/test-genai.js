const { GoogleGenAI } = require('@google/genai');
console.log('GoogleGenAI Type:', typeof GoogleGenAI);
try {
  const genAI = new GoogleGenAI('test-key');
  console.log('genAI Instance Methods:', Object.keys(Object.getPrototypeOf(genAI)));
  console.log('getGenerativeModel exists:', typeof genAI.getGenerativeModel);
} catch (e) {
  console.log('Error during instantiation:', e.message);
}
