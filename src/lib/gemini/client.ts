import { GoogleGenerativeAI } from '@google/generative-ai';

const rawApiKey = (process.env.GEMINI_API_KEY || '').trim();
const isPlaceholderKey =
  !rawApiKey ||
  rawApiKey.toLowerCase().includes('yourgemini') ||
  rawApiKey.toLowerCase().includes('your_') ||
  rawApiKey.toLowerCase().includes('placeholder') ||
  rawApiKey.length < 20;

export const isGeminiConfigured = !isPlaceholderKey;

export const genAI = isGeminiConfigured ? new GoogleGenerativeAI(rawApiKey) : null;

export function getGeminiModel(modelName = 'gemini-1.5-flash') {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: modelName });
}
