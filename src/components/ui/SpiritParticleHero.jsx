import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/api/apiClient';
import HolographicButton from '../HolographicButton';

const TOTAL_PARTICLES = 160;
const MAX_BOTTLES = 16;

export default function SpiritParticleHero({ onEnterApp }) {
  const [bottles, setBottles] = useState([]);
  const [phase, setPhase] = useState('A'); // 'A' = Swarm, 'B' = Text
  const [textPoints, setTextPoints] = useState([]);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });
  const containerRef = useRef(null);

  // Measure container
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch bottles
  useEffect(() => {
    async function loadBottles() {
      try {
        const products = await api.entities.Product.list();
        let validProducts = products.filter(p => p.imageUrl || p.image_url);
        let images = validProducts.map(p => p.imageUrl || p.image_url).slice(0, MAX_BOTTLES);
        
        if (images.length > 0 && images.length < MAX_BOTTLES) {
          let multiplied = [...images];
          while (multiplied.length < MAX_BOTTLES) {
            multiplied = [...multiplied, ...images];
          }
          images = multiplied.slice(0, MAX_BOTTLES);
        } else if (images.length === 0) {
          images = Array(MAX_BOTTLES).fill(null);
        }

        setBottles(images);
      } catch (e) {
        console.error("Failed to load products", e);
        setBottles(Array(MAX_BOTTLES).fill(null));
      }
    }
    loadBottles();
  }, []);

  // Generate Text Points offscreen
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const cWidth = 1000;
    const cHeight = 250;
    canvas.width = cWidth;
    canvas.height = cHeight;
    
    ctx.fillStyle = 'white';
    ctx.font = '800 140px "Outfit", sans-serif'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ACERVO', cWidth / 2, cHeight / 2);
    
    const imgData = ctx.getImageData(0, 0, cWidth, cHeight);
    const data = imgData.data;
    
    let points = [];
    const step = 6; // Dense sampling
    
    for (let y = 0; y < cHeight; y += step) {
      for (let x = 0; x < cWidth; x += step) {
        const alpha = data[(y * cWidth + x) * 4 + 3];
        if (alpha > 128) {
          // Add a tiny bit of random jitter to the text points for a more organic look
          const jitterX = (Math.random() - 0.5) * 4;
          const jitterY = (Math.random() - 0.5) * 4;
          points.push({ 
            x: (x - cWidth / 2) + jitterX, 
            y: (y - cHeight / 2) + jitterY 
          });
        }
      }
    }
    
    // Shuffle and pick exactly TOTAL_PARTICLES points
    const shuffled = points.sort(() => 0.5 - Math.random());
    const finalPoints = [];
    for (let i = 0; i < TOTAL_PARTICLES; i++) {
      if (shuffled[i]) {
        finalPoints.push(shuffled[i]);
      } else {
        // Fallback if not enough points
        finalPoints.push({ x: (Math.random() - 0.5) * 400, y: (Math.random() - 0.5) * 100 });
      }
    }
    
    setTextPoints(finalPoints);
  }, []);

  // Phase Timer
  useEffect(() => {
    let cycleInterval;
    const startTimeout = setTimeout(() => {
      setPhase('B');
      cycleInterval = setInterval(() => {
        setPhase(prev => prev === 'A' ? 'B' : 'A');
      }, 7000); // Hold each phase for a bit longer to appreciate the effect
    }, 1500);

    return () => {
      clearTimeout(startTimeout);
      clearInterval(cycleInterval);
    };
  }, []);

  // Generate random idle paths for swarm effect
  const particlesData = useMemo(() => {
    return Array.from({ length: TOTAL_PARTICLES }).map((_, i) => {
      const isBottle = i < MAX_BOTTLES;
      const src = isBottle ? bottles[i] : null;
      
      // Generate 4 random waypoints for continuous looping in Phase A
      const rangeX = dimensions.width * 0.8;
      const rangeY = dimensions.height * 0.8;
      
      const pathX = Array.from({ length: 4 }).map(() => (Math.random() - 0.5) * rangeX);
      const pathY = Array.from({ length: 4 }).map(() => (Math.random() - 0.5) * rangeY);
      
      // Ensure smooth looping back to start
      pathX.push(pathX[0]);
      pathY.push(pathY[0]);

      return {
        id: i,
        isBottle,
        src,
        idleX: pathX,
        idleY: pathY,
        duration: 20 + Math.random() * 20, // Slow organic movement
        delay: Math.random() * 2,
        baseScale: isBottle ? 1.5 + Math.random() : 0.5 + Math.random() * 1.5,
      };
    });
  }, [bottles, dimensions.width, dimensions.height]);

  const [showUI, setShowUI] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShowUI(true), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative w-screen h-screen bg-[#080808] overflow-hidden flex flex-col items-center justify-center"
      style={{ perspective: "1000px" }}
    >
      {/* Background Glow during Text Phase */}
      <motion.div
        animate={{ opacity: phase === 'B' ? 1 : 0 }}
        transition={{ duration: 2 }}
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(180,180,180,0.12) 0%, transparent 60%)'
        }}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ transformStyle: "preserve-3d" }}>
        {particlesData.map((p, i) => {
          const isPhaseB = phase === 'B';
          const textP = textPoints[i] || { x: 0, y: 0 };
          const zDepth = (Math.random() - 0.5) * 200; // Fake 3D depth
          
          return (
            <motion.div
              key={p.id}
              className={`absolute top-1/2 left-1/2 pointer-events-auto ${
                p.isBottle 
                  ? 'rounded-full overflow-hidden shadow-2xl bg-black/40' 
                  : 'rounded-full bg-slate-100/60 shadow-[0_0_12px_rgba(226,232,240,0.8)]'
              }`}
              style={{
                width: p.isBottle ? 28 : 6,
                height: p.isBottle ? 28 : 6,
                marginTop: p.isBottle ? -14 : -3,
                marginLeft: p.isBottle ? -14 : -3,
                willChange: "transform, opacity",
              }}
              initial={{ x: p.idleX[0], y: p.idleY[0], opacity: 0, scale: 0 }}
              animate={isPhaseB ? {
                x: textP.x,
                y: textP.y,
                z: 0,
                scale: 1,
                opacity: p.isBottle ? 0.9 : 0.8,
                rotate: 0,
              } : {
                x: p.idleX,
                y: p.idleY,
                z: zDepth,
                scale: p.isBottle ? [p.baseScale, p.baseScale * 1.2, p.baseScale] : [p.baseScale, p.baseScale * 2, p.baseScale],
                opacity: p.isBottle ? [0.4, 0.8, 0.4] : [0.2, 0.9, 0.2],
                rotate: [0, 180, 360],
              }}
              transition={isPhaseB ? {
                // Magnetic snap effect
                type: "spring", 
                stiffness: 70 + Math.random() * 40, 
                damping: 12 + Math.random() * 4, 
                mass: 0.8 + Math.random() * 0.5,
                delay: Math.random() * 0.2 // Slight random delay for organic assembly
              } : {
                // Continuous wandering
                x: { repeat: Infinity, duration: p.duration, ease: "linear" },
                y: { repeat: Infinity, duration: p.duration, ease: "linear" },
                z: { repeat: Infinity, duration: p.duration, ease: "easeInOut" },
                scale: { repeat: Infinity, duration: p.duration * 0.5, ease: "easeInOut" },
                opacity: { repeat: Infinity, duration: p.duration * 0.3, ease: "easeInOut" },
                rotate: { repeat: Infinity, duration: p.duration * 0.8, ease: "linear" },
              }}
              onClick={() => setPhase(prev => prev === 'A' ? 'B' : 'A')}
            >
              {p.isBottle && p.src ? (
                <img 
                  src={p.src} 
                  alt="bottle" 
                  className="w-full h-full object-cover rounded-full"
                  draggable={false}
                />
              ) : p.isBottle ? (
                <div className="w-full h-full rounded-full bg-gradient-to-br from-slate-200 to-slate-500 opacity-80" />
              ) : null}
            </motion.div>
          );
        })}
      </div>

      {/* Copy and CTA */}
      <div className="absolute bottom-[15%] flex flex-col items-center gap-6 z-20 pointer-events-none">
        <AnimatePresence>
          {showUI && (
            <motion.div
              initial={{ opacity: 0, filter: 'blur(10px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              transition={{ duration: 1.5 }}
              className="text-[15px] italic font-serif tracking-wide"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              Cada garrafa tem uma história.
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showUI && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4 }}
              className="pointer-events-auto"
            >
              <HolographicButton 
                onClick={onEnterApp}
                className="px-10 py-3.5 bg-transparent border border-white/10 text-white hover:bg-white/10 hover:border-white/30 backdrop-blur-md rounded-full tracking-wider text-xs font-bold"
              >
                EXPLORAR ACERVO →
              </HolographicButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
