
"use client";;
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { GlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * @typedef {Object} FloatingActionOption
 * @property {string} label - Rótulo da opção
 * @property {React.ReactNode} Icon - Ícone da opção
 * @property {function} onClick - Função chamada ao clicar na opção
 */

/**
 * @typedef {Object} FloatingActionMenuProps
 * @property {FloatingActionOption[]} options - Lista de opções do menu
 * @property {string} [className] - Classe CSS do container principal
 * @property {React.ReactNode} [TriggerIcon] - Ícone customizado para o botão gatilho
 * @property {string} [menuClassName] - Classe CSS customizada para o menu de opções
 * @property {string} [triggerClassName] - Classe CSS customizada para o botão gatilho
 * @property {string} [optionClassName] - Classe CSS customizada para cada item do menu
 * @property {"vertical" | "horizontal" | "vertical-left"} [direction] - Direção de expansão do menu
 */

/** @type {React.FC<FloatingActionMenuProps>} */
const FloatingActionMenu = ({
  options,
  className,
  TriggerIcon,
  menuClassName,
  triggerClassName,
  optionClassName,
  direction = "vertical"
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className={cn("z-[100]", className)}>
      <GlassButton
        onClick={toggleMenu}
        size="none"
        className={cn("w-10 h-10 rounded-full !p-0 flex items-center justify-center", triggerClassName)}
        contentClassName="w-full h-full flex items-center justify-center"
        glassColor="rgba(255, 255, 255, 0.8)"
      >
        <motion.div
          className="w-full h-full flex items-center justify-center"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
            type: "spring",
            stiffness: 300,
            damping: 20,
          }}>
          {TriggerIcon || <Plus className="w-5 h-5" />}
        </motion.div>
      </GlassButton>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Overlay invisível para fechar ao clicar fora */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[-1]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
              transition={{
                duration: 0.4,
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
              className={cn(
                "absolute z-50",
                (direction === "horizontal" || direction === "vertical-left") ? "right-12 top-0" : "right-0",
                menuClassName || (direction === "vertical" ? "bottom-12" : "")
              )}>
              <div className={cn(
                "flex gap-2 p-1",
                direction === "horizontal" ? "flex-row-reverse" : "flex-col items-end"
              )}>
                {options.map((option, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{
                      duration: 0.3,
                      delay: index * 0.05,
                    }}>
                    <GlassButton
                      onClick={() => {
                        option.onClick();
                        setIsOpen(false);
                      }}
                      size="none"
                      className={cn("flex items-center gap-2 rounded-xl px-4 py-3 h-auto !p-0 min-h-[44px]", optionClassName)}
                      glassColor="rgba(255, 255, 255, 0.9)"
                    >
                      <div className="flex items-center gap-2 px-4 py-2">
                        {option.Icon}
                        <span className="text-[11px] font-medium tracking-wide uppercase">{option.label}</span>
                      </div>
                    </GlassButton>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FloatingActionMenu;
