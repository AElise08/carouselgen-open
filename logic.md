# Lógica de Renderização e Exportação do Carrossel

## 1. Geração da Imagem (App.tsx & geminiService.ts)
- O usuário insere um prompt ou seleciona um post.
- `generateCarouselScript` cria o JSON com o roteiro e o `imagePrompt` para cada slide (via Gemini API para o script).
- `generateSlideImage` usa o **Pollinations.ai** para gerar a imagem a partir do prompt.
  - URL construída: `https://image.pollinations.ai/prompt/{prompt}?width=1024&height=1024&nologo=true&seed={random}`
  - Sem API key necessária — totalmente gratuito.
- A imagem é baixada via `fetch`, convertida para **Base64** (`data:image/...;base64,...`) via `FileReader`.
- Essa string Base64 é salva no estado `slides` dentro da propriedade `imageUrl`.

## 2. Renderização Visual (CarouselPreview.tsx)
- O componente `CarouselPreview` recebe os `slides`.
- Ele renderiza duas coisas:
  1. **O Carrossel Visível:** Um preview responsivo na tela do usuário.
  2. **O Container Oculto (`hiddenContainerRef`):** Uma versão em tamanho real (1080x1080px) de todos os slides, posicionada fora da tela (`top: -9999px`). Isso serve para garantir que a exportação tenha alta resolução.

## 3. O Problema da "Camada de Baixo" (Fundo sem Imagem)
A função `renderImage` cria a camada da imagem usando uma `div` com `clip-path` e uma tag `<img>` dentro:
```tsx
<div style={{ clipPath }}>
  <img src={slide.imageUrl} />
</div>
```

Quando o usuário clica em **Download as PNG**:
1. A função `handleDownloadCurrentSlide` busca o elemento do slide correspondente dentro do **Container Oculto**.
2. Ela aguarda as imagens carregarem (usando `img.onload`).
3. Ela chama a biblioteca `html-to-image` (`toPng`) para converter o DOM em um Canvas e depois em PNG.

**Por que a imagem some e só o fundo aparece?**
A biblioteca `html-to-image` tem limitações conhecidas ao clonar o DOM:
1. **Clip-Path Bug:** Em navegadores baseados em WebKit (Safari) e às vezes no Chrome, quando um elemento tem `clip-path`, o `html-to-image` falha ao renderizar os elementos filhos (a tag `<img>`), resultando em uma área vazia (mostrando apenas a cor de fundo do slide).
2. **Off-screen Rendering:** Como o container oculto está em `top: -9999px`, o navegador pode otimizar a renderização e não "pintar" a imagem Base64 na memória, fazendo com que o `html-to-image` capture um quadro vazio.
3. **Animações/Transições:** O CSS do Tailwind (`absolute`, `overflow-hidden`) combinado com o `clip-path` cria um contexto de empilhamento complexo que o parser do `html-to-image` não consegue traduzir perfeitamente para o `<foreignObject>` do SVG (técnica usada por baixo dos panos para tirar a print).

## 4. Solução Proposta
Para resolver isso definitivamente, precisamos:
1. Trocar a biblioteca de captura para `html2canvas` (que desenha elemento por elemento no canvas e lida melhor com imagens Base64) OU aplicar o `clip-path` diretamente na tag `<img>` em vez de usar uma `div` wrapper.
2. Trazer o container oculto de volta para a viewport (ex: `z-index: -1`, `position: fixed`, `top: 0`, `left: 0`), mas escondê-lo de uma forma que o navegador ainda o pinte (ex: `opacity: 0.01` ou atrás de outro elemento).
3. Garantir que a imagem seja desenhada como `background-image` em vez de `<img>` tag, pois `html-to-image` lida melhor com backgrounds cortados por `clip-path` do que com tags `<img>` aninhadas.
