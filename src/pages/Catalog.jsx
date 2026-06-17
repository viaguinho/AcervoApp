import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { X, SlidersHorizontal } from "lucide-react";
import ProductGrid from "../components/ProductGrid";
import ProductFilters from "../components/ProductFilters";
import VoiceSearchButton from "../components/VoiceSearchButton";
import { AuroraBackground } from "../components/ui/aurora-background";
import catalogoLocal from "@/data/catalogo-acervo.json";

// @base44-command: sync-entity AuroraBackground.jsonc --force


const CATEGORY_ORDER = [
  "Todos", "Licor", "Whisky", "Gin", "Rum", "Tequila", "Vodka",
  "Aperitivo", "Cachaça", "Cognac/Brandy", "Amaro",
  "Vermouth", "Mezcal", "Pisco"
];

export default function Catalog() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState(() => {
    const cat = searchParams.get("category");
    return cat || "Todos";
  });
  const [listeningVoice, setListeningVoice] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    sensory: [],
    special: false,
    closed: false,
  });
  const [showCategoryTags, setShowCategoryTags] = useState(true);

  const scrollContainerRef = useRef(null);

  // Sync active category with URL
  useEffect(() => {
    const cat = searchParams.get("category");
    setActiveCategory(cat || "Todos");
  }, [searchParams]);

  useEffect(() => {
    async function load() {
      const data = await base44.entities.Product.list("-created_date", 500);
      const filteredData = data.filter(p => p.id !== "_CATEGORY_CONFIG_" && p.name !== "_CATEGORY_CONFIG_").map(p => {
        if (p.category === "Cachaca") p.category = "Cachaça";
        if (p.name === "Goldwasser Danzig 22 Karat") p.category = "Licor";
        if (p.category === "Bitter/Aperitivo" || p.name === "Absinthe Doc Pierre") p.category = "Aperitivo";
        const localMatch = catalogoLocal.find(l => l.name === p.name);
        if (localMatch) {
          p.description = localMatch.description;
        }
        if (p.description) {
          p.description = p.description.replace(/—/g, "");
        }
        return p;
      });
      setProducts(filteredData);
      setLoading(false);
    }
    load();
  }, []);

  // Reset scroll to top when category changes or page loads
  useEffect(() => {
    const resetScroll = () => {
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      window.scrollTo(0, 0);
    };

    // Execute immediately and also after a short delay to handle content rendering
    resetScroll();
    const timer = setTimeout(resetScroll, 100);
    return () => clearTimeout(timer);
  }, [activeCategory, loading]);

  const filtered = useMemo(() => {
    let result = products;

    const normalizeCat = (c) => {
      if (!c) return "";
      const n = c.trim();
      if (n === "Cachaca") return "Cachaça";
      if (n === "Bitter/Aperitivo") return "Aperitivo";
      return n;
    };

    if (activeCategory !== "Todos") {
      result = result.filter(p => normalizeCat(p.category) === normalizeCat(activeCategory));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.country?.toLowerCase().includes(q)
      );
    }

    if (filters.categories?.length > 0) {
      result = result.filter(p => filters.categories.includes(normalizeCat(p.category)));
    }

    if (filters.sensory?.length > 0) {
      result = result.filter(p =>
        p.sensory_profile?.some(s => filters.sensory.includes(s))
      );
    }

    if (filters.special) {
      result = result.filter(p => p.is_special);
    }

    if (filters.closed) {
      result = result.filter(p => p.is_closed || !p.is_opened);
    }

    return result;
  }, [products, searchQuery, filters, activeCategory]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f4]">
        <div className="w-6 h-6 border-2 border-[#0071e3]/20 border-t-[#0071e3] rounded-full animate-spin" />
      </div>
    );
  }

  const activeFilterCount =
    (filters.categories?.length || 0) +
    (filters.sensory?.length || 0) +
    (filters.special ? 1 : 0) +
    (filters.closed ? 1 : 0);

  return (
    <AuroraBackground className="min-h-screen px-0 pt-0 pb-0 relative overflow-hidden" showRadialGradient={true}>
      {/* Header — Estilo Apple Premium */}
      <div className="absolute top-[60px] left-0 right-0 px-6 z-[10] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/")}
            aria-label="Voltar"
            className="flex items-center justify-center hover:opacity-70 active:scale-95 transition-all focus:outline-none shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-[#0f1012]/10 bg-white"
            style={{
              width: 36,
              height: 36,
              borderRadius: "50%",
              color: "#0f1012"
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <h1 
            className="text-2xl tracking-tight text-[#0f1012]"
            style={{ fontFamily: 'var(--font-primary)', fontWeight: '350', letterSpacing: '-0.54px' }}
          >
            Acervo.
          </h1>
        </div>

      </div>

      <div 
        ref={scrollContainerRef}
        className="w-full h-full px-4 pt-[150px] pb-8 overflow-y-auto scroll-smooth"
      >
        <div className="max-w-2xl mx-auto relative z-10">
        
        {/* Search Bar — Apple Minimal Style */}
        <div className="relative group mb-8">
          <div className="absolute inset-0 bg-[#fdfdfd] rounded-2xl border border-[#0f1012]/15 pointer-events-none transition-all duration-300 group-focus-within:border-[#0071e3]" style={{ borderWidth: '1.8px' }} />
          
          <div className="relative flex items-center px-4 py-2.5">
            {/* Lupa Minimalista */}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#0f1012]/40 transition-colors group-focus-within:text-[#0071e3]">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
            </svg>
            
            <input
              type="text"
              placeholder={listeningVoice ? "Ouvindo..." : "Buscar no acervo"}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none focus:outline-none text-[14px] placeholder:text-[#0f1012]/20 text-[#0f1012] transition-all ml-3 font-normal"
              style={{
                fontFamily: 'var(--font-inter)',
                letterSpacing: '-0.28px',
                fontStyle: listeningVoice ? "italic" : "normal"
              }}
            />

            <div className="flex items-center gap-2">
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-muted-foreground/30 hover:text-foreground/50 active-scale">
                  <X className="h-3.5 w-3.5" strokeWidth={1.5} />
                </button>
              )}
              <VoiceSearchButton
                onTranscript={(t) => setSearchQuery(t)}
                onListeningChange={setListeningVoice}
              />
              
              {/* Linha divisória fina */}
              <div className="w-[1px] h-4 bg-[#0f1012]/15 mx-1" />

              {/* Botão de Filtro integrado no campo de busca */}
              <ProductFilters 
                filters={filters} 
                onFilterChange={setFilters} 
                customTrigger={
                  <button
                    className="p-1.5 hover:bg-black/5 rounded-full transition-colors text-[#0f1012]/70 hover:text-[#0f1012] relative active-scale"
                    aria-label="Abrir filtros"
                  >
                    <SlidersHorizontal className="h-4 w-4" strokeWidth={1.8} />
                    {activeFilterCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-3.5 w-3.5 rounded-full bg-[#0071e3] text-white text-[8px] font-bold flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </button>
                }
              />
            </div>
          </div>
        </div>

        {/* Active filters display */}
        {(activeCategory !== "Todos" || filters.categories.length > 0 || filters.sensory.length > 0 || filters.special || filters.closed) && (
          <div className="flex flex-wrap gap-2 mb-8">
            {activeCategory !== "Todos" && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0071e3]/10 text-[#0071e3] px-3 py-1 text-[11px] font-medium tracking-wide border border-[#0071e3]/30">
                {activeCategory}
                <button onClick={() => {
                  setActiveCategory("Todos");
                  navigate("/catalog", { replace: true });
                }} className="hover:opacity-60 transition-opacity active-scale">
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </span>
            )}
            {filters.special && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0071e3]/10 text-[#0071e3] px-3 py-1 text-[11px] font-medium tracking-wide border border-[#0071e3]/30">
                Especiais
                <button onClick={() => setFilters(f => ({ ...f, special: false }))} className="hover:opacity-60 transition-opacity active-scale">
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </span>
            )}
            {filters.closed && (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#0071e3]/10 text-[#0071e3] px-3 py-1 text-[11px] font-medium tracking-wide border border-[#0071e3]/30">
                Lacradas
                <button onClick={() => setFilters(f => ({ ...f, closed: false }))} className="hover:opacity-60 transition-opacity active-scale">
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </span>
            )}
            {filters.categories.map(c => (
              <span key={c} className="inline-flex items-center gap-2 rounded-full bg-[#0071e3]/10 text-[#0071e3] px-3 py-1 text-[11px] font-medium tracking-wide border border-[#0071e3]/30">
                {c}
                <button onClick={() => setFilters(f => ({ ...f, categories: f.categories.filter(x => x !== c) }))} className="hover:opacity-60 transition-opacity active-scale">
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </span>
            ))}
            {filters.sensory.map(s => (
              <span key={s} className="inline-flex items-center gap-2 rounded-full bg-[#0071e3]/10 text-[#0071e3] px-3 py-1 text-[11px] font-medium tracking-wide border border-[#0071e3]/30">
                {s}
                <button onClick={() => setFilters(f => ({ ...f, sensory: f.sensory.filter(x => x !== s) }))} className="hover:opacity-60 transition-opacity active-scale">
                  <X className="h-3 w-3" strokeWidth={2} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Category Tags */}
        {showCategoryTags && (
          <div className="overflow-hidden mb-6">
            <div className="flex overflow-x-auto gap-2 no-scrollbar pb-8 -mb-8 -mx-1 px-1 bg-transparent">
              {CATEGORY_ORDER.map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      setActiveCategory(cat);
                      if (cat !== "Todos") {
                        navigate(`/catalog?category=${cat}`, { replace: true });
                      } else {
                        navigate("/catalog", { replace: true });
                      }
                    }}
                    className={`px-4 py-1.5 rounded-full text-[12px] transition-all duration-300 whitespace-nowrap active-scale`}
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
        )}


        {/* Product Grid */}
        <ProductGrid
          products={filtered}
          title={null}
        />

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-muted-foreground font-light text-sm">
              Nenhum item encontrado.
            </p>
          </div>
        )}
      </div>
    </div>
    </AuroraBackground>
  );
}