"use client";
import { motion } from "framer-motion";

export function TrackingIn({
  text,
  startTracking = 0.8,
  endTracking = 0.35,
  startBlur = 14,
  duration = 1.5,
  className
}) {
  return (
    <div className="flex items-center justify-center bg-transparent">
      <motion.span
        className={className}
        initial={{ 
          letterSpacing: `${startTracking}em`,
          filter: `blur(${startBlur}px)`,
          opacity: 0 
        }}
        animate={{ 
          letterSpacing: `${endTracking}em`,
          filter: `blur(0px)`,
          opacity: 1 
        }}
        transition={{ 
          duration: duration,
          ease: [0.16, 1, 0.3, 1], // Custom spring-like cubic bezier
          opacity: { duration: 0.8 }
        }}
        style={{ whiteSpace: "nowrap" }}
      >
        {text}
      </motion.span>
    </div>
  );
}
