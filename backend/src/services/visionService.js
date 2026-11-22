
import Groq from "groq-sdk";
import "dotenv/config";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Analyze an uploaded image using Groq Vision
export const analyzeImage = async (image, userPrompt = "") => {
  try {
    const base64Image = image.buffer.toString("base64");

    const imageUrl = `data:${image.mimetype};base64,${base64Image}`;

    const response = await groq.chat.completions.create({
      model:
        process.env.GROQ_VISION_MODEL || "qwen/qwen3.8-27b",

      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text:
                userPrompt ||
                "Describe this image clearly and explain its important details.",
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],

      max_completion_tokens: 1024,
    });

    return response.choices[0].message.content;

  } catch (error) {
    console.error("Image Analysis Error:", error);

    throw new Error("Unable to analyze the uploaded image.");
  }
};
