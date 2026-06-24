"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "@/api/apiClient"
import { GlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button"

export const WaitlistHero = ({ onEnterApp }) => {
  const [status, setStatus] = useState("idle") // 'idle' | 'loading' | 'success'
  const [beverageImages, setBeverageImages] = useState([])
  const canvasRef = useRef(null)

  useEffect(() => {
    async function loadImages() {
      try {
        const products = await api.entities.Product.list()
        const images = products
          .filter(p => p.image_url || p.imageUrl)
          .map(p => p.image_url || p.imageUrl)
          .slice(0, 3)
        
        if (images.length > 0) {
          setBeverageImages(images)
        }
      } catch (e) {
        console.error("Failed to load beverage images", e)
      }
    }
    loadImages()
  }, [])

  const handleEnter = (e) => {
    e.preventDefault()
    setStatus("loading")

    // Simulate small delay for animation
    setTimeout(() => {
      setStatus("success")
      fireConfetti()
      
      // Navigate to app after success animation
      setTimeout(() => {
        if (onEnterApp) {
          onEnterApp()
        }
      }, 1500)
    }, 800)
  }

  // --- Confetti Logic ---
  const fireConfetti = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    const particles = []
    const colors = ["#0079da", "#10b981", "#fbbf24", "#f472b6", "#fff"]

    // Resize canvas to cover the button area mostly
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    const createParticle = () => {
      return {
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 12, // Random spread X
        vy: (Math.random() - 2) * 10, // Upward velocity
        life: 100,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 4 + 2,
      }
    }

    // Create batch of particles
    for (let i = 0; i < 50; i++) {
      particles.push(createParticle())
    }

    const animate = () => {
      if (particles.length === 0) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        p.x += p.vx
        p.y += p.vy
        p.vy += 0.5 // Gravity
        p.life -= 2

        ctx.fillStyle = p.color
        ctx.globalAlpha = Math.max(0, p.life / 100)
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        if (p.life <= 0) {
          particles.splice(i, 1)
          i--
        }
      }

      requestAnimationFrame(animate)
    }

    animate()
  }

  // Color tokens
  const colors = {
    textMain: "#ffffff",
    textSecondary: "#a1a1aa", // zinc-400
    bluePrimary: "#0079da",
    success: "#10b981", // emerald-500
    inputBg: "#18181b", // zinc-900
    baseBg: "#000000", // Pure black as requested
    inputShadow: "rgba(255, 255, 255, 0.05)",
  }

  return (
    <div className="w-full min-h-screen bg-black flex items-center justify-center">
      {/* Animation Styles */}
      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
        @keyframes spin-slow-reverse {
          from { transform: rotate(0deg); }
          to { transform: rotate(-360deg); }
        }
        .animate-spin-slow-reverse {
          animation: spin-slow-reverse 60s linear infinite;
        }
        @keyframes bounce-in {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.05); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .animate-bounce-in {
          animation: bounce-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        @keyframes success-pulse {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.1); }
          70% { transform: scale(0.95); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes success-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 60px rgba(16, 185, 129, 0.8), 0 0 100px rgba(16, 185, 129, 0.4); }
        }
        @keyframes checkmark-draw {
          0% { stroke-dashoffset: 24; }
          100% { stroke-dashoffset: 0; }
        }
        @keyframes celebration-ring {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
        .animate-success-pulse {
          animation: success-pulse 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
        }
        .animate-success-glow {
          animation: success-glow 2s ease-in-out infinite;
        }
        .animate-checkmark {
          stroke-dasharray: 24;
          stroke-dashoffset: 24;
          animation: checkmark-draw 0.4s ease-out 0.3s forwards;
        }
        .animate-ring {
          animation: celebration-ring 0.8s ease-out forwards;
        }
      `}</style>

      {/* Main Container */}
      <div
        className="relative w-full h-screen overflow-hidden shadow-2xl"
        style={{
          backgroundColor: colors.baseBg,
          fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Background Decorative Layer */}
        <div
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{
            perspective: "1200px",
            transform: "perspective(1200px) rotateX(15deg)",
            transformOrigin: "center bottom",
            opacity: 1,
            zIndex: 1,
          }}
        >
          {/* Image 3 (Back) - spins clockwise */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2">
              {[0, 90, 180, 270].map((angle) => (
                <div
                  key={`back-${angle}`}
                  className="absolute"
                  style={{
                    top: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * 800}px)`,
                    left: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * 800}px)`,
                    width: "120px",
                    height: "120px",
                    transform: "translate(-50%, -50%)",
                    zIndex: 0,
                  }}
                >
                  {beverageImages[0] && (
                    <img
                      src={beverageImages[0]}
                      alt="Bebida 1"
                      className="w-full h-full object-contain opacity-40 blur-sm"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image 2 (Middle) - spins counter-clockwise */}
          <div className="absolute inset-0 animate-spin-slow-reverse">
            <div className="absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2">
              {[45, 135, 225, 315].map((angle) => (
                <div
                  key={`mid-${angle}`}
                  className="absolute"
                  style={{
                    top: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * 450}px)`,
                    left: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * 450}px)`,
                    width: "100px",
                    height: "100px",
                    transform: "translate(-50%, -50%)",
                    zIndex: 1,
                  }}
                >
                  {beverageImages[1] && (
                    <img
                      src={beverageImages[1]}
                      alt="Bebida 2"
                      className="w-full h-full object-contain opacity-50 blur-[2px]"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Image 1 (Front) - spins clockwise */}
          <div className="absolute inset-0 animate-spin-slow">
            <div className="absolute top-1/2 left-1/2 w-full h-full transform -translate-x-1/2 -translate-y-1/2">
              {[0, 120, 240].map((angle) => (
                <div
                  key={`front-${angle}`}
                  className="absolute"
                  style={{
                    top: `calc(50% + ${Math.cos((angle * Math.PI) / 180) * 250}px)`,
                    left: `calc(50% + ${Math.sin((angle * Math.PI) / 180) * 250}px)`,
                    width: "90px",
                    height: "90px",
                    transform: "translate(-50%, -50%)",
                    zIndex: 2,
                  }}
                >
                  {beverageImages[2] && (
                    <img
                      src={beverageImages[2]}
                      alt="Bebida 3"
                      className="w-full h-full object-contain opacity-70"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Gradient Overlay */}
        <div
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background: `linear-gradient(to top, ${colors.baseBg} 10%, rgba(9, 9, 11, 0.8) 40%, transparent 100%)`,
          }}
        />

        {/* Content Container */}
        <div className="relative z-20 w-full h-full flex flex-col items-center justify-end pb-24 gap-6">
          <div className="w-16 h-16 rounded-2xl shadow-lg overflow-hidden mb-2 ring-1 ring-white/10 flex items-center justify-center bg-black/50 backdrop-blur-md">
            <img src="./assets/logo.png" alt="App Icon" className="w-12 h-12 object-contain" />
          </div>

          <h1 className="text-4xl md:text-5xl font-outfit font-light uppercase tracking-[0.15em] text-center" style={{ color: colors.textMain }}>
            Acervo
          </h1>

          <p className="text-[13px] md:text-sm font-inter font-light text-center max-w-[340px] leading-relaxed opacity-80" style={{ color: colors.textSecondary }}>
            O Acervo une paixão pela coquetelaria e rigor de curadoria em bebidas premium com preços especiais, ajustados conforme o volume de líquido presente em cada garrafa.
          </p>

          {/* Form / Success Container */}
          <div className="w-full max-w-md px-4 mt-4 h-[60px] relative perspective-1000">
            {/* Confetti Canvas - overlays everything but ignores clicks */}
            <canvas
              ref={canvasRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] pointer-events-none z-50"
            />

            {/* SUCCESS STATE */}
            <div
              className={`absolute inset-0 flex items-center justify-center rounded-full transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                status === "success"
                  ? "opacity-100 scale-100 rotate-x-0 animate-success-pulse animate-success-glow"
                  : "opacity-0 scale-95 -rotate-x-90 pointer-events-none"
              }`}
              style={{ backgroundColor: colors.success }}
            >
              {/* Celebration rings */}
              {status === "success" && (
                <>
                  <div
                    className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-emerald-400 animate-ring"
                    style={{ animationDelay: "0s" }}
                  />
                  <div
                    className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-emerald-300 animate-ring"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <div
                    className="absolute top-1/2 left-1/2 w-full h-full rounded-full border-2 border-emerald-200 animate-ring"
                    style={{ animationDelay: "0.3s" }}
                  />
                </>
              )}
              <div
                className={`flex items-center gap-2 text-white font-semibold text-lg ${status === "success" ? "animate-bounce-in" : ""}`}
              >
                <div className="bg-white/20 p-1 rounded-full">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      className={status === "success" ? "animate-checkmark" : ""}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <span>Acesso Liberado!</span>
              </div>
            </div>

            {/* FORM STATE */}
            <form
              onSubmit={handleEnter}
              className={`relative w-full h-full group transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                status === "success"
                  ? "opacity-0 scale-95 rotate-x-90 pointer-events-none"
                  : "opacity-100 scale-100 rotate-x-0"
              }`}
            >
              <GlassButton
                type="submit"
                disabled={status === "loading"}
                className="w-full h-full rounded-full font-semibold text-white text-lg transition-all active:scale-95 hover:brightness-110 disabled:hover:brightness-100 disabled:active:scale-100 disabled:cursor-wait flex items-center justify-center border border-white/10 !p-0"
                style={{ backgroundColor: colors.inputBg, boxShadow: `0 4px 20px ${colors.inputShadow}` }}
                glassColor="rgba(255,255,255,0.05)"
              >
                {status === "loading" ? (
                  <svg
                    className="animate-spin h-6 w-6 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                ) : (
                  "Entrar no Acervo"
                )}
              </GlassButton>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}