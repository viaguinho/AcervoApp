import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { addToBag } from "@/lib/bagStore";
import { toast } from "sonner";
import { HolographicButton } from "../components/HolographicButton";
import { calcularPrecoFromProduct, getCurrentVolumeMl, parseVolumeMl, getLiquidColor } from "@/lib/openedBottle";
import catalogoLocal from "@/data/catalogo-acervo.json";
import { useDraggableLayout, useDraggable } from "@/hooks/useDraggableLayout";
import FloatingActionMenu from "@/components/ui/floating-action-menu";
import { Share2, MessageCircle, Mail, Link2, ShoppingBag } from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";
import { Lens } from "@/components/ui/lens";
import { GlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button";
import { AuroraBackground } from "@/components/ui/aurora-background";
import GlassSurface from "@/components/ui/GlassSurface";
import { GooeyText } from "@/components/ui/gooey-text-morphing";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
};

const fadeUpItem = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
};

const chipContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const chipItem = {
  hidden: { opacity: 0, y: 12, scale: 0.95 },
  show: { 
    opacity: 1, 
    y: 0, 
    scale: 1, 
    transition: { 
      type: "spring", 
      stiffness: 300, 
      damping: 22 
    } 
  }
};

/* ─────────────────────────────
   SENSORY ICONS - SVG MINIMALISTAS
   Design de Alta Costura Mixológica (stroke-width 1.5px / Springy Physics)
   Estilizados com precisão editorial
───────────────────────────── */

const sensoryIcons = {
  "Amadeirado": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="6" strokeDasharray="3 3" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 3v2M12 19v2M3 12h2M19 12h2" />
    </svg>
  ),
  "Cítrico": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18M3 12h18M5.64 5.64l12.72 12.72M5.64 18.36L18.36 5.64" />
    </svg>
  ),
  "Mel": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2v4M8 6h8M6 9h12M6 12h12M8 15h8M12 15v3c0 1.5-1.5 2.5-1.5 3.5s1 1.5 1.5 1.5 1.5-.5 1.5-1.5-1.5-2-1.5-3.5" />
    </svg>
  ),
  "Defumado": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 20c0-3.5 2-5 2-7.5S9.5 8 9.5 4M15 20c0-3.5 2-5 2-7.5S15.5 8 15.5 4M5 20h14" />
    </svg>
  ),
  "Floral": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="2" />
      <path d="M12 10a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5zM12 14a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zM14 12a2.5 2.5 0 1 0 5 0 2.5 2.5 0 0 0-5 0zM10 12a2.5 2.5 0 1 0-5 0 2.5 2.5 0 0 0 5 0z" />
    </svg>
  ),
  "Frutado": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8z" />
      <path d="M12 6V3c1 0 2 1 2.5 2" />
      <path d="M8 14c0-2.2 1.8-4 4-4" />
    </svg>
  ),
  "Herbáceo": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 22c0-10 6-18 18-20-2 8-10 14-18 20z" />
      <path d="M9 15c2.5-3 5-4.5 8.5-5.5" />
    </svg>
  ),
  "Especiarias": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="2.5" />
      <path d="M12 9.5c0-2.5-1.5-4.5-1.5-4.5s1.5 2 1.5 4.5z" />
      <path d="M12 14.5c0 2.5 1.5 4.5 1.5 4.5s-1.5-2-1.5-4.5z" />
      <path d="M14.5 12c2.5 0 4.5 1.5 4.5 1.5s-2-1.5-4.5-1.5z" />
      <path d="M9.5 12c-2.5 0-4.5-1.5-4.5-1.5s2 1.5 4.5 1.5z" />
      <path d="M13.8 10.2c1.8-1.8 3.9-2.2 3.9-2.2s-.4 2.1-2.2 3.9z" />
      <path d="M10.2 13.8c-1.8 1.8-3.9 2.2-3.9 2.2s.4-2.1 2.2-3.9z" />
      <path d="M13.8 13.8c1.8 1.8 2.2 3.9 2.2 3.9s-2.1-.4-3.9-2.2z" />
      <path d="M10.2 10.2c-1.8-1.8-2.2-3.9-2.2-3.9s2.1.4 3.9 2.2z" />
    </svg>
  ),
  "Chocolate": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 3v18M15 3v18M3 9h18M3 15h18" />
    </svg>
  ),
  "Caramelo": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="10" height="10" rx="1.5" />
      <path d="M14 9c2 0 3 1.5 3 3s-1.5 3-3.5 3S10 16.5 10 18.5s1 2.5 2 2.5h6" />
    </svg>
  ),
  "Baunilha": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 12c-1.5-3-4-4-4-4s3 0.5 4 4z" />
      <path d="M12 12c1.5-3 4-4 4-4s-3 0.5-4 4z" />
      <path d="M12 12c-2 2-5 2.5-5 2.5s2.5-.5 5-2.5z" />
      <path d="M12 12c2 2 5 2.5 5 2.5s-2.5-.5-5-2.5z" />
      <path d="M12 12v9c0 0 3.5-2 3.5-4s-3.5-5-3.5-5z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
  "Marítimo": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12c3-3 6-3 9 0s6 3 9 0M2 17c3-3 6-3 9 0s6 3 9 0" />
    </svg>
  ),
  "Terroso": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 20h18M4 16l4-5 4 4 6-7 4 6" />
    </svg>
  ),
  "Tropical": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22V10M12 10c0-4 3-6 5-6M12 10c0-4-3-6-5-6M12 10c3-2 6 0 6 2M12 10c-3-2-6 0-6 2" />
    </svg>
  ),
  "Turfado": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2c0 0 4 4 4 8s-4 10-4 12c0 0-4-6-4-12s4-8 4-8z" />
      <path d="M12 12c-2-2-2-4-2-4s1.5 2 2 4z" />
    </svg>
  ),
  "Nozes": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a6 6 0 0 1 6 6c0 3-2.5 5-6 8c-3.5-3-6-5-6-8a6 6 0 0 1 6-6z" />
      <path d="M12 17v4M8 21h8" />
    </svg>
  ),
  "Mentolado": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22V12M12 12c2-2 5-2 6 0s0 4-6 5c-6-1-7-3-6-5s4-2 6 0z" />
    </svg>
  ),
  "Picante": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 3a2 2 0 0 1 2 2c0 2.5-2 4.5-4 6.5s-4 4.5-4 6.5a6 6 0 0 0 12 0c0-4.5-4-7.5-6-10" />
    </svg>
  )
};

/* ─────────────────────────────
   SPEC ROW
───────────────────────────── */

function SpecRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between py-4 border-b-[0.5px] border-black/[0.04] last:border-0 gap-4">
      <span className="text-[10px] tracking-[0.2em] uppercase text-foreground/40 font-outfit font-semibold flex-shrink-0">{label}</span>
      <span className="text-[12px] tracking-[0.05em] uppercase text-foreground font-semibold text-right max-w-[65%] font-outfit flex justify-end min-w-0">{value}</span>
    </div>);
}

/* ─────────────────────────────
   ORBIT RING — Círculo 3D elíptico inclinado
───────────────────────────── */





/* ─────────────────────────────
   BOTTLE IMAGE — animada (Rotação 3D)
───────────────────────────── */

const bottleVariants = {
  enter: (dir) => ({
    rotateY: dir > 0 ? 90 : -90,
    opacity: 0,
    scale: 0.95
  }),
  center: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.45,
      ease: [0.33, 0.66, 0.66, 1], // easeOutCubic
      rotateY: { duration: 0.45 },
      opacity: { duration: 0.35, delay: 0.1 },
      scale: { duration: 0.45 }
    }
  },
  exit: (dir) => ({
    rotateY: dir > 0 ? -90 : 90,
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.45,
      ease: [0.32, 0, 0.67, 0], // easeInCubic
      rotateY: { duration: 0.45 },
      opacity: { duration: 0.35, delay: 0.05 },
      scale: { duration: 0.45 }
    }
  })
};

/* ─────────────────────────────
   COLOR UTILITIES - CONTRAST & SATURATION ENHANCEMENT
───────────────────────────── */

function hexToHsl(hex) {
  hex = hex.replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map(char => char + char).join('');
  }
  let r = parseInt(hex.substring(0, 2), 16) / 255;
  let g = parseInt(hex.substring(2, 4), 16) / 255;
  let b = parseInt(hex.substring(4, 6), 16) / 255;
  let max = Math.max(r, g, b);
  let min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  if (max === min) {
    h = s = 0;
  } else {
    let d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  };
}

function hslToHex(h, s, l) {
  s /= 100;
  l /= 100;
  let c = (1 - Math.abs(2 * l - 1)) * s;
  let x = c * (1 - Math.abs((h / 60) % 2 - 1));
  let m = l - c / 2;
  let r = 0, g = 0, b = 0;
  if (0 <= h && h < 60) {
    r = c; g = x; b = 0;
  } else if (60 <= h && h < 120) {
    r = x; g = c; b = 0;
  } else if (120 <= h && h < 180) {
    r = 0; g = c; b = x;
  } else if (180 <= h && h < 240) {
    r = 0; g = x; b = c;
  } else if (240 <= h && h < 300) {
    r = x; g = 0; b = c;
  } else if (300 <= h && h < 360) {
    r = c; g = 0; b = x;
  }
  let rHex = Math.round((r + m) * 255).toString(16).padStart(2, '0');
  let gHex = Math.round((g + m) * 255).toString(16).padStart(2, '0');
  let bHex = Math.round((b + m) * 255).toString(16).padStart(2, '0');
  return `#${rHex}${gHex}${bHex}`;
}

function getEnhancedColorForText(hexColor) {
  try {
    const hsl = hexToHsl(hexColor);
    if (hsl.l > 65) {
      hsl.l = 42; // Aumenta o contraste reduzindo a luminosidade de cores muito claras
    }
    if (hsl.s < 40) {
      hsl.s = Math.min(100, hsl.s + 35); // Aumenta a saturação para destacar a cor
    }
    return hslToHex(hsl.h, hsl.s, hsl.l);
  } catch (e) {
    return hexColor;
  }
}

/* ─────────────────────────────
   TEXT SHORTENING UTILITIES
───────────────────────────── */

function summarizeText(text) {
  if (!text) return "";
  let t = text.trim();
  
  // Abreviações globais de termos longos para otimizar espaço
  t = t.replace(/\bPremium\b/gi, "Prem.")
       .replace(/\bClássico\b/gi, "Cláss.")
       .replace(/\bClássica\b/gi, "Cláss.")
       .replace(/\bclássico\b/gi, "cláss.")
       .replace(/\bclássica\b/gi, "cláss.")
       .replace(/\bEspresso\b/gi, "Esp.")
       .replace(/\bArtesanal\b/gi, "Art.")
       .replace(/\bartesanal\b/gi, "art.")
       .replace(/\bCaipirinha\b/gi, "Caip.")
       .replace(/\bcaipirinha\b/gi, "caip.")
       .replace(/\bDigestivo\b/gi, "Dig.")
       .replace(/\bdigestivo\b/gi, "dig.");

  const replacements = {
    "Gin Tônica Clássico com Limão Siciliano": "Gin Tônica Clássica",
    "Gin Tônica clássica com limão taiti": "Gin Tônica Clássica",
    "Caipirinha clássica com limão taiti": "Caipirinha de Limão",
    "Caipirinha de maracujá com borda de açúcar": "Caipirinha Maracujá",
    "Digestivo puro com gelo e raspas de laranja": "Digestivo com Gelo",
    "Digestivo puro com gelo e casca de laranja": "Digestivo com Gelo",
    "On the rocks com gelo e casca de laranja": "On the rocks com Laranja",
    "On the rocks com rodela de laranja": "On the rocks com Laranja",
    "On the rocks com casca de laranja": "On the rocks com Laranja",
    "Ramazzotti Spritz (Ramazzotti, prosecco, laranja)": "Ramazzotti Spritz",
    "Averna Spritz (Averna, prosecco, laranja)": "Averna Spritz",
    "Lucano Spritz (Lucano, água com gás, fatia de limão)": "Lucano Spritz",
    "Margarita clássica (silver, Cointreau, limão, sal)": "Margarita Clássica",
    "Margarita Patrón Silver (pura, sem mixes)": "Margarita Patrón",
    "Pisco Sour argentino (com limão verde)": "Pisco Sour",
    "Pisco Sour chileno": "Pisco Sour",
    "Pisco Sour clássico (1615, limão, clara, xarope, angostura)": "Pisco Sour Clássico",
    "Talisker & Soda marinha": "Talisker & Soda",
    "Bobby Burns (scotch, vermouth rosso, Bénédictine)": "Bobby Burns",
    "Woodford Reserve Kentucky Bourbon": "Woodford Bourbon",
    "Monkey Old Fashioned (Monkey, mel, angostura laranja)": "Monkey Old Fashioned",
    "Wild Turkey Rye Whiskey": "Wild Turkey Rye",
    "Suntory Toki Japanese Whisky": "Suntory Toki",
    "William Grant's Family Reserve Scotch": "William Grant's",
    "Tiramisù clássico": "Tiramisù",
    "Tiramisu clássico": "Tiramisù",
    "Mortadela de Bolonha": "Mortadela",
    "Panna cotta com calda de frutas": "Panna Cotta",
    "Risotto alla milanese": "Risoto Milanese",
    "Queijo parmesão curado": "Parmesão Curado",
    "Costela bovina defumada": "Costela Defumada",
    "Figos frescos com mel": "Figos com Mel",
    "Torresmo crocante com páprica": "Torresmo Crocante",
    "Churrasco gaúcho de costela": "Churrasco de Costela",
    "Queijo provolone grelhado": "Provolone Grelhado",
    "Picanha com chimichurri": "Picanha Chimichurri",
    "Carne seca com mandioca": "Carne Seca e Mandioca",
    "Chocolate amargo com flor de sal": "Chocolate com Flor de Sal",
    "Chocolate amargo 70%": "Chocolate 70%",
    "Cannoli siciliano": "Cannoli",
    "Arancini de carne": "Arancini",
    "Queijo pecorino siciliano": "Pecorino",
    "Figos assados com mel": "Figos com Mel",
    "Bistecca com chimichurri de ervas": "Bistecca Chimichurri",
    "Biscoitos de avelã": "Biscoitos Avelã",
    "Queijo pecorino com mel": "Pecorino com Mel",
    "Salame picante": "Salame",
    "Bruschetta de tomate com manjericão": "Bruschetta Tomate",
    "Torta de ricota": "Torta Ricota",
    "Queijo de coalho na brasa": "Queijo Coalho",
    "Tapioca de carne seca": "Tapioca Carne Seca",
    "Pamonha salgada": "Pamonha",
    "Baião de dois": "Baião de Dois",
    "Carnes grelhadas ao ponto": "Carnes Grelhadas",
    "Queijo gruyère": "Queijo Gruyère",
    "Lombo de porco assado com ervas": "Lombo Assado",
    "Risotto de cogumelos": "Risoto Cogumelos",
    "Fondant de chocolate amargo": "Fondant Chocolate",
    "Guacamole artesanal": "Guacamole",
    "Tostadas de tinga de frango": "Tostadas Frango",
    "Quesillo": "Quesillo",
    "Nopales salteados com limão": "Nopales",
    "Empanadas oaxaqueñas": "Empanadas",
    "Ostras frescas com limão e sal": "Ostras Frescas",
    "Queijo curado de alta qualidade": "Queijo Curado",
    "Carnes defumadas premium": "Carnes Defumadas",
    "Chocolates de origem única": "Chocolate Fino",
    "Trufas negras": "Trufas Negras",
    "Carnes especiadas festivas": "Carnes Especiadas",
    "Pierogi de carne e couve": "Pierogi",
    "Bigos": "Bigos",
    "Queijo oscypek defumado": "Queijo Defumado",
    "Sobremesas de canela e ouro": "Doces Canela",
    "Queijo de cabra fresco": "Queijo de Cabra",
    "Ostras com granita de absinto": "Ostras Absinto",
    "Frutos do mar com ervas": "Frutos do Mar",
    "Salmão curado": "Salmão Curado",
    "Salmão curado com ervas": "Salmão Curado",
    "Cogumelos salteados": "Cogumelos",
    "Jerk chicken com arroz e feijão": "Jerk Chicken",
    "Pudim de rum": "Pudim de Rum",
    "Frutas tropicais caramelizadas": "Frutas Tropicais",
    "Bolo de banana com rum": "Bolo de Banana",
    "Porco defumado ao estilo caribenho": "Porco Defumado",
    "Charque com mandioca": "Charque Mandioca",
    "Queijo amarelo maturado": "Queijo Maturado",
    "Tâmaras recheadas com queijo": "Tâmaras com Queijo",
    "Frutas secas mistas": "Frutas Secas",
    "Torta de maçã americana": "Torta de Maçã",
    "Caramel apple": "Maçã Caramelada",
    "Queijo brie com maçã": "Brie com Maçã",
    "Salada waldorf": "Salada Waldorf",
    "Crepe de maçã caramelada": "Crepe de Maçã",
    "Feijão preto com arroz": "Arroz e Feijão",
    "Brownie de chocolate": "Brownie",
    "Banana caramelada com sorvete": "Banana com Sorvete",
    "Panna cotta com coulis de framboesa": "Panna Cotta",
    "Cheesecake de frutas vermelhas": "Cheesecake",
    "Macarons de framboesa": "Macarons",
    "Pavlova com creme chantilly": "Pavlova",
    "Mousse de chocolate branco com berry": "Mousse Choc Branco",
    "Croissant de pistache": "Croissant Pistache",
    "Gelato de pistache artesanal": "Gelato Pistache",
    "Torrone de pistache": "Torrone Pistache",
    "Tiramisu de pistache": "Tiramisù Pistache",
    "Queijo de cabra com nozes": "Queijo com Nozes",
    "Salada grega com azeitonas": "Salada Grega",
    "Bruschetta de tapenade": "Bruschetta Tapenade",
    "Cordeiro assado com ervas": "Cordeiro Assado",
    "Mousse de chocolate amargo": "Mousse Chocolate",
    "Frutas secas com nozes": "Frutas e Nozes",
    "Chocolate amargo com especiarias": "Chocolate Especiado",
    "Foie gras com brioche": "Foie Gras",
    "Tarte aux fruits secs": "Torta Frutas Secas",
    "Torta de nozes": "Torta de Nozes",
    "Tiramisu": "Tiramisù",
    "Sorvete de baunilha artesanal": "Sorvete Baunilha",
    "Mousse au chocolat noir": "Mousse Choc Preto",
    "Framboesa fresca com chantilly": "Framboesa Chantilly",
    "Macaron de violeta": "Macaron Violeta",
    "Foie gras com compota": "Foie Gras Compota",
    "Panna cotta al limone": "Panna Cotta Limão",
    "Torta caprese de limone": "Torta Limão Caprese",
    "Risotto al limone": "Risoto de Limão",
    "Frutos do mar com limão": "Frutos do Mar",
    "Salmão grelhado com ervas": "Salmão Grelhado",
    "Guacamole com chips de tortilla": "Guacamole & Chips",
    "Tacos de peixe grelhado": "Tacos de Peixe",
    "Ceviche veracruzano": "Ceviche",
    "Sopa de tortilla": "Sopa Tortilla",
    "Quesadilla de flor de abóbora": "Quesadilla",
    "Ceviche de vieiras": "Ceviche Vieiras",
    "Tacos de peixe com crema": "Tacos de Peixe",
    "Guacamole de abacate premium": "Guacamole Premium",
    "Carpaccio de atum com jalapeño": "Carpaccio de Atum",
    "Tostadas de mariscos": "Tostadas Mariscos",
    "Empanadas mendocinas": "Empanadas",
    "Asado de tira": "Asado de Tira",
    "Chimichurri com pão": "Pão Chimichurri",
    "Chivito (cabrito assado)": "Chivito",
    "Asado argentino": "Asado Argentino",
    "Empanadas de carne com passas": "Empanadas Carne",
    "Provoleta grelhada": "Provoleta",
    "Malbec cheese board": "Tábua de Queijos",
    "Chivito com salsa criolla": "Chivito Criolla",
    "Ceviche ao estilo chileno": "Ceviche Chileno",
    "Mariscos da costa do Pacífico": "Mariscos",
    "Empanadas de mariscos": "Empanadas Mariscos",
    "Ensalada a la chilena": "Salada Chilena",
    "Caldillo de congrio": "Caldillo Congrio",
    "Ceviche clássico limeño": "Ceviche Limeño",
    "Tiradito de atum": "Tiradito Atum",
    "Causa rellena": "Causa Rellena",
    "Leche de tigre com frutos do mar": "Leche de Tigre",
    "Anticuchos de coração": "Anticuchos",
    "Ramen de frango shoyu": "Ramen Frango",
    "Frango karaage": "Frango Karaage",
    "Tonkatsu com molho": "Tonkatsu",
    "Soba fria com dipping": "Soba Fria",
    "Yakitori de aspargo com manteiga": "Yakitori Aspargo",
    "Churrasco de linguiça": "Churrasco Linguiça",
    "Queijos médios artesanais": "Queijos Médios",
    "Frios variados": "Frios Variados",
    "Torresmo com páprica": "Torresmo Páprica",
    "Sanduiche de roast beef": "Sanduíche Roast Beef",
    "Ostras Gillardeau": "Ostras",
    "Salmão defumado das Highlands": "Salmão Defumado",
    "Carnes de caça (veado, pombo)": "Carnes de Caça",
    "Queijo dunlop artesanal": "Queijo Dunlop",
    "Biscoitos de malte escoceses": "Biscoitos de Malte",
    "Jamón ibérico": "Jamón Ibérico",
    "Queijo manchego curado": "Manchego Curado",
    "Embutidos do País Basco": "Embutidos Bascos",
    "Bacalao al pil pil": "Bacalhau Pil Pil",
    "Pintxos de chorizo": "Pintxos Chorizo",
    "Carne defumada de costela": "Carne Defumada",
    "Queijo gouda curado extra": "Gouda Curado",
    "Pretzels com mostarda artesanal": "Pretzels & Mostarda",
    "Reuben sandwich de pastrami": "Reuben Pastrami",
    "Pão de centeio com manteiga temperada": "Pão de Centeio",
    "Salmão defumado escocês": "Salmão Defumado",
    "Queijo cheddar artesanal": "Cheddar Artesanal",
    "Castanhas caramelizadas": "Castanhas Doces",
    "Shortbread escocês": "Shortbread",
    "Brie com mel de rosmaninho": "Brie com Mel",
    "Costela bovina com barbecue de melaço": "Costela Barbecue",
    "Chocolate amargo 70% com noz": "Chocolate 70% Noz",
    "Kentucky bourbon cake": "Bolo de Bourbon",
    "Queijo emmental curado extra": "Emmental Curado",
    "Pecan pie com sorvete de baunilha": "Torta Pecan",
    "Frutos do mar grelhados": "Frutos do Mar"
  };
  return replacements[t] || t;
}

function cleanAndShorten(text) {
  const summarized = summarizeText(text);
  if (summarized.length > 25) {
    let cut = summarized.split(/ com | de | para | e | \(/i)[0].trim();
    if (cut.length > 0 && cut.length < 25) return cut;
    return summarized.substring(0, 24).trim();
  }
  return summarized;
}

/* ─────────────────────────────
   PRODUCT DETAIL PAGE
───────────────────────────── */

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [allProductsState, setAllProductsState] = useState(() => {
    const raw = location.state?.allProducts || [];
    return raw.map(p => {
      if (p.category === "Cachaca") p.category = "Cachaça";
      if (p.name === "Goldwasser Danzig 22 Karat") p.category = "Licor";
      if (p.name === "Absinthe Doc Pierre") p.category = "Bitter/Aperitivo";
      
      const localMatch = catalogoLocal.find(l => l.name === p.name);
      if (localMatch) {
        p.description = localMatch.description;
        p.suggested_use = localMatch.suggested_use;
        p.pairing = localMatch.pairing;
      }
      if (p.description) {
        p.description = p.description.replace(/—/g, "");
      }
      return p;
    });
  });

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verifica se o usuário é admin
  useEffect(() => {
    base44.auth.me().then(u => { if (u?.role === "admin") setIsAdmin(true); }).catch(() => {});
  }, []);

  useEffect(() => {
    if (id === "_CATEGORY_CONFIG_" || id === "_CONFIG_") {
      navigate("/", { replace: true });
      return;
    }

    async function load() {
      // @ts-ignore
      const products = await base44.entities.Product.filter({ id });
      if (products.length > 0) {
        const prod = products[0];
        if (prod.category === "Cachaca") prod.category = "Cachaça";
        if (prod.name === "Goldwasser Danzig 22 Karat") prod.category = "Licor";
        if (prod.name === "Absinthe Doc Pierre") prod.category = "Bitter/Aperitivo";
        
        const localMatch = catalogoLocal.find(l => l.name === prod.name);
        if (localMatch) {
          prod.description = localMatch.description;
          prod.suggested_use = localMatch.suggested_use;
          prod.pairing = localMatch.pairing;
        }
        if (prod.description) {
          prod.description = prod.description.replace(/—/g, "");
        }
        
        setProduct(prod);
      }
      
      // Carrega todo o catálogo se não houver produtos no estado
      if (allProductsState.length === 0) {
        // @ts-ignore
        const all = await base44.entities.Product.filter();
        const validProducts = all.filter(p => p.id !== "_CATEGORY_CONFIG_" && p.name !== "_CATEGORY_CONFIG_" && p.category !== "_CONFIG_").map(p => {
          if (p.category === "Cachaca") p.category = "Cachaça";
          if (p.name === "Goldwasser Danzig 22 Karat") p.category = "Licor";
          if (p.name === "Absinthe Doc Pierre") p.category = "Bitter/Aperitivo";
          
          const localMatch = catalogoLocal.find(l => l.name === p.name);
          if (localMatch) {
            p.description = localMatch.description;
            p.suggested_use = localMatch.suggested_use;
            p.pairing = localMatch.pairing;
          }
          if (p.description) {
            p.description = p.description.replace(/—/g, "");
          }
          
          return p;
        });
        setAllProductsState(validProducts);
        const idx = validProducts.findIndex((p) => p.id === id);
        if (idx !== -1) setCurrentIndex(idx);
      } else {
        const idx = allProductsState.findIndex((p) => p.id === id);
        if (idx !== -1) setCurrentIndex(idx);
      }
      
      setLoading(false);
    }
    load();
  }, [id, navigate]);

  const allProducts = allProductsState;

  const goTo = (newIndex, dir) => {
    if (isAnimating) return;
    const total = allProducts.length;
    if (total <= 1) return; // Evita bugs se só houver 1 produto ou acesso direto sem estado

    const safeIndex = (newIndex % total + total) % total;

    setIsAnimating(true);
    setDirection(dir);
    setCurrentIndex(safeIndex);
    navigate(`/product/${encodeURIComponent(allProducts[safeIndex].id)}`, {
      replace: true,
      state: { allProducts }
    });

    // Libera a animação após o tempo da transição
    setTimeout(() => setIsAnimating(false), 450);
  };

  const minSwipeDistance = 50;

  const handleAdd = () => {
    if (!product) return;
    const result = addToBag(product);
    if (result) {
      toast.success("Adicionado à sacola", {
        description: product.name,
        duration: 2000
      });
    } else {
      toast.info("Item já está na sacola", {
        description: product.name,
        duration: 2000
      });
    }
  };

  const handleShare = () => {
    // A funcionalidade agora é gerenciada pelo FloatingActionMenu
  };

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(`Confira ${product?.name} no Personal Bar App! ` + window.location.href)}`,
    email: `mailto:?subject=${encodeURIComponent(`Confira ${product?.name}`)}&body=${encodeURIComponent(`Veja este rótulo exclusivo no Personal Bar: ` + window.location.href)}`,
  };

  const pricing = product ? calcularPrecoFromProduct(product) : null;
  const finalPrice = pricing?.finalPrice ?? 0;
  const discount = pricing?.discountPercent ?? 0;
  const hasNav = allProducts.length > 1;

  // Layout arrastável (posições salvas no banco)
  const { layout, updateLayout } = useDraggableLayout(product?.id, isAdmin);

  // Drag da gota
  const dropDrag = useDraggable({
    enabled: isAdmin && !!product?.is_opened,
    initialX: layout.drop_x,
    initialY: layout.drop_y,
    onDragEnd: (x, y) => { updateLayout("drop_x", x); updateLayout("drop_y", y); },
  });

  // Drag da categoria
  const catDrag = useDraggable({
    enabled: isAdmin,
    initialX: layout.category_x,
    initialY: layout.category_y,
    onDragEnd: (x, y) => { updateLayout("category_x", x); updateLayout("category_y", y); },
  });

  /* Drag do ícone de navegação removido conforme solicitado */

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>);

  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-muted-foreground font-light">
          Produto não encontrado.
        </p>
      </div>);

  }

  const liquidColor = getLiquidColor(product);
  const isDarkLiquid = liquidColor === "#0A0A0A" || liquidColor === "#111827";
  const accentColor = isDarkLiquid ? "#FFFFFF" : liquidColor;



  function OrbitRing() {
    return (
      <div
        style={{
          position: "absolute",
          bottom: -20,
          left: "50%",
          transform: "translateX(-50%)",
          width: 320,
          height: 84,
          zIndex: 2,
          pointerEvents: "none"
        }}>
        <svg width="320" height="84" viewBox="0 0 320 84" overflow="visible" aria-hidden="true">
          <defs>
            <linearGradient id="pdOrbitGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor={liquidColor} stopOpacity="1" />
              <stop offset="30%" stopColor={liquidColor} stopOpacity="0.6" />
              <stop offset="60%" stopColor={liquidColor} stopOpacity="0.1" />
              <stop offset="100%" stopColor={liquidColor} stopOpacity="0" />
            </linearGradient>
            <filter id="pdOrbitGlow" x="-20%" y="-60%" width="140%" height="220%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>
          <ellipse cx="160" cy="42" rx="155" ry="36" fill="none" stroke="url(#pdOrbitGrad)" strokeWidth="2" filter="url(#pdOrbitGlow)" />
        </svg>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-y-auto overflow-x-hidden selection:bg-amber-100 font-inter relative rounded-none border-none bg-[#F8F9FA]">
      <AuroraBackground
        showRadialGradient={true}
        colors={{
          color1: `${liquidColor}66`,
          color2: `${liquidColor}44`,
          color3: `${liquidColor}55`,
          color4: `${liquidColor}33`,
          color5: `${liquidColor}44`,
        }}
        className="absolute top-[-150px] left-0 w-full h-[750px] overflow-hidden z-0 rounded-none border-none"
      >
        <div />
      </AuroraBackground>
      
      <div className="relative z-10 w-full overflow-visible">
      {/* ── HERO ── */}
      <div
        className="relative flex flex-col"
        style={{ background: "transparent", paddingTop: 0, paddingBottom: 0, marginTop: -20 }}>
        
        {/* Botão voltar — ícone minimalista */}
        <GlassButton
          onClick={() => navigate(-1)}
          aria-label="Voltar"
          size="none"
          className="absolute z-[100] flex items-center justify-center hover:opacity-70 transition-opacity focus:outline-none !p-0"
          style={{
            top: 30,
            left: 20,
            width: 44,
            height: 44,
            borderRadius: "50%",
            color: "currentColor"
          }}
          glassColor="rgba(255, 255, 255, 0.7)"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </GlassButton>

        {/* Floating Action Menu para Compartilhamento — Superior Direito (Alinhado com o Voltar) */}
        <FloatingActionMenu
          className="absolute top-[30px] right-[20px]"
          direction="vertical-left"
          triggerClassName="w-11 h-11 bg-[rgba(255,255,255,0.20)] hover:bg-[rgba(255,255,255,0.40)] backdrop-blur-[10px] border-[0.5px] border-[rgba(0,0,0,0.06)] shadow-none text-foreground transition-all duration-300"
          optionClassName="bg-[rgba(255,255,255,0.98)] hover:bg-white backdrop-blur-xl border border-black/10 shadow-[0_12px_24px_-4px_rgba(0,0,0,0.15)] text-foreground font-semibold transition-all duration-200 px-4 py-5"
          TriggerIcon={<Share2 className="w-[18px] h-[18px] stroke-[1.5] translate-x-[1px]" />}
          options={[
            {
              label: "WhatsApp",
              Icon: <MessageCircle className="w-4 h-4 text-[#25D366]" />,
              onClick: () => window.open(shareLinks.whatsapp, "_blank"),
            },
            {
              label: "E-mail",
              Icon: <Mail className="w-4 h-4 text-[#111827]" />,
              onClick: () => window.location.href = shareLinks.email,
            },
            {
              label: "Copiar Link",
              Icon: <Link2 className="w-4 h-4 text-[#111827]" />,
              onClick: () => {
                navigator.clipboard.writeText(window.location.href);
                toast.success("Link copiado!", { duration: 2000 });
              },
            },
          ]}
        />

        {/* Tipografia de categoria — TOPO, acima da imagem — arrastável pelo admin */}
        <Lens zoomFactor={1.4} lensSize={200} lensBackground="#FFFFFF" className="w-full flex flex-col items-center">
          {product.category && (
            <div
              ref={catDrag.ref}
              onMouseDown={catDrag.onPointerDown}
              onTouchStart={catDrag.onPointerDown}
              className="absolute select-none w-full flex justify-center"
              style={{
                left: `${catDrag.pos.x}%`,
                top: `${catDrag.pos.y}%`,
                transform: "translateX(-50%)",
                zIndex: 2,
                cursor: isAdmin ? "grab" : "default",
                touchAction: isAdmin ? "none" : "auto",
                willChange: "transform",
                backfaceVisibility: "hidden",
              }}
              title={isAdmin ? "Arraste para reposicionar a categoria" : undefined}
            >
              <span
                style={(() => {
                  const label = (product.category === "Bitter/Aperitivo" ? "APERITIVO" : 
                                 product.category === "Cognac/Brandy" ? "CONHAQUE" : 
                                 product.category === "Cachaca" ? "CACHAÇA" :
                                 product.category || "").toUpperCase();
                  
                  const safeLabel = label === "CACHACA" ? "CACHAÇA" : label;
                  
                  let dynamicVw = 20;
                  if (safeLabel === "APERITIVO") dynamicVw = 18.5;
                  else if (safeLabel === "CONHAQUE") dynamicVw = 17.5;
                  else if (safeLabel === "VERMOUTH") dynamicVw = 17.5;
                  else if (safeLabel === "TEQUILA" || safeLabel === "CACHAÇA") dynamicVw = 20;
                  else dynamicVw = Math.min(28, Math.max(14, 160 / (safeLabel.length || 1)));
                  
                  const textGradientColor = getEnhancedColorForText(liquidColor);
                  
                  return {
                    fontSize: `clamp(45px, ${dynamicVw}vw, ${(dynamicVw * 4.3).toFixed(1)}px)`,
                    fontWeight: 900,
                    textTransform: "uppercase",
                    letterSpacing: "-0.06em",
                    lineHeight: 1,
                    whiteSpace: "nowrap",
                    background: `linear-gradient(180deg, ${textGradientColor}80 0%, ${textGradientColor}33 60%, transparent 100%)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    pointerEvents: "none",
                    filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.05))",
                  };
                })()}
              >
                {(() => {
                  const label = (product.category === "Bitter/Aperitivo" ? "APERITIVO" : 
                                 product.category === "Cognac/Brandy" ? "CONHAQUE" : 
                                 product.category === "Cachaca" ? "CACHAÇA" :
                                 product.category || "").toUpperCase();
                  return label === "CACHACA" ? "CACHAÇA" : label;
                })()}
              </span>
            </div>
          )}

          {/* Container imagem + anel — COM SWIPE */}
          <motion.div
            className="relative flex flex-col items-center justify-center flex-grow max-w-lg mx-auto w-full"
            style={{
              marginTop: 0,
              perspective: "1200px",
              perspectiveOrigin: "center center",
              touchAction: "pan-y",
              minHeight: 380,
              cursor: hasNav ? "grab" : "default"
            }}
            drag={hasNav ? "x" : false}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.6} // Maior elasticidade para feedback visual mais longo
            whileDrag={hasNav ? { cursor: "grabbing" } : {}}
            onDragEnd={(e, info) => {
              const swipeThreshold = 30; // Distância mais fácil de atingir
              if (info.offset.x < -swipeThreshold) {
                goTo(currentIndex + 1, 1);
              } else if (info.offset.x > swipeThreshold) {
                goTo(currentIndex - 1, -1);
              }
            }}
          >
            
            {/* Anel 3D — atrás da imagem */}
            <OrbitRing />

            {/* Imagem animada — AMPLIADA */}
            <div
              style={{
                position: "relative",
                zIndex: 5,
                display: "flex",
                alignItems: "flex-end",
                justifyContent: "center",
                height: 360,
                width: "100%",
                maxWidth: 360,
                transformStyle: "preserve-3d"
              }}>
              
              <AnimatePresence
                mode="popLayout"
                custom={direction}
                initial={false}>
                
                <motion.div
                  key={product.id}
                  custom={direction}
                  variants={bottleVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  style={{
                    position: "absolute",
                    bottom: 0,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                    willChange: "transform, opacity",
                    transformStyle: "preserve-3d",
                    backfaceVisibility: "hidden"
                  }}>
                  
                  {product.image_url ? (
                    <>
                      <img
                        src={product.image_url}
                        alt={`${product.name} - ${product.country || product.category}`}
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                        style={{
                          maxHeight: product.id === "6a0dc3499ad1b7ea7552d5c0" ? 800
                            : ["6a0dc3499ad1b7ea7552d5b7","6a0dc3499ad1b7ea7552d5c1","6a0dc3499ad1b7ea7552d5bb","6a0dc3499ad1b7ea7552d5c3","6a0dc3499ad1b7ea7552d5c4","6a0dbe1fc1e4ea1af1e858cf","6a0dbe1fc1e4ea1af1e858d1"].includes(product.id) ? 260
                            : 480,
                          maxWidth: product.id === "6a0dc3499ad1b7ea7552d5c0" ? 240
                            : ["6a0dc3499ad1b7ea7552d5b7","6a0dc3499ad1b7ea7552d5c1","6a0dc3499ad1b7ea7552d5bb","6a0dc3499ad1b7ea7552d5c3","6a0dc3499ad1b7ea7552d5c4","6a0dbe1fc1e4ea1af1e858cf","6a0dbe1fc1e4ea1af1e858d1"].includes(product.id) ? 140
                            : 230,
                          width: "auto",
                          height: "auto",
                          objectFit: "contain",
                          display: "block",
                          filter: "drop-shadow(0 28px 20px rgba(0,0,0,0.18))",
                          userSelect: "none",
                          position: "relative",
                          zIndex: 5
                        }} />
                      
                      {/* Sombra de ancoragem na base */}
                      <div
                        aria-hidden="true"
                        style={{
                          position: "absolute",
                          bottom: 4,
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: 160,
                          height: 18,
                          borderRadius: "50%",
                          background: "radial-gradient(ellipse at center, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.06) 55%, transparent 100%)",
                          zIndex: 1,
                          pointerEvents: "none"
                        }} />
                    </>
                  ) : (
                    <div
                      style={{
                        height: 360,
                        width: 140,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                      }}
                      aria-label="Imagem do produto não disponível">
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1"
                          strokeLinecap="round"
                          style={{
                            width: 64,
                            height: 64,
                            opacity: 0.15
                          }}
                          aria-hidden="true">
                          <path d="M8 3h8l1 5H7L8 3z" />
                          <path d="M7 8h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z" />
                        </svg>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Liquid Gauge — Novo Mostrador Geométrico Premium */}
            {product.is_opened && (() => {
              const volTotal = parseVolumeMl(product.volume);
              const volCurrent = getCurrentVolumeMl(product);
              const pct = Math.max(0, Math.min(100, product.opening_level ?? 100));
              const fillH = pct; // Height of liquid
              return (
                <div
                  ref={dropDrag.ref}
                  onMouseDown={dropDrag.onPointerDown}
                  onTouchStart={dropDrag.onPointerDown}
                  aria-label={`Volume: ${pct}% da garrafa — ${volCurrent}ml restantes de ${volTotal}ml`}
                  style={{
                    position: "absolute",
                    left: `${dropDrag.pos.x}%`,
                    top: `${dropDrag.pos.y}%`,
                    transform: "translate(-50%, 0) translateZ(0)",
                    zIndex: 1,
                    cursor: isAdmin ? "grab" : "default",
                    touchAction: isAdmin ? "none" : "auto",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                  title={isAdmin ? "Arraste para reposicionar o mostrador" : undefined}
                >
                  <GlassButton
                    as="div"
                    size="none"
                    glassColor="rgba(255, 255, 255, 0.6)"
                    className="!p-[10px_14px] flex items-center gap-[14px] rounded-[20px] transition-all duration-300"
                  >
                    
                    {/* Cápsula do líquido */}
                    <div style={{
                      width: "12px",
                      height: "64px",
                      borderRadius: "12px",
                      background: "rgba(0,0,0,0.04)",
                      position: "relative",
                      overflow: "hidden",
                      border: "1px solid rgba(0,0,0,0.05)",
                      boxShadow: "inset 0 2px 4px rgba(0,0,0,0.1)"
                    }}>
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        width: "100%",
                        height: `${fillH}%`,
                        background: `linear-gradient(90deg, rgba(255,255,255,0.2) 0%, transparent 40%, rgba(0,0,0,0.1) 100%), linear-gradient(180deg, ${liquidColor} 0%, ${liquidColor}CC 100%)`,
                        boxShadow: `0 0 8px ${liquidColor}66`,
                        transition: "height 0.5s ease-out"
                      }} />
                    </div>

                    {/* Dados textuais Brutalistas/Editoriais */}
                    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
                      <div style={{ display: "flex", alignItems: "baseline", gap: "2px" }}>
                        <span style={{ fontSize: "28px", fontWeight: "300", letterSpacing: "-0.04em", color: "#111827", lineHeight: 1 }}>
                          {pct}
                        </span>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: liquidColor }}>%</span>
                      </div>
                      
                      <div style={{ width: "100%", height: "1px", background: "rgba(0,0,0,0.06)", margin: "4px 0" }} />
                      
                      <div style={{ display: "flex", flexDirection: "column", gap: "1px" }}>
                        <span style={{ fontSize: "10px", fontWeight: "600", color: "#6B7280", letterSpacing: "0.06em", textTransform: "uppercase" }}>
                          <span style={{ color: "#111827" }}>{volCurrent}</span><span style={{ fontSize: "8px" }}>ml</span> rest.
                        </span>
                        <span style={{ fontSize: "9px", fontWeight: "500", color: "#9CA3AF", letterSpacing: "0.04em" }}>
                          de {volTotal}ml total
                        </span>
                      </div>
                    </div>

                  </GlassButton>
                </div>);

            })()}


            {/* NavIndicator — Estética Apple Tahoe Glass com linhas finas */}
            <div
              style={{
                position: "absolute",
                left: "50%",
                bottom: "-36px", // Posiciona o centro do botão exatamente sobre o arco inferior do orbe
                transform: "translateX(-50%)",
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.05)",
                backdropFilter: "blur(24px) saturate(180%)",
                WebkitBackdropFilter: "blur(24px) saturate(180%)",
                border: "0.5px solid rgba(255, 255, 255, 0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "inset 0 0 12px rgba(255, 255, 255, 0.1), 0 4px 15px rgba(0, 0, 0, 0.05)",
                zIndex: 50,
                cursor: "default",
                pointerEvents: "none",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#000000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 17l-5-5 5-5" />
                <path d="M14 7l5 5-5 5" />
              </svg>
            </div>
          </motion.div>
        </Lens>
      </div>

      {/* ── CARD INFERIOR SOBREPOSTO ── */}
      <motion.div 
        className="bg-white rounded-t-[40px] shadow-[0_-12px_40px_rgba(0,0,0,0.04)] border-t border-black/[0.02] relative z-20 pb-16 pt-12 px-6 mt-12 flex flex-col gap-6 max-w-lg mx-auto"
        variants={staggerContainer}
        initial="hidden"
        animate="show"
      >
        {/* Botão de adicionar à sacola flutuante */}
        <button
          onClick={handleAdd}
          className="absolute top-0 right-8 -translate-y-1/2 w-14 h-14 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all duration-150 z-30"
          aria-label="Adicionar à sacola"
        >
          <ShoppingBag className="w-5 h-5" strokeWidth={1.8} />
        </button>

        {/* Status Badge dentro do card */}
        {!product.is_opened && (
          <div className="flex justify-center -mt-2 mb-2">
            <StatusBadge text="PRODUTO FECHADO" />
          </div>
        )}

        {/* Product Identity — Centralizado */}
        <motion.div variants={fadeUpItem} className="text-center flex flex-col items-center gap-2">
          {/* Pre-title Context */}
          <div className="flex items-center gap-3 opacity-40">
            <div className="h-[0.5px] w-4 bg-foreground" />
            <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-foreground font-outfit">
              {product.category === "Bitter/Aperitivo" ? "APERITIVO" : 
               product.category === "Cognac/Brandy" ? "CONHAQUE" : 
               product.category} {product.country ? `• ${product.country}` : ''}
            </span>
            <div className="h-[0.5px] w-4 bg-foreground" />
          </div>

          <h1 className="text-2xl md:text-3xl tracking-tight font-extrabold text-[#111827] leading-[1.2] font-outfit max-w-[90%] mx-auto antialiased">
            {product.name}
          </h1>
        </motion.div>

        {/* Price Section — Centralizada com Badge de Desconto à Direita */}
        <motion.div variants={fadeUpItem} className="flex flex-col items-center gap-1 mt-1">
          <div className="flex items-center gap-3 justify-center">
            <span className="text-4xl font-extrabold tracking-tight text-[#111827] flex items-baseline font-outfit" aria-label={`Preço: R$ ${finalPrice?.toFixed(2)}`}>
              <span className="text-lg font-bold text-[#111827]/40 uppercase tracking-[0.1em] font-outfit mr-1.5">R$</span>
              {Math.floor(finalPrice)}
              <span className="text-2xl font-semibold opacity-60 ml-0.5">,{(finalPrice % 1).toFixed(2).split('.')[1]}</span>
            </span>

            {product.is_opened && discount > 0 && (
              <span 
                className="bg-black text-white text-[10px] font-black tracking-[0.1em] px-2.5 py-1 rounded-full uppercase font-outfit"
                aria-label={`Desconto de ${discount}%`}
              >
                -{discount}%
              </span>
            )}
          </div>

          {product.is_opened && discount > 0 && (
            <span className="text-[11px] text-zinc-400 line-through font-medium tracking-wider uppercase font-outfit" aria-label={`Preço original: R$ ${product.price?.toFixed(2)}`}>
              DE R$ {product.price?.toFixed(2)}
            </span>
          )}

          {pricing?.isFloorActive && !pricing?.isCritical && (
            <div className="mt-1.5 px-3 py-1 rounded-full bg-amber-500/5 border border-amber-500/10">
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-amber-600 font-outfit">
                Preço Mínimo
              </span>
            </div>
          )}

          {pricing?.isCritical && (
            <div className="mt-1.5 px-3 py-1 rounded-full bg-red-600/5 border border-red-600/10">
              <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-red-600 font-outfit">
                Dose Final
              </span>
            </div>
          )}
        </motion.div>

        {/* Description */}
        {product.description && (
          <motion.div variants={fadeUpItem} className="px-2">
            <p className="font-sans font-light text-[14px] text-zinc-600 leading-[1.6] text-center antialiased text-pretty">
              {product.description}
            </p>
          </motion.div>
        )}

        {/* Perfil Sensorial */}
        {product.sensory_profile?.length > 0 && (
          <motion.div variants={fadeUpItem} className="w-full mt-2">
            <div className="bg-zinc-50 border border-zinc-100 rounded-[2.5rem] p-6">
              <h3 className="text-sm font-bold text-[#111827] uppercase tracking-[0.15em] text-center mb-5 font-outfit">
                Perfil Sensorial
              </h3>

              <motion.div 
                variants={chipContainer}
                initial="hidden"
                animate="show"
                className="grid grid-cols-2 gap-2.5 max-w-[320px] mx-auto"
              >
                {product.sensory_profile.map((p) => (
                  <motion.div
                    key={p}
                    variants={chipItem}
                    whileHover={{ scale: 1.03, y: -1 }}
                    whileTap={{ scale: 0.96 }}
                    className="flex items-center px-3 py-2.5 bg-white border border-zinc-100 rounded-xl gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.02)] transition-all cursor-default"
                    role="listitem"
                  >
                    {/* Indicador de intensidade líquida pulsante */}
                    <span className="relative flex h-1.5 w-1.5 mr-0.5 flex-shrink-0">
                      <span 
                        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
                        style={{ backgroundColor: liquidColor }}
                      />
                      <span 
                        className="relative inline-flex rounded-full h-1.5 w-1.5"
                        style={{ backgroundColor: liquidColor }}
                      />
                    </span>

                    <span style={{ color: liquidColor }} className="flex-shrink-0 scale-90 opacity-90">
                      {sensoryIcons[p] || (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4" aria-hidden="true">
                          <circle cx="12" cy="12" r="3" />
                        </svg>
                      )}
                    </span>

                    <span className="text-[10px] tracking-[0.12em] uppercase font-bold font-outfit text-zinc-700 truncate">
                      {p}
                    </span>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Ritual de Serviço no Rodapé */}
        {(product.suggested_use || product.pairing || product.abv) && (
          <motion.div variants={fadeUpItem} className="w-full">
            <div className="bg-zinc-50 border border-zinc-100 rounded-[2.5rem] p-6">
              <h3 className="text-sm font-bold text-[#111827] uppercase tracking-[0.15em] text-center mb-5 font-outfit">
                Recomendação do Bartender
              </h3>

              <div className="flex flex-col gap-0.5 px-1">
                {product.suggested_use && (
                  <SpecRow 
                    label="Sugestão" 
                    value={
                      <GooeyText 
                        texts={product.suggested_use.split("·").map(part => {
                          let clean = part.trim().replace(/^\d+\.\s*/, "");
                          return cleanAndShorten(clean.split("(")[0]);
                        })}
                        className="w-[160px] min-[380px]:w-[180px] sm:w-[220px]"
                        textClassName="text-[12px] tracking-[0.05em] uppercase text-foreground font-semibold font-outfit"
                      />
                    } 
                  />
                )}
                {product.pairing && (
                  <SpecRow 
                    label="Combina com" 
                    value={
                      <GooeyText 
                        texts={product.pairing.split("·").map(part => cleanAndShorten(part))}
                        className="w-[160px] min-[380px]:w-[180px] sm:w-[220px]"
                        textClassName="text-[12px] tracking-[0.05em] uppercase text-foreground font-semibold font-outfit"
                      />
                    } 
                  />
                )}
                <SpecRow label="ABV" value={product.abv} />
              </div>
            </div>
          </motion.div>
        )}

        {/* CTA — Reservar */}
        <motion.div variants={fadeUpItem} className="w-full mt-4">
          <button
            onClick={handleAdd}
            className="w-full py-4 bg-black text-white rounded-full font-semibold text-sm tracking-[0.15em] uppercase hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-md flex items-center justify-center gap-2 font-outfit"
            aria-label={`Solicitar reserva de ${product.name}`}
          >
            Reservar por R$ {finalPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </button>
        </motion.div>

      </motion.div>
    </div>
    </div>
  );
}