import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Sparkles, Layers } from "lucide-react";
import { useAuth } from "../lib/AuthContext";
import { motion, useScroll } from "framer-motion";
import { toast } from "sonner";
import { categoryConfig } from "../components/CategoryCardStack";
import Carousel3DPerspective from "../components/ui/Perspective3d";
import { MorphingCardStack } from "../components/ui/morphing-card-stack";
import { LiquidNumber } from "../components/ui/LiquidNumber";
import catalogoLocal from "@/data/catalogo-acervo.json";

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name || user?.email?.split("@")[0] || "Visitante";
  // Mapeamento de normalização para chaves de categoria
  const normalizeCategory = (name) => {
    if (!name) return "";
    const n = name.trim();
    if (n === "Cachaca") return "Cachaça";
    if (n === "Bitter/Aperitivo") return "Aperitivo";
    return n;
  };

  const [categories, setCategories] = useState([]);
  const [catImages, setCatImages] = useState({});
  const [specials, setSpecials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [config, setConfig] = useState({});
  const [totalLabels, setTotalLabels] = useState(0);

  const { scrollY } = useScroll();

  const [tapCount, setTapCount] = useState(0);

  const handleAdminEasterEgg = () => {
    if (!isAdmin) return;
    
    setTapCount(prev => {
      const newCount = prev + 1;
      if (newCount === 5) {
        toast.success("Área de Administração Desbloqueada", {
          icon: <Sparkles className="h-4 w-4 text-amber-500" />
        });
        setTimeout(() => navigate('/admin'), 600);
        return 0;
      }
      return newCount;
    });
  };

  useEffect(() => {
    if (tapCount > 0) {
      const timer = setTimeout(() => setTapCount(0), 1000);
      return () => clearTimeout(timer);
    }
  }, [tapCount]);

  const saveGlobalConfig = async (newConfig) => {
    try {
      const jsonStr = JSON.stringify(newConfig);
      // @ts-ignore
      const configProducts = await base44.entities.Product.filter({ name: "_CATEGORY_CONFIG_" });
      if (configProducts.length > 0) {
        // @ts-ignore
        await base44.entities.Product.update(configProducts[0].id, { description: jsonStr });
      } else {
        // @ts-ignore
        await base44.entities.Product.create({
          name: "_CATEGORY_CONFIG_",
          category: "_CONFIG_",
          description: jsonStr,
          price: 0,
          is_closed: true
        });
      }
    } catch (e) {
      console.error("Erro ao salvar config global", e);
    }
  };

  useEffect(() => {
    async function load() {
      try {
        // @ts-ignore
        const products = await base44.entities.Product.list("-created_date", 500);
        products.forEach(p => {
          if (p.category === "Cachaca") p.category = "Cachaça";
          if (p.name === "Goldwasser Danzig 22 Karat") p.category = "Licor";
          if (p.name === "Absinthe Doc Pierre") p.category = "Bitter/Aperitivo";
          const localMatch = catalogoLocal.find(l => l.name === p.name);
          if (localMatch) {
            p.description = localMatch.description;
          }
          if (p.description) {
            p.description = p.description.replace(/—/g, "");
          }
        });
        const catMap = {};
        const catImagesMap = {};
        let globalConfig = {};

        const configProduct = products.find(p => p.name === "_CATEGORY_CONFIG_");
        if (configProduct && configProduct.description) {
          try { globalConfig = JSON.parse(configProduct.description); } catch(e) {}
        }

        let activeCount = 0;
        products.forEach((p) => {
          if (p.category && p.category !== "_CONFIG_") {
            activeCount++;
            const normalizedCat = normalizeCategory(p.category);
            catMap[normalizedCat] = (catMap[normalizedCat] || 0) + 1;
            if (p.image_url && !catImagesMap[normalizedCat]) {
              catImagesMap[normalizedCat] = p.image_url;
            }
          }
        });

        setTotalLabels(activeCount);
        setCatImages(catImagesMap);
        setConfig(globalConfig);
        setCategories(
          Object.entries(catMap)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
        );
        const ORDERED_IDS = [
          "69ddaa4ccb2b09770cbf8dbb", // Monkey Shoulder (Whisky - Dourado)
          "69dda9a0cb2b09770cbf8d7a", // Volcán Tequila Blanco (Tequila - Claro)
          "69dda9a0cb2b09770cbf8d79", // Patron XO Cafe (Tequila/Licor - Escuro)
          "69ddaa4ccb2b09770cbf8dbd", // Talisker 10 Anos (Whisky - Dourado)
          "69dda94ccb2b09770cbf8d49", // El Pisco Calavera (Pisco - Claro)
          "6a0dc3499ad1b7ea7552d5c1", // Hennessy Very Special (Cognac - Dourado)
        ];
        const specialsRaw = products.filter((p) => p.is_special && p.id !== "_CATEGORY_CONFIG_" && p.name !== "_CATEGORY_CONFIG_");
        const ordered = ORDERED_IDS.map(id => specialsRaw.find(p => p.id === id)).filter(Boolean);
        const rest = specialsRaw.filter(p => !ORDERED_IDS.includes(p.id));
        setSpecials([...ordered, ...rest].slice(0, 6));
        
        // Verifica admin
        try {
          const u = await base44.auth.me();
          if (u?.role === "admin") setIsAdmin(true);
        } catch (e) {}
      } catch (error) {
        console.error("Erro ao carregar dados do Home:", error);
        toast.error("Erro ao carregar produtos. Verifique as configurações de API.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-6 h-6 border-2 border-muted-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  const handleExploreClick = () => {
    navigate("/catalog");
  };

  const handleImageUpload = async (rawCategoryName, file) => {
    const normalizedKey = normalizeCategory(rawCategoryName);
    
    // Tenta fazer o upload via base44
    try {
      // @ts-ignore
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      if (file_url) {
        setConfig(prev => {
          const newConfig = {
            ...prev,
            [normalizedKey]: {
              ...(prev[normalizedKey] || {}),
              image: file_url
            }
          };
          saveGlobalConfig(newConfig);
          return newConfig;
        });
      }
    } catch (e) {
      console.error("Erro no upload", e);
      alert("Falha ao enviar a imagem. Tente novamente.");
    }
  };

  const handleImageDelete = (rawCategoryName) => {
    const normalizedKey = normalizeCategory(rawCategoryName);
    setConfig(prev => {
      const newConfig = {
        ...prev,
        [normalizedKey]: {
          ...(prev[normalizedKey] || {}),
          image: ""
        }
      };
      saveGlobalConfig(newConfig);
      return newConfig;
    });
  };


  return (
    <div className="min-h-screen bg-background relative w-full overflow-x-hidden">
      {/* Hero */}
      <section className="px-6 pt-4 pb-12 overflow-hidden">
        <div className="max-w-lg mx-auto">
          {/* Welcome Header baseado na imagem */}
          <div className="flex flex-col text-left">
            <div className="text-[14px] text-foreground font-light mb-2 leading-tight">
              Olá,
              <br />
              <span className="font-semibold">{userName}!</span>
            </div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="text-[27px] font-light leading-[1.3] text-foreground tracking-tight"
            >
              <span className="text-muted-foreground/60 font-light">Monte seu</span>{" "}
              <motion.span 
                className="font-semibold text-foreground relative inline-block cursor-default select-none"
                onClick={handleAdminEasterEgg}
                whileTap={isAdmin ? { scale: 0.92, color: tapCount >= 3 ? "hsl(var(--primary))" : "inherit" } : {}}
              >
                acervo
              </motion.span>.
              <br />
              <span className="text-muted-foreground/60 font-light">
                <span className="font-semibold text-foreground">Adquira</span> garrafas exclusivas.
              </span>
            </motion.h1>

            {/* Contador de Rótulos Curados no estilo do design Swiped */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="mt-4 flex flex-row items-center gap-3"
            >
              <LiquidNumber value={totalLabels || 181} />
              <div 
                className="px-2.5 py-3.5 rounded-xl bg-white/30 dark:bg-black/15 backdrop-blur-md border border-black/[0.06] dark:border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.55),0_8px_16px_-4px_rgba(0,0,0,0.03)] text-[#7c4a1e] dark:text-[#d4af37] text-[10px] font-bold tracking-wider uppercase flex items-center justify-center select-none transition-all duration-300 hover:bg-white/40 hover:border-black/[0.08] active:scale-[0.97]"
                style={{
                  writingMode: 'vertical-rl',
                  textOrientation: 'mixed',
                  transform: 'rotate(180deg)',
                  height: '96px'
                }}
              >
                rótulos disponíveis
              </div>
            </motion.div>
          </div>
        </div>
      </section>
 
      {/* Specials - Carrossel 3D Perspective */}
      {specials.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2 }}
        >
          <Carousel3DPerspective
            products={specials}
            title={
              <div className="flex items-center gap-2">
                <Sparkles
                  size={12}
                  className="text-[#7c4a1e] dark:text-[#d4af37]"
                />
                <h2 className="text-[10px] uppercase text-foreground/50 font-medium tracking-[0.4em] font-outfit m-0">
                  Seleção Especial
                </h2>
              </div>
            }
          />
        </motion.div>
      )}

      {/* Categorias */}
      <section className="px-6 pb-8 pt-1">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-lg mx-auto"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers 
                size={12} 
                className="text-foreground/70"
              />
              <h2 className="text-[10px] uppercase text-foreground/50 font-medium tracking-[0.4em] font-outfit m-0">
                Categorias
              </h2>
            </div>
          </div>

          <div className="flex flex-col gap-6 pt-0">
            <MorphingCardStack
              cards={[...categories]
                .sort((a, b) => {
                  if (a.name.toUpperCase() === "OUTROS") return 1;
                  if (b.name.toUpperCase() === "OUTROS") return -1;
                  return a.name.localeCompare(b.name);
                })
                .map((cat) => {
                  const normalizedKey = normalizeCategory(cat.name);
                  const globalConfigEntry = config[normalizedKey] || {};
                  const defaultDesc = categoryConfig[normalizedKey]?.desc || "";
                  const defaultImage = categoryConfig[normalizedKey]?.image || "";
                  const fallbackImage = catImages[cat.name];
                  
                  const imageUrl = defaultImage || globalConfigEntry.image || fallbackImage;
                  
                  return {
                    id: cat.name,
                    title: normalizedKey,
                    description: globalConfigEntry.desc || defaultDesc,
                    imageUrl,
                    color: globalConfigEntry.color || undefined
                  };
                })}
              onCardClick={(card) => navigate(`/catalog?category=${encodeURIComponent(card.id)}`)}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
              isAdmin={isAdmin}
              className=""
            />
          </div>
        </motion.div>
      </section>
    </div>
  );
}