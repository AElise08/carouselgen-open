# CarouselGen

CarouselGen is an open-source AI web application that turns manual text scripts into editorial-style social media carousels. It generates the content structure, visual direction, image prompts, live previews, and export-ready PNG slides.

## Technology Stack

- **Frontend Framework:** React 19 with Vite
- **Styling:** Tailwind CSS v4 for utility-first styling and responsive design
- **Animations:** Framer Motion (via `motion/react`) for smooth transitions and interactive elements
- **Icons:** Lucide React
- **AI Integration:** Server-side Google GenAI SDK (`@google/genai`)
  - **Text & Layout Generation:** Uses advanced language models to parse scripts, determine optimal typographic contrast, and assign layout zones (e.g., 'left-half', 'top-half', 'full-background', 'bleed-right').
  - **Image Generation:** Uses image generation models to create cohesive, text-free background assets and editorial collages based on the generated layout prompts.
- **Export:** `html-to-image` and `jszip` for rendering the DOM elements into high-quality PNGs and packaging them into a downloadable ZIP file.

## Features

- **Manual Script Input:** Paste your exact script, and the AI will intelligently divide it into slides without altering your core message.
- **Editorial Layout Engine:** The app enforces strict design rules (e.g., visual zones vs. reading zones, z-index layering, typographic contrast) to ensure professional, non-repetitive layouts.
- **Dynamic Image Generation:** Automatically generates unique, cohesive background images and collages for each slide based on the content and requested design aesthetic.
- **Live Preview:** Preview the generated carousel in a responsive, interactive UI before exporting.
- **One-Click Export:** Download all slides as a ZIP file containing high-resolution PNG images ready for social media.
- **Secret-Safe Architecture:** AI keys stay on server-side API routes and are never injected into the browser bundle.

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- A Gemini API key configured as a server-side environment variable.

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file from the example and add your local values:
   ```env
   GEMINI_API_KEY="your_gemini_api_key"
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Usage

1. **Enter your script:** Navigate to the "Manual" tab and paste the text you want to convert into a carousel.
2. **Provide a design prompt (optional):** Describe the visual style you want (e.g., "minimalist, dark mode, neon accents").
3. **Generate:** Click the generate button. The app will first create the script and layout structure, then begin generating the images in the background.
4. **Preview & Export:** Once generation is complete, review the slides. Click "Download All Slides" to get your ZIP file.

## Security Notes

- Do not commit `.env` files.
- Keep `GEMINI_API_KEY` on the server.
- The frontend calls local `/api/*` routes instead of reading model credentials directly.
- This public version does not include authentication, billing, database credentials, or payment webhooks.

## License

This project is licensed under the Apache 2.0 License.
