import { generateSlideImage } from "../src/services/geminiService.js";

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const imageUrl = await generateSlideImage(prompt);
    return res.status(200).json({ imageUrl });
  } catch (error) {
    console.error("Image generation failed:", error);
    const message = error instanceof Error ? error.message : "Image generation failed.";
    return res.status(500).json({ error: message });
  }
}
