import React, { useState } from "react";
import { Slide, SlideDesign } from "../types";
import {
  Palette,
  LayoutGrid,
  Type,
  Eye,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";

const LAYOUT_OPTIONS: { value: SlideDesign["imagePosition"]; label: string; icon: string }[] = [
  { value: "left-half", label: "Imagem Esquerda", icon: "◧" },
  { value: "top-half", label: "Imagem Topo", icon: "⬒" },
  { value: "full-background", label: "Fundo Inteiro", icon: "▣" },
  { value: "bleed-right", label: "Imagem Direita", icon: "◨" },
  { value: "none", label: "Sem Imagem", icon: "☐" },
];

const FONT_OPTIONS = [
  "Inter",
  "Playfair Display",
  "Space Grotesk",
  "Anton",
  "JetBrains Mono",
  "DM Sans",
  "Montserrat",
  "Roboto",
  "Syne",
  "Archivo Black",
];

const PRESET_COLORS = [
  "#09090b", "#18181b", "#27272a", "#3f3f46",
  "#f4f4f5", "#ffffff", "#fafaf9", "#EFEBE4",
  "#10b981", "#059669", "#065f46", "#34d399",
  "#3b82f6", "#2563eb", "#1d4ed8", "#60a5fa",
  "#ef4444", "#dc2626", "#f97316", "#eab308",
  "#8b5cf6", "#a855f7", "#ec4899", "#f472b6",
  "#C5A059", "#2D1A11", "#1A0F0A", "#F5F5F0",
];

interface SlideEditorProps {
  slide: Slide;
  slideIndex: number;
  onUpdateSlide: (index: number, updated: Slide) => void;
}

function Section({ title, icon, children, defaultOpen = true }: { title: string; icon: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-zinc-800 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-3 px-1 text-sm font-semibold text-zinc-300 hover:text-zinc-100 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-2">
          {icon}
          {title}
        </span>
        {open ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {open && <div className="pb-4 px-1">{children}</div>}
    </div>
  );
}

function ColorGrid({ value, onChange }: { value: string; onChange: (color: string) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-7 gap-1.5">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            onClick={() => onChange(color)}
            className={`w-7 h-7 rounded-lg border-2 transition-all cursor-pointer hover:scale-110 ${
              value?.toLowerCase() === color.toLowerCase()
                ? "border-emerald-400 ring-2 ring-emerald-400/30 scale-110"
                : "border-zinc-700 hover:border-zinc-500"
            }`}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <div className="flex items-center gap-2 mt-1">
        <label className="text-xs text-zinc-500">Custom:</label>
        <input
          type="color"
          value={value || "#18181b"}
          onChange={(e) => onChange(e.target.value)}
          className="w-8 h-6 rounded cursor-pointer border border-zinc-700 bg-transparent"
        />
        <input
          type="text"
          value={value || ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder="#hex"
          className="flex-1 text-xs bg-zinc-950 border border-zinc-800 rounded px-2 py-1 text-zinc-300 font-mono"
        />
      </div>
    </div>
  );
}

function FontSelector({ value, onChange, label }: { value: string; onChange: (font: string) => void; label: string }) {
  return (
    <div className="space-y-1">
      <label className="text-xs text-zinc-500">{label}</label>
      <select
        value={value || "Inter"}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500/50 cursor-pointer"
        style={{ fontFamily: `"${value || 'Inter'}", sans-serif` }}
      >
        {FONT_OPTIONS.map((font) => (
          <option key={font} value={font} style={{ fontFamily: `"${font}", sans-serif` }}>
            {font}
          </option>
        ))}
      </select>
    </div>
  );
}

function FontSizeControl({ value, onChange, label, min = 0.7, max = 5, step = 0.1, presets }: {
  value: string;
  onChange: (size: string) => void;
  label: string;
  min?: number;
  max?: number;
  step?: number;
  presets: { label: string; value: number }[];
}) {
  const currentRem = parseFloat(value?.replace('rem', '') || '1.5');

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs text-zinc-500">{label}</label>
        <span className="text-xs font-mono text-emerald-400">{currentRem.toFixed(1)}rem</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={currentRem}
        onChange={(e) => onChange(`${parseFloat(e.target.value)}rem`)}
        className="w-full h-1.5 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-500"
      />
      <div className="flex gap-1">
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => onChange(`${p.value}rem`)}
            className={`flex-1 py-1 text-[10px] font-bold rounded-md border transition-all cursor-pointer ${
              Math.abs(currentRem - p.value) < 0.05
                ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                : "border-zinc-800 text-zinc-600 hover:border-zinc-600 hover:text-zinc-400"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function SlideEditor({ slide, slideIndex, onUpdateSlide }: SlideEditorProps) {
  const updateDesign = (updates: Partial<SlideDesign>) => {
    onUpdateSlide(slideIndex, {
      ...slide,
      design: { ...slide.design, ...updates },
    });
  };

  const updateTypography = (
    section: "labelTypography" | "titleTypography" | "bodyTypography",
    updates: Record<string, string>
  ) => {
    onUpdateSlide(slideIndex, {
      ...slide,
      design: {
        ...slide.design,
        [section]: { ...slide.design[section], ...updates },
      },
    });
  };

  return (
    <div className="w-full space-y-1">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-zinc-100 tracking-tight">
          Editar Slide {String(slideIndex + 1).padStart(2, "0")}
        </h3>
      </div>

      {/* Layout Position */}
      <Section title="Layout" icon={<LayoutGrid className="w-4 h-4 text-emerald-400" />}>
        <div className="grid grid-cols-5 gap-1.5">
          {LAYOUT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateDesign({ imagePosition: opt.value })}
              className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg border text-xs transition-all cursor-pointer ${
                slide.design?.imagePosition === opt.value
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                  : "border-zinc-800 text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
              }`}
              title={opt.label}
            >
              <span className="text-lg leading-none">{opt.icon}</span>
            </button>
          ))}
        </div>
        {/* Text Alignment */}
        <div className="mt-3">
          <label className="text-xs text-zinc-500 mb-1 block">Alinhamento do Texto</label>
          <div className="grid grid-cols-3 gap-1.5">
            {(["left", "center", "right"] as const).map((align) => (
              <button
                key={align}
                onClick={() => updateDesign({ textAlign: align })}
                className={`py-2 rounded-lg border text-xs font-medium transition-all cursor-pointer capitalize ${
                  slide.design?.textAlign === align
                    ? "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                    : "border-zinc-800 text-zinc-500 hover:border-zinc-600"
                }`}
              >
                {align === "left" ? "Esquerda" : align === "center" ? "Centro" : "Direita"}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Colors */}
      <Section title="Cores" icon={<Palette className="w-4 h-4 text-emerald-400" />}>
        <div className="space-y-4">
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Cor de Fundo</label>
            <ColorGrid
              value={slide.design?.backgroundColor || "#18181b"}
              onChange={(color) => updateDesign({ backgroundColor: color })}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Cor do Título</label>
            <ColorGrid
              value={slide.design?.titleTypography?.color || "#ffffff"}
              onChange={(color) => updateTypography("titleTypography", { color })}
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Cor do Texto</label>
            <ColorGrid
              value={slide.design?.bodyTypography?.color || "#e4e4e7"}
              onChange={(color) => updateTypography("bodyTypography", { color })}
            />
          </div>
        </div>
      </Section>

      {/* Fonts */}
      <Section title="Tipografia" icon={<Type className="w-4 h-4 text-emerald-400" />} defaultOpen={false}>
        <div className="space-y-4">
          {/* Font Size Controls */}
          <FontSizeControl
            label="Tamanho do Label"
            value={slide.design?.labelTypography?.fontSize || "1rem"}
            onChange={(size) => updateTypography("labelTypography", { fontSize: size })}
            min={0.6}
            max={2.5}
            presets={[
              { label: "P", value: 0.75 },
              { label: "M", value: 1 },
              { label: "G", value: 1.5 },
              { label: "XG", value: 2 },
            ]}
          />
          <FontSizeControl
            label="Tamanho do Título"
            value={slide.design?.titleTypography?.fontSize || "2.5rem"}
            onChange={(size) => updateTypography("titleTypography", { fontSize: size })}
            min={1.2}
            max={5}
            presets={[
              { label: "P", value: 1.8 },
              { label: "M", value: 2.5 },
              { label: "G", value: 3.5 },
              { label: "XG", value: 4.5 },
            ]}
          />
          <FontSizeControl
            label="Tamanho do Corpo"
            value={slide.design?.bodyTypography?.fontSize || "1.125rem"}
            onChange={(size) => updateTypography("bodyTypography", { fontSize: size })}
            min={0.7}
            max={3}
            presets={[
              { label: "P", value: 0.875 },
              { label: "M", value: 1.125 },
              { label: "G", value: 1.5 },
              { label: "XG", value: 2 },
            ]}
          />

          <div className="border-t border-zinc-800 pt-3 mt-3">
            <label className="text-xs text-zinc-500 mb-2 block">Famílias de Fonte</label>
          </div>
          <FontSelector
            label="Fonte do Label"
            value={slide.design?.labelTypography?.fontFamily || "Inter"}
            onChange={(font) => updateTypography("labelTypography", { fontFamily: font })}
          />
          <FontSelector
            label="Fonte do Título"
            value={slide.design?.titleTypography?.fontFamily || "Inter"}
            onChange={(font) => updateTypography("titleTypography", { fontFamily: font })}
          />
          <FontSelector
            label="Fonte do Corpo"
            value={slide.design?.bodyTypography?.fontFamily || "Inter"}
            onChange={(font) => updateTypography("bodyTypography", { fontFamily: font })}
          />
        </div>
      </Section>

      {/* Overlay */}
      <Section title="Sobreposição" icon={<Eye className="w-4 h-4 text-emerald-400" />} defaultOpen={false}>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 mb-2 block">Cor da Sobreposição</label>
            <input
              type="text"
              value={slide.design?.overlayColor || "rgba(0,0,0,0.5)"}
              onChange={(e) => updateDesign({ overlayColor: e.target.value })}
              placeholder="rgba(0,0,0,0.5)"
              className="w-full text-xs bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-zinc-300 font-mono"
            />
          </div>
        </div>
      </Section>
    </div>
  );
}
