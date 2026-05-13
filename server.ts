import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import "dotenv/config";
import generateCarousel from "./api/generate-carousel";
import generateImage from "./api/generate-image";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.post("/api/generate-carousel", generateCarousel);
  app.post("/api/generate-image", generateImage);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
