import { calcularPrecoFromProduct, getCurrentVolumeMl, parseVolumeMl, getLiquidColor } from "@/lib/openedBottle";
import MiniBottleGauge from "./MiniBottleGauge";

/**
 * Componente OpenedBottleBadge
 * Exibe informações refinadas sobre garrafas abertas, alinhado com a identidade visual de luxo.
 */
export default function OpenedBottleBadge({ product, size = "sm" }) {
  if (!product.is_opened || product.opening_level == null) return null;

  const pricing = calcularPrecoFromProduct(product);
  const volumeTotal = parseVolumeMl(product.volume);
  const currentVolumeMl = getCurrentVolumeMl(product);
  const liquidColor = getLiquidColor(product);
  const level = product.opening_level;

  if (size === "sm") {
    return (
      <div className="absolute top-2.5 left-2.5 glass-strong rounded-full pl-1.5 pr-2.5 py-1 flex items-center gap-2 border border-white/40 shadow-sm">
        <MiniBottleGauge product={product} size="xs" />
        <div className="flex flex-col font-outfit leading-none">
          <span className="text-[8px] font-bold tracking-[0.1em] uppercase text-foreground/80">
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

  const economia = Math.round(product.price - pricing.finalPrice);

  return (
    <div 
      className="rounded-[2rem] p-6 font-outfit border border-white/50 relative overflow-hidden backdrop-blur-xl" 
      style={{ 
        background: "rgba(255, 255, 255, 0.72)",
        boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 12px 24px -12px rgba(0,0,0,0.05)"
      }}
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <MiniBottleGauge product={product} size="md" />
          <div className="flex flex-col">
            <span className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground/60 leading-none mb-1">
              Fração de Líquido
            </span>
            <span className="text-xl font-bold text-foreground leading-none">
              Garrafa Aberta
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end text-right leading-tight">
          <span className="text-2xl font-black text-foreground">
            {level}%
          </span>
          {currentVolumeMl > 0 && (
            <span className="text-[10px] font-medium text-muted-foreground/60 lowercase">
              ({currentVolumeMl}ml de {volumeTotal}ml)
            </span>
          )}
        </div>
      </div>

      {/* Barra de progresso sofisticada */}
      <div 
        className="h-1 rounded-full overflow-hidden mb-4 bg-zinc-100 border-[0.5px] border-black/5"
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${level}%`,
            background: pricing.isCritical
              ? "linear-gradient(90deg, #3B1F0A, #7C4A1E)" // Gradiente solar para estoque crítico
              : `linear-gradient(90deg, ${liquidColor}, rgba(255,255,255,0.4))`,
          }}
        />
      </div>

      {/* Detalhes de preço e economia */}
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

      {/* Alertas Premium */}
      {pricing.isCritical && (
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

      {pricing.isFloorActive && !pricing.isCritical && (
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

      {product.opened_date && (
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