import { Minus, Plus, Trash2 } from "lucide-react";
import { updateBagQuantity, removeFromBag } from "@/lib/bagStore";
import { motion } from "framer-motion";
import { getFinalPrice, getCurrentVolumeMl } from "@/lib/openedBottle";
import MiniBottleGauge from "./MiniBottleGauge";
import GlassSurface from "@/components/ui/GlassSurface";

export default function BagItem({ item, onUpdate }) {
  const handleQuantity = (delta) => {
    if (item.quantity + delta < 1) {
      removeFromBag(item.id);
    } else {
      updateBagQuantity(item.id, item.quantity + delta);
    }
    onUpdate();
  };

  const handleRemove = () => {
    removeFromBag(item.id);
    onUpdate();
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="flex items-center gap-4 py-4"
    >
      <div className="h-16 w-16 rounded-xl bg-secondary overflow-hidden flex-shrink-0">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-xl opacity-30">🍾</span>
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-medium">{item.name}</h4>
        <div className="flex items-center flex-wrap gap-x-2 gap-y-1 mt-0.5">
          <p className="text-xs text-muted-foreground">{item.category}</p>

        </div>
        <p className="text-sm font-light mt-1">
          R$ {((getFinalPrice(item) || 0) * (item.quantity || 1)).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <button
          onClick={() => handleQuantity(-1)}
          className="relative h-7 w-7 rounded-full flex items-center justify-center hover:bg-secondary/20 transition-all duration-300 active:scale-95"
        >
          <GlassSurface className="absolute inset-0 rounded-full" />
          <Minus className="h-3 w-3 relative z-10" strokeWidth={1.5} />
        </button>
        <span className="w-6 text-center text-sm font-light">{item.quantity || 1}</span>
        <button
          onClick={() => handleQuantity(1)}
          className="relative h-7 w-7 rounded-full flex items-center justify-center hover:bg-secondary/20 transition-all duration-300 active:scale-95"
        >
          <GlassSurface className="absolute inset-0 rounded-full" />
          <Plus className="h-3 w-3 relative z-10" strokeWidth={1.5} />
        </button>
        <button
          onClick={handleRemove}
          className="h-7 w-7 rounded-full flex items-center justify-center ml-1 text-muted-foreground hover:text-destructive transition-colors"
        >
          <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
        </button>
      </div>
    </motion.div>
  );
}