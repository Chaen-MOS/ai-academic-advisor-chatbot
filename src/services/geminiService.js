import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

async function getGeminiResponse(prompt) {
  for (let attempt = 1; attempt <= 3; attempt++) {

    try {

      const response = await ai.models.generateContent({
        model: "gemini-3.6-flash",
        contents: prompt,
      });

      return response.text;

    } catch (error) {

      if (error.status === 503) {

        console.log(
          `Gemini busy. Retry ${attempt}/3...`
        );

        await new Promise(resolve =>
          setTimeout(resolve, 3000)
        );

        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Gemini unavailable after retries."
  );
}

export { getGeminiResponse };