import { lazy, Suspense, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Layers, Loader2 } from "lucide-react";
import { ManualScript } from "./ManualScript";
import { generateCarouselScript, generateSlideImage } from "../services/carouselApi";
import { Slide } from "../types";

const CarouselPreview = lazy(() =>
  import("./CarouselPreview").then((module) => ({ default: module.CarouselPreview }))
);

export default function Dashboard() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isGeneratingScript, setIsGeneratingScript] = useState(false);
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [error, setError] = useState("");

  const generateImagesForSlides = async (initialSlides: Slide[]) => {
    setIsGeneratingImages(true);

    for (let index = 0; index < initialSlides.length; index++) {
      const slide = initialSlides[index];
      if (!slide) continue;

      try {
        const imageUrl = await generateSlideImage(slide.imagePrompt);
        setSlides((currentSlides) => {
          const newSlides = [...currentSlides];
          if (newSlides[index]) {
            newSlides[index] = { ...newSlides[index], imageUrl };
          }
          return newSlides;
        });
      } catch (err) {
        console.error(`Failed to generate image for slide ${index + 1}:`, err);
      }
    }

    setIsGeneratingImages(false);
  };

  const handleGenerateScript = async (text: string, designPrompt: string) => {
    setIsGeneratingScript(true);
    setError("");
    setSlides([]);

    try {
      const generatedSlides = await generateCarouselScript(text, designPrompt);
      if (!generatedSlides || generatedSlides.length === 0) {
        throw new Error("A IA retornou um resultado vazio ou inválido.");
      }

      setSlides(generatedSlides);
      generateImagesForSlides(generatedSlides);
    } catch (err) {
      console.error("Falha ao gerar o carrossel:", err);
      const message = err instanceof Error ? err.message : "Erro desconhecido";

      if (/api key|401|403|unauthorized|permission/i.test(message)) {
        setError("Erro de autenticação no serviço de IA. Verifique a configuração do servidor.");
      } else {
        setError(`Falha ao gerar o carrossel: ${message}`);
      }
    } finally {
      setIsGeneratingScript(false);
    }
  };

  const handleUpdateSlide = (index: number, updated: Slide) => {
    setSlides((currentSlides) => {
      const newSlides = [...currentSlides];
      newSlides[index] = updated;
      return newSlides;
    });
  };

  const handleRegenerateImage = async (index: number, prompt: string) => {
    setSlides((current) => {
      const newSlides = [...current];
      if (newSlides[index]) {
        newSlides[index] = {
          ...newSlides[index],
          imageUrl: undefined,
          isGeneratingImage: true,
          imagePrompt: prompt,
        };
      }
      return newSlides;
    });

    try {
      const imageUrl = await generateSlideImage(prompt);
      setSlides((current) => {
        const newSlides = [...current];
        if (newSlides[index]) {
          newSlides[index] = { ...newSlides[index], imageUrl, isGeneratingImage: false };
        }
        return newSlides;
      });
    } catch (err) {
      console.error("Failed to regenerate image:", err);
      setSlides((current) => {
        const newSlides = [...current];
        if (newSlides[index]) {
          newSlides[index] = { ...newSlides[index], isGeneratingImage: false };
        }
        return newSlides;
      });
    }
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-zinc-950 text-zinc-200 font-sans selection:bg-emerald-500/30">
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 sm:h-20 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Layers className="w-5 h-5 text-zinc-950" />
            </div>
            <h1 className="text-lg sm:text-xl font-bold tracking-tight text-zinc-100 whitespace-nowrap">
              Quero<span className="text-emerald-500">Carrossel</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white/5 border border-white/10 backdrop-blur rounded-full text-zinc-400 text-xs sm:text-sm whitespace-nowrap">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Open-source demo</span>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-center">
            {error}
          </div>
        )}

        {!isGeneratingScript && slides.length === 0 && (
          <AnimatePresence mode="wait">
            <motion.div
              key="manual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ManualScript onGenerate={handleGenerateScript} />
            </motion.div>
          </AnimatePresence>
        )}

        {isGeneratingScript && (
          <div className="flex flex-col items-center justify-center py-32 space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500/20 blur-xl rounded-full" />
              <Loader2 className="w-12 h-12 text-emerald-500 animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-xl font-bold text-zinc-100">Criando seu carrossel...</h3>
              <p className="text-zinc-500 font-mono text-sm">Analisando e gerando o roteiro com IA</p>
            </div>
          </div>
        )}

        {slides.length > 0 && !isGeneratingScript && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <Suspense fallback={<div className="py-20 text-center animate-pulse text-zinc-500 font-mono text-sm">Carregando editor...</div>}>
              <CarouselPreview
                slides={slides}
                isGeneratingImages={isGeneratingImages}
                onUpdateSlide={handleUpdateSlide}
                onRegenerateImage={handleRegenerateImage}
              />
            </Suspense>
            <div className="mt-12 flex justify-center">
              <button
                onClick={() => setSlides([])}
                className="text-zinc-500 hover:text-zinc-300 text-sm font-medium underline underline-offset-4 transition-colors"
              >
                Gerar outro carrossel
              </button>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
