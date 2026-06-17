import { memo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ProductCard from "./ProductCard";

const ANIMATION_CONFIG = {
  container: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.5, staggerChildren: 0.05 }
  },
  item: {
    initial: { opacity: 0, y: 20, scale: 0.95 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const GRADIENT_STYLE = {
  backgroundImage: "linear-gradient(to right, hsl(var(--foreground)) 0%, hsl(var(--primary)) 100%)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text"
};

function ProductGrid({ products, title }) {
  if (!products) return null;

  return (
    <section className="mt-6">
      {title && (
        <div className="px-6 mb-5">
          <h2 
            className="text-[10px] uppercase flex items-center gap-2 font-bold tracking-[0.2em] font-outfit"
            style={GRADIENT_STYLE}
            aria-label={title}
          >
            {title}
          </h2>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4 px-4 pb-12">
        <AnimatePresence mode="popLayout">
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              layout
              initial={ANIMATION_CONFIG.item.initial}
              animate={ANIMATION_CONFIG.item.animate}
              exit={ANIMATION_CONFIG.item.exit}
              transition={ANIMATION_CONFIG.item.transition}
              className="h-full"
            >
              <ProductCard 
                product={product} 
                index={index} 
                variant="glass"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </section>
  );
}

export default memo(ProductGrid);