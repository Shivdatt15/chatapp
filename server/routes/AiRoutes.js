import express from "express";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();
const router = express.Router();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System-level pre-prompt to guide Gemini behavior
const PRE_PROMPT = {
  role: "system",
  parts: [
    {
      text: `You are a helpful and concise assistant. Always respond in under 50 words. Do not say you are an AI. Keep replies friendly, clear, and brief.`,
    },
  ],
};

// Strict 50-word limiter (cleans up input & punctuation)
function trimToMaxWordsWithPunctuation(text, maxWords = 50) {
  if (!text) return "";

  const words = text
    .replace(/[*_~`]+/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .split(/\s+/);

  return words.slice(0, maxWords).join(" ").replace(/\s+([.,!?;:])/g, "$1").trim();
}

router.post("/reply", async (req, res) => {
  const { message, history = [], userName = "User" } = req.body;

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    // Build structured conversation history for Gemini
    const structuredHistory = [
      PRE_PROMPT,
      ...history.slice(-5).map((item) => ({
        role: item.role === "user" ? "user" : "model",
        parts: [{ text: item.content }],
      })),
      {
        role: "user",
        parts: [{ text: message }],
      },
    ];

    // Generate reply from Gemini
    const result = await model.generateContent({
      contents: structuredHistory,
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 70, // Limit to ~50 words
      },
    });

    const response = await result.response;
    let fullReply = response.text().trim();

    // Apply strict 50-word limit
    let finalReply = trimToMaxWordsWithPunctuation(fullReply, 50);

    // Safety: re-check and re-trim if needed
    const wordCount = finalReply.split(/\s+/).length;
    if (wordCount > 50) {
      finalReply = finalReply.split(/\s+/).slice(0, 50).join(" ");
    }

    console.log("Final Gemini Reply:", finalReply);
    return res.status(200).json({ reply: finalReply });
  } catch (error) {
    console.error("Gemini error:", error.message);
    return res.status(500).json({
      reply: "I'm sorry, I couldn't respond right now.",
    });
  }
});

export default router;
