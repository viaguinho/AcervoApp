import * as React from "react";
import { cn } from "@/lib/utils";

export function GooeyText({
  texts,
  morphTime = 1.0,
  cooldownTime = 2.5, // 2.5s de exibição para leitura confortável
  className,
  textClassName,
  blurMax = 2.0, // Valor menor (2.0) otimizado para fontes pequenas (12px-14px) para evitar que o texto suma
  align = "right"
}) {
  const text1Ref = React.useRef(null);
  const text2Ref = React.useRef(null);
  
  // Gera um ID único para o filtro SVG para evitar conflito entre múltiplas instâncias na mesma página
  const uniqueId = React.useId().replace(/:/g, "");
  const filterId = `threshold-${uniqueId}`;

  React.useEffect(() => {
    if (!texts || texts.length === 0) return;
    
    // Se houver apenas 1 texto, exibe de forma estática
    if (texts.length === 1) {
      if (text1Ref.current) text1Ref.current.textContent = texts[0];
      if (text2Ref.current) text2Ref.current.textContent = "";
      return;
    }

    let textIndex = texts.length - 1;
    let time = new Date();
    let morph = 0;
    let cooldown = cooldownTime;
    let animationFrameId;

    const setMorph = (fraction) => {
      if (text1Ref.current && text2Ref.current) {
        // Aplica o desfoque escalado pelo blurMax
        const blurVal2 = Math.min(blurMax / fraction - blurMax, 50);
        text2Ref.current.style.filter = `blur(${blurVal2}px)`;
        text2Ref.current.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

        const fractionInverse = 1 - fraction;
        const blurVal1 = Math.min(blurMax / fractionInverse - blurMax, 50);
        text1Ref.current.style.filter = `blur(${blurVal1}px)`;
        text1Ref.current.style.opacity = `${Math.pow(fractionInverse, 0.4) * 100}%`;
      }
    };

    const doCooldown = () => {
      morph = 0;
      if (text1Ref.current && text2Ref.current) {
        text2Ref.current.style.filter = "";
        text2Ref.current.style.opacity = "100%";
        text1Ref.current.style.filter = "";
        text1Ref.current.style.opacity = "0%";
      }
    };

    const doMorph = () => {
      morph -= cooldown;
      cooldown = 0;
      let fraction = morph / morphTime;

      if (fraction > 1) {
        cooldown = cooldownTime;
        fraction = 1;
      }

      setMorph(fraction);
    };

    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      const newTime = new Date();
      const shouldIncrementIndex = cooldown > 0;
      const dt = (newTime.getTime() - time.getTime()) / 1000;
      time = newTime;

      cooldown -= dt;

      if (cooldown <= 0) {
        if (shouldIncrementIndex) {
          textIndex = (textIndex + 1) % texts.length;
          if (text1Ref.current && text2Ref.current) {
            text1Ref.current.textContent = texts[textIndex % texts.length];
            text2Ref.current.textContent = texts[(textIndex + 1) % texts.length];
          }
        }
        doMorph();
      } else {
        doCooldown();
      }
    }

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [texts, morphTime, cooldownTime, blurMax]);

  if (!texts || texts.length === 0) return null;

  return (
    <div className={cn("relative h-[18px] w-[200px] overflow-visible", className)}>
      {/* SVG local com ID único de filtro */}
      <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
        <defs>
          <filter id={filterId}>
            {/* 
              Matriz de cor otimizada (18 -8) para fontes pequenas.
              Evita que as letras sumam completamente durante o desfoque,
              mantendo a transição fluida e visível.
            */}
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 18 -8"
            />
          </filter>
        </defs>
      </svg>

      <div
        className={cn(
          "relative flex items-center h-full w-full",
          align === "left" ? "justify-start" : "justify-end"
        )}
        style={{ filter: `url(#${filterId})` }}
      >
        <span
          ref={text1Ref}
          className={cn(
            "absolute select-none whitespace-nowrap font-semibold font-outfit",
            align === "left" ? "text-left left-0" : "text-right right-0",
            textClassName
          )}
        />
        <span
          ref={text2Ref}
          className={cn(
            "absolute select-none whitespace-nowrap font-semibold font-outfit",
            align === "left" ? "text-left left-0" : "text-right right-0",
            textClassName
          )}
        />
      </div>
    </div>
  );
}
