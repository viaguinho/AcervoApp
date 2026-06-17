"use client";;
import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
  useReducedMotion,
  cubicBezier,
} from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

/**
 * Curated editorial portrait set used as the default `images` for {@link ScrollTiltedGrid}.
 * Hosted on Pinterest's CDN — fine for demos and prototypes; swap to your own assets in production.
 */
export const DEFAULT_GRID_IMAGES = [
  "https://i.pinimg.com/736x/de/0f/9c/de0f9c57bf7ae1c48ea467ffe9817fdc.jpg",
  "https://i.pinimg.com/736x/80/17/36/8017367dbe52dae63b58a678018795ee.jpg",
  "https://i.pinimg.com/736x/0d/b6/1f/0db61f5245c835228df83398f6d96ceb.jpg",
  "https://i.pinimg.com/736x/39/27/f5/3927f53cebd0a148ba806fbd15e1fdd9.jpg",
  "https://i.pinimg.com/1200x/5f/ae/6d/5fae6de0940fe4a2471f34fb1b259b77.jpg",
  "https://i.pinimg.com/736x/df/04/61/df0461286b3e5291300adbffa70b3e9e.jpg",
  "https://i.pinimg.com/736x/6d/45/f1/6d45f1c96c3316c3bc5055ed6e8e3b8f.jpg",
  "https://i.pinimg.com/736x/a9/4c/e0/a94ce014127cfded1c7160b110eb7a86.jpg",
  "https://i.pinimg.com/736x/fe/f0/8a/fef08a661d0ef55561d99a293c79dd81.jpg",
  "https://i.pinimg.com/736x/84/c6/10/84c610443c77c1e34398f071fdc3b71a.jpg",
  "https://i.pinimg.com/736x/54/13/9d/54139d6fd658b1d5e71cdc07ea37a57c.jpg",
  "https://i.pinimg.com/736x/2d/0b/74/2d0b74227b38d56fcc8b9f4872addcfc.jpg",
];

const easeIntoFocus = cubicBezier(0.22, 1, 0.36, 1);
const easeOutOfFocus = cubicBezier(0, 0, 0.58, 1);
const focusEase = [
  easeIntoFocus,
  easeOutOfFocus,
];

const MAX_WIDTH_CLASS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  none: "",
};

const GAP_CLASS = {
  4: "gap-4",
  6: "gap-6",
  8: "gap-8",
  10: "gap-10",
  12: "gap-12",
  14: "gap-14",
};

/**
 * @param {{ item: string | GridImage; side: 'L' | 'R'; config: any; containerRef?: import('react').RefObject<HTMLElement>; itemScale?: number }} props
 */
function Tile({
  item,
  side,
  config,
  containerRef,
  itemScale = 1
}) {
  const src = typeof item === 'string' ? item : item.url;
  const bgColor = typeof item === 'string' ? 'transparent' : (item.color || '#F4F5F6');
  
  const ref = useRef(null);
  const { scrollYProgress: p } = useScroll({
    target: ref,
    container: containerRef,
    offset: ["start end", "end start"],
  });

  const reduce = useReducedMotion();
  const sign = side === "L" ? -1 : 1;
  const { aspectRatio, perspective, maxTilt, maxBlur, rounded } = config;

  const blur     = useTransform(p, [0, 0.7, 1], [maxBlur, 0, maxBlur], { ease: focusEase });
  const bright   = useTransform(p, [0, 0.7, 1], [1, 1, 1], { ease: focusEase });
  const contrast = useTransform(p, [0, 0.7, 1], [1, 1, 1], { ease: focusEase });

  const ty = useTransform(p, [0, 0.7, 1], ["40%", "0%", "-40%"], { ease: focusEase });
  const tz = useTransform(p, [0, 0.7, 1], [300, 0, 300], { ease: focusEase });
  const rx = useTransform(p, [0, 0.7, 1], [maxTilt, 0, -maxTilt], { ease: focusEase });

  const tx = useTransform(
    p,
    [0, 0.7, 1],
    [`${sign * 40}%`, "0%", `${sign * 40}%`],
    { ease: focusEase }
  );
  const rot = useTransform(p, [0, 0.7, 1], [-sign * 5, 0, sign * 5], { ease: focusEase });
  const sk  = useTransform(p, [0, 0.7, 1], [sign * 20, 0, -sign * 20], { ease: focusEase });

  const innerSY = useTransform(p, [0, 0.7, 1], [1.8, 1, 1.8], { ease: focusEase });

  const filter = useMotionTemplate`blur(${blur}px) brightness(${bright}) contrast(${contrast})`;

  if (reduce) {
    return (
      <figure ref={ref} className="relative z-10 m-0">
        <div
          className="relative w-full overflow-hidden flex items-center justify-center"
          style={{ aspectRatio, borderRadius: rounded, backgroundColor: bgColor }}>
          {typeof item === 'string' ? (
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url("${src}")` }} />
          ) : (
            <img src={src} className="w-[80%] h-[80%] object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.15)]" alt="" />
          )}
        </div>
      </figure>
    );
  }

  return (
    <motion.figure
      ref={ref}
      className="relative z-10 m-0"
      style={{ perspective, willChange: "transform" }}>
      <motion.div
        className="relative w-full overflow-hidden will-change-[filter,transform] flex items-center justify-center border border-black/5"
        style={{
          aspectRatio,
          borderRadius: rounded,
          backgroundColor: bgColor,
          filter,
          x: tx,
          y: ty,
          z: tz,
          rotate: rot,
          rotateX: rx,
          skewX: sk,
        }}>
        {typeof item === 'string' ? (
          <motion.div
            className="absolute inset-0 bg-cover bg-center will-change-transform"
            style={{
              backgroundImage: `url("${src}")`,
              scaleY: innerSY,
              backfaceVisibility: "hidden",
            }} />
        ) : (
          <motion.div
            className="absolute inset-0 flex items-center justify-center border border-black/5 overflow-hidden"
            style={{
              scaleY: innerSY,
              backfaceVisibility: "hidden",
              borderRadius: rounded,
              backgroundColor: bgColor,
            }}>
            {/* Wrapper para agrupar garrafa e sombra, garantindo que fiquem sempre juntas */}
            <div 
              className="relative flex items-end justify-center group pb-[16px]"
              style={{ 
                width: `${85 * itemScale}%`, 
                height: `${85 * itemScale}%`,
                maxWidth: '90%',
                maxHeight: '90%'
              }}
            >
              <img 
                src={src} 
                className="relative z-10 w-auto h-auto max-w-full max-h-full object-contain drop-shadow-[0_8px_12px_rgba(0,0,0,0.08)]" 
                alt="" 
                loading="lazy"
              />
              {/* Ground Shadow - pinned directly to bottle base */}
              <div 
                className="absolute bottom-[13px] left-0 right-0 mx-auto w-[60%] h-[6px] rounded-[100%] z-0 mix-blend-multiply opacity-35 blur-[4px]" 
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 80%)',
                }}
              />
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.figure>
  );
}

/**
 * @typedef {Object} GridImage
 * @property {string} url
 * @property {string} [color]
 */

/**
 * @typedef {Object} ScrollTiltedGridProps
 * @property {Array<string | GridImage>} [images]
 * @property {boolean} [loop]
 * @property {number} [initialCycles]
 * @property {string} [aspectRatio]
 * @property {string} [maxWidth]
 * @property {number} [gap]
 * @property {number} [perspective]
 * @property {number} [maxTilt]
 * @property {number} [maxBlur]
 * @property {string} [rounded]
 * @property {import('react').RefObject<HTMLElement>} [containerRef]
 * @property {string} [className]
 * @property {number} [itemScale]
 */

/**
 * Editorial scroll-tilted image grid. Pairs of images rise from below tipped
 * forward, settle into a clean focus, then tilt back over the top edge as they
 * exit. Optionally loops infinitely via an IntersectionObserver-driven append.
 * 
 * @param {ScrollTiltedGridProps} props
 */
export function ScrollTiltedGrid({
  images = DEFAULT_GRID_IMAGES,
  loop = false,
  initialCycles = 3,
  aspectRatio = "3/4",
  maxWidth = "lg",
  gap = 2,
  perspective = 900,
  maxTilt = 70,
  maxBlur = 8,
  rounded = "1rem",
  containerRef,
  className,
  itemScale = 1
} = {}) {
  const [cycles, setCycles] = useState(loop ? initialCycles : 1);
  const sentinelRef = useRef(null);

  useEffect(() => {
    if (!loop) return;
    const el = sentinelRef.current;
    if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      if (entries.some((e) => e.isIntersecting)) {
        setCycles((c) => c + 2);
      }
    }, { rootMargin: "1500px 0px 1500px 0px" });
    obs.observe(el);
    return () => obs.disconnect();
  }, [loop]);

  /** @type {Array<string | GridImage>} */
  const items = useMemo(() =>
    loop
      ? Array.from({ length: cycles }, () => images).flat()
      : [...images], [loop, cycles, images]);

  const config = useMemo(
    () => ({ aspectRatio, perspective, maxTilt, maxBlur, rounded }),
    [aspectRatio, perspective, maxTilt, maxBlur, rounded]
  );

  const gridClass = [
    "mx-auto mb-4 grid w-full grid-cols-2 px-4",
    MAX_WIDTH_CLASS[maxWidth],
    GAP_CLASS[gap] || "gap-2",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className={["relative w-full", className].filter(Boolean).join(" ")}>
      <div className={gridClass}>
        {items.map((item, i) => {
          const keySrc = typeof item === 'string' ? item : item.url;
          return (
            <Tile
              key={`${i}-${keySrc}`}
              item={item}
              side={i % 2 === 0 ? "L" : "R"}
              config={config}
              containerRef={containerRef}
              itemScale={itemScale} />
          );
        })}
      </div>
      {loop ? (
        <div ref={sentinelRef} aria-hidden className="h-px w-full" />
      ) : null}
    </section>
  );
}