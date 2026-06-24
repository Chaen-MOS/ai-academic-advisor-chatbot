import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function generateEmbedding(text) {
  const response = await ai.models.embedContent({
    model: "gemini-embedding-2",
    contents: text,
  });

  return response.embeddings[0].values;
}