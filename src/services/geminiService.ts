import { GoogleGenAI, Type } from "@google/genai";
import type { Slide } from "../types";

const MODEL_FALLBACKS = ["gemini-3-flash-preview", "gemini-2.5-flash", "gemini-2.0-flash"];

function isRetryableGeminiError(error: unknown): boolean {
  const message = String(error || "");
  return /503|unavailable|high demand|429|rate.?limit|timeout|econnreset/i.test(message);
}

function isModelNotFoundError(error: unknown): boolean {
  const message = String(error || "");
  return /404|not.?found|models\/.+ is not found/i.test(message);
}

async function generateWithResilience(
  ai: GoogleGenAI,
  contents: string,
  config: Record<string, unknown>
) {
  let lastError: unknown = null;

  for (const model of MODEL_FALLBACKS) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        return await ai.models.generateContent({
          model,
          contents,
          config,
        });
      } catch (error) {
        lastError = error;
        if (isModelNotFoundError(error)) {
          // This model is unavailable for this API version; try the next fallback model.
          break;
        }

        if (!isRetryableGeminiError(error)) {
          throw error;
        }

        const backoffMs = Math.min(1500 * Math.pow(2, attempt - 1), 8000);
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }
  }

  throw lastError || new Error("Gemini indisponivel temporariamente");
}

export async function generateCarouselScript(text: string, designPrompt: string, apiKey: string): Promise<Slide[]> {
  if (!apiKey) {
    throw new Error("Missing Gemini API key");
  }

  const ai = new GoogleGenAI({ apiKey });
  
  const systemInstruction = `You are an Expert Art Director and Social Media Designer. 
Your job is to create a visually stunning carousel.
User's Design Request: ${designPrompt || "Make it look professional, modern, and engaging."}

CRITICAL: The user has provided the EXACT script. DO NOT rewrite or summarize the text. Intelligently divide their exact text into a 'label' (e.g., 'Slide 1' or 'Step 1'), a 'title' (the main hook/heading), and a 'body' (the explanatory paragraphs) for each slide. Do not leave out any of their text. The body MUST be an array of strings, where each string is a distinct paragraph or sentence. If the user uses *asterisks* around text, preserve them!

Available fonts to choose from: 'Inter', 'Playfair Display', 'Space Grotesk', 'Anton', 'JetBrains Mono'.
CRITICAL: You MUST use typographic contrast by assigning DIFFERENT fonts to the label, title, and body elements on the same slide (e.g., use a mono font for the label, a bold display font for the title, and a clean sans-serif for the body).

ZONAS FÍSICAS — REGRA DE LAYOUT INEGOCIÁVEL:

O slide é dividido em duas zonas que NUNCA se sobrepõem:

ZONA VISUAL (imagem, elementos decorativos):
- Ocupa uma região específica: topo, lateral esquerda, ou canto
- Máximo 45% da área do slide
- Elementos com z-index baixo (10–20)
- NEVER contains readable text, titles, words, or loose letters.

ZONA DE LEITURA (todo o texto):
- Região separada da zona visual, sem sobreposição
- Fundo com contraste suficiente para leitura (sólido ou semi-opaco)
- Elementos com z-index alto (40–50)
- Padding interno de 24px mínimo

TESTE DE VALIDAÇÃO ANTES DE RENDERIZAR:
Cada palavra do texto está 100% legível? 
Se NÃO → mova ou escureça o fundo da zona de leitura.
Se o conteúdo não cabe na zona de leitura → CORTE o texto.

NUNCA posicione imagem sobre texto principal.
NUNCA deixe texto transbordando fora do slide.

Prohibited in the generated image: loose decorative letters, background words, visible lorem ipsum text, background typography that mixes with the real content.

TECHNICAL LAYOUT INSTRUCTION — MANDATORY FOR ALL SLIDES:
The slides are editorial collages. Never presentation layouts.

MANDATORY HTML STRUCTURE:
- The slide container uses position: relative
- All internal elements use position: absolute
- Minimum 4 layers with different z-index (10, 20, 30, 40)
- Elements intentionally overlap

LAYERS IN ORDER:
z-index 10 -> textured background (background-image, grain, CSS pattern)
z-index 20 -> image/photo with irregular clip-path or asymmetric border-radius
z-index 30 -> semi-opaque color blocks (background + opacity)
z-index 40 -> text (large bold title + smaller body)
z-index 50 -> overlapping decorative elements (lines, SVG circles, stickers)

TYPOGRAPHY:
- Title: minimum font-size 3.5rem, font-weight 900, overlaps other elements
- Never align all texts to the center
- Mix alignments (left + center) on the same slide

MAIN IMAGE:
- Never as a simple rectangle
- Use clip-path: polygon() or irregular border
- Positioned off-center, bleeding off the edges

SLIDE LIMIT & CONTENT RULES:
- MAXIMUM 10 SLIDES TOTAL. You are forbidden from generating more than 10 slides.

DESIGN METADATA LINES — MUST BE REMOVED FROM OUTPUT:
Lines starting with these patterns are DESIGN INSTRUCTIONS ONLY and must NEVER appear in the final slides:
- "Elemento visual:*" or "Elemento visual:" (describes what should be in the image, not slide content)
- "Destaque:*" or "Destaque:" (highlights information for design context only)
- "Nota:*" or "Nota:" (design notes or annotations)

IMPORTANT: When you encounter these lines, use them ONLY to inform your design choices (imagePrompt, colors, layout). REMOVE them completely from 'title' and 'body' fields. They are metadata, not part of the carousel narrative.

CONTEÚDO — REGRA ABSOLUTA:
Use o texto do roteiro EXATAMENTE como fornecido.
Não reescreva, não resuma, não parafraseie, não simplifique.
Cada frase do roteiro deve aparecer no slide correspondente 
palavra por palavra. O texto é sagrado.
EXCEPTION: Lines marked with "Elemento visual:", "Destaque:", or "Nota:" are metadata and must be excluded from slides.

- Slides with list items: maximum 3 visible items per slide.
- IMAGENS ESTÁTICAS (SEM SCROLL): Este carrossel será exportado como imagens para redes sociais. NÃO EXISTE SCROLL. Todo o texto DEVE caber visivelmente no slide.
- Se um slide tiver muito texto, use no mínimo (título: 2rem, corpo: 0.9rem). NUNCA use fontes menores que isso, pois fica ilegível em redes sociais.
- Se o texto for longo demais para caber com a fonte mínima de 0.9rem, VOCÊ DEVE DIVIDIR O TEXTO EM MÚLTIPLOS SLIDES, mesmo que o roteiro seja manual.

TÍTULO CURTO E GIGANTE (NUNCA CORTADO):
O título de cada slide deve ser CURTO, IMPACTANTE E GIGANTE (2 a 5 palavras).
Extraia a essência da primeira frase para o título. O restante da frase vai para o corpo do texto.
Tamanho da fonte do título: ideal 3.5rem a 5rem. Se o título for mais longo que 5 palavras OU contiver palavras muito longas (mais de 12 letras), OBRIGATORIAMENTE reduza para 2rem a 2.5rem.
Se o texto do corpo for longo, reduza a fonte do corpo (0.9rem a 1rem) para garantir que caiba sem cortar, mas nunca menor que 0.9rem.

PREENCHIMENTO DO SLIDE — REGRA DE LAYOUT:
O conteúdo deve preencher 85-90% da altura do slide.
Nenhum slide pode ter mais de 15% de espaço vazio.

Se o conteúdo for curto, compense com:
- Título em fonte maior (até 5rem)
- Espaçamento generoso entre elementos
- Elemento visual maior ocupando a área restante
- Citação ou frase em destaque em tamanho grande

Nunca deixe metade do slide vazia.

PADDING E SCROLL — REGRA CRÍTICA:

O conteúdo visível do slide começa 40px abaixo do topo 
e termina 40px acima do rodapé. Nada fora dessas margens.

O container do slide tem overflow: hidden.
Todo texto DEVE estar dentro dessas margens — nunca além.

Para slides com muito conteúdo:
- Reduza o tamanho da fonte do corpo (mínimo 13px)
- Aumente o espaçamento entre itens apenas se sobrar espaço
- Corte itens da lista até caber — nunca deixe scroll

TEXTO CORTADO = slide com erro. Refaça com menos conteúdo.

ELEMENTOS DECORATIVOS — LISTA NEGRA COMPLETA:
NUNCA usar nenhum desses elementos como decoração:
- Círculo outline em qualquer cor (branco, dourado, marrom, creme)
- Losango outline em qualquer cor
- Linha diagonal solitária sem propósito
- Elipse outline
- Qualquer forma geométrica vazia (só borda, sem preenchimento)

Decoração permitida:
- Manchas de cor sólida com opacidade (40-70%)
- Pontos halftone em área
- Blocos geométricos sólidos como fundo
- Fragmentos de papel rasgado
- Texto decorativo grande em baixa opacidade

Se não tiver imagem real carregada no slide, substitua por: mancha de cor com textura, fragmento tipográfico grande decorativo, ou bloco geométrico sólido com opacidade.

SLIDES SEM IMAGEM:
Nunca usar "Image pending" ou placeholder vazio.
Se a imagem falhar, o slide precisa funcionar só com tipografia e textura — sem espaço em branco.

Para slides tipográficos: título em fonte display enorme (5–8rem) ocupando a maior parte do espaço visual.

LAYOUT VARIATION — MANDATORY:
VARIAÇÃO OBRIGATÓRIA — CADA SLIDE DEVE SER DIFERENTE:
Proibido usar o mesmo layout em dois slides seguidos. Alterne obrigatoriamente entre:
- 'left-half': LAYOUT A: Imagem ocupa metade esquerda, texto direita
- 'top-half': LAYOUT B: Imagem ocupa topo inteiro, texto embaixo em faixa
- 'full-background': LAYOUT C: Texto centralizado grande, imagem como fundo com overlay
- 'bleed-right': LAYOUT D: Texto à esquerda em coluna, imagem vaza pela borda direita

LAYOUT TOPO/BAIXO — PROIBIDO como padrão:
Máximo 2 slides no carousel inteiro podem usar imagem topo + texto embaixo ('top-half'). Os demais precisam de layouts diferentes.

Cada slide também deve ter uma paleta ligeiramente diferente dentro da mesma família de cores — não usar exatamente as mesmas cores em todos.

TEXTO CORTADO = slide com erro. Nenhum texto deve ficar cortado no resultado final. Refaça com menos conteúdo ou reduza a fonte.

PROHIBITED:
- Displaying structural labels like "SLIDE 1 —" or "COVER" in the final design. Labels should be thematic (e.g., "PRO TIP") or empty.
- Image always positioned in the same place (e.g., top right corner).
- Text overflowing outside the slide boundaries.
- display: flex with justify-content: center on everything
- Elements that do not overlap
- Layout that looks like a PowerPoint slide

STYLE GUIDE (O DNA INVARIÁVEL DO ESTILO):
Use these principles to generate the 'imagePrompt' and 'design' parameters.
1. INVARIABLE DNA:
- Layered Collage: 3-4 overlapping layers (textured background, cutout photo, abstract shapes).
- Organic Cutout: Main photo with irregular silhouette, thin white border (sticker style), no rectangular masks.
- NO TEXT IN IMAGES: Absolutely no typography, letters, or words in the generated image.
- Handwritten Annotations: Abstract underlines, circles, scribbles that look hand-drawn but contain NO WORDS.
- Print Texture: Halftone, paper, gloss, or grain.
- Aggressive Hierarchy: Huge title dominates, rest is subordinated.
- Cultural Reference: Film frame, archive photo, image with its own narrative.

2. PALETA DE CORES:
${designPrompt ? `O usuário solicitou um design específico: "${designPrompt}". Você DEVE criar uma paleta de cores baseada EXATAMENTE nesse pedido. Ignore as restrições de cores padrão e use as cores, hexadecimais e estilos que o usuário pediu.` : `Você DEVE usar EXATAMENTE estas cores para garantir harmonia:
- Fundo Claro: #F5F5F0 ou #EFEBE4. Texto: #2D1A11. Destaque: #C5A059.
- Fundo Escuro: #2D1A11 ou #1A0F0A. Texto: #F5F5F0. Destaque: #C5A059.
- Fundo Dourado: #C5A059. Texto: #2D1A11. Destaque: #F5F5F0.
NÃO INVENTE CORES FORA DESSES HEXADECIMAIS. Azul, verde, vermelho, cores frias: PROIBIDO.`}

3. IMAGE PROMPT GENERATION:
Your 'imagePrompt' MUST follow this master structure:
"Editorial collage, [PALETTE COLORS], real photographic elements: ancient marble sculptures, classical paintings detail, aged paper textures, historical black and white photography, organic cutout with thin white sticker border, halftone grain overlay, torn paper edges, NO TEXT, NO LETTERS, NO WORDS, NO CIRCLES, NO RINGS, NO GEOMETRIC OUTLINES, NO ILLUSTRATION, NO VECTOR ART, photorealistic collage zine aesthetic, asymmetric composition, negative space for text overlay, [CULTURAL THEME/SUBJECT]"
Adapt the bracketed parts based on the chosen palette and the slide's content.

Return a JSON array where each object represents a slide.`;

  const typographySchema = {
    type: Type.OBJECT,
    properties: {
      fontFamily: { type: Type.STRING, description: "Font family (e.g., 'Inter', 'Playfair Display', 'Space Grotesk', 'Anton', 'JetBrains Mono')" },
      color: { type: Type.STRING, description: "Hex color code (e.g., '#FFFFFF', '#00FF00')" },
      fontSize: { type: Type.STRING, description: "CSS font size (e.g., '1rem', '3rem', '5rem')" },
      fontWeight: { type: Type.STRING, description: "CSS font weight (e.g., '400', '700', '900')" },
      textTransform: { type: Type.STRING, description: "'none', 'uppercase', or 'lowercase'" },
    },
    required: ["fontFamily", "color", "fontSize", "fontWeight", "textTransform"],
  };

  const carouselSchema = {
    type: Type.ARRAY,
    items: {
      type: Type.OBJECT,
      properties: {
        label: {
          type: Type.STRING,
          description: "A short tag, number, or category (e.g., '01', 'PRO TIP', 'STEP 2'). Can be empty.",
        },
        title: {
          type: Type.STRING,
          description: "The main heading or hook of the slide.",
        },
        body: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "The explanatory paragraphs or subtext. Each item in the array is a distinct paragraph.",
        },
        imagePrompt: {
          type: Type.STRING,
          description: "A detailed prompt for an AI image generator to create a background or illustration for this slide. The prompt should describe a cohesive visual style (e.g., 'minimalist 3d render, vibrant neon colors, dark background').",
        },
        design: {
          type: Type.OBJECT,
          properties: {
            backgroundColor: { type: Type.STRING, description: "Hex color code for the solid background (e.g., '#18181b')" },
            overlayColor: { type: Type.STRING, description: "Hex color code for the background overlay (e.g., '#00000080' for 50% black, '#FF000040' for red tint)" },
            textAlign: { type: Type.STRING, description: "'left', 'center', or 'right'" },
            imagePosition: { type: Type.STRING, description: "'left-half', 'top-half', 'full-background', or 'bleed-right'" },
            labelTypography: typographySchema,
            titleTypography: typographySchema,
            bodyTypography: typographySchema,
          },
          required: ["backgroundColor", "overlayColor", "textAlign", "imagePosition", "labelTypography", "titleTypography", "bodyTypography"],
        }
      },
      required: ["title", "imagePrompt", "design"],
    },
  };

  // PASS 1: Generate Draft
  const draftResponse = await generateWithResilience(ai, text, {
    systemInstruction,
    responseMimeType: "application/json",
    responseSchema: carouselSchema,
  });

  const draftJsonStr = draftResponse.text?.trim() || "[]";

  // PASS 2: Quality Assurance Reviewer
  const reviewerInstruction = `You are a strict Quality Assurance Art Director. Your job is to review the provided carousel JSON draft and FIX IT before final delivery. You cannot see the rendered images, so you MUST use mathematical logic on the JSON values to fix layout issues.

CRITICAL ERRORS TO FIX:

1. REPETITIVE LAYOUTS & COLORS (THE MOST COMMON ERROR):
   - Check the 'imagePosition' of EVERY slide.
   - If slide 1 is 'left-half', slide 2 CANNOT be 'left-half'. 
   - You MUST force a different 'imagePosition' for every consecutive slide. Cycle through: 'left-half', 'top-half', 'full-background', 'bleed-right'.
   - Check 'backgroundColor'. Cada slide deve ter uma paleta ligeiramente diferente. ${designPrompt ? `Use as cores solicitadas pelo usuário: "${designPrompt}".` : `Use APENAS os hexadecimais permitidos (#F5F5F0, #EFEBE4, #2D1A11, #1A0F0A, #C5A059).`} Não usar exatamente as mesmas cores em todos os slides.

2. SLIDE LIMIT & TEXT OVERFLOW:
   - IMAGENS ESTÁTICAS: O carrossel é para redes sociais. NÃO HÁ SCROLL. O texto não pode vazar do slide.
   - MAXIMUM 10 SLIDES. If the draft has more than 10 slides, you MUST combine or summarize them to be exactly 10 or fewer.
   - Count the characters in 'title' + 'body'.
   - If total characters > 300: You MUST split the content into two separate slides to maintain readability. Minimum font size is body: 0.9rem, title: 2rem.
   - If total characters > 200: body MUST be '0.9rem', title MUST be '2rem'.
   - If total characters > 150: body MUST be '1rem', title MUST be '2.5rem'.
   - TÍTULO CURTO E GIGANTE: O título deve ter no máximo 5 palavras e tamanho GIGANTE (3.5rem a 5rem). Se o título tiver mais de 5 palavras ou palavras muito longas, reduza para 2rem.

   - CONTEÚDO — REGRA ABSOLUTA: Use o texto do roteiro EXATAMENTE como fornecido. Não reescreva, não resuma, não parafraseie. O texto é sagrado.

3. EXCESSIVE WHITE SPACE (EMPTY SLIDES):
   - PREENCHIMENTO DO SLIDE — REGRA DE LAYOUT: O conteúdo deve preencher 85-90% da altura do slide. Nenhum slide pode ter mais de 15% de espaço vazio. Nunca deixe metade do slide vazia.
   - If total characters < 50 (very short text):
     - 'titleTypography.fontSize' MUST be massive: '4rem', '5rem', or '6rem'.
     - 'bodyTypography.fontSize' MUST be '1.2rem' or '1.5rem'.
   - If imagePosition is 'full-background' and the slide appears empty, CHANGE imagePosition to 'left-half' or 'bleed-right' and ensure the imagePrompt requests a high-contrast photographic subject that fills the visual zone without bleeding into the text zone.
   - NEVER use 'full-background' for slides with long body text — the overlay always reduces legibility. Reserve 'full-background' only for slides with 1-2 short lines of text maximum.
     - 'imagePosition' MUST be 'full-background' or 'top-half' to fill space with an image.

4. LACK OF TYPOGRAPHIC CONTRAST:
   - On the SAME slide, 'titleTypography.fontFamily' and 'bodyTypography.fontFamily' MUST BE DIFFERENT.
   - Example: Title = 'Anton' (sans-serif display), Body = 'Playfair Display' (serif).
   - If they are the same in the draft, CHANGE ONE OF THEM.

Return the CORRECTED JSON array of slides.`;

  const reviewResponse = await generateWithResilience(
    ai,
    `Here is the draft JSON:\n${draftJsonStr}\n\nPlease fix any issues regarding text length, font contrast, and white space, and return the final JSON.`,
    {
      systemInstruction: reviewerInstruction,
      responseMimeType: "application/json",
      responseSchema: carouselSchema,
    }
  );

  const finalJsonStr = reviewResponse.text?.trim() || "[]";
  try {
    return JSON.parse(finalJsonStr) as Slide[];
  } catch (e) {
    console.error("Failed to parse JSON:", e, finalJsonStr);
    throw new Error("Gemini retornou um JSON inválido.");
  }
}

export async function generateSlideImage(prompt: string, _apiKey?: string, retries = 3): Promise<string> {
  try {
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, Math.random() * 500));
    
    // Build Pollinations.ai URL
    // Encode the prompt for URL safety, add parameters for quality
    const encodedPrompt = encodeURIComponent(prompt);
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true&seed=${Math.floor(Math.random() * 999999)}`;
    
    // Fetch the image and convert to base64 data URL
    // This maintains compatibility with the existing html-to-image capture pipeline
    const response = await fetch(pollinationsUrl);
    
    if (!response.ok) {
      throw new Error(`Pollinations returned status ${response.status}`);
    }
    
    const contentType = response.headers.get("content-type") || "image/png";
    const buffer = Buffer.from(await response.arrayBuffer());
    return `data:${contentType};base64,${buffer.toString("base64")}`;
  } catch (error) {
    if (retries > 0) {
      console.warn(`Image generation failed, retrying... (${retries} retries left)`, error);
      await new Promise(resolve => setTimeout(resolve, 2000));
      const modifiedPrompt = prompt + " (high quality, safe for work)";
      return generateSlideImage(modifiedPrompt, _apiKey, retries - 1);
    }
    
    console.error("Image generation failed after retries:", error);
    throw error;
  }
}
