# CarouselGen

Open-source AI web application that turns manual scripts into editorial-style social media carousels. It generates slide structure, visual direction, image prompts, live previews, and export-ready PNG slides.

## Why this project matters

CarouselGen is a product-focused AI tool, not just a model wrapper. It combines prompt orchestration, layout rules, image generation, frontend preview, and export workflows into one usable creator tool.

## Tech stack

- React 19 + TypeScript
- Vite + Tailwind CSS v4
- Express API server
- Google GenAI SDK (`@google/genai`)
- Framer Motion / Motion
- `html-to-image`, `html2canvas`, `jszip`, `file-saver`
- Lucide React icons

## Features

- Manual script input for creator-controlled content.
- AI slide planning that splits long text into carousel-ready sections.
- Editorial layout engine with visual zones, reading zones, z-index layering, and typographic contrast rules.
- Server-side Gemini integration so API keys stay out of the browser bundle.
- AI image prompt generation for cohesive slide backgrounds and visual direction.
- Live responsive carousel preview.
- One-click PNG export packaged as a ZIP file.

## Technical highlights

- Built a full AI workflow from raw user script to structured slide data.
- Designed the app around a secret-safe architecture using local `/api/*` routes.
- Added export tooling that renders DOM slides into production-ready image assets.
- Structured the UI around real creator workflows: write, generate, preview, export.

## Security notes

- Do not commit `.env` files.
- Keep `GEMINI_API_KEY` on the server.
- The frontend calls local API routes instead of reading model credentials directly.
- This public version does not include authentication, billing, database credentials, or payment webhooks.

## Getting started

### Prerequisites

- Node.js 18+
- Gemini API key

### Installation

```bash
npm install
```

Create a `.env` file:

```env
GEMINI_API_KEY="your_gemini_api_key"
```

Start the development server:

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

## Available scripts

```bash
npm run dev       # Start Express + Vite dev server
npm run build     # Build frontend
npm run preview   # Preview production build
npm run lint      # TypeScript check
npm run clean     # Remove dist
```

## License

Apache 2.0
