
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

export function createGeminiModel() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY não configurada. Verifique o arquivo .env."
    );
  }



  return new ChatGoogleGenerativeAI({
    model: "gemini-3.8-flash",
    apiKey,
    temperature: 0,
    maxRetries: 0,
  });

}
