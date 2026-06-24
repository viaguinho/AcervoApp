import { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";
import { useAuth } from "@/lib/AuthContext";
import { Plus, X, Upload, Save, Trash2, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { calcularPrecoFromProduct, DEFAULT_COST_OPERATING, DEFAULT_MARGIN_MIN, isPriceViable, parseVolumeMl } from "@/lib/openedBottle";
import catalogoLocal from "@/data/catalogo-acervo.json";

const CATEGORIES = [
  "Amaro","Bitter/Aperitivo","Cachaça","Cognac/Brandy","Gin","Licor",
  "Mezcal","Pisco","Rum","Tequila","Vermouth","Vodka","Whisky"
];

function ImageUploader({ imageUrl, onUpload, loading }) {
  const fileRef = useRef(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Selecione uma imagem válida"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Imagem muito grande (máx 5MB)"); return; }
    await onUpload(file);
    e.target.value = "";
  };

  return (
    <div>
      <div
        onClick={() => fileRef.current?.click()}
        className="relative w-full h-40 rounded-xl overflow-hidden bg-secondary flex items-center justify-center cursor-pointer hover:opacity-90 transition-opacity group border border-border"
      >
        {imageUrl ? (
          <>
            <img src={imageUrl} alt="Produto" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Upload className="h-6 w-6 text-white" />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            {loading ? (
              <div className="w-5 h-5 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
            ) : (
              <>
                <Upload className="h-6 w-6" strokeWidth={1.5} />
                <span className="text-xs">Clique para importar imagem</span>
              </>
            )}
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

function ProductRow({ product, onEdit }) {
  const pricing = calcularPrecoFromProduct(product);
  const finalPrice = pricing.finalPrice;
  const discount = pricing.discountPercent;

  return (
    <motion.div
      layout
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0"
    >
      <div className="h-12 w-12 rounded-lg bg-secondary overflow-hidden flex-shrink-0">
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" className="w-6 h-6 text-muted-foreground/20">
              <path d="M8 3h8l1 5H7L8 3z" /><path d="M7 8h10v10a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2V8z" />
            </svg>
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{product.name}</p>
        <p className="text-xs text-muted-foreground">{product.category} · {product.country}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs font-medium">R$ {finalPrice?.toFixed(2)}</span>
          {product.is_opened && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full text-white" style={{ background: pricing.isCritical ? "#E63946" : pricing.isFloorActive ? "hsl(var(--primary))" : "#34C759" }}>
              {pricing.isCritical ? "⚠ Dose Final" : `Aberta ${product.opening_level}%`} {discount > 0 ? `-${discount}%` : ""}
            </span>
          )}
          {product.is_closed && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-muted text-foreground border border-border">
              Fechada
            </span>
          )}
          {product.is_special && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-foreground text-background">
              Especial
            </span>
          )}
        </div>
      </div>
      <button
        onClick={() => onEdit(product)}
        className="text-xs text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-lg glass"
      >
        Editar
      </button>
    </motion.div>
  );
}

function EditModal({ product, onSave, onClose, onDelete }) {
  const [form, setForm] = useState({ ...product });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [saving, setSaving] = useState(false);
  const isNew = !product.id;

  const handleImageUpload = async (file) => {
    setUploadingImage(true);
    // @ts-ignore — api.integrations é tipado como {} mas Core existe em runtime
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    setForm(f => ({ ...f, image_url: file_url }));
    setUploadingImage(false);
  };

  const handleSave = async () => {
    if (!form.name || !form.category || !form.price) {
      toast.error("Nome, categoria e preço são obrigatórios");
      return;
    }
    setSaving(true);

    const processedForm = { ...form };
    if (processedForm.description) {
      const desc = processedForm.description.trim().replace(/\s+/g, " ");
      const words = desc.split(" ");
      if (words.length > 1) {
        const last = words.pop();
        const secondLast = words.pop();
        processedForm.description = [...words, secondLast + "\u00a0" + last].join(" ");
      }
    }

    if (isNew) {
      // @ts-ignore — api.entities é tipado como {} mas Product existe em runtime
      await api.entities.Product.create(processedForm);
      toast.success("Produto criado!");
    } else {
      // @ts-ignore
      await api.entities.Product.update(product.id, processedForm);
      toast.success("Produto atualizado!");
    }
    setSaving(false);
    onSave();
  };

  const handleDelete = async () => {
    if (!confirm(`Excluir "${product.name}"?`)) return;
    // @ts-ignore
    await api.entities.Product.delete(product.id);
    toast.success("Produto excluído");
    onDelete();
  };

  const pricing = calcularPrecoFromProduct(form);
  const discount = pricing.discountPercent;
  const finalPrice = pricing.finalPrice;
  const volumeTotalMl = parseVolumeMl(form.volume);
  const currentMl = volumeTotalMl ? Math.round(volumeTotalMl * (form.opening_level ?? 80) / 100) : 0;
  const priceViable = form.price ? isPriceViable(form) : true;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 pb-[80px] sm:pb-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 40 }}
        className="relative bg-background rounded-t-2xl sm:rounded-2xl w-full max-w-lg shadow-2xl flex flex-col"
        style={{ maxHeight: "calc(100dvh - 80px)", height: "calc(100dvh - 80px)" }}
      >
        <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 px-5 pt-5 pb-3 flex items-center justify-between border-b border-border flex-shrink-0">
          <h2 className="text-base font-medium">{isNew ? "Novo Produto" : "Editar Produto"}</h2>
          <button onClick={onClose} className="h-8 w-8 rounded-full glass flex items-center justify-center">
            <X className="h-4 w-4" strokeWidth={1.5} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-4 overflow-y-auto flex-1">
          {/* Image */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Imagem</label>
            <ImageUploader imageUrl={form.image_url} onUpload={handleImageUpload} loading={uploadingImage} />
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Nome *</label>
            <input
              className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
              value={form.name || ""}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Nome do produto"
            />
          </div>

          {/* Category + Country */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Categoria *</label>
              <select
                className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none"
                value={form.category || ""}
                onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
              >
                <option value="">Selecionar</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">País</label>
              <input
                className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
                value={form.country || ""}
                onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                placeholder="País de origem"
              />
            </div>
          </div>

          {/* Price + ABV */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Preço (R$) *</label>
              <input
                type="number"
                className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
                value={form.price || ""}
                onChange={e => setForm(f => ({ ...f, price: parseFloat(e.target.value) }))}
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">ABV</label>
              <input
                className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
                value={form.abv || ""}
                onChange={e => setForm(f => ({ ...f, abv: e.target.value }))}
                placeholder="ex: 40%"
              />
            </div>
          </div>

          {/* Volume */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Volume</label>
            <input
              className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
              value={form.volume || ""}
              onChange={e => setForm(f => ({ ...f, volume: e.target.value }))}
              placeholder="ex: 750ml"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Cor do Líquido (Hex)</label>
            <div className="flex gap-2">
              <input
                type="color"
                className="w-12 h-10 rounded-xl border-none p-1 bg-transparent glass cursor-pointer"
                value={form.color || "#FBBF24"}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
              />
              <input
                className="flex-1 glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
                value={form.color || ""}
                onChange={e => setForm(f => ({ ...f, color: e.target.value }))}
                placeholder="#FBBF24"
              />
            </div>
          </div>

          {/* Flags */}
          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={form.is_special || false}
                onChange={e => setForm(f => ({ ...f, is_special: e.target.checked }))}
              />
              <span className="text-sm">Especial</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={form.is_opened || false}
                onChange={e => {
                  const checked = e.target.checked;
                  setForm(f => ({ ...f, is_opened: checked, is_closed: checked ? false : f.is_closed, opening_level: checked ? (f.opening_level ?? 80) : undefined }))
                }}
              />
              <span className="text-sm">Garrafa Aberta</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                className="rounded"
                checked={form.is_closed || false}
                onChange={e => {
                  const checked = e.target.checked;
                  setForm(f => ({ ...f, is_closed: checked, is_opened: checked ? false : f.is_opened, opening_level: checked ? undefined : f.opening_level }))
                }}
              />
              <span className="text-sm">Garrafa Fechada</span>
            </label>
          </div>

          {/* Opening Level + Precificação Dinâmica */}
          <AnimatePresence>
            {form.is_opened && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-4"
              >
                {/* Volume Slider */}
                <div
                  className="rounded-xl p-4"
                  style={{ background: "hsla(220, 70%, 45%, 0.06)", border: "0.5px solid hsla(220, 70%, 45%, 0.2)" }}
                >
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs uppercase tracking-widest text-muted-foreground">
                      Volume na Garrafa
                    </label>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold" style={{ color: "hsl(var(--primary))" }}>
                        {form.opening_level ?? 80}%
                      </span>
                      {currentMl > 0 && (
                        <span className="text-[10px] text-muted-foreground">({currentMl}ml)</span>
                      )}
                    </div>
                  </div>
                  <input
                    type="range"
                    min="0" max="100" step="5"
                    value={form.opening_level ?? 80}
                    onChange={e => setForm(f => ({ ...f, opening_level: parseInt(e.target.value) }))}
                    className="w-full mb-3"
                  />
                  <div className="h-1.5 rounded-full overflow-hidden mb-3" style={{ background: "hsla(220, 70%, 45%, 0.15)" }}>
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${form.opening_level ?? 80}%`,
                        background: pricing.isCritical
                          ? "linear-gradient(90deg, #E63946, #C0392B)"
                          : "linear-gradient(90deg, hsl(220, 70%, 45%), hsl(215, 20%, 65%))",
                      }}
                    />
                  </div>

                  {form.price && (
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Preço proporcional: <strong className="text-foreground">R$ {pricing.proportionalPrice?.toFixed(2)}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>Piso de segurança: <strong className="text-foreground">R$ {pricing.safetyFloor?.toFixed(2)}</strong></span>
                      </div>
                      <div className="flex items-center gap-2 text-xs font-medium">
                        <span style={{ color: pricing.isFloorActive ? "hsl(var(--primary))" : "#34C759" }}>
                          {pricing.isFloorActive ? "⚠ Piso ativo →" : "Preço final:"} R$ {finalPrice?.toFixed(2)}
                          {discount > 0 && ` (-${discount}%)`}
                        </span>
                      </div>

                      {pricing.isCritical && (
                        <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider mt-2" style={{ color: "#E63946" }}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></svg>
                          Estoque Crítico · Dose Final
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Custo Operacional + Margem */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Custo Op. (R$)</label>
                    <input
                      type="number"
                      step="0.50"
                      className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
                      value={form.cost_operating ?? DEFAULT_COST_OPERATING}
                      onChange={e => setForm(f => ({ ...f, cost_operating: parseFloat(e.target.value) || DEFAULT_COST_OPERATING }))}
                      placeholder="15.00"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Margem Mín. (%)</label>
                    <input
                      type="number"
                      step="1"
                      min="0"
                      max="99"
                      className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
                      value={Math.round((form.margin_min ?? DEFAULT_MARGIN_MIN) * 100)}
                      onChange={e => setForm(f => ({ ...f, margin_min: Math.min(0.99, Math.max(0, parseFloat(e.target.value) / 100)) || DEFAULT_MARGIN_MIN }))}
                      placeholder="20"
                    />
                  </div>
                </div>

                {/* Alerta de preço inviável */}
                {!priceViable && (
                  <div
                    className="rounded-xl p-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ background: "rgba(230,57,70,0.08)", border: "0.5px solid rgba(230,57,70,0.3)", color: "#E63946" }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 flex-shrink-0"><circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" /></svg>
                    Preço cheio abaixo do piso de segurança
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Descrição</label>
            <textarea
              rows={3}
              className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20 resize-none"
              value={form.description || ""}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="História e curiosidades do produto..."
            />
          </div>

          {/* Sensory Profile */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Perfil Sensorial</label>
            <input
              className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
              value={(form.sensory_profile || []).join(", ")}
              onChange={e => setForm(f => ({ ...f, sensory_profile: e.target.value.split(",").map(s => s.trim()).filter(Boolean) }))}
              placeholder="ex: Amadeirado, Mel, Baunilha"
            />
          </div>

          {/* Suggested Use + Pairing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-widests text-muted-foreground mb-1.5">Uso Sugerido</label>
              <input
                className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
                value={form.suggested_use || ""}
                onChange={e => setForm(f => ({ ...f, suggested_use: e.target.value }))}
                placeholder="ex: Neat, On the rocks"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-widests text-muted-foreground mb-1.5">Harmonização</label>
              <input
                className="w-full glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
                value={form.pairing || ""}
                onChange={e => setForm(f => ({ ...f, pairing: e.target.value }))}
                placeholder="ex: Chocolate, Queijos"
              />
            </div>
          </div>

          <div className="h-4" />
        </div>

        {/* Fixed action footer — pb-safe garante espaço acima do menu fixo no mobile */}
        <div
          className="sticky bottom-0 z-10 flex gap-3 px-5 pt-3 pb-3 border-t border-border flex-shrink-0"
          style={{
            background: "rgba(255,255,255,0.95)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
          }}
        >
          {!isNew && (
            <button
              onClick={handleDelete}
              className="h-11 w-11 flex items-center justify-center rounded-xl glass text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
            >
              <Trash2 className="h-4 w-4" strokeWidth={1.5} />
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 flex items-center justify-center gap-2 bg-foreground text-background rounded-xl py-3 text-sm font-light tracking-wide hover:opacity-90 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-background/30 border-t-background rounded-full animate-spin" />
            ) : (
              <Save className="h-4 w-4" strokeWidth={1.5} />
            )}
            {isNew ? "Criar Produto" : "Salvar"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function Admin() {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState(null);
  const [showNew, setShowNew] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [savingWhatsapp, setSavingWhatsapp] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    load();
    loadConfig();
  }, []);

  const handleSync = async () => {
    setSyncing(true);
    const toastId = toast.loading("Sincronizando descrições...");
    try {
      // @ts-ignore
      const backendProducts = await api.entities.Product.list("-created_date", 500);
      let updatedCount = 0;
      for (const localProd of catalogoLocal) {
        const match = backendProducts.find(p => p.name === localProd.name);
        if (match) {
          // @ts-ignore
          await api.entities.Product.update(match.id, { description: localProd.description });
          updatedCount++;
        } else {
          // @ts-ignore
          await api.entities.Product.create(localProd);
          updatedCount++;
        }
      }
      toast.dismiss(toastId);
      toast.success(`${updatedCount} produtos sincronizados com sucesso!`);
      load();
    } catch (e) {
      toast.dismiss(toastId);
      toast.error("Erro na sincronização: " + e.message);
    }
    setSyncing(false);
  };

  const loadConfig = async () => {
    // @ts-ignore
    const results = await api.entities.Product.filter({ name: "_CATEGORY_CONFIG_" });
    if (results.length > 0 && results[0].description) {
      try {
        const cfg = JSON.parse(results[0].description);
        if (cfg._whatsapp) setWhatsappNumber(cfg._whatsapp);
      } catch (e) {}
    }
  };

  const saveWhatsapp = async () => {
    setSavingWhatsapp(true);
    try {
      // @ts-ignore
      const results = await api.entities.Product.filter({ name: "_CATEGORY_CONFIG_" });
      let currentCfg = {};
      if (results.length > 0 && results[0].description) {
        try { currentCfg = JSON.parse(results[0].description); } catch (e) {}
      }
      const newCfg = { ...currentCfg, _whatsapp: whatsappNumber.replace(/\D/g, '') };
      const jsonStr = JSON.stringify(newCfg);
      if (results.length > 0) {
        // @ts-ignore
        await api.entities.Product.update(results[0].id, { description: jsonStr });
      } else {
        // @ts-ignore
        await api.entities.Product.create({ name: "_CATEGORY_CONFIG_", category: "_CONFIG_", description: jsonStr, price: 0, is_closed: true });
      }
      setWhatsappNumber(whatsappNumber.replace(/\D/g, ''));
      toast.success("Número do WhatsApp salvo!");
    } catch (e) {
      toast.error("Erro ao salvar número.");
    }
    setSavingWhatsapp(false);
  };

  const load = async () => {
    setLoading(true);
    // @ts-ignore
    const data = await api.entities.Product.list("-updated_date", 500);
    setProducts(data);
    setLoading(false);
  };

  const filtered = products.filter(p => {
    if (p.name === "_CATEGORY_CONFIG_") return false;
    return !search || p.name?.toLowerCase().includes(search.toLowerCase()) || p.category?.toLowerCase().includes(search.toLowerCase());
  });

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <p className="text-muted-foreground font-light">Acesso restrito a administradores.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-5 pt-14 pb-32">
      <div className="max-w-lg mx-auto">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-extralight tracking-tight">Gerenciar Acervo</h1>
          <p className="text-xs text-muted-foreground mt-1 font-light">{products.length} produtos no acervo</p>
        </motion.div>

        <div className="flex items-center gap-3 mt-6">
          <div className="flex-1 relative">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground">
              <circle cx="11" cy="11" r="6"/><path d="M16 16l4 4"/>
            </svg>
            <input
              type="text"
              placeholder="Buscar produto..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full glass rounded-xl pl-10 pr-4 py-2.5 text-sm font-light placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-foreground/10 bg-transparent"
            />
          </div>
          <button
            onClick={() => setShowNew(true)}
            className="flex items-center gap-2 glass rounded-xl px-4 py-2.5 text-sm font-light hover:scale-[1.02] transition-transform active:scale-95"
          >
            <Plus className="h-4 w-4" strokeWidth={1.5} />
            Novo
          </button>
        </div>

        {/* Configurações */}
        <div className="mt-6 glass rounded-2xl px-5 py-4 space-y-4">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Configurações</p>
          
          <div>
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Número WhatsApp (com DDI, sem espaços)</label>
            <div className="flex gap-2">
              <input
                className="flex-1 glass rounded-xl px-3.5 py-2.5 text-sm bg-transparent focus:outline-none focus:ring-1 focus:ring-foreground/20"
                value={whatsappNumber}
                onChange={e => setWhatsappNumber(e.target.value)}
                placeholder="5519981984598"
              />
              <button
                onClick={saveWhatsapp}
                disabled={savingWhatsapp}
                className="flex items-center gap-1.5 glass rounded-xl px-4 py-2.5 text-sm font-light hover:scale-[1.02] transition-transform active:scale-95 disabled:opacity-50"
              >
                {savingWhatsapp ? <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" /> : <Save className="h-4 w-4" strokeWidth={1.5} />}
                Salvar
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-border/50">
            <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-1.5">Sincronizar Catálogo</label>
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center justify-center gap-2 glass rounded-xl py-3 text-sm font-light hover:scale-[1.01] transition-transform active:scale-98 disabled:opacity-50 text-foreground"
            >
              {syncing ? (
                <div className="w-4 h-4 border-2 border-muted-foreground/30 border-t-foreground rounded-full animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" strokeWidth={1.5} />
              )}
              Sincronizar Descrições do JSON Local
            </button>
          </div>
        </div>

        <div className="mt-4 glass rounded-2xl px-4">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-5 h-5 border-2 border-muted-foreground/20 border-t-foreground rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <p className="text-center text-muted-foreground text-sm py-10 font-light">Nenhum produto encontrado.</p>
          ) : (
            filtered.map(p => (
              <ProductRow key={p.id} product={p} onEdit={setEditing} />
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {(editing || showNew) && (
          <EditModal
            product={editing || { name: "", category: "", price: "", is_special: false, is_opened: false, is_closed: false }}
            onSave={() => { setEditing(null); setShowNew(false); load(); }}
            onClose={() => { setEditing(null); setShowNew(false); }}
            onDelete={() => { setEditing(null); setShowNew(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}