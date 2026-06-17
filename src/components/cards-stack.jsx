import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ContainerScroll({ children, className, ...props }) {
  return (
    <div
      className={cn("relative w-full", className)}
      style={{ perspective: "1000px", ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardSticky({ 
  index, 
  incrementY = 16, 
  incrementZ = 2, 
  children, 
  className = "", 
  style = {}, 
  ...props 
}) {
  const baseTop = 100; 
  const y = baseTop + (index * incrementY);
  const z = index * incrementZ;

  return (
    <motion.div
      layout="position"
      style={{ top: y, z, backfaceVisibility: "hidden", ...style }}
      className={cn("sticky", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}