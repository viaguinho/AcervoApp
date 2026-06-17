import React, { useState, useEffect } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
const defaultImages = [
  "/assets/hero/img-0.png",
  "/assets/hero/img-1.png",
  "/assets/hero/img-2.png",
  "/assets/hero/img-3.png",
  "/assets/hero/img-4.png",
  "/assets/hero/img-5.png",
  "/assets/hero/img-6.png",
  "/assets/hero/img-7.png"
]

export const ImageCarouselHero = ({
  title = "ACERVO",
  description = "O Acervo une paixão pela coquetelaria e rigor de curadoria em bebidas premium com preços especiais, ajustados conforme o volume de líquido presente em cada garrafa.",
  onCtaClick,
  isLoading = false,
  items = null,
  logoUrl = "/assets/logo.png"
}) => {
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  
  // Use provided items or fallback to default images
  const carouselItems = items || defaultImages.map((src, index) => ({
    url: src,
    type: 'image',
    id: `default-${index}`
  }));

  const products = carouselItems.map((item, index) => ({
    ...item,
    id: item.id || `item-${index}`,
    rotation: (index % 2 === 0 ? -1 : 1) * (5 + (index * 2))
  }));

  const [rotatingCards, setRotatingCards] = useState(products.map((_, i) => i * (360 / products.length)))

  // Sync rotation states when products change (e.g. after upload)
  useEffect(() => {
    setRotatingCards(products.map((_, i) => i * (360 / products.length)))
  }, [products.length])

  // Continuous rotation animation
  useEffect(() => {
    const interval = setInterval(() => {
      setRotatingCards((prev) => prev.map((val) => (val + 0.3) % 360))
    }, 30)
    return () => clearInterval(interval)
  }, [products.length])

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  return (
    <div 
      className="relative w-full min-h-screen bg-white overflow-hidden font-sans flex flex-col items-center justify-start py-8 sm:py-12"
      onMouseMove={handleMouseMove}
    >
      {/* 2D Circular Carousel Effect with 3D Tilt */}
      <div className="relative w-full h-[32vh] sm:h-[38vh] flex items-center justify-center overflow-visible pointer-events-none mt-8 sm:mt-12 mb-2">
        <div className="absolute inset-0 flex items-center justify-center" style={{perspective: "1200px"}}>
          {products.map((p, index) => {
            const angle = (rotatingCards[index] || 0) * (Math.PI / 180)
            // Responsive radius - adjusted for 6 cards and tighter layout
            const radius = typeof window !== 'undefined' && window.innerWidth < 640 ? 120 : 220
            const x = Math.cos(angle) * radius
            const y = Math.sin(angle) * radius

            // 3D perspective effect based on mouse position
            const perspectiveX = (mousePosition.x - 0.5) * 30
            const perspectiveY = (mousePosition.y - 0.5) * 30

            return (
              <div
                key={p.id}
                className="absolute w-[90px] h-[130px] sm:w-[140px] sm:h-[195px] transition-all duration-700 ease-linear"
                style={{
                  transform: `
                    translate(${x}px, ${y}px)
                    rotateX(${perspectiveY}deg)
                    rotateY(${perspectiveX}deg)
                    rotateZ(${p.rotation}deg)
                  `,
                  transformStyle: "preserve-3d",
                }}
              >
                <div className="w-full h-full rounded-[1rem] sm:rounded-[1.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.1)] overflow-hidden bg-white border-none group">
                  {p.type === 'video' ? (
                    <video 
                      src={p.url} 
                      autoPlay 
                      loop 
                      muted 
                      playsInline
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <img 
                      src={p.url} 
                      alt="Acervo Boutique" 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  {/* Subtle shine */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-50 pointer-events-none" />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hero Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl mx-auto flex flex-col items-center flex-1 justify-start pt-20 sm:pt-10">
        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-sm overflow-hidden mb-5 flex items-center justify-center bg-white border border-zinc-50">
          <img src={logoUrl} alt="Logo" className="w-10 h-10 sm:w-12 sm:h-12 object-contain" />
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light uppercase tracking-[0.35em] text-zinc-900 mb-5 leading-tight">
          {title}
        </h1>
        
        <p className="text-[10px] sm:text-[0.85rem] font-light text-zinc-500 max-w-lg mx-auto mb-8 leading-relaxed tracking-wide italic">
          {description}
        </p>

        <button
          onClick={onCtaClick}
          disabled={isLoading}
          className="group relative bg-zinc-900 text-white px-8 py-3.5 sm:px-10 sm:py-4.5 rounded-full text-[9px] sm:text-[10px] font-bold tracking-[0.25em] overflow-hidden transition-all hover:bg-black hover:scale-105 active:scale-95"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                ENTRAR NO ACERVO
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </span>
        </button>
      </div>

      {/* Decorative gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0.01)_0%,transparent_80%)] pointer-events-none" />
    </div>
  )
}
