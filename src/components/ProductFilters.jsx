import { useState } from "react";
import { X } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const SENSORY_PROFILES = [
  "Amadeirado", "Cítrico", "Mel", "Defumado", "Floral", "Frutado",
  "Herbáceo", "Especiarias", "Chocolate", "Caramelo", "Baunilha",
  "Mentolado", "Turfado", "Tropical", "Nozes", "Marítimo", "Terroso", "Picante"
];

const CATEGORIES = [
  "Amaro", "Aperitivo", "Cachaça", "Cognac/Brandy", "Gin", "Licor",
  "Mezcal", "Outros", "Pisco", "Rum", "Tequila", "Vermouth", "Vodka", "Whisky"
];

import { GlassButton } from "./ui/apple-tahoe-liquid-glass-button";

const FilterIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
  </svg>
);

const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

export default function ProductFilters({ filters, onFilterChange, customTrigger }) {
  const [open, setOpen] = useState(false);

  // No need for custom body locking since Drawer from vaul handles it automatically

  const toggleFilter = (key, value) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFilterChange({ ...filters, [key]: updated });
  };

  const toggleSpecial = () => {
    onFilterChange({ ...filters, special: !filters.special });
  };

  const clearAll = () => {
    onFilterChange({ categories: [], sensory: [], special: false, closed: false });
    setOpen(false);
  };

  const activeCount =
    (filters.categories?.length || 0) +
    (filters.sensory?.length || 0) +
    (filters.special ? 1 : 0) +
    (filters.closed ? 1 : 0);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      {/* Trigger button — Estilo Glass Compacto ou Customizado */}
      <DrawerTrigger asChild>
        {customTrigger || (
          <GlassButton
            size="none"
            className="px-3.5 py-2 flex items-center gap-2 text-sm transition-all rounded-xl border border-white/40 shadow-sm"
            glassColor="rgba(255, 255, 255, 0.75)"
          >
            <FilterIcon />
            <span className="font-light tracking-wide">Filtros</span>
            {activeCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-foreground text-background text-[9px] font-medium flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </GlassButton>
        )}
      </DrawerTrigger>

      <DrawerContent className="bg-[#fdfdfd] border-t border-[#0f1012]/15 pb-6 max-w-[430px] mx-auto left-0 right-0">
        <DrawerHeader className="px-6 py-4 flex flex-row items-center justify-between border-b border-[#0f1012]/10 bg-transparent">
          <DrawerTitle className="text-[18px] font-semibold text-[#0f1012] font-inter" style={{ letterSpacing: '-0.36px' }}>
            Filtros
          </DrawerTitle>
          <div className="flex items-center gap-4">
            {activeCount > 0 && (
              <button
                onClick={clearAll}
                className="text-[11px] font-medium text-[#0071e3] hover:opacity-75 transition-opacity font-inter active-scale"
              >
                Limpar tudo
              </button>
            )}
            <DrawerClose asChild>
              <button className="h-8 w-8 rounded-full border border-[#0f1012]/10 bg-white flex items-center justify-center hover:bg-black/5 transition-colors active-scale text-[#0f1012]">
                <X className="h-4 w-4" strokeWidth={1.8} />
              </button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-6 space-y-8 no-scrollbar" style={{ maxHeight: "70vh", WebkitOverflowScrolling: "touch" }}>
          {/* Special & Closed */}
          <div className="flex flex-col gap-3">
            <button
              onClick={toggleSpecial}
              className="w-full flex items-center justify-between px-5 py-4 transition-all duration-300 active-scale"
              style={{
                borderWidth: '1.8px',
                borderRadius: '16px',
                backgroundColor: filters.special ? 'rgba(0, 113, 227, 0.05)' : '#ffffff',
                borderColor: filters.special ? '#0071e3' : 'rgba(15, 16, 18, 0.12)',
                color: filters.special ? '#0071e3' : '#0f1012'
              }}
            >
              <div className="flex items-center gap-3">
                <StarIcon />
                <span className="text-sm font-medium tracking-tight font-inter" style={{ letterSpacing: '-0.28px' }}>
                  Apenas Especiais
                </span>
              </div>
              {filters.special && <div className="w-2 h-2 rounded-full bg-[#0071e3]" />}
            </button>

            <button
              onClick={() => onFilterChange({ ...filters, closed: !filters.closed })}
              className="w-full flex items-center justify-between px-5 py-4 transition-all duration-300 active-scale"
              style={{
                borderWidth: '1.8px',
                borderRadius: '16px',
                backgroundColor: filters.closed ? 'rgba(0, 113, 227, 0.05)' : '#ffffff',
                borderColor: filters.closed ? '#0071e3' : 'rgba(15, 16, 18, 0.12)',
                color: filters.closed ? '#0071e3' : '#0f1012'
              }}
            >
              <div className="flex items-center gap-3">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-sm font-medium tracking-tight font-inter" style={{ letterSpacing: '-0.28px' }}>
                  Garrafas Lacradas
                </span>
              </div>
              {filters.closed && <div className="w-2 h-2 rounded-full bg-[#0071e3]" />}
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-[12px] font-semibold text-[#0f1012] mb-3 ml-1 font-inter" style={{ letterSpacing: '-0.28px' }}>
              Categorias
            </h4>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => {
                const isActive = filters.categories?.includes(cat);
                return (
                  <button
                    key={cat}
                    onClick={() => toggleFilter("categories", cat)}
                    className="px-4 py-1.5 rounded-full text-[12px] transition-all duration-300 active-scale"
                    style={{
                      borderWidth: '1.8px',
                      borderRadius: '9999px',
                      fontFamily: 'var(--font-inter)',
                      fontWeight: '350',
                      letterSpacing: '-0.2px',
                      backgroundColor: isActive ? 'rgba(0, 113, 227, 0.1)' : 'transparent',
                      color: isActive ? '#0071e3' : '#5e5e5e',
                      borderColor: isActive ? '#0071e3' : 'rgba(15, 16, 18, 0.15)'
                    }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sensory Profiles */}
          <div className="pb-6">
            <h4 className="text-[12px] font-semibold text-[#0f1012] mb-3 ml-1 font-inter" style={{ letterSpacing: '-0.28px' }}>
              Perfil Sensorial
            </h4>
            <div className="flex flex-wrap gap-2">
              {SENSORY_PROFILES.map((profile) => {
                const isActive = filters.sensory?.includes(profile);
                return (
                  <button
                    key={profile}
                    onClick={() => toggleFilter("sensory", profile)}
                    className="px-4 py-1.5 rounded-full text-[12px] transition-all duration-300 active-scale"
                    style={{
                      borderWidth: '1.8px',
                      borderRadius: '9999px',
                      fontFamily: 'var(--font-inter)',
                      fontWeight: '350',
                      letterSpacing: '-0.2px',
                      backgroundColor: isActive ? 'rgba(0, 113, 227, 0.1)' : 'transparent',
                      color: isActive ? '#0071e3' : '#5e5e5e',
                      borderColor: isActive ? '#0071e3' : 'rgba(15, 16, 18, 0.15)'
                    }}
                  >
                    {profile}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DrawerFooter className="px-6 py-4 border-t border-[#0f1012]/10 bg-[#fdfdfd]">
          <DrawerClose asChild>
            <button
              className="w-full bg-[#0f1012] text-white py-3.5 text-[14px] font-semibold transition-all active-scale"
              style={{
                fontFamily: 'var(--font-inter)',
                borderRadius: '26px', // radius-button
                letterSpacing: '-0.28px'
              }}
            >
              Aplicar Filtros
            </button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}