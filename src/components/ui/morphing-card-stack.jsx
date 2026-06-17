import { useState, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { cn } from "@/lib/utils";
import { Upload, Trash2 } from "lucide-react";

const SWIPE_THRESHOLD = 50;

export function MorphingCardStack({
  cards = [],
  className = "",
  onCardClick,
  onImageUpload,
  onImageDelete,
  isAdmin = false
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const fileInputRef = useRef(null);

  if (!cards || cards.length === 0) {
    return null;
  }

  const handleDragEnd = (event, info) => {
    const { offset, velocity } = info;
    const swipe = Math.abs(offset.x) * velocity.x;

    if (offset.x < -SWIPE_THRESHOLD || swipe < -1000) {
      // Swiped left - go to next card
      setActiveIndex((prev) => (prev + 1) % cards.length);
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 1000) {
      // Swiped right - go to previous card
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length);
    }
    setIsDragging(false);
  };

  const getStackOrder = () => {
    const reordered = [];
    for (let i = 0; i < cards.length; i++) {
      const index = (activeIndex + i) % cards.length;
      reordered.push({ ...cards[index], stackPosition: i, originalIndex: index });
    }
    return reordered.reverse(); // Reverse so top card renders last (on top)
  };

  const handleImageClick = (e, cardId) => {
    e.stopPropagation();
    setEditingCardId(cardId);
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageDeleteClick = (e, cardId) => {
    e.stopPropagation();
    if (onImageDelete) {
      onImageDelete(cardId);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file && onImageUpload && editingCardId) {
      onImageUpload(editingCardId, file);
    }
    // Reset file input so same file can be uploaded again if needed
    if (fileInputRef.current) fileInputRef.current.value = "";
    setEditingCardId(null);
  };

  const displayCards = getStackOrder();

  return (
    <div className={cn("space-y-6 flex flex-col items-start w-full", className)}>
      {/* Single hidden file input for all cards */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*"
      />

      <LayoutGroup>
        <motion.div layout className="relative h-[360px] w-[260px] -mt-6">
          <AnimatePresence mode="popLayout">
            {displayCards.map((card) => {
              const styles = {
                top: 0,
                left: card.stackPosition * 20,
                zIndex: cards.length - card.stackPosition,
                rotate: 0,
                transformOrigin: "bottom center",
              };
              const isTopCard = card.stackPosition === 0;

              return (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: 0,
                    ...styles,
                  }}
                  exit={{ opacity: 0, scale: 0.8, x: -200 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 25,
                  }}
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.7}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.05, cursor: "grabbing" }}
                  onClick={() => {
                    if (isDragging) return;
                    onCardClick?.(card);
                  }}
                  className={cn(
                    "cursor-pointer rounded-2xl border border-white/20 absolute w-full h-full backdrop-blur-sm overflow-hidden flex flex-col justify-end group",
                    isTopCard ? "cursor-grab active:cursor-grabbing" : ""
                  )}
                  style={{
                    backgroundColor: card.color || "rgba(255,255,255,0.8)",
                    boxShadow: "none",
                  }}
                >
                  {/* Background Image - Tag <img> para compatibilidade mobile */}
                  {card.imageUrl && (
                    <img 
                      src={card.imageUrl} 
                      className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" 
                      alt="" 
                    />
                  )}

                  {/* Action buttons - Only visible on top card for ADMIN */}
                  {isTopCard && isAdmin && (
                    <div className="absolute top-4 right-4 flex gap-2 z-30">
                      {card.imageUrl && (
                        <button
                          onClick={(e) => handleImageDeleteClick(e, card.id)}
                          className="p-2.5 rounded-full bg-red-500/20 text-white backdrop-blur-md border border-red-500/30 transition-all hover:bg-red-500/40 active:scale-95 shadow-lg"
                          title="Excluir imagem"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleImageClick(e, card.id)}
                        className="p-2.5 rounded-full bg-white/20 text-white backdrop-blur-md border border-white/30 transition-all hover:bg-white/40 active:scale-95 shadow-lg"
                        title="Alterar imagem de fundo"
                      >
                        <Upload className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  <div 
                    className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/90 via-black/60 to-transparent backdrop-blur-[4px] px-3.5 pb-2.5 pt-2.5 rounded-b-2xl h-auto flex flex-col justify-end"
                    style={{
                      maskImage: 'linear-gradient(to top, black 95%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to top, black 95%, transparent 100%)'
                    }}
                  >
                    <div className="relative flex flex-col h-full mt-0.5">
                      <h3 className="font-serif text-xl sm:text-2xl font-bold text-white drop-shadow-md mb-0 tracking-tight w-full leading-tight">{card.title}</h3>
                      <p 
                        className="text-xs sm:text-[13px] text-white/95 font-inter font-medium drop-shadow-sm leading-relaxed flex-grow mt-0.5"
                        style={{ textWrap: 'pretty' }}
                      >
                        {(() => {
                          const desc = card.description || "Explore esta categoria especial.";
                          const trimmed = desc.trim();
                          const lastSpaceIndex = trimmed.lastIndexOf(" ");
                          if (lastSpaceIndex === -1) return trimmed;
                          return trimmed.substring(0, lastSpaceIndex) + "\u00A0" + trimmed.substring(lastSpaceIndex + 1);
                        })()}
                      </p>

                      {isTopCard && (
                        <div className="mt-1 text-left pointer-events-none">
                          <span className="text-[7.5px] uppercase tracking-widest text-white/90 bg-white/10 px-2 py-0.5 rounded-full backdrop-blur-sm border border-white/10">
                            Deslize para ver mais
                          </span>
                        </div>
                      )}
                      {!isTopCard && (
                        <div className="mt-1 text-left pointer-events-none invisible">
                          <span className="text-[7.5px] px-2 py-0.5">
                            &nbsp;
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

    </div>
  );
}
