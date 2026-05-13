export interface TypographyDesign {
  fontFamily: string;
  color: string;
  fontSize: string;
  fontWeight: string;
  textTransform: "none" | "uppercase" | "lowercase";
}

export interface SlideDesign {
  backgroundColor: string;
  overlayColor: string;
  textAlign: "left" | "center" | "right";
  imagePosition: "left-half" | "top-half" | "full-background" | "bleed-right" | "none";
  labelTypography: TypographyDesign;
  titleTypography: TypographyDesign;
  bodyTypography: TypographyDesign;
}

export interface Slide {
  label?: string;
  title: string;
  body?: string[];
  imagePrompt: string;
  imageUrl?: string;
  isGeneratingImage?: boolean;
  design: SlideDesign;
}

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
  }
}
