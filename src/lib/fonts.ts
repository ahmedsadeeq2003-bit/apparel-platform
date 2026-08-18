import { Anton, Archivo, Bebas_Neue, Caveat, Permanent_Marker, Playfair_Display } from "next/font/google";

export const anton = Anton({
  weight: "400",
  variable: "--font-anton",
  subsets: ["latin"],
});

export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

// Editorial display serif -- used only within the `.theme-editorial` scope
// (see tokens.css), for the fashion-studio homepage direction.
export const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
  weight: ["500", "600"],
});

// Editor-only text-tool fonts (Anton/Archivo/Playfair above are reused for
// the "Streetwear"/"Minimal"/"Editorial" curated options -- these three are
// the only new font loads for the "Graffiti"/"Handwritten"/"Bold" options).
export const permanentMarker = Permanent_Marker({
  weight: "400",
  variable: "--font-permanent-marker",
  subsets: ["latin"],
});

export const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  weight: ["500", "700"],
});

export const bebasNeue = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas-neue",
  subsets: ["latin"],
});
