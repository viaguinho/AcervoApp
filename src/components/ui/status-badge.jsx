import React, { useEffect, useRef, useState } from "react";

const backgroundColor = "#ddd"; // Cinza claro conforme a imagem

export const StatusBadge = ({ text = "PRODUTO FECHADO" }) => {
  const ref = useRef(null);
  const [firstOverlayPosition, setFirstOverlayPosition] = useState(0);
  const [disableInOutOverlayAnimation, setDisableInOutOverlayAnimation] = useState(true);
  const [disableOverlayAnimation, setDisableOverlayAnimation] = useState(false);
  const leaveTimeout1 = useRef(null);
  const leaveTimeout2 = useRef(null);
  const leaveTimeout3 = useRef(null);

  const getDimensions = () => {
    const left = ref?.current?.getBoundingClientRect()?.left || 0;
    const right = ref?.current?.getBoundingClientRect()?.right || 0;
    const top = ref?.current?.getBoundingClientRect()?.top || 0;
    const bottom = ref?.current?.getBoundingClientRect()?.bottom || 0;

    return { left, right, top, bottom };
  };

  const onMouseEnter = (e) => {
    if (leaveTimeout1.current) clearTimeout(leaveTimeout1.current);
    if (leaveTimeout2.current) clearTimeout(leaveTimeout2.current);
    if (leaveTimeout3.current) clearTimeout(leaveTimeout3.current);
    setDisableOverlayAnimation(true);

    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;

    setDisableInOutOverlayAnimation(false);
    requestAnimationFrame(() => {
      setFirstOverlayPosition((Math.abs(xCenter - e.clientX) + Math.abs(yCenter - e.clientY)) / 1.5);
    });
  };

  const onMouseMove = (e) => {
    const { left, right, top, bottom } = getDimensions();
    const xCenter = (left + right) / 2;
    const yCenter = (top + bottom) / 2;

    // Movimentação suave dos reflexos internos
    setFirstOverlayPosition((Math.abs(xCenter - e.clientX) + Math.abs(yCenter - e.clientY)) / 1.2);
  };

  const onMouseLeave = (e) => {
    requestAnimationFrame(() => {
      setDisableInOutOverlayAnimation(false);
      leaveTimeout1.current = setTimeout(() => setFirstOverlayPosition(0), 300);
      leaveTimeout2.current = setTimeout(() => {
        setDisableOverlayAnimation(false);
        setDisableInOutOverlayAnimation(true);
      }, 500);
    });
  };

  // Giroscópio para dispositivos móveis
  useEffect(() => {
    let active = true;
    const handleOrientation = (event) => {
      if (!active) return;
      const { beta, gamma } = event;
      if (beta !== null && gamma !== null) {
        // Mapeia a inclinação direcional (eixos beta e gamma) para a rotação holográfica
        const angle = (gamma || 0) * 2.2 + (beta || 0) * 0.8;
        setFirstOverlayPosition(angle);
        setDisableOverlayAnimation(true);
        setDisableInOutOverlayAnimation(false);
      }
    };

    const initGyro = async () => {
      if (
        typeof DeviceOrientationEvent !== "undefined" &&
        typeof DeviceOrientationEvent.requestPermission === "function"
      ) {
        try {
          const response = await DeviceOrientationEvent.requestPermission();
          if (response === "granted") {
            window.addEventListener("deviceorientation", handleOrientation);
            window.removeEventListener("click", initGyro);
            window.removeEventListener("touchstart", initGyro);
          }
        } catch (e) {
          console.error("Erro ao solicitar permissão de giroscópio:", e);
        }
      } else {
        window.addEventListener("deviceorientation", handleOrientation);
      }
    };

    // Tenta registrar diretamente (para navegadores sem restrição de clique prévio)
    window.addEventListener("deviceorientation", handleOrientation);

    // Registra listeners de ativação por toque na página (necessário no iOS)
    window.addEventListener("click", initGyro);
    window.addEventListener("touchstart", initGyro);

    return () => {
      active = false;
      window.removeEventListener("deviceorientation", handleOrientation);
      window.removeEventListener("click", initGyro);
      window.removeEventListener("touchstart", initGyro);
    };
  }, []);

  const overlayAnimations = [...Array(10).keys()].map((e) => (
    `
    @keyframes overlayAnimation${e + 1} {
      0% { transform: rotate(${e * 10}deg); }
      50% { transform: rotate(${(e + 1) * 10}deg); }
      100% { transform: rotate(${e * 10}deg); }
    }
    `
  )).join(" ");

  return (
    <div
      ref={ref}
      className="block w-[160px] sm:w-[210px] h-auto cursor-default"
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      onMouseEnter={onMouseEnter}
    >
      <style>{overlayAnimations}</style>
      <div
        style={{
          transformOrigin: "center center",
          // Removida a rotação 3D do container (matrix3d)
          transition: "transform 200ms ease-out"
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 260 54" className="w-full h-auto">
          <defs>
            <filter id="blur1">
              <feGaussianBlur in="SourceGraphic" stdDeviation="3" />
            </filter>
            <mask id="badgeMask">
              <rect width="260" height="54" fill="white" rx="10" />
            </mask>
          </defs>
          <rect width="260" height="54" rx="10" fill={backgroundColor} />
          <rect x="4" y="4" width="252" height="46" rx="8" fill="transparent" stroke="#bbb" strokeWidth="1" />
          
          <text fontFamily="Helvetica-Bold, Helvetica" fontSize="15" fontWeight="bold" fill="#666" x="52" y="27" dominantBaseline="central">
            {text}
          </text>

          {/* Laurel Icon Path */}
          <g transform="translate(8, 9)">
            <path fill="#666" d="M14.963 9.075c.787-3-.188-5.887-.188-5.887S12.488 5.175 11.7 8.175c-.787 3 .188 5.887.188 5.887s2.25-1.987 3.075-4.987m-4.5 1.987c.787 3-.188 5.888-.188 5.888S7.988 14.962 7.2 11.962c-.787-3 .188-5.887.188-5.887s2.287 1.987 3.075 4.987m.862 10.388s-.6-2.962-2.775-5.175C6.337 14.1 3.375 13.5 3.375 13.5s.6 2.962 2.775 5.175c2.213 2.175 5.175 2.775 5.175 2.775m3.3 3.413s-1.988-2.288-4.988-3.075-5.887.187-5.887.187 1.987 2.287 4.988 3.075c3 .787 5.887-.188 5.887-.188Zm6.75 0s1.988-2.288 4.988-3.075c3-.826 5.887.187 5.887.187s-1.988 2.287-4.988 3.075c-3 .787-5.887-.188-5.887-.188ZM32.625 13.5s-2.963.6-5.175 2.775c-2.213 2.213-2.775 5.175-2.775 5.175s2.962-.6 5.175-2.775c2.175-2.213 2.775-5.175 2.775-5.175M28.65 6.075s.975 2.887.188 5.887c-.826 3-3.076 4.988-3.076 4.988s-.974-2.888-.187-5.888c.788-3 3.075-4.987 3.075-4.987m-4.5 7.987s.975-2.887.188-5.887c-.788-3-3.076-4.988-3.076-4.988s-.974 2.888-.187 5.888c.788 3 3.075 4.988 3.075 4.988ZM18 26.1c.975-.225 3.113-.6 5.325 0 3 .788 5.063 3.038 5.063 3.038s-2.888.975-5.888.187a13 13 0 0 1-1.425-.525c.563.788 1.125 1.425 2.288 1.913l-.863 2.062c-2.063-.862-2.925-2.137-3.675-3.262-.262-.375-.525-.713-.787-1.05-.26.293-.465.586-.686.903l-.102.147-.048.068c-.775 1.108-1.643 2.35-3.627 3.194l-.862-2.062c1.162-.488 1.725-1.125 2.287-1.913-.45.225-.938.375-1.425.525-3 .788-5.887-.187-5.887-.187s1.987-2.288 4.987-3.075c2.212-.563 4.35-.188 5.325.037" />
          </g>

          {/* Rainbow Overlay */}
          <g style={{ mixBlendMode: "overlay" }} mask="url(#badgeMask)">
            <g style={{
              transform: `rotate(${firstOverlayPosition}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation1 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 260,54 260,0 0,54" fill="hsl(358, 100%, 62%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 10}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation2 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 260,54 260,0 0,54" fill="hsl(30, 100%, 50%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 20}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation3 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 260,54 260,0 0,54" fill="hsl(60, 100%, 50%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 30}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation4 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 260,54 260,0 0,54" fill="hsl(96, 100%, 50%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 40}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation5 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 260,54 260,0 0,54" fill="hsl(233, 85%, 47%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 50}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation6 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 260,54 260,0 0,54" fill="hsl(271, 85%, 47%)" filter="url(#blur1)" opacity="0.5" />
            </g>
            <g style={{
              transform: `rotate(${firstOverlayPosition + 60}deg)`,
              transformOrigin: "center center",
              transition: !disableInOutOverlayAnimation ? "transform 200ms ease-out" : "none",
              animation: disableOverlayAnimation ? "none" : "overlayAnimation7 5s infinite",
              willChange: "transform"
            }}>
              <polygon points="0,0 260,54 260,0 0,54" fill="hsl(300, 20%, 35%)" filter="url(#blur1)" opacity="0.5" />
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
