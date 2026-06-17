import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { addToBag } from "@/lib/bagStore";
import { toast } from "sonner";
import { getFinalPrice } from "@/lib/openedBottle";
import { GlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button";

const AMBER = "#FFB84D";
const AMBER_DARK = "#C88A00";

export default function ProductShowcase({ products }) {
  const navigate = useNavigate();

  if (!products || products.length === 0) return null;

  const handleAddToBag = (e, product) => {
    e.stopPropagation();
    const result = addToBag(product);
    if (result) {
      toast.success("Adicionado à sacola", { description: product.name, duration: 2000 });
    } else {
      toast.info("Item já está na sacola", { description: product.name, duration: 2000 });
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${encodeURIComponent(productId)}`, {
      state: { allProducts: products },
    });
  };

  return (
    <div
      className="w-full mb-10"
      style={{
        background: "none",
        position: "relative",
        paddingTop: 16,
        paddingBottom: 60,
      }}
    >
      {/* Grid de produtos */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 16,
          padding: "0 24px",
        }}
      >
        {products.map((product) => {
          const finalPrice = getFinalPrice(product);
          const productAlt = `${product.name} - ${product.country || product.category}`;

          return (
            <motion.div
              key={product.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.3 }}
              onClick={() => handleProductClick(product.id)}
              style={{
                cursor: "pointer",
                background: "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.05) 100%)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.4)",
                borderRadius: 16,
                overflow: "hidden",
                boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
                display: "flex",
                flexDirection: "column",
                height: "auto",
              }}
              role="button"
              tabIndex={0}
              aria-label={`${product.name}, ${product.country || product.category}, R$ ${finalPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}`}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleProductClick(product.id);
                }
              }}
            >
              {/* Imagem do produto */}
              <div
                style={{
                  position: "relative",
                  height: 180,
                  background: "transparent",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  flexShrink: 0
                }}
              >
                {product.image_url ? (
                  <img
                    src={product.image_url}
                    alt={productAlt}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    style={{
                      height: "100%",
                      width: "auto",
                      maxWidth: "100%",
                      objectFit: "contain",
                      display: "block",
                      transition: "transform 0.5s ease"
                    }}
                  />
                ) : (
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Imagem do produto não disponível">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1"
                      style={{ width: 40, height: 40, color: "rgba(115, 115, 115, 0.2)" }}
                      aria-hidden="true"
                    >
                      <path d="M8 3h8l1 5H7L8 3z" />
                      <path d="M7 8h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z" />
                    </svg>
                  </div>
                )}

                {/* Botão de adicionar - Corrigido para Preto */}
                <GlassButton
                  onClick={(e) => handleAddToBag(e, product)}
                  aria-label={`Adicionar ${product.name} à sacola`}
                  size="none"
                  className="absolute bottom-[10px] right-[10px] w-8 h-8 rounded-full flex items-center justify-center shadow-lg z-10 !p-0"
                  style={{
                    background: "#121614",
                    color: "white",
                  }}
                  glassColor="rgba(0,0,0,0.5)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ width: 16, height: 16 }}>
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </GlassButton>
              </div>

              {/* Informações do produto */}
              <div style={{ padding: "8px 12px", display: "flex", flexDirection: "column", flexGrow: 1, justifyContent: "space-between" }}>
                <div style={{ height: 70, overflow: "hidden", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                  <p
                    style={{
                      fontSize: 9,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                      color: "#737373",
                      textAlign: "center",
                      margin: "0 0 4px 0",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    {product.country || product.category}
                  </p>
                  <h3
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: "#121614",
                      lineHeight: 1.2,
                      textAlign: "center",
                      margin: "0 0 12px 0",
                    }}
                  >
                    {product.name}
                  </h3>
                </div>

                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-end",
                    paddingTop: 6,
                    borderTop: "1px solid rgba(115, 115, 115, 0.1)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 2 }}>
                      <span style={{ fontSize: 10, color: "#737373", fontWeight: 500 }}>R$</span>
                      <span style={{ fontSize: 20, fontWeight: "bold", color: "#121614" }}>
                        {finalPrice?.toLocaleString("pt-BR", { minimumFractionDigits: 0 }).split(',')[0]}
                      </span>
                    </div>
                    {product.price && (
                      <span style={{ fontSize: 11, textDecoration: "line-through", color: "rgba(115, 115, 115, 0.5)" }}>
                        R$ {product.price?.toLocaleString("pt-BR", { minimumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>

                  {product.abv && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                      <span style={{ fontSize: 8, color: "rgba(115, 115, 115, 0.6)", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500, lineHeight: 1 }}>
                        ABV
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(115, 115, 115, 0.8)", fontWeight: 600, lineHeight: 1 }}>
                        {product.abv.replace("~", "")}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}