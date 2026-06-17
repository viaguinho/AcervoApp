"use client";
import { cn } from "@/lib/utils";
import React from "react";

/**
 * @typedef {Object} AuroraColors
 * @property {string} [color1]
 * @property {string} [color2]
 * @property {string} [color3]
 * @property {string} [color4]
 * @property {string} [color5]
 */

/**
 * @param {Object} props
 * @param {string} [props.className]
 * @param {React.ReactNode} props.children
 * @param {boolean} [props.showRadialGradient]
 * @param {AuroraColors} [props.colors]
 */
export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  colors = {},
  ...props
}) => {
  return (
    <main>
      <div
        className={cn(
          "transition-bg relative flex flex-col items-center justify-center bg-[#F8F9FA] text-slate-950 dark:bg-zinc-950",
          className
        )}
        {...props}
      >
        <div
          className="absolute inset-0 overflow-hidden"
          style={
            /** @type {any} */
            ({
              "--aurora":
                `repeating-linear-gradient(100deg,${colors?.color3 || '#94a3b8'}_10%,${colors?.color4 || '#f1f5f9'}_15%,${colors?.color1 || '#e2e8f0'}_20%,${colors?.color5 || '#ffffff'}_25%,${colors?.color2 || '#cbd5e1'}_30%)`,
              "--dark-gradient":
                "repeating-linear-gradient(100deg,#000_0%,#000_7%,transparent_10%,transparent_12%,#000_16%)",
              "--white-gradient":
                "repeating-linear-gradient(100deg,#fff_0%,#fff_7%,transparent_10%,transparent_12%,#fff_16%)",

              "--blue-300": colors?.color1 || "#e2e8f0",
              "--blue-400": colors?.color2 || "#cbd5e1",
              "--blue-500": colors?.color3 || "#94a3b8",
              "--indigo-300": colors?.color4 || "#f1f5f9",
              "--violet-200": colors?.color5 || "#ffffff",
              "--black": "#000",
              "--white": "#fff",
              "--transparent": "transparent",
            })
          }
        >
          <div
            className={cn(
              `after:animate-aurora pointer-events-none absolute -inset-[10px] opacity-50 blur-[10px] invert filter will-change-transform`,
              `[background-image:var(--white-gradient),var(--aurora)] [background-size:300%_200%] [background-position:50%_50%]`,
              `[--aurora:repeating-linear-gradient(100deg,var(--blue-500)_10%,var(--indigo-300)_15%,var(--blue-300)_20%,var(--violet-200)_25%,var(--blue-400)_30%)]`,
              `[--dark-gradient:repeating-linear-gradient(100deg,var(--black)_0%,var(--black)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--black)_16%)]`,
              `[--white-gradient:repeating-linear-gradient(100deg,var(--white)_0%,var(--white)_7%,var(--transparent)_10%,var(--transparent)_12%,var(--white)_16%)]`,
              `after:absolute after:inset-0 after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%_100%] after:[background-attachment:fixed] after:mix-blend-difference after:content-[""]`,
              `dark:[background-image:var(--dark-gradient),var(--aurora)] dark:invert-0 after:dark:[background-image:var(--dark-gradient),var(--aurora)]`,
              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,var(--transparent)_70%)]`
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  );
};
