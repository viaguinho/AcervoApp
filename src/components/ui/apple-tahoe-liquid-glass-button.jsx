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
 * Extrai a luminância de uma cor rgba()/rgb() para decidir entre vidro claro e escuro.
 * @param {string | undefined} color
 */
function isDarkGlass(color) {
  const m = color && color.match(/rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)/);
  if (!m) return false;
  const [r, g, b] = [Number(m[1]), Number(m[2]), Number(m[3])];
  return (0.299 * r + 0.587 * g + 0.114 * b) < 110;
}

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
        className={cn(glassButtonVariants({ size }), "overflow-hidden active:scale-[0.98] transition-all duration-300", isDarkGlass(glassColor) && "text-white", className)}
        ref={ref}
        {...props}
      >
        {/* Camada Liquid Glass (ver .liquid-glass em index.css) */}
        <div
          aria-hidden="true"
          className={cn(
            "liquid-glass absolute inset-0 -z-10 rounded-[inherit] pointer-events-none",
            isDarkGlass(glassColor) && "liquid-glass--dark"
          )}
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