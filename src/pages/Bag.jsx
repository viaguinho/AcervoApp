import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShoppingBag, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getBagItems, clearBag } from "@/lib/bagStore";
import { getFinalPrice } from "@/lib/openedBottle";
import BagItem from "../components/BagItem";
import { HolographicButton } from "../components/HolographicButton";
import { GlassButton } from "@/components/ui/apple-tahoe-liquid-glass-button";
import { api } from "@/api/apiClient";

export default function Bag() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [savings, setSavings] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [whatsappNumber, setWhatsappNumber] = useState("");

  const refresh = () => {
    const bagItems = getBagItems();
    setItems(bagItems);
    
    let currentSubtotal = 0;
    let currentTotal = 0;
    
    bagItems.forEach(item => {
      const q = item.quantity || 1;
      currentSubtotal += (item.price || 0) * q;
      currentTotal += (getFinalPrice(item) || 0) * q;
    });
    
    setSubtotal(currentSubtotal);
    setTotal(currentTotal);
    setSavings(Math.max(0, currentSubtotal - currentTotal));
  };

  useEffect(() => {
    refresh();
    window.addEventListener("bag-updated", refresh);

    // Carrega o número do WhatsApp das configurações globais
    api.entities.Product.filter({ name: "_CATEGORY_CONFIG_" }).then(results => {
      if (results.length > 0 && results[0].description) {
        try {
          const cfg = JSON.parse(results[0].description);
          if (cfg._whatsapp) setWhatsappNumber(cfg._whatsapp);
        } catch (e) {}
      }
    });

    return () => window.removeEventListener("bag-updated", refresh);
  }, []);

  const handleWhatsApp = () => {
    const itemsList = items
      .map(
        (item, i) =>
          `${i + 1}. ${item.name} (${item.quantity}x) — R$ ${((getFinalPrice(item) || 0) * (item.quantity || 1)).toFixed(2)}`
      )
      .join("\n");

    const message = encodeURIComponent(
      `Olá! Tenho interesse nos seguintes itens do seu acervo:\n\n${itemsList}\n\n*Total estimado: R$ ${total.toFixed(2)}*\n\nPodemos finalizar por aqui?`
    );

    if (!whatsappNumber) {
      alert("Número do WhatsApp não configurado. Configure-o na página de administração.");
      return;
    }
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <div className="h-16 w-16 rounded-2xl glass flex items-center justify-center mx-auto mb-5">
            <ShoppingBag className="h-6 w-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <h2 className="text-lg font-light">Sacola vazia</h2>
          <p className="text-sm text-muted-foreground font-light mt-2 max-w-xs">
            Explore o acervo e adicione os itens que deseja à sua sacola de seleção.
          </p>
          <div className="mt-8">
            <HolographicButton onClick={() => navigate("/catalog")} hideArrow={true}>
              Explorar Acervo
            </HolographicButton>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 pt-14 pb-44">
      <div className="max-w-lg mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-extralight tracking-tight">Sacola de Seleção</h1>
          <p className="text-xs text-muted-foreground mt-1 font-light">
            {items.length} {items.length === 1 ? "item" : "itens"} selecionados
          </p>
        </motion.div>

        <div className="mt-8">
          <AnimatePresence>
            {items.map((item, i) => (
              <div key={item.id}>
                <BagItem item={item} onUpdate={refresh} />
                {i < items.length - 1 && <div className="line-separator" />}
              </div>
            ))}
          </AnimatePresence>
        </div>

        <div className="line-separator mt-4 mb-6" />

        {/* Resumo do Pedido */}
        <div className="space-y-6">
          <div className="space-y-3 px-1">
            <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.15em] text-muted-foreground/60 font-medium font-outfit">
              <span>Subtotal (Preço Integral)</span>
              <span>R$ {subtotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
            </div>
            
            {savings > 0 && (
              <div className="flex justify-between items-center text-[11px] uppercase tracking-[0.15em] text-green-600/80 font-bold font-outfit">
                <span>Descontos Aplicados</span>
                <span>- R$ {savings.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            
            <div className="h-[0.5px] w-full bg-black/5" />
            
            <div className="flex justify-between items-center py-1">
              <span className="text-xs tracking-[0.2em] uppercase text-foreground font-bold font-outfit">Total Estimado</span>
              <span className="text-2xl font-light text-foreground font-outfit">
                R$ {total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="fixed bottom-[108px] left-1/2 -translate-x-1/2 w-full max-w-[430px] z-40 px-6">
        <div className="space-y-3">
          <GlassButton
            onClick={handleWhatsApp}
            size="none"
            className="w-full flex items-center justify-center gap-3 rounded-2xl py-4 bg-foreground text-background text-sm font-light tracking-wide hover:opacity-90 transition-all active:scale-[0.98] !p-0 h-[56px]"
            glassColor="rgba(0,0,0,0.8)"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={2} />
            Solicitar Disponibilidade
          </GlassButton>
          <button
            onClick={() => { clearBag(); refresh(); }}
            className="w-full text-center text-xs text-muted-foreground font-light tracking-wide hover:text-foreground transition-colors py-2"
          >
            Limpar sacola
          </button>
        </div>
      </div>
    </div>
  );
}