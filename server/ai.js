const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const apiKey = process.env.GEMINI_API_KEY || "AI_KEY";
const genAI = new GoogleGenerativeAI(apiKey);

// Optimized AI Multi-Model Fallback Logic
async function getAIResponse(prompt) {
    const models = ["gemini-1.5-flash", "gemini-2.0-flash-lite", "gemini-2.5-flash"];
    let lastError = null;

    for (const modelName of models) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(prompt);
            return result.response.text();
        } catch (err) {
            console.error(`AI Model ${modelName} issue:`, err.message);
            lastError = err;
            if (err.message.includes("429")) continue; // Try next move on rate limit
        }
    }
    throw lastError || new Error("All AI models are currently overwhelmed.");
}

module.exports = {
    getAIResponse,
    genAI
};
