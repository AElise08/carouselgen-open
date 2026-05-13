import React, { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronLeft, ChevronRight, Download, Loader2, Pencil, PanelRightOpen, PanelRightClose } from "lucide-react";
import { Slide } from "../types";
import { toPng } from "html-to-image";
import { saveAs } from "file-saver";
import { SlideEditor } from "./SlideEditor";

interface CarouselPreviewProps {
  slides: Slide[];
  isGeneratingImages: boolean;
  onUpdateSlide?: (index: number, updated: Slide) => void;
  onRegenerateImage?: (index: number, prompt: string) => void;
}

const EXPORT_SIZE = 1080;

export function CarouselPreview({ slides, isGeneratingImages, onUpdateSlide, onRegenerateImage }: CarouselPreviewProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [isEditingImage, setIsEditingImage] = useState(false);
  const [tempPrompt, setTempPrompt] = useState("");
  const hiddenContainerRef = useRef<HTMLDivElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const [previewSize, setPreviewSize] = useState(672);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setPreviewSize(Math.round(entry.contentRect.width));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!slides || slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  const nextSlide = () => { setIsEditingImage(false); setCurrentIndex((prev) => (prev + 1) % slides.length); };
  const prevSlide = () => { setIsEditingImage(false); setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length); };

  const handleUpdateSlide = useCallback((index: number, updated: Slide) => {
    onUpdateSlide?.(index, updated);
  }, [onUpdateSlide]);

  const handleTextEdit = (field: "label" | "title", value: string) => {
    if (!onUpdateSlide) return;
    handleUpdateSlide(currentIndex, {
      ...currentSlide,
      [field]: value,
    });
  };

  const handleBodyEdit = (paragraphIndex: number, value: string) => {
    if (!onUpdateSlide || !currentSlide.body) return;
    const newBody = [...currentSlide.body];
    newBody[paragraphIndex] = value;
    handleUpdateSlide(currentIndex, {
      ...currentSlide,
      body: newBody,
    });
  };

  const handleDownloadCurrentSlide = async () => {
    if (!hiddenContainerRef.current || isDownloading) return;
    
    setIsDownloading(true);
    try {
      const slideElements = hiddenContainerRef.current.querySelectorAll('.slide-capture-target');
      const el = slideElements[currentIndex] as HTMLElement;
      
      if (!el) throw new Error("Slide element not found");
      
      if (slides[currentIndex].imageUrl) {
        await new Promise((resolve) => {
          const img = new Image();
          img.onload = resolve;
          img.onerror = resolve;
          img.src = slides[currentIndex].imageUrl!;
        });
      }
      
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const options = {
        quality: 1.0,
        canvasWidth: EXPORT_SIZE,
        canvasHeight: EXPORT_SIZE,
        backgroundColor: slides[currentIndex].design?.backgroundColor || '#18181b',
      };

      await toPng(el, options).catch(() => {});
      const dataUrl = await toPng(el, options);
      
      const blob = await (await fetch(dataUrl)).blob();
      saveAs(blob, `slide-${String(currentIndex + 1).padStart(2, '0')}.png`);
    } catch (error) {
      console.error("Failed to download slide:", error);
      alert("Failed to download slide. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  const renderSlideContent = (slide: Slide, index: number, isInteractive: boolean = false) => {
    const overlayColor = slide.design?.overlayColor || 'rgba(0,0,0,0.5)';

    const renderImage = (className: string) => {
      if (slide.design?.imagePosition === 'none') return null;

      const isBleedRight = slide.design?.imagePosition === 'bleed-right';
      const bgColor = slide.design?.backgroundColor || '#18181b';

      const renderMask = () => {
        if (!isBleedRight) return null;
        return (
          <div 
            className="absolute top-0 left-0 pointer-events-none z-30" 
            style={{
              width: 0,
              height: 0,
              borderTop: `1080px solid ${bgColor}`,
              borderRight: `73px solid transparent`
            }}
          />
        );
      };

      const isLoading = isGeneratingImages || slide.isGeneratingImage;

      if (!slide.imageUrl && isLoading) {
        return (
          <div className={`absolute z-20 flex items-center justify-center bg-zinc-900/80 backdrop-blur-sm ${className}`}>
            {renderMask()}
            <div className="flex flex-col items-center text-zinc-400 z-40">
              <Loader2 className="w-8 h-8 animate-spin mb-4 text-emerald-500" />
              <span className="text-sm font-mono tracking-widest uppercase">Gerando...</span>
            </div>
          </div>
        );
      }

      return (
        <div 
          className={`absolute z-20 overflow-hidden group/img cursor-pointer ${className.replace('object-cover', '')}`}
          style={!slide.imageUrl ? { backgroundColor: slide.design?.overlayColor || 'rgba(0,0,0,0.2)' } : undefined}
          onClick={(e) => {
            if (isInteractive && onRegenerateImage) {
              e.stopPropagation();
              setIsEditingImage(true);
              setTempPrompt(slide.imagePrompt || "");
            }
          }}
        >
          {renderMask()}
          {slide.imageUrl ? (
            <img 
              src={slide.imageUrl} 
              alt={`Slide ${index + 1}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <>
              <div 
                className="absolute -right-10 -bottom-10 text-[15rem] font-black opacity-10 leading-none select-none z-10" 
                style={{ 
                  fontFamily: slide.design?.titleTypography?.fontFamily ? `"${slide.design.titleTypography.fontFamily}", sans-serif` : 'inherit',
                  color: slide.design?.titleTypography?.color || '#ffffff'
                }}
              >
                {slide.title?.charAt(0) || 'X'}
              </div>
              <div className="absolute top-0 left-0 w-full h-full bg-linear-to-br from-white/10 to-transparent z-10"></div>
            </>
          )}

          {isInteractive && onRegenerateImage && !isEditingImage && (
            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity z-50">
               <Pencil className="w-8 h-8 text-white mb-2" />
               <span className="text-white font-medium text-sm">Editar Imagem</span>
            </div>
          )}

          {isInteractive && isEditingImage && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center p-6 z-50 pointer-events-auto" onClick={(e) => e.stopPropagation()}>
               <label className="text-white text-sm font-bold mb-2">Novo Prompt da Imagem</label>
               <textarea 
                 autoFocus
                 className="w-full max-w-sm h-32 bg-zinc-900 border border-emerald-500/50 rounded-xl p-3 text-white text-sm outline-none resize-none"
                 value={tempPrompt}
                 onChange={(e) => setTempPrompt(e.target.value)}
                 onKeyDown={(e) => {
                   if (e.key === 'Escape') setIsEditingImage(false);
                 }}
               />
               <div className="flex gap-3 mt-4">
                 <button 
                   onClick={() => setIsEditingImage(false)}
                   className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-sm transition-colors cursor-pointer"
                 >
                   Cancelar
                 </button>
                 <button 
                   onClick={() => {
                     setIsEditingImage(false);
                     onRegenerateImage(index, tempPrompt);
                   }}
                   className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold rounded-lg text-sm transition-colors cursor-pointer"
                 >
                   Regerar
                 </button>
               </div>
            </div>
          )}
        </div>
      );
    };

    const renderFormattedText = (text: string) => {
      if (!text) return null;
      const parts = text.split(/(\*[^*]+\*)/g);
      return parts.map((part, i) => {
        if (part.startsWith('*') && part.endsWith('*')) {
          return <strong key={i} style={{ fontWeight: 'bolder' }}>{part.slice(1, -1)}</strong>;
        }
        return <span key={i}>{part}</span>;
      });
    };

    const getAdaptiveTitleSize = () => {
      const configuredSize = slide.design?.titleTypography?.fontSize || '2.5rem';
      const remMatch = configuredSize.match(/^([\d.]+)rem$/);
      const pxMatch = configuredSize.match(/^([\d.]+)px$/);
      const baseRem = remMatch ? parseFloat(remMatch[1]) : pxMatch ? parseFloat(pxMatch[1]) / 16 : 2.5;

      const longestWord = (slide.title || '')
        .split(/\s+/)
        .reduce((max, word) => Math.max(max, word.length), 0);

      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      let factor = isMobile ? 0.85 : 1;

      if (longestWord >= 10) factor *= 0.72;
      else if (longestWord >= 8) factor *= 0.8;
      else if ((slide.title || '').length > 28) factor *= 0.9;

      const finalRem = Math.max(1.8, Math.min(baseRem * factor, isMobile ? 2.6 : 3.6));
      return `${finalRem}rem`;
    };

    const makeEditable = (
      fieldKey: string,
      value: string,
      onBlur: (newValue: string) => void,
      style: React.CSSProperties,
      className: string,
      multiline: boolean = false,
    ) => {
      if (!isInteractive || !onUpdateSlide) {
        if (multiline) {
          return <p className={className} style={style}>{renderFormattedText(value)}</p>;
        }
        return <span className={className} style={style}>{renderFormattedText(value)}</span>;
      }

      const isEditing = editingField === fieldKey;

      if (isEditing) {
        if (multiline) {
          return (
            <textarea
              autoFocus
              defaultValue={value}
              onBlur={(e) => { onBlur(e.target.value); setEditingField(null); }}
              onKeyDown={(e) => { if (e.key === 'Escape') setEditingField(null); }}
              className={`${className} bg-transparent border border-emerald-500/50 rounded-lg outline-none resize-none w-full`}
              style={{ ...style, minHeight: '3em' }}
            />
          );
        }
        return (
          <input
            autoFocus
            defaultValue={value}
            onBlur={(e) => { onBlur(e.target.value); setEditingField(null); }}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape') { if (e.key === 'Enter') onBlur(e.currentTarget.value); setEditingField(null); } }}
            className={`${className} bg-transparent border-b-2 border-emerald-500/50 outline-none w-full`}
            style={style}
          />
        );
      }

      return (
        <div
          onClick={(e) => { e.stopPropagation(); setEditingField(fieldKey); }}
          className={`${className} cursor-text group/edit relative`}
          style={style}
          title="Clique para editar"
        >
          {renderFormattedText(value)}
          <Pencil className="absolute -top-1 -right-1 w-3 h-3 text-emerald-400 opacity-0 group-hover/edit:opacity-100 transition-opacity pointer-events-none" />
        </div>
      );
    };

    const renderText = (justifyContent: string, alignItems: string, boundsClass: string) => (
      <div 
        className={`absolute z-40 flex flex-col p-6 ${boundsClass}`}
        style={{ 
          textAlign: slide.design?.textAlign || 'left',
          alignItems: alignItems,
          justifyContent: justifyContent,
          overflow: 'visible',
        }}
      >
        {slide.label && (
          makeEditable(
            `label-${index}`,
            slide.label,
            (val) => handleTextEdit("label", val),
            {
              fontFamily: slide.design?.labelTypography?.fontFamily ? `"${slide.design.labelTypography.fontFamily}", sans-serif` : 'inherit',
              color: slide.design?.labelTypography?.color || '#ffffff',
              fontSize: slide.design?.labelTypography?.fontSize || '1rem',
              fontWeight: slide.design?.labelTypography?.fontWeight || '700',
              textTransform: (slide.design?.labelTypography?.textTransform || 'uppercase') as any,
              letterSpacing: '0.1em',
              display: 'block',
              marginBottom: '0.5rem',
            },
            "drop-shadow-md",
          )
        )}
        
        {makeEditable(
          `title-${index}`,
          slide.title,
          (val) => handleTextEdit("title", val),
          {
            fontFamily: slide.design?.titleTypography?.fontFamily ? `"${slide.design.titleTypography.fontFamily}", sans-serif` : 'inherit',
            color: slide.design?.titleTypography?.color || '#ffffff',
            fontSize: getAdaptiveTitleSize(),
            fontWeight: slide.design?.titleTypography?.fontWeight || '700',
            textTransform: (slide.design?.titleTypography?.textTransform || 'none') as any,
            wordBreak: 'normal',
            overflowWrap: 'anywhere' as any,
            hyphens: 'none',
            lineHeight: '1.2',
            maxWidth: '100%',
            whiteSpace: 'pre-wrap',
            display: 'block',
            marginBottom: '1rem',
          },
          "drop-shadow-lg leading-tight w-full",
        )}

        {slide.body && slide.body.length > 0 && (
          <div className="flex flex-col mt-1 w-full">
            {slide.body.map((paragraph, idx) => (
              <div key={idx}>
                {makeEditable(
                  `body-${index}-${idx}`,
                  paragraph,
                  (val) => handleBodyEdit(idx, val),
                  {
                    fontFamily: slide.design?.bodyTypography?.fontFamily ? `"${slide.design.bodyTypography.fontFamily}", sans-serif` : 'inherit',
                    color: slide.design?.bodyTypography?.color || '#e4e4e7',
                    fontSize: slide.design?.bodyTypography?.fontSize || '1.125rem',
                    fontWeight: slide.design?.bodyTypography?.fontWeight || '400',
                    textTransform: (slide.design?.bodyTypography?.textTransform || 'none') as any,
                    wordBreak: 'normal',
                    overflowWrap: 'normal',
                    hyphens: 'none',
                    display: 'block',
                    marginBottom: '0.75rem',
                  },
                  "drop-shadow-md leading-snug max-w-2xl",
                  true,
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );

    let imgClass = "top-0 right-0 w-[55%] h-[55%] opacity-90 shadow-2xl";
    let textJustify = "center";
    let textItems = slide.design?.textAlign === 'center' ? 'center' : slide.design?.textAlign === 'right' ? 'flex-end' : 'flex-start';
    let overlayClass = "bottom-[5%] left-[5%] w-[90%] min-h-[45%]";

    switch (slide.design?.imagePosition) {
      case 'left-half':
        imgClass = "top-0 left-0 w-[50%] h-full opacity-90 object-cover";
        textItems = "flex-start";
        overlayClass = "top-[5%] right-[5%] w-[46%] min-h-[90%]";
        break;
      case 'top-half':
        imgClass = "top-0 left-0 w-full h-[50%] opacity-90 object-cover";
        textJustify = "center";
        overlayClass = "bottom-[5%] left-[5%] w-[90%] min-h-[40%]";
        break;
      case 'full-background':
        imgClass = "inset-0 w-full h-full opacity-60 object-cover";
        textJustify = "center";
        textItems = "center";
        overlayClass = "inset-[5%] w-[90%] min-h-[90%] bg-black/60 rounded-3xl border border-white/10 shadow-2xl p-8";
        break;
      case 'bleed-right':
        imgClass = "top-0 right-0 w-[45%] h-full opacity-90 shadow-2xl object-cover";
        textItems = "flex-start";
        overlayClass = "top-[5%] left-[5%] w-[56%] min-h-[90%]";
        break;
      case 'none':
        imgClass = "hidden";
        textJustify = "center";
        textItems = "center";
        overlayClass = "inset-[10%] w-[80%] min-h-[80%]";
        break;
    }

    return (
      <div className="relative w-full h-full overflow-hidden" style={{ backgroundColor: slide.design?.backgroundColor || '#18181b' }}>
        <div className="absolute inset-0 z-10"></div>
        {renderImage(imgClass)}
        <div 
          className={`absolute z-30 pointer-events-none ${slide.design?.imagePosition === 'full-background' ? overlayClass : ''}`}
          style={{
            backgroundColor: slide.design?.imagePosition === 'full-background' ? overlayColor : 'transparent',
          }}
        ></div>
        {renderText(textJustify, textItems, slide.design?.imagePosition === 'full-background' ? overlayClass : overlayClass)}

        {/* Decorative Elements */}
        {(() => {
          const variant = index % 6;
          switch (variant) {
            case 0:
              return <div className="absolute z-50 top-[10%] left-[-5%] w-32 h-64 bg-white/20 rotate-12 pointer-events-none"></div>;
            case 1:
              return <div className="absolute z-50 bottom-[10%] right-[5%] text-9xl font-black text-white/5 pointer-events-none select-none">{String(index + 1).padStart(2, '0')}</div>;
            case 2:
              return (
                <div className="absolute z-50 top-[20%] right-[10%] grid grid-cols-5 gap-2 pointer-events-none opacity-20">
                  {[...Array(25)].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-white"></div>
                  ))}
                </div>
              );
            case 3:
              return <div className="absolute z-50 bottom-[15%] left-[10%] w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>;
            case 4:
              return (
                <svg className="absolute z-50 top-[10%] right-[10%] w-32 h-32 opacity-10 pointer-events-none fill-white" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
                  <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,81.3,-46.3C90.8,-33.5,96.8,-18,96.3,-2.8C95.8,12.4,88.8,27.3,79.4,40.4C70,53.5,58.2,64.8,44.5,72.8C30.8,80.8,15.4,85.5,-0.3,86C-16,86.5,-32,82.8,-45.5,74.5C-59,66.2,-70,53.3,-78.2,39.1C-86.4,24.9,-91.8,9.4,-90.4,-5.4C-89,-20.2,-80.8,-34.3,-70.7,-46.1C-60.6,-57.9,-48.6,-67.4,-35.3,-75.2C-22,-83,-8.7,-89.1,3.2,-84.6C15.1,-80.1,30.6,-83.6,44.7,-76.4Z" transform="translate(100 100)" />
                </svg>
              );
            case 5:
              return <div className="absolute z-50 bottom-0 left-0 w-full h-8 bg-linear-to-t from-white/10 to-transparent pointer-events-none"></div>;
            default:
              return null;
          }
        })()}
      </div>
    );
  };

  return (
    <div className="w-full max-w-6xl mx-auto mt-12">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-zinc-100 font-sans tracking-tight">Seu Carrossel</h2>
        <button
          onClick={() => setIsEditorOpen(!isEditorOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/30 text-zinc-300 hover:text-emerald-400 rounded-xl text-sm font-medium transition-all cursor-pointer"
        >
          {isEditorOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
          {isEditorOpen ? "Fechar Editor" : "Editar Slide"}
        </button>
      </div>

      <div className={`flex gap-6 ${isEditorOpen ? 'flex-col lg:flex-row' : ''}`}>
        {/* Carousel Preview */}
        <div className={`${isEditorOpen ? 'lg:flex-1' : 'w-full'} max-w-2xl`}>
          <div ref={previewRef} className="relative aspect-square w-full bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 flex"
              >
                {renderSlideContent(currentSlide, currentIndex, true)}
              </motion.div>
            </AnimatePresence>

            {/* Edit mode indicator */}
            {isEditorOpen && (
              <div className="absolute top-3 left-3 z-100 flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/90 text-zinc-950 rounded-full text-xs font-bold backdrop-blur-sm">
                <Pencil className="w-3 h-3" />
                Modo Edição
              </div>
            )}
            
            <div className="absolute bottom-0 left-0 right-0 z-100 p-6 flex justify-between items-center bg-linear-to-t from-black/80 to-transparent pointer-events-none">
              <span className="text-zinc-400 font-mono text-xs pointer-events-auto">
                {String(currentIndex + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
              </span>
              <div className="flex gap-2 pointer-events-auto">
                <button 
                  onClick={prevSlide}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button 
                  onClick={nextSlide}
                  className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-sm transition-colors cursor-pointer"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Slide thumbnails */}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            {slides.map((slide, idx) => (
              <button
                key={idx}
                onClick={() => { setIsEditingImage(false); setCurrentIndex(idx); }}
                className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  idx === currentIndex 
                    ? "border-emerald-500 ring-2 ring-emerald-500/30" 
                    : "border-zinc-800 hover:border-zinc-600 opacity-60 hover:opacity-100"
                }`}
              >
                <div className="w-full h-full relative" style={{ backgroundColor: slide.design?.backgroundColor || '#18181b' }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[0.5rem] font-bold text-zinc-400 font-mono">{String(idx + 1).padStart(2, '0')}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Download button */}
          <div className="mt-4 flex justify-end">
            <button 
              onClick={handleDownloadCurrentSlide}
              disabled={isDownloading || isGeneratingImages}
              className="flex items-center gap-2 px-6 py-3 bg-zinc-100 hover:bg-white text-zinc-900 font-semibold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isDownloading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Gerando PNG...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Baixar como PNG
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Panel */}
        {isEditorOpen && onUpdateSlide && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="lg:w-[320px] w-full bg-zinc-900 border border-zinc-800 rounded-2xl p-5 overflow-y-auto max-h-[80vh]"
          >
            <SlideEditor
              slide={currentSlide}
              slideIndex={currentIndex}
              onUpdateSlide={handleUpdateSlide}
            />
          </motion.div>
        )}
      </div>

      {/* Hidden container for rendering all slides for download */}
      <div
        ref={hiddenContainerRef}
        className="fixed -top-[99999px] -left-[99999px] w-0 h-0 overflow-hidden pointer-events-none"
        aria-hidden="true"
      >
        {slides.map((slide, index) => (
          <div 
            key={index} 
            className="slide-capture-target relative"
            style={{ width: `${previewSize}px`, height: `${previewSize}px` }}
          >
            {renderSlideContent(slide, index, false)}
          </div>
        ))}
      </div>
    </div>
  );
}
