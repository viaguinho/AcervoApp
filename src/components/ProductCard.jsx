import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { addToBag } from "@/lib/bagStore";
import { toast } from "sonner";
import { getFinalPrice, getDiscount } from "@/lib/openedBottle";
import OpenedBottleBadge from "./OpenedBottleBadge";


const PlusIcon = () =>
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>;

export default function ProductCard({ product, index, variant = "solid", hideStatus = false }) {
  const [bottomOffset, setBottomOffset] = useState(0);

  useEffect(() => {
    setBottomOffset(0);
  }, [product.image_url]);

  const handleImageLoad = (e) => {
    const img = e.currentTarget;
    if (!img || !product.image_url) return;

    // Criar uma imagem temporária para analisar via Canvas (CORS é suportado pelo base44.app)
    const tempImg = new Image();
    tempImg.crossOrigin = "anonymous";
    tempImg.src = product.image_url;
    tempImg.onload = () => {
      try {
        const size = 50; // Tamanho reduzido para processamento ultra rápido (< 1ms)
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(tempImg, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        // Escanear linhas do fundo para o topo para encontrar a base real da garrafa
        let bottomPaddingRows = 0;
        for (let y = size - 1; y >= 0; y--) {
          let rowHasPixels = false;
          for (let x = 0; x < size; x++) {
            const alpha = data[(y * size + x) * 4 + 3];
            if (alpha > 8) { // Limiar de opacidade
              rowHasPixels = true;
              break;
            }
          }
          if (rowHasPixels) {
            bottomPaddingRows = (size - 1) - y;
            break;
          }
        }

        const ratio = bottomPaddingRows / size;
        const renderedHeight = img.clientHeight || 150;
        const calculatedOffset = ratio * renderedHeight;

        // Limita o deslocamento a um máximo de 25px para segurança de layout
        setBottomOffset(Math.min(calculatedOffset, 25));
      } catch (err) {
        console.warn("Erro ao calcular offset de sombra dinamicamente:", err);
      }
    };
  };

  const handleAddToBag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const result = addToBag(product);
    if (result) {
      toast.success("Adicionado à sacola", { description: product.name, duration: 2000 });
    } else {
      toast.info("Item já está na sacola", { description: product.name, duration: 2000 });
    }
  };

  const finalPrice = getFinalPrice(product);
  const discount = getDiscount(product);
  const productUrl = `/product/${encodeURIComponent(product.id)}`;
  const productAlt = `${product.name} - ${product.country || product.category}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.35 }}>
      <div
        className="overflow-hidden hover:scale-[1.01] transition-transform duration-300 group"
        style={{
          background: "#fdfdfd", // Paper White
          borderRadius: "20px",
          border: "1.8px solid rgba(15, 16, 18, 0.08)",
          boxShadow: "none",
          display: "flex",
          flexDirection: "column",
          height: hideStatus ? "360px" : "333px",
          position: "relative"
        }}>
        
        <div className="relative overflow-hidden flex items-center justify-center flex-shrink-0 bg-transparent"
          style={{ 
            height: hideStatus ? 215 : 180, 
            perspective: 1000
          }}>

          <Link to={productUrl} className="w-full h-full flex items-center justify-end flex-col pb-2 z-10">
            {product.image_url ?
              <motion.div 
                className="flex-grow w-full flex flex-col justify-end items-center"
                whileHover={{ rotateY: 8, rotateX: -5, scale: 1.12 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <img
                  src={product.image_url}
                  alt={productAlt}
                  loading="lazy"
                  decoding="async"
                  crossOrigin="anonymous"
                  onLoad={handleImageLoad}
                  className={`h-full w-auto object-contain object-bottom drop-shadow-lg transition-all duration-300 ${hideStatus ? "max-h-[195px]" : "max-h-[150px]"}`} />
                {/* Sombra de ancoragem grudada na base da garrafa com deslocamento dinâmico */}
                <div
                  aria-hidden="true"
                  style={{
                    width: 70,
                    height: 6,
                    borderRadius: "50%",
                    background: "radial-gradient(ellipse at center, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.05) 55%, transparent 100%)",
                    flexShrink: 0,
                    position: "relative",
                    marginTop: -1 - bottomOffset,
                    zIndex: 5,
                    transition: "margin-top 0.25s cubic-bezier(0.23, 1, 0.32, 1)"
                  }}
                />
              </motion.div>
              :
              <div className="w-full h-full flex items-center justify-center" aria-label="Imagem do produto não disponível">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="w-8 h-8 text-[#0f1012]/20" aria-hidden="true">
                  <path d="M8 3h8l1 5H7L8 3z" /><path d="M7 8h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z" />
                </svg>
              </div>
            }
          </Link>
          
          {product.is_opened && (
            <OpenedBottleBadge product={product} size="sm" />
          )}

          <button
            onClick={handleAddToBag}
            aria-label={`Adicionar ${product.name} à sacola`}
            className="absolute top-3 right-3 h-8 w-8 rounded-full border border-[#0f1012]/10 bg-white text-[#0f1012] flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 z-30 shadow-[0_2px_8px_rgba(0,0,0,0.04)] active-scale"
          >
            <PlusIcon />
          </button>
        </div>

        {/* Card body */}
        <Link to={productUrl} className="flex-grow flex flex-col no-underline">
          <div className={`px-4 pb-5 flex flex-col flex-grow bg-transparent ${hideStatus ? "pt-1" : "pt-3"}`}>
            <div className={`mb-1 flex flex-col justify-start overflow-hidden ${hideStatus ? "h-[65px]" : "h-[68px]"}`}>
              {product.is_special && !hideStatus && (
                <p className="text-[10px] text-[#7c4a1e] font-bold tracking-[0.05em] uppercase mb-0.5 font-inter">
                  Seleção Especial
                </p>
              )}
              <p className="text-[10px] text-[#5e5e5e] font-medium tracking-[0.05em] uppercase mb-1 font-inter">
                {product.category} {product.country ? `• ${product.country}` : ''}
              </p>
              <h3 
                className="text-[15px] font-semibold tracking-tight text-[#0f1012] leading-[1.2] font-inter line-clamp-2"
                style={{ letterSpacing: '-0.32px' }}
              >
                {product.name}
              </h3>
            </div>

            <div className="mt-1 font-inter">
              <div className="flex items-baseline gap-0.5">
                <span className="text-[11px] text-[#0f1012]/60 font-medium">R$</span>
                <span className="text-[20px] font-semibold text-[#0f1012] tracking-tight" aria-label={`Preço: R$ ${finalPrice?.toFixed(2)}`}>
                  {Math.floor(finalPrice)}
                </span>
                {product.is_opened && discount > 0 && product.price && (
                  <span className="text-[10px] line-through text-muted-foreground/40 font-medium ml-1.5" aria-label={`Preço original: R$ ${product.price?.toFixed(2)}`}>
                    R$ {Math.floor(product.price)}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-auto pt-2 flex items-center justify-between text-[11px] text-[#5e5e5e] font-inter font-light border-t border-[#0f1012]/5">
              <span>
                {product.is_closed || !product.is_opened ? "Lacrada" : "Aberta"}
                {product.abv ? ` | ABV ${product.abv.replace("~", "").replace("%", "")}%` : ""}
              </span>
            </div>
          </div>
        </Link>
      </div>
    </motion.div>
  );
}