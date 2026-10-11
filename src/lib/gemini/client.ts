import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';

export const isGeminiConfigured = Boolean(apiKey);

export const genAI = isGeminiConfigured ? new GoogleGenerativeAI(apiKey) : null;

export function getGeminiModel(modelName = 'gemini-1.5-flash') {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: modelName });
}
