import { useState, useEffect, useRef, useCallback } from "react";
import { api } from "@/api/apiClient";

const DEFAULTS = {
  drop_x: 94,
  drop_y: 20,
  category_x: 50,
  category_y: 0,
  nav_x: 50,
  nav_y: 86, // Ajustado para "recortar" o orbe na base
};

/**
 * Hook que gerencia posições arrastáveis para a gota e categoria na ProductDetail.
 * - Admin: pode arrastar e salvar posições como padrão GLOBAL (aplicado a todos os produtos).
 * - Outros usuários: apenas leem as posições globais salvas.
 *
 * Lógica de carregamento:
 *   1. Tenta carregar o layout com is_global_default = true.
 *   2. Se não encontrar, usa os DEFAULTS.
 *
 * Lógica de salvamento (admin):
 *   - Sempre salva/atualiza o registro global (is_global_default: true).
 *   - Isso propaga a mudança para todos os produtos automaticamente.
 */
export function useDraggableLayout(productId, isAdmin) {
  const [layout, setLayout] = useState(DEFAULTS);
  const [globalLayoutId, setGlobalLayoutId] = useState(null);
  const [ready, setReady] = useState(false);
  const saveTimeoutRef = useRef(null);

  // Carrega o layout global ao montar
  useEffect(() => {
    async function load() {
      try {
        const rows = await api.entities.ProductUILayout.filter({ is_global_default: true });
        if (rows.length > 0) {
          const r = rows[0];
          setGlobalLayoutId(r.id);
          setLayout({
            drop_x: r.drop_x ?? DEFAULTS.drop_x,
            drop_y: r.drop_y ?? DEFAULTS.drop_y,
            category_x: r.category_x ?? DEFAULTS.category_x,
            category_y: r.category_y ?? DEFAULTS.category_y,
            nav_x: r.nav_x ?? DEFAULTS.nav_x,
            nav_y: r.nav_y ?? DEFAULTS.nav_y,
          });
        }
      } catch { }
      setReady(true);
    }
    load();
  }, []);

  // Salva o layout global no banco com debounce de 600ms
  const saveLayout = useCallback(async (newLayout) => {
    if (!isAdmin) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        if (globalLayoutId) {
          await api.entities.ProductUILayout.update(globalLayoutId, {
            ...newLayout,
            is_global_default: true,
          });
        } else {
          const created = await api.entities.ProductUILayout.create({
            ...newLayout,
            is_global_default: true,
          });
          setGlobalLayoutId(created.id);
        }
      } catch { }
    }, 600);
  }, [isAdmin, globalLayoutId]);

  // Atualiza uma chave de layout e dispara save global
  const updateLayout = useCallback((key, value) => {
    setLayout(prev => {
      const next = { ...prev, [key]: value };
      saveLayout(next);
      return next;
    });
  }, [saveLayout]);

  return { layout, updateLayout, ready };
}

/**
 * Hook para tornar um elemento arrastável dentro de um container pai.
 * Funciona com mouse e touch. Retorna posição em % relativa ao container.
 *
 * @param {object} params
 * @param {boolean} params.enabled - se false, sem interação
 * @param {number} params.initialX - posição X inicial em %
 * @param {number} params.initialY - posição Y inicial em %
 * @param {function} params.onDragEnd - chamado com (x%, y%) ao soltar
 */
export function useDraggable({ enabled, initialX, initialY, onDragEnd }) {
  const ref = useRef(null);
  const containerRef = useRef(null);
  const dragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startPct = useRef({ x: initialX, y: initialY });
  const [pos, setPos] = useState({ x: initialX, y: initialY });

  // Sincroniza posição se as props iniciais mudarem (ex: após carregar do banco)
  useEffect(() => {
    setPos({ x: initialX, y: initialY });
    startPct.current = { x: initialX, y: initialY };
  }, [initialX, initialY]);

  const getContainerRect = () => {
    let el = ref.current?.parentElement;
    while (el) {
      const style = window.getComputedStyle(el);
      if (style.position !== "static") return el.getBoundingClientRect();
      el = el.parentElement;
    }
    return document.body.getBoundingClientRect();
  };

  const onPointerDown = useCallback((e) => {
    if (!enabled) return;
    e.preventDefault();
    e.stopPropagation();
    dragging.current = true;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    startPos.current = { x: clientX, y: clientY };
    startPct.current = { x: pos.x, y: pos.y };

    const onMove = (ev) => {
      if (!dragging.current) return;
      const cx = ev.touches ? ev.touches[0].clientX : ev.clientX;
      const cy = ev.touches ? ev.touches[0].clientY : ev.clientY;
      const rect = getContainerRect();
      const dx = ((cx - startPos.current.x) / rect.width) * 100;
      const dy = ((cy - startPos.current.y) / rect.height) * 100;
      const newX = Math.max(0, Math.min(100, startPct.current.x + dx));
      const newY = Math.max(0, Math.min(100, startPct.current.y + dy));
      setPos({ x: newX, y: newY });
    };

    const onUp = (ev) => {
      if (!dragging.current) return;
      dragging.current = false;
      const cx = ev.changedTouches ? ev.changedTouches[0].clientX : ev.clientX;
      const cy = ev.changedTouches ? ev.changedTouches[0].clientY : ev.clientY;
      const rect = getContainerRect();
      const dx = ((cx - startPos.current.x) / rect.width) * 100;
      const dy = ((cy - startPos.current.y) / rect.height) * 100;
      const newX = Math.max(0, Math.min(100, startPct.current.x + dx));
      const newY = Math.max(0, Math.min(100, startPct.current.y + dy));
      setPos({ x: newX, y: newY });
      onDragEnd?.(newX, newY);
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onUp);
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", onUp);
  }, [enabled, pos, onDragEnd]);

  return { ref, containerRef, pos, onPointerDown };
}