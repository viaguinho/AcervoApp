import { getLiquidColor, getSafeHexColor } from "@/lib/openedBottle";

/**
 * Componente LiquidPill
 * Renderiza uma cápsula/pílula vertical com líquido colorido proporcional,
 * menisco reflexivo e brilho tridimensional de vidro.
 *
 * @param {Object} props
 * @param {Object} props.product - O objeto do produto
 * @param {number} [props.level] - Nível percentual de líquido (0 a 100). Se não fornecido, usa product.opening_level.
 * @param {number} [props.width=14] - Largura da pílula em pixels
 * @param {number} [props.height=54] - Altura da pílula em pixels
 * @param {string} [props.className=""] - Classes CSS adicionais
 */
export default function LiquidPill({ product, level, width = 14, height = 54, className = "" }) {
  if (!product) return null;

  const isOpened = product.is_opened && product.opening_level != null;
  const pct = level != null ? level : (isOpened ? Math.max(0, Math.min(100, product.opening_level)) : 100);
  const rawColor = getLiquidColor(product);
  const liquidColor = getSafeHexColor(rawColor);
  const fillH = Math.max(0, Math.min(100, pct));
  const borderRadius = Math.round(width * 0.7);
  const innerRadius = Math.round(width * 0.55);

  return (
    <div
      className={`relative overflow-hidden flex flex-col justify-end shrink-0 ${className}`}
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: `${borderRadius}px`,
        background: "rgba(0, 0, 0, 0.08)",
        border: "1px solid rgba(0, 0, 0, 0.12)",
        boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.15)",
      }}
    >
      {/* Fundo de contraste interno */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(0, 0, 0, 0.04)" }} />

      {/* Preenchimento do líquido em HTML/CSS puro com gradiente e sombra de brilho */}
      <div
        style={{
          width: "100%",
          height: `${fillH}%`,
          background: `linear-gradient(180deg, ${liquidColor} 0%, ${liquidColor}DD 100%)`,
          borderRadius: fillH >= 95 ? `${innerRadius}px` : `0 0 ${innerRadius}px ${innerRadius}px`,
          transition: "height 0.5s ease-out",
          position: "relative",
          boxShadow: `0 0 8px ${liquidColor}66`,
        }}
      >
        {/* Menisco / Linha de Superfície do Líquido */}
        {fillH > 0 && fillH < 100 && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: "2px",
              background: "rgba(255, 255, 255, 0.85)",
              boxShadow: "0 0 4px rgba(255, 255, 255, 0.95)",
            }}
          />
        )}
      </div>

      {/* Reflexo Glossy/Vidro Tridimensional na frente da cápsula */}
      <div
        style={{
          position: "absolute",
          top: "2px",
          left: "2px",
          bottom: "2px",
          width: Math.max(2, Math.round(width * 0.2)) + "px",
          background: "linear-gradient(180deg, rgba(255, 255, 255, 0.6) 0%, rgba(255, 255, 255, 0.08) 100%)",
          borderRadius: "4px",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
