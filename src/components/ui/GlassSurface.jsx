import React, { useId } from 'react';

/**
 * Componente GlassSurface - React Bits
 * Fornece um efeito de vidro fosco (glassmorphism) de alta fidelidade
 * com distorção realística e refracção de luz simulada por filtros SVG dinâmicos.
 */
export default function GlassSurface({
  children = null,
  className = "",
  blur = 20,
  backgroundOpacity = 0.5,
  saturation = 1.3,
  distortionScale = 12,
  border = true,
  style = {}
}) {
  // Usa useId do React para gerar IDs únicos e estáveis entre renders
  const uid = useId().replace(/:/g, '');
  const filterId = `glass-filter-${uid}`;

  const isPositioned = className.includes("absolute") || className.includes("fixed");

  return (
    <div className={`${isPositioned ? "" : "relative"} ${className}`} style={{ ...style }}>
      {/* SVG de Filtro de Distorção de Vidro Líquido (Refração) */}
      <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
        <defs>
          <filter id={filterId}>
            {/* Gera ruído fractal simulando imperfeições do vidro */}
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.015"
              numOctaves="3"
              result="noise"
            />
            {/* Distorce os pixels do plano de fundo baseando-se no ruído gerado */}
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale={distortionScale}
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Camada Física do Vidro */}
      <div
        className="absolute inset-0 pointer-events-none rounded-[inherit] transition-all duration-300"
        style={{
          backgroundColor: `rgba(255, 255, 255, ${backgroundOpacity})`,
          backdropFilter: `blur(${blur}px) saturate(${saturation})`,
          WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation})`,
          filter: `url(#${filterId})`,
          border: border ? '1px solid rgba(255, 255, 255, 0.4)' : 'none',
          boxShadow: 'inset 0 1px 1px rgba(255, 255, 255, 0.5), 0 8px 32px rgba(0, 0, 0, 0.03)',
        }}
      />

      {/* Conteúdo Renderizado por cima */}
      <div className="relative z-10 w-full h-full rounded-[inherit]">
        {children}
      </div>
    </div>
  );
}
