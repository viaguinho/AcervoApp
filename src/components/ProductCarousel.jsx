import { useRef, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import ProductCard from "./ProductCard";

export default function ProductCarousel({ products, title, showControls = true, cardWidth = "220px" }) {
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const container = scrollContainerRef.current;
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0);
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
      return () => {
        container.removeEventListener("scroll", checkScroll);
        window.removeEventListener("resize", checkScroll);
      };
    }
  }, [products]);

  const scroll = (direction) => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollBy({ left: direction === "left" ? -320 : 320, behavior: "smooth" });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="pb-10"
    >
      {title && (
        <div className="px-6 mb-5">
          <h2 className="text-[10px] uppercase flex items-center gap-2 font-bold tracking-[0.2em] font-outfit"
            style={{
              backgroundImage: "linear-gradient(to right, hsl(var(--foreground)) 0%, hsl(var(--primary)) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text"
            }}>
            {title}
          </h2>
        </div>
      )}
      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-2 px-6"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none", WebkitOverflowScrolling: "touch" }}
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
              className="flex-shrink-0 snap-start"
              style={{ width: cardWidth }}
            >
              <ProductCard product={product} index={index} />
            </motion.div>
          ))}
        </div>
        {showControls && canScrollLeft && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => scroll("left")}
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background border border-foreground/10 hover:bg-secondary transition-all hover:scale-110">
            <ChevronLeft size={20} strokeWidth={1.5} />
          </motion.button>
        )}
        {showControls && canScrollRight && (
          <motion.button initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => scroll("right")}
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-background border border-foreground/10 hover:bg-secondary transition-all hover:scale-110">
            <ChevronRight size={20} strokeWidth={1.5} />
          </motion.button>
        )}
      </div>
    </motion.section>
  );
}