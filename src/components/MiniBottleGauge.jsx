import { getLiquidColor } from "@/lib/openedBottle";

/**
 * Componente MiniBottleGauge
 * Renderiza um indicador de volume em forma de garrafa de cristal minimalista.
 *
 * @param {Object} props
 * @param {Object} props.product - O objeto do produto contendo is_opened, opening_level, volume, etc.
 * @param {('xs'|'sm'|'md'|'lg')} [props.size='sm'] - Tamanho do componente
 * @param {string} [props.className=''] - Classes adicionais CSS
 */
export default function MiniBottleGauge({ product, size = "sm", className = "" }) {
  if (!product) return null;

  const isOpened = product.is_opened && product.opening_level != null;
  const level = isOpened ? Math.max(0, Math.min(100, product.opening_level)) : 100;
  const liquidColor = getLiquidColor(product);
  
  // Detecção de bebida escura para melhorar contraste visual
  const isDarkLiquid = liquidColor === "#0A0A0A" || liquidColor === "#111827";
  
  // Dimensões do SVG com base no tamanho solicitado
  const dimensions = {
    xs: { width: 14, height: 35 },
    sm: { width: 20, height: 50 },
    md: { width: 28, height: 70 },
    lg: { width: 40, height: 100 }
  }[size] || { width: 20, height: 50 };

  const { width, height } = dimensions;

  // Gerador de ID único para evitar colisão de clipPaths no mesmo DOM
  const uniqueId = `bottle-clip-${product.id || Math.random().toString(36).substr(2, 9)}`;

  // Cálculo da altura do líquido dentro do gargalo e do corpo da garrafa (viewBox 0 0 30 75)
  // O espaço interno útil vai de y=7 (gargalo topo) a y=68 (base)
  // Altura total interna útil = 61px
  const startY = 68;
  const endY = 7;
  const targetY = startY - (level / 100) * (startY - endY);

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div 
        className="relative flex items-center justify-center"
        style={{ width, height }}
      >
        <svg 
          width="100%" 
          height="100%" 
          viewBox="0 0 30 75" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="overflow-visible"
        >
          <defs>
            {/* Máscara interna para o corte do líquido correspondendo ao formato da garrafa */}
            <clipPath id={uniqueId}>
              <path 
                d="M 12 7 H 18 V 18 L 23 23 V 64 C 23 68, 7 68, 7 64 V 23 L 12 18 Z" 
              />
            </clipPath>

            {/* Gradiente 3D para dar volume ao líquido */}
            <linearGradient id={`${uniqueId}-liquid-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={liquidColor} stopOpacity="0.85" />
              <stop offset="35%" stopColor={isDarkLiquid ? "#333" : "#FFFFFF"} stopOpacity="0.4" />
              <stop offset="70%" stopColor={liquidColor} />
              <stop offset="100%" stopColor={liquidColor} stopOpacity="0.9" />
            </linearGradient>

            {/* Gradiente para o vidro da garrafa */}
            <linearGradient id={`${uniqueId}-glass-grad`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
              <stop offset="100%" stopColor="rgba(255, 255, 255, 0.1)" />
            </linearGradient>
          </defs>

          {/* Silhueta Externa da Garrafa (Fundo de Vidro Fosco Seco) */}
          <path 
            d="M 11 5 H 19 V 18 L 24 24 V 65 C 24 70, 6 70, 6 65 V 24 L 11 18 Z" 
            fill={`url(#${uniqueId}-glass-grad)`}
            stroke="rgba(0, 0, 0, 0.08)"
            strokeWidth="0.75"
            className="backdrop-blur-sm"
          />

          {/* Líquido preenchendo a garrafa */}
          <rect 
            x="0" 
            y={targetY} 
            width="30" 
            height={75 - targetY} 
            fill={`url(#${uniqueId}-liquid-grad)`}
            clipPath={`url(#${uniqueId})`}
            className="transition-all duration-700 ease-out"
          />

          {/* Lacre da Garrafa (Apenas se não for aberta/lacrada) */}
          {!isOpened && (
            <path 
              d="M 11 5 H 19 V 10 H 11 Z" 
              fill={`url(#${uniqueId}-glass-grad)`}
              stroke="#D4AF37" // Lacre dourado elegante para garrafas lacradas
              strokeWidth="0.5"
            />
          )}

          {/* Reflexo de Luz / Brilho do Vidro Lateral */}
          <path 
            d="M 8 26 V 63" 
            stroke="rgba(255, 255, 255, 0.3)" 
            strokeWidth="0.5" 
            strokeLinecap="round" 
          />
        </svg>
      </div>
    </div>
  );
}
