import React, { useState, useEffect } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Configuração premium de categorias com suporte a imagens e descrições
export const categoryConfig = {
  Licor: { desc: "Aromáticos e envolventes, os licores combinam frutas, ervas e especiarias em sabores únicos e irresistíveis.", image: "/assets/licor.png" },
  Whisky: { desc: "Envelhecido em barris, o whisky entrega profundidade, aromas complexos e uma experiência rica a cada dose.", image: "/assets/whisky.png" },
  Gin: { desc: "Com notas de zimbro e botânicos selecionados, o gin entrega frescor, aroma e personalidade em cada drink.", image: "/assets/gin.png" },
  Vodka: { desc: "De perfil limpo e versátil, a vodka se adapta perfeitamente aos mais variados estilos de drinks e combinações.", image: "/assets/vodka.png" },
  Rum: { desc: "Produzido a partir da cana-de-açúcar, o rum revela sabores que transitam entre o adocicado suave e notas amadeiradas intensas.", image: "/assets/rum.png" },
  Tequila: { desc: "Feita com agave azul, a tequila carrega a essência mexicana em um destilado autêntico e cheio de atitude.", image: "/assets/tequila.png" },
  Cachaça: { desc: "Nascida da cana-de-açúcar, a cachaça traduz a autenticidade brasileira em um destilado marcante e versátil.", image: "/assets/cachaca.png" },
  Aperitivo: { desc: "Leve e aromático, o aperitivo desperta o paladar e transforma encontros em momentos ainda mais especiais.", image: "/assets/aperitivo.png" },
  Amaro: { desc: "Ícone italiano de sabor amargo e herbal, o amaro combina ervas, raízes e especiarias em uma experiência intensa e sofisticada.", image: "/assets/amaro.png" },
  Pisco: { desc: "Tradicional na América do Sul, o pisco conquista pelo equilíbrio suave e elegância presente em clássicos da coquetelaria.", image: "/assets/pisco.png" },
  Mezcal: { desc: "O mezcal, conhecido como “a mãe de todas as tequilas”, é um destilado produzido a partir do cozimento e da destilação do agave.", image: "/assets/mezcal.png" },
  Absinto: { desc: "Destilado místico e herbal de sabor intenso, consagrado pela presença marcante do anis e ervas tradicionais.", image: "/assets/absinto.png" },
  "Cognac/Brandy": { desc: "Elegante e encorpado, o conhaque ganha riqueza de aromas e profundidade com o envelhecimento em barris.", image: "/assets/conhaque.png" },
  Vermouth: { desc: "Sofisticado e aromático, o vermouth une vinho, ervas e especiarias em um clássico indispensável da coquetelaria.", image: "/assets/vermouth.png" },
  Outros: { desc: "Raridades e destilados exclusivos", image: "" }
};

const MAX_VISIBLE = 4;

// Componente para o conteúdo interno premium do card
function CardContent({ displayName, config, isTop, onImageUpload = null }) {
  const fileInputRef = React.useRef(null);
  const imageSrc = config.image || "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><rect width='200' height='200' fill='rgba(0,0,0,0.05)' rx='100'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='14' font-weight='600' fill='rgba(0,0,0,0.4)'>Imagem</text></svg>";

  const handleImageClick = (e) => {
    if (!isTop) return;
    e.stopPropagation();
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload) {
      onImageUpload(file);
    }
  };

  return (
    <div style={{ transform: "translateZ(15px)", transformStyle: "preserve-3d" }} className="absolute inset-2.5 rounded-[1rem] bg-white shadow-sm pointer-events-none">
      {/* Input de Arquivo Escondido */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        className="hidden" 
        accept="image/*"
      />

      {/* Grid Texture */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)] rounded-[1rem]" />
      
      <div className="relative z-10 flex h-full flex-col p-4 gap-4">

        <div className="text-foreground">
          <h2 className="text-xl font-outfit font-bold tracking-tight leading-tight">{displayName}</h2>
          <p className="mt-2 text-xs text-muted-foreground leading-relaxed max-w-[80%]">{config.desc || "\u00A0"}</p>
        </div>
      </div>

      <div className="absolute -right-6 -bottom-6 h-28 w-28 flex items-center justify-center pointer-events-auto z-20">
        <motion.img
          src={imageSrc}
          alt={`Imagem de ${displayName}`}
          style={{ transform: "translateZ(40px)" }}
          whileHover={isTop ? { scale: 1.25, rotate: -5, y: -20, filter: "drop-shadow(0px 20px 30px rgba(0,0,0,0.2))" } : {}}
          onClick={handleImageClick}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="h-full w-full object-contain cursor-pointer drop-shadow-2xl"
        />
        {isTop && !config.image && (
          <div 
            onClick={handleImageClick}
            className="absolute inset-0 flex items-center justify-center bg-black/5 dark:bg-white/5 rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        )}
      </div>

      {isTop && (
        <div className="absolute bottom-3 left-3 flex items-center gap-1 text-[7px] font-bold uppercase tracking-wider text-muted-foreground/60">
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Deslize
          <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </div>
      )}
    </div>
  );
}

import { GlowCard } from "./ui/spotlight-card";

// Componente para o card do topo (interativo)
function TopCard({ cat, dragX, dragProgress, isAnimating, onDragEnd, navigate, customConfig, onImageUpload }) {
  const rotateZ = useTransform(dragX, [-300, 300], [-12, 12]);
  const rotateY = useTransform(dragX, [-300, 300], [-15, 15]);
  const opacity = useTransform(dragX, [-300, 0, 300], [0, 1, 0.8]);

  const displayName = cat.name === "Cachaca" ? "Cachaça" : cat.name;
  
  // Busca a config prioritariamente pelo nome original (cat.name)
  const config = (customConfig && customConfig[cat.name]) || 
                 categoryConfig[displayName] || 
                 categoryConfig[cat.name] || 
                 { desc: "" };

  return (
    <motion.div
      style={{
        x: dragX,
        opacity,
        rotateZ,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      drag={!isAnimating ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.8}
      onDrag={(e, info) => {
        dragX.set(info.offset.x);
        const p = Math.min(Math.abs(info.offset.x) / 150, 1);
        dragProgress.set(p);
      }}
      onDragEnd={onDragEnd}
      onClick={(e) => {
        if (Math.abs(dragX.get()) > 5) { e.preventDefault(); return; }
        navigate(`/catalog?category=${encodeURIComponent(cat.name)}`);
      }}
      className={`relative w-[200px] h-[260px] rounded-[1.25rem] select-none
        ${!isAnimating ? "cursor-grab active:cursor-grabbing hover:shadow-2xl" : ""}`}
    >
      <GlowCard customSize glowColor="silver" style={/** @type {any} */ ({ '--backdrop': 'white', backdropFilter: 'none' })} className="!block !p-0 !m-0 !shadow-none !rounded-[1.25rem] w-full h-full border-none overflow-visible">
        <CardContent 
          displayName={displayName} 
          config={config} 
          isTop={true} 
          onImageUpload={(file) => onImageUpload(cat.name, file)} 
        />
      </GlowCard>
    </motion.div>
  );
}

// Componente para os cards empilhados
function StackedCard({ cat, index, dragProgress, customConfig }) {
  const baseScale = 1 - index * 0.03;
  const baseX = index * 12; // Deslocamento para a direita proporcional ao tamanho menor
  const baseY = index * 5; // Deslocamento leve para baixo
  const baseRotate = index * 4; 
  const baseZ = index * -40;

  const scale = useTransform(dragProgress, [0, 1], [baseScale, baseScale + 0.03]);
  const x = useTransform(dragProgress, [0, 1], [baseX, baseX - 12]);
  const y = useTransform(dragProgress, [0, 1], [baseY, baseY - 5]);
  const z = useTransform(dragProgress, [0, 1], [baseZ, baseZ + 40]);
  const rotate = useTransform(dragProgress, [0, 1], [baseRotate, baseRotate - 4]);

  const displayName = cat.name === "Cachaca" ? "Cachaça" : cat.name;
  const config = (customConfig && customConfig[cat.name]) || 
                 categoryConfig[displayName] || 
                 categoryConfig[cat.name] || 
                 { desc: "" };

  return (
    <motion.div
      style={{ 
        scale, 
        x, 
        y, 
        z, 
        rotate, 
        transformStyle: "preserve-3d",
        transformOrigin: "bottom center"
      }}
      className="relative w-[200px] h-[260px] rounded-[1.25rem] select-none shadow-xl border border-black/5 dark:border-white/10"
    >
      <GlowCard customSize glowColor="silver" style={/** @type {any} */ ({ '--backdrop': 'white', backdropFilter: 'none' })} className="!block !p-0 !m-0 !shadow-none !rounded-[1.25rem] w-full h-full border-none overflow-visible">
        <CardContent displayName={displayName} config={config} isTop={false} />
      </GlowCard>
    </motion.div>
  );
}

export default function CategoryCardStack({ categories, customConfig, onImageUpload }) {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const dragX = useMotionValue(0);
  const dragProgress = useMotionValue(0);

  useEffect(() => {
    if (categories?.length > 0 && cards.length === 0) {
      const sorted = [...categories].sort((a, b) => {
        if (a.name.toUpperCase() === "OUTROS") return 1;
        if (b.name.toUpperCase() === "OUTROS") return -1;
        return a.name.localeCompare(b.name);
      });
      setCards(sorted.map((c) => ({ ...c, id: `cat-${c.name}` })));
    }
  }, [categories]);

  const goNext = async () => {
    if (isAnimating || cards.length < 2) return;
    setIsAnimating(true);

    await Promise.all([
      animate(dragX, -600, { duration: 0.35, ease: "easeIn" }),
      animate(dragProgress, 1, { duration: 0.35, ease: "easeIn" }),
    ]);

    setCards((prev) => {
      const [first, ...rest] = prev;
      return [...rest, first];
    });

    dragX.set(0);
    dragProgress.set(0);
    setIsAnimating(false);
  };

  const goPrev = async () => {
    if (isAnimating || cards.length < 2) return;
    setIsAnimating(true);

    setCards((prev) => {
      const last = prev[prev.length - 1];
      return [last, ...prev.slice(0, -1)];
    });

    dragProgress.set(-1);
    await animate(dragProgress, 0, { duration: 0.35, ease: "easeOut" });

    setIsAnimating(false);
  };

  const handleDragEnd = (e, info) => {
    if (isAnimating) return;
    const threshold = 80;
    const velocity = 400;

    if (info.offset.x < -threshold || info.velocity.x < -velocity) {
      goNext();
    } else if (info.offset.x > threshold || info.velocity.x > velocity) {
      goPrev();
    } else {
      animate(dragX, 0, { type: "spring", stiffness: 300, damping: 28 });
      animate(dragProgress, 0, { type: "spring", stiffness: 300, damping: 28 });
    }
  };

  if (!cards.length) return null;

  const visibleCards = cards.slice(0, MAX_VISIBLE);

  return (
    <div className="w-full flex flex-col items-center pb-8">
      <div className="relative w-full h-[320px]" style={{ perspective: "1000px", transformStyle: "preserve-3d" }}>
        {[...visibleCards].reverse().map((cat, revIdx) => {
          const index = visibleCards.length - 1 - revIdx;
          const isTop = index === 0;

          return (
            <div
              key={cat.id}
              className="absolute top-0 left-0 right-0 flex justify-center"
              style={{ 
                zIndex: index === 0 ? 50 : MAX_VISIBLE - index,
                transformStyle: "preserve-3d"
              }}
            >
              {isTop ? (
                <TopCard
                  cat={cat}
                  dragX={dragX}
                  dragProgress={dragProgress}
                  isAnimating={isAnimating}
                  onDragEnd={handleDragEnd}
                  navigate={navigate}
                  customConfig={customConfig}
                  onImageUpload={onImageUpload}
                />
              ) : (
                <StackedCard
                  cat={cat}
                  index={index}
                  dragProgress={dragProgress}
                  customConfig={customConfig}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
