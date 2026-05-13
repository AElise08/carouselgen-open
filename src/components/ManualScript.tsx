import React, { useState } from "react";
import { FileText, Loader2, Sparkles, Palette } from "lucide-react";

export function ManualScript({ onGenerate }: { onGenerate: (text: string, designPrompt: string) => void }) {
  const [text, setText] = useState("");
  const [designPrompt, setDesignPrompt] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    setLoading(true);
    onGenerate(text, designPrompt);
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-xl">
        <h2 className="text-2xl font-bold text-zinc-100 mb-2 font-sans tracking-tight">Manual Script</h2>
        <p className="text-zinc-400 text-sm mb-6">Paste your exact script here. The AI will follow it slide-by-slide and apply your design choices.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-500" />
              Your Script
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Slide 1: Welcome to my carousel...&#10;Slide 2: Here is the second point..."
              className="w-full h-48 bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all resize-none font-sans leading-relaxed"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300 flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-500" />
              Design Preferences (Optional)
            </label>
            <input
              type="text"
              value={designPrompt}
              onChange={(e) => setDesignPrompt(e.target.value)}
              placeholder="e.g., Paleta azul e laranja, Cyberpunk vibe, neon green text..."
              className="w-full bg-zinc-950 border border-zinc-800 text-zinc-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !text.trim()}
            className="bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-950 font-semibold px-8 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            Generate Carousel
          </button>
        </form>
      </div>
    </div>
  );
}
