import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import GlassSurface from "./GlassSurface";

const glassButtonVariants = cva(
  "relative isolate inline-flex items-center justify-center gap-2 rounded-full cursor-pointer transition-transform duration-300 ease-out tracking-tight disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/50",
  {
    variants: {
      size: {
        default: "px-6 py-3.5 text-base font-medium",
        sm: "px-4 py-2 text-sm font-medium",
        lg: "px-8 py-4 text-lg font-medium",
        icon: "h-10 w-10 p-0 gap-0",
        none: "",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
);

/**
 * @type {React.ForwardRefExoticComponent<{
 *   className?: string;
 *   children?: React.ReactNode;
 *   size?: "default" | "sm" | "lg" | "icon" | "none";
 *   contentClassName?: string;
 *   glassColor?: string;
 *   as?: React.ElementType | string;
 *   [key: string]: any;
 * } & React.RefAttributes<HTMLButtonElement>>}
 */
const GlassButton = React.forwardRef(
  /**
   * @param {{ className?: string; children?: React.ReactNode; size?: "default" | "sm" | "lg" | "icon" | "none"; contentClassName?: string; glassColor?: string; as?: any; [key: string]: any }} props
   * @param {React.Ref<HTMLButtonElement>} ref
   */
  ({ className, children, size, contentClassName, glassColor, as: Comp = "button", ...props }, ref) => {
    return (
      <Comp
        className={cn(glassButtonVariants({ size }), "overflow-hidden active:scale-[0.98] transition-all duration-300", className)}
        ref={ref}
        {...props}
      >
        {/* Fundo premium limpo sem distorção em SVG para evitar artefatos brancos */}
        <div
          className="absolute inset-0 -z-10 rounded-[inherit] transition-all duration-300"
          style={{
            backgroundColor: glassColor ? glassColor.replace(/[\d.]+\)$/g, '0.15)') : "rgba(255, 255, 255, 0.15)",
            backdropFilter: "blur(20px) saturate(1.5)",
            WebkitBackdropFilter: "blur(20px) saturate(1.5)",
            border: "0.5px solid rgba(255, 255, 255, 0.3)",
            boxShadow: "inset 0 1px 1px rgba(255, 255, 255, 0.4)",
          }}
        />

        {/* Conteúdo do Botão posicionado acima */}
        <span className={cn("relative z-10 w-full flex items-center justify-center gap-[inherit] select-none font-light tracking-wide", contentClassName)}>
          {children}
        </span>
      </Comp>
    );
  }
);

GlassButton.displayName = "GlassButton";

export { GlassButton, glassButtonVariants };