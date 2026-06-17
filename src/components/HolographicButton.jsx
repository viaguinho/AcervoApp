import { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";

export function HolographicButton({ children, onClick, icon = null, hideArrow = false, className = "", style = {} }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    const styleId = "holographic-button-styles";
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement("style");
      styleEl.id = styleId;
      styleEl.textContent = `
        @keyframes flow-mercury {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes holographic-glow-pulse {
          0% { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 8px rgba(161, 161, 170, 0.1); }
          50% { box-shadow: 0 8px 24px rgba(0, 0, 0, 0.25), 0 0 0 1.5px rgba(255, 255, 255, 0.25), 0 0 16px rgba(161, 161, 170, 0.3); }
          100% { box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.1), 0 0 8px rgba(161, 161, 170, 0.1); }
        }
        @keyframes arrow-slide {
          0% { transform: translateX(0); }
          50% { transform: translateX(3px); }
          100% { transform: translateX(0); }
        }
        @keyframes shimmer-slide {
          0% { transform: translateX(-150%) skewX(-25deg); }
          100% { transform: translateX(150%) skewX(-25deg); }
        }
        .holographic-button {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(0, 0, 0, 0.15);
          background: linear-gradient(90deg, #18181b 0%, #3f3f46 25%, #71717a 50%, #3f3f46 75%, #18181b 100%);
          background-size: 200% auto;
          cursor: pointer;
          outline: none !important;
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          -webkit-tap-highlight-color: transparent;
          transition: transform 150ms cubic-bezier(0.23, 1, 0.32, 1), box-shadow 150ms cubic-bezier(0.23, 1, 0.32, 1), border-color 150ms ease;
          z-index: 1;
          border-radius: 100px;
          box-shadow: 0 4px 14px rgba(0, 0, 0, 0.12), inset 0 1px 1px rgba(255, 255, 255, 0.15);
          animation: flow-mercury 8s linear infinite;
        }
        .dark .holographic-button {
          border: 1px solid rgba(255, 255, 255, 0.35);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), inset 0 1px 1px rgba(255, 255, 255, 0.2);
        }
        .holographic-button:hover {
          border-color: rgba(0, 0, 0, 0.3);
        }
        .dark .holographic-button:hover {
          border-color: rgba(255, 255, 255, 0.7);
        }
        .holographic-button:focus { outline: none !important; }
        .holographic-button:focus-visible { outline: none !important; }
        .holographic-button.holo-active { 
          animation: flow-mercury 4s linear infinite, holographic-glow-pulse 2s cubic-bezier(0.23, 1, 0.32, 1) infinite;
        }
        .holographic-button:active { transform: scale(0.96) !important; }
        
        .holographic-shimmer-layer {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
          transform: translateX(-150%) skewX(-25deg);
          animation: shimmer-slide 3s ease-in-out infinite;
          z-index: 1;
          pointer-events: none;
        }
        
        .holographic-button-inner {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: var(--holographic-padding, 13px 36px);
          font-size: var(--holographic-font-size, 14px);
          width: 100%;
          font-weight: 500;
          letter-spacing: 0.5px;
          color: #ffffff;
          white-space: nowrap;
          background: transparent;
          border-radius: 100px;
          transition: letter-spacing 150ms ease;
          z-index: 2;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }
        .holographic-button.holo-active .holographic-button-inner {
          letter-spacing: 0.8px;
          font-weight: 600;
        }
        .holographic-button-arrow {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 150ms ease;
          width: 12px;
          height: 12px;
        }
        .holographic-button.holo-active .holographic-button-arrow {
          animation: arrow-slide 0.8s cubic-bezier(0.23, 1, 0.32, 1) infinite;
        }
        .holographic-button:active,
        .holographic-button:focus-visible { outline: none !important; }
      `;
      document.head.appendChild(styleEl);
    }
  }, []);

  return (
    <button
      className={`holographic-button ${isHovered || isPressed ? 'holo-active' : ''} ${className}`}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {onClick?.();}}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onBlur={() => setIsPressed(false)}
      type="button"
    >
      <div className="holographic-shimmer-layer" />
      <span className="holographic-button-inner">
        {icon && <span className="holographic-button-arrow">{icon}</span>}
        {children}
        {!icon && !hideArrow &&
          <span className="holographic-button-arrow">
            <ArrowRight size={14} />
          </span>
        }
      </span>
    </button>
  );
}

export default HolographicButton;