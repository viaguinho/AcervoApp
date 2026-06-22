import { useMemo } from "react";

export function LiquidNumber({ value = 0 }) {
  const textValue = String(value);
  const charCount = textValue.length;
  
  // Calcula a largura do viewBox dinamicamente com base na quantidade de caracteres
  // 58px por caractere mais 10px de margem lateral
  const width = useMemo(() => charCount * 58 + 10, [charCount]);
  const height = 100;
  const viewBox = `0 0 ${width} ${height}`;
  
  // Onda senoidal gerada matematicamente baseada na largura calculada
  const waveLength = 100;
  const wavePath1 = useMemo(() => {
    let points = [];
    const waveY = 15; // Nível base da onda em relação ao topo
    const amp = 5.5;  // Amplitude da onda (ondas mais suaves e realistas)
    points.push(`M 0 ${waveY}`);
    const steps = Math.ceil((width * 2.5) / waveLength);
    for (let i = 0; i < steps; i++) {
      const startX = i * waveLength;
      
      // Primeira metade (crista): de startX a startX + waveLength/2
      const cp1x = startX + waveLength / 6;
      const cp1y = waveY - amp;
      const cp2x = startX + (5 * waveLength) / 12;
      const cp2y = waveY - amp;
      const endX1 = startX + waveLength / 2;
      const endY1 = waveY;
      points.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX1} ${endY1}`);
      
      // Segunda metade (vale): de endX1 a startX + waveLength
      const cp3x = startX + (7 * waveLength) / 12;
      const cp3y = waveY + amp;
      const cp4x = startX + (11 * waveLength) / 12;
      const cp4y = waveY + amp;
      const endX2 = startX + waveLength;
      const endY2 = waveY;
      points.push(`C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${endX2} ${endY2}`);
    }
    points.push(`V ${height + 20}`);
    points.push(`H 0`);
    points.push("Z");
    return points.join(" ");
  }, [width]);

  const wavePath2 = useMemo(() => {
    let points = [];
    const waveY = 17; // Levemente deslocado verticalmente para dar profundidade
    const amp = 4;    // Amplitude da onda secundária mais suave
    points.push(`M 0 ${waveY}`);
    const steps = Math.ceil((width * 2.5) / waveLength);
    for (let i = 0; i < steps; i++) {
      const startX = i * waveLength;
      
      // Primeira metade (crista): de startX a startX + waveLength/2
      const cp1x = startX + waveLength / 6;
      const cp1y = waveY - amp;
      const cp2x = startX + (5 * waveLength) / 12;
      const cp2y = waveY - amp;
      const endX1 = startX + waveLength / 2;
      const endY1 = waveY;
      points.push(`C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${endX1} ${endY1}`);
      
      // Segunda metade (vale): de endX1 a startX + waveLength
      const cp3x = startX + (7 * waveLength) / 12;
      const cp3y = waveY + amp;
      const cp4x = startX + (11 * waveLength) / 12;
      const cp4y = waveY + amp;
      const endX2 = startX + waveLength;
      const endY2 = waveY;
      points.push(`C ${cp3x} ${cp3y}, ${cp4x} ${cp4y}, ${endX2} ${endY2}`);
    }
    points.push(`V ${height + 20}`);
    points.push(`H 0`);
    points.push("Z");
    return points.join(" ");
  }, [width]);

  // ID único para evitar conflitos de clipPath e Gradient
  const uniqueId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  const clipPathId = `liquid-num-clip-${uniqueId}`;
  const gradId = `liquid-grad-${uniqueId}`;

  return (
    <div className="relative select-none flex items-center justify-center">
      {/* CSS injetado inline para manter o componente autocontido e otimizado na GPU */}
      <style>{`
        :root {
          --liquid-top: #00d2ff; /* Azul Ciano / Elétrico Vivo */
          --liquid-bottom: #1d4ed8; /* Azul Royal Profundo */
        }
        .dark {
          --liquid-top: #00f2ff; /* Azul Neon / Ciano Brilhante */
          --liquid-bottom: #1e3a8a; /* Azul Índigo Profundo */
        }
        @keyframes wave-horiz-1 {
          0% { transform: translateX(0); }
          100% { transform: translateX(-${waveLength}px); }
        }
        @keyframes wave-horiz-2 {
          0% { transform: translateX(-${waveLength}px); }
          100% { transform: translateX(0); }
        }
        .animate-wave-1 {
          animation: wave-horiz-1 9s linear infinite;
        }
        .animate-wave-2 {
          animation: wave-horiz-2 7s linear infinite;
        }
      `}</style>

      <svg
        viewBox={viewBox}
        className="h-[96px] w-auto overflow-visible font-sans font-bold"
        style={{ contentVisibility: "auto" }}
      >
        <defs>
          {/* Gradiente tridimensional do líquido */}
          <linearGradient id={gradId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--liquid-top)" />
            <stop offset="100%" stopColor="var(--liquid-bottom)" />
          </linearGradient>

          {/* A máscara com o número */}
          <clipPath id={clipPathId}>
            <text
              x="50%"
              y="80"
              textAnchor="middle"
              className="text-[92px] font-bold font-sans tracking-tight"
            >
              {textValue}
            </text>
          </clipPath>
        </defs>

        {/* 1. Contorno (Stroke) que permanece sempre visível */}
        <text
          x="50%"
          y="80"
          textAnchor="middle"
          fill="none"
          strokeWidth="1.5"
          className="text-[92px] font-bold font-sans tracking-tight stroke-primary/35"
        >
          {textValue}
        </text>

        {/* 2. Conteúdo Líquido clipado dentro do número */}
        <g clipPath={`url(#${clipPathId})`}>
          {/* Grupo de ondas animado verticalmente (esvaziamento lento) */}
          <g className="animate-liquid-drain">
            {/* Onda de trás (fundo translúcido com opacidade) */}
            <path
              d={wavePath2}
              fill={`url(#${gradId})`}
              opacity="0.3"
              className="animate-wave-2"
            />
            {/* Onda da frente (sólida/gradiente) */}
            <path
              d={wavePath1}
              fill={`url(#${gradId})`}
              className="animate-wave-1"
            />
          </g>
        </g>
      </svg>
    </div>
  );
}
