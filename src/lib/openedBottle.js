/**
 * ═══════════════════════════════════════════════════════════════
 *  MÓDULO DE PRECIFICAÇÃO DINÂMICA — GARRAFAS ABERTAS
 *  Versão 2.0 · Base44 · 26/04/2026
 * ═══════════════════════════════════════════════════════════════
 *
 *  Lógica:
 *    Preço Proporcional = priceFull × (volumeCurrent / volumeTotal)
 *    Piso de Segurança  = costOperating / (1 − marginMin)
 *    Preço Final        = max(Preço Proporcional, Piso de Segurança)
 *
 *  Parâmetros globais padrão:
 *    costOperating = R$ 15,00  (custo fixo: embalagem + manuseio)
 *    marginMin     = 0.20      (20% de margem mínima)
 * ═══════════════════════════════════════════════════════════════
 */

// ── CONSTANTES GLOBAIS ──────────────────────────────────────────
export const DEFAULT_COST_OPERATING = 15.00;
export const DEFAULT_MARGIN_MIN = 0.20;

// ── ARREDONDAMENTO (Ceiling 2 casas) ────────────────────────────
function ceilTo2(value) {
  return Math.ceil(value * 100) / 100;
}

// ── EXTRAI VOLUME EM ML DO CAMPO STRING ─────────────────────────
export function parseVolumeMl(volumeStr) {
  if (!volumeStr) return 0;
  const match = String(volumeStr).match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

// ── CALCULA VOLUME ATUAL EM ML ──────────────────────────────────
export function getCurrentVolumeMl(product) {
  const volumeTotal = parseVolumeMl(product.volume);
  if (!volumeTotal || product.opening_level == null) return volumeTotal;
  return Math.round(volumeTotal * product.opening_level / 100);
}

/**
 * Função pura: calcula o preço dinâmico com base no volume remanescente.
 *
 * @param {number} priceFull      - Preço da garrafa cheia (R$)
 * @param {number} volumeTotal    - Volume total da garrafa em ml
 * @param {number} volumeCurrent  - Volume atual de líquido em ml
 * @param {number} costOperating  - Custo operacional fixo (R$)
 * @param {number} marginMin      - Margem mínima (0-1, ex: 0.20 para 20%)
 *
 * @returns {{ finalPrice: number, proportionalPrice: number, safetyFloor: number, isFloorActive: boolean, isCritical: boolean, discountPercent: number }}
 */
export function calcularPrecoDinamico(
  priceFull,
  volumeTotal,
  volumeCurrent,
  costOperating = DEFAULT_COST_OPERATING,
  marginMin = DEFAULT_MARGIN_MIN,
) {
  // ── Validações de entrada ──
  if (!priceFull || priceFull <= 0) {
    throw new Error("Preço cheio (priceFull) deve ser maior que zero.");
  }
  if (!volumeTotal || volumeTotal <= 0) {
    throw new Error("Volume total (volumeTotal) deve ser maior que zero.");
  }
  if (volumeCurrent < 0) {
    throw new Error("Volume atual (volumeCurrent) não pode ser negativo.");
  }
  if (volumeCurrent > volumeTotal) {
    throw new Error("Volume atual não pode ser maior que o volume total.");
  }
  if (marginMin >= 1) {
    throw new Error("Margem mínima deve ser menor que 1 (100%).");
  }

  // ── Garrafa lacrada (100%) → preço cheio ──
  if (volumeCurrent === volumeTotal) {
    return {
      finalPrice: ceilTo2(priceFull),
      proportionalPrice: ceilTo2(priceFull),
      safetyFloor: ceilTo2(costOperating / (1 - marginMin)),
      isFloorActive: false,
      isCritical: false,
      discountPercent: 0,
    };
  }

  // ── Cálculos principais ──
  const ratio = volumeCurrent / volumeTotal;
  const proportionalPrice = priceFull * ratio;
  const safetyFloor = costOperating / (1 - marginMin);

  const isFloorActive = proportionalPrice < safetyFloor;
  const finalPrice = Math.max(proportionalPrice, safetyFloor);

  // Volume crítico: ≤ 10%
  const isCritical = ratio <= 0.10;

  // Desconto real em relação ao preço cheio
  const discountPercent = Math.round((1 - finalPrice / priceFull) * 100);

  return {
    finalPrice: ceilTo2(finalPrice),
    proportionalPrice: ceilTo2(proportionalPrice),
    safetyFloor: ceilTo2(safetyFloor),
    isFloorActive,
    isCritical,
    discountPercent: Math.max(0, discountPercent),
  };
}

/**
 * Versão simplificada usando dados do product object.
 * Aceita opening_level (0-100%) e converte para volume.
 */
export function calcularPrecoFromProduct(product) {
  if (!product.is_opened || product.opening_level == null) {
    return {
      finalPrice: product.price || 0,
      proportionalPrice: product.price || 0,
      safetyFloor: 0,
      isFloorActive: false,
      isCritical: false,
      discountPercent: 0,
    };
  }

  const volumeTotal = parseVolumeMl(product.volume);
  const costOp = product.cost_operating ?? DEFAULT_COST_OPERATING;
  const margin = product.margin_min ?? DEFAULT_MARGIN_MIN;

  // Se não temos volume em ml, usamos opening_level como proporção direta
  if (!volumeTotal) {
    const ratio = product.opening_level / 100;
    const proportionalPrice = product.price * ratio;
    const safetyFloor = costOp / (1 - margin);
    const isFloorActive = proportionalPrice < safetyFloor;
    const finalPrice = Math.max(proportionalPrice, safetyFloor);
    const isCritical = ratio <= 0.10;
    const discountPercent = Math.round((1 - finalPrice / product.price) * 100);

    return {
      finalPrice: ceilTo2(finalPrice),
      proportionalPrice: ceilTo2(proportionalPrice),
      safetyFloor: ceilTo2(safetyFloor),
      isFloorActive,
      isCritical,
      discountPercent: Math.max(0, discountPercent),
    };
  }

  const volumeCurrent = Math.round(volumeTotal * product.opening_level / 100);
  return calcularPrecoDinamico(product.price, volumeTotal, volumeCurrent, costOp, margin);
}

// ── COMPAT: APIs legadas usadas em outros componentes ───────────
export function getFinalPrice(product) {
  const result = calcularPrecoFromProduct(product);
  return result.finalPrice;
}

export function getDiscount(product) {
  const result = calcularPrecoFromProduct(product);
  return result.discountPercent;
}

/** @deprecated Use getDiscount(product) */
export function calculateOpenedDiscount(openingLevel) {
  // Desconto agora é proporcional: se opening_level = 70%, desconto = 30%
  const discount = Math.round(100 - openingLevel);
  return Math.max(0, discount);
}

/**
 * Verifica se o preço cheio é suficiente para cobrir o piso de segurança.
 * Retorna true se está OK, false se o produto deveria ser bloqueado.
 */
export function isPriceViable(product) {
  const costOp = product.cost_operating ?? DEFAULT_COST_OPERATING;
  const margin = product.margin_min ?? DEFAULT_MARGIN_MIN;
  const safetyFloor = costOp / (1 - margin);
  return product.price >= safetyFloor;
}

/**
 * Heurística automática para determinar a cor do líquido baseada no nome ou categoria.
 * Serve como fallback caso a propriedade 'color' não esteja definida no banco.
 */
export function getLiquidColor(product) {
  if (!product) return "#FBBF24";

  // 1. Se já houver uma cor definida no produto, usa ela (Prioridade Máxima)
  if (product.color) return product.color;

  const name = product.name?.toLowerCase() || "";
  const category = product.category?.toLowerCase() || "";

  // 2. Palavras-chave no nome do produto (Cafe, XO, Gold, etc)
  if (name.includes("cafe") || name.includes("coffee") || name.includes("xo") || name.includes("black")) return "#3F2B22"; // Marrom Café Escuro / Preto
  if (name.includes("aperol") || name.includes("campari") || name.includes("red") || name.includes("vermelho")) return "#EF4444"; // Vermelho Vibrante
  if (name.includes("goldwasser")) return "#FDE047"; // Dourado Suave (folhas de ouro)
  if (name.includes("gold") || name.includes("oro") || name.includes("reposado") || name.includes("añejo")) return "#D97706"; // Ouro Rico
  if (name.includes("blanco") || name.includes("silver") || name.includes("prata")) return "#E2E8F0"; // Prata / Cristalino
  if (name.includes("absinthe") || name.includes("absinto")) return "#10B981"; // Verde Absinto / Herbal
  if (name.includes("pistacchio") || name.includes("pistache")) return "#86EFAC"; // Verde Pistache Cremoso
  if (name.includes("raspberry") || name.includes("framboesa") || name.includes("granate") || name.includes("romã")) return "#BE123C"; // Vermelho Rubi / Framboesa
  if (name.includes("chambord")) return "#4C1D95"; // Roxo Chambord
  if (name.includes("limoncello")) return "#FDE047"; // Amarelo Limão Vibrante
  if (name.includes("baileys") || name.includes("creme") || name.includes("irish cream")) return "#C3A17E"; // Bege / Creme Irlandês

  // 3. Fallbacks por Categoria
  switch (category) {
    case "whisky":
    case "cognac/brandy":
    case "cachaça":
    case "cachaca":
      return "#B45309"; // Âmbar Whisky / Cachaça
    case "rum":
      return name.includes("white") ? "#E2E8F0" : "#92400E"; // Rum Branco (Prata) ou Rum Escuro (Âmbar)
    case "gin":
    case "vodka":
    case "pisco":
    case "mezcal":
      return "#E2E8F0"; // Prata / Cristalino (antes estava marrom escuro por engano!)
    case "tequila":
      return "#D97706"; // Tequila Ouro
    case "bitter/aperitivo":
    case "vermouth":
      return "#991B1B"; // Vermelho Escuro / Vermute
    case "amaro":
    case "licor":
      return "#3F2B22"; // Marrom Licor / Amaro
    default:
      return "#B45309"; // Âmbar HomeBar
  }
}