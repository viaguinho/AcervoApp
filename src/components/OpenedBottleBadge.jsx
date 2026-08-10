import { calcularPrecoFromProduct, getCurrentVolumeMl, parseVolumeMl, getLiquidColor } from "@/lib/openedBottle";

/**
 * Componente OpenedBottleBadge
 * Exibe informações refinadas sobre garrafas abertas, alinhado com a identidade visual de luxo.
 */
export default function OpenedBottleBadge({ product, size = "sm" }) {
  if (!product) return null;

  const isOpened = product.is_opened && product.opening_level != null;

  if (size === "sm") {
    if (!isOpened) return null;
    const pricing = calcularPrecoFromProduct(product);
    const level = product.opening_level;

    return (
      <div className="absolute z-40 top-2.5 left-2.5 glass-strong rounded-full px-3 py-1.5 flex items-center gap-1.5 border border-white/40 shadow-sm" style={{ zIndex: 50 }}>
        <div className="flex flex-col font-outfit leading-none">
          <span className="text-[9px] font-bold tracking-[0.08em] uppercase text-foreground/90">
            {level}% rest.
          </span>
          {pricing.discountPercent > 0 && (
            <span className="text-[8px] font-black text-amber-700 mt-0.5">
              -{pricing.discountPercent}% OFF
            </span>
          )}
        </div>
      </div>
    );
  }

  const level = isOpened ? Math.max(0, Math.min(100, product.opening_level)) : 100;
  const pricing = calcularPrecoFromProduct(product);
  const volumeTotal = parseVolumeMl(product.volume);
  const currentVolumeMl = isOpened ? getCurrentVolumeMl(product) : volumeTotal;
  const liquidColor = getLiquidColor(product);
  const economia = Math.round((product.price || 0) - pricing.finalPrice);

  return (
    <div 
      className="rounded-[2rem] p-6 font-outfit border border-black/5 relative overflow-hidden backdrop-blur-xl transition-all duration-300" 
      style={{ 
        background: "rgba(255, 255, 255, 0.72)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.8), 0 12px 24px -12px rgba(0,0,0,0.05)"
      }}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/60 leading-none mb-1">
            {isOpened ? "Fração de Líquido" : "Volume Integral"}
          </span>
          <span className="text-xl font-bold text-foreground leading-none">
            {isOpened ? "Garrafa Aberta" : "Garrafa Lacrada"}
          </span>
        </div>

        <div className="flex flex-col items-end text-right leading-tight">
          <span className="text-2xl font-black text-foreground">
            {level}%
          </span>
          {volumeTotal > 0 && (
            <span className="text-[10px] font-medium text-muted-foreground/60 lowercase">
              ({currentVolumeMl}ml de {volumeTotal}ml)
            </span>
          )}
        </div>
      </div>

      {/* Barra de progresso sofisticada */}
      <div 
        className="h-1.5 rounded-full overflow-hidden mb-4 bg-zinc-100 border-[0.5px] border-black/5"
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${level}%`,
            background: pricing.isCritical
              ? "linear-gradient(90deg, #3B1F0A, #7C4A1E)"
              : `linear-gradient(90deg, ${liquidColor}, ${liquidColor}88)`,
          }}
        />
      </div>

      {/* Detalhes de preço e economia */}
      {isOpened ? (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-black/5">
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground/70 font-light tracking-wide">
              Benefício Fracionado:
            </span>
            <span className="text-xs font-black text-amber-700">
              -{pricing.discountPercent}%
            </span>
          </div>

          {economia > 0 && (
            <span className="text-[10px] text-muted-foreground/60 font-medium bg-black/5 px-2.5 py-0.5 rounded-full">
              Economiza R$ {economia}
            </span>
          )}
        </div>
      ) : (
        <div className="flex items-center justify-between pt-3 border-t border-black/5 text-[10px] text-muted-foreground/70 font-outfit">
          <span className="font-semibold tracking-wider uppercase">Lacre de Fábrica</span>
          <span className="font-medium text-emerald-600">Volume 100% Preservado</span>
        </div>
      )}

      {/* Alertas Premium */}
      {isOpened && pricing.isCritical && (
        <div
          className="flex items-center gap-2 mt-4 pt-3 text-[9px] font-bold uppercase tracking-[0.15em]"
          style={{ borderTop: "0.5px solid rgba(0, 0, 0, 0.05)", color: "#7C4A1E" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5" aria-hidden="true">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Dose Final · Disponibilidade Crítica
        </div>
      )}

      {isOpened && pricing.isFloorActive && !pricing.isCritical && (
        <div
          className="flex items-center gap-2 mt-4 pt-3 text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground/60"
          style={{ borderTop: "0.5px solid rgba(0, 0, 0, 0.05)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-3.5 h-3.5" aria-hidden="true">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          Preço protegido por piso de segurança
        </div>
      )}

      {isOpened && product.opened_date && (
        <p 
          className="text-[9px] uppercase tracking-[0.15em] text-muted-foreground/40 mt-3 pt-3 font-semibold text-right" 
          style={{ borderTop: "0.5px solid rgba(0,0,0,0.05)" }}
        >
          Aberta em: {new Date(product.opened_date).toLocaleDateString("pt-BR")}
        </p>
      )}
    </div>
  );
}