import "dotenv/config";
import OpenAI from "openai";

// Check API key
if (!process.env.GROQ_API_KEY) {
  throw new Error("GROQ_API_KEY is missing in environment variables");
}

// Create Groq client (using OpenAI SDK with Groq base URL)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export default groq;