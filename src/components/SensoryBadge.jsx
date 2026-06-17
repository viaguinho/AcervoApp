const sensoryIcons = {
  "Amadeirado": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <rect x="3" y="8" width="18" height="10" rx="4"/><path d="M8 8V6a4 4 0 0 1 8 0v2"/>
    </svg>
  ),
  "Cítrico": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <circle cx="12" cy="12" r="9"/><path d="M12 3v18M3 12h18"/>
    </svg>
  ),
  "Mel": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M4 10c0-1 .5-2 1.5-2h11c1 0 1.5 1 1.5 2v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7z"/><path d="M8 8V5a4 4 0 0 1 8 0v3"/>
    </svg>
  ),
  "Defumado": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M8 20c0-3 2-5 2-8"/><path d="M12 20c0-3 2-5 2-8"/><path d="M16 20c0-3 2-5 2-8"/>
    </svg>
  ),
  "Floral": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  "Frutado": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <circle cx="12" cy="13" r="6"/><path d="M12 7v-2m0-2c1.5 0 3 .5 4 2"/>
    </svg>
  ),
  "Herbáceo": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M17 3C17 3 7 8 7 16c0 5.5 5 9 5 9s5-3.5 5-9c0-4-4-7-4-7"/><path d="M7 16c0-6 5-11 10-13"/>
    </svg>
  ),
  "Especiarias": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M12 3c0 0-4 3-4 7s4 8 4 8m0-15c0 0 4 3 4 7s-4 8-4 8"/>
    </svg>
  ),
  "Chocolate": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18M15 3v18"/>
    </svg>
  ),
  "Caramelo": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M8 3h8l2 6H6L8 3z"/><rect x="6" y="9" width="12" height="9" rx="2"/>
    </svg>
  ),
  "Baunilha": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M12 2c-4 0-6 3-6 6 0 4 2 6 4 8h4c2-2 4-4 4-8 0-3-2-6-6-6z"/><path d="M9 16h6m-3 0v4"/>
    </svg>
  ),
  "Marítimo": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M3 10c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M3 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/>
    </svg>
  ),
  "Terroso": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M3 20l5-10 4 6 3-4 6 8H3z"/>
    </svg>
  ),
  "Tropical": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <circle cx="12" cy="12" r="2"/><path d="M12 2v4M12 18v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M2 12h4M18 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
    </svg>
  ),
  "Turfado": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M3 20l5-10 4 6 3-4 6 8H3z"/>
    </svg>
  ),
  "Nozes": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <circle cx="12" cy="13" r="6"/><path d="M12 7v-2m0-2c1.5 0 3 .5 4 2"/>
    </svg>
  ),
  "Mentolado": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M17 3C17 3 7 8 7 16c0 5.5 5 9 5 9s5-3.5 5-9c0-4-4-7-4-7"/><path d="M7 16c0-6 5-11 10-13"/>
    </svg>
  ),
  "Picante": (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 flex-shrink-0">
      <path d="M12 3c0 0-4 3-4 7s4 8 4 8m0-15c0 0 4 3 4 7s-4 8-4 8"/>
    </svg>
  ),
};

const DefaultIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="w-4 h-4 flex-shrink-0">
    <circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/>
  </svg>
);

import GlassSurface from "@/components/ui/GlassSurface";

export default function SensoryBadge({ profile }) {
  const Icon = sensoryIcons[profile];
  return (
    <GlassSurface className="inline-flex rounded-full">
      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-light tracking-wide text-foreground">
        {Icon || <DefaultIcon />}
        {profile}
      </span>
    </GlassSurface>
  );
}