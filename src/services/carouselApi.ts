import { Slide } from "../types";

async function parseJsonResponse<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload?.error === "string"
        ? payload.error
        : "Request failed. Please try again.";
    throw new Error(message);
  }

  return payload as T;
}

export async function generateCarouselScript(
  text: string,
  designPrompt: string
): Promise<Slide[]> {
  const response = await fetch("/api/generate-carousel", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, designPrompt }),
  });

  const data = await parseJsonResponse<{ slides: Slide[] }>(response);
  return data.slides;
}

export async function generateSlideImage(prompt: string): Promise<string> {
  const response = await fetch("/api/generate-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });

  const data = await parseJsonResponse<{ imageUrl: string }>(response);
  return data.imageUrl;
}
