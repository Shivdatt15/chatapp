import axios from "axios";

export const generateGeminiReply = async (prompt) => {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: prompt }] }]
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini error:", error.message);
    return "I'm sorry, I couldn't respond right now.";
  }
};
