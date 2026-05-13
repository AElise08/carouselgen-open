import { generateCarouselScript } from "../src/services/geminiService.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Gemini API key is not configured." });
  }

  const { text, designPrompt = "" } = req.body || {};
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Text is required." });
  }

  try {
    const slides = await generateCarouselScript(text, String(designPrompt), apiKey);
    return res.status(200).json({ slides });
  } catch (error) {
    console.error("Carousel generation failed:", error);
    const message = error instanceof Error ? error.message : "Generation failed.";
    return res.status(500).json({ error: message });
  }
}
