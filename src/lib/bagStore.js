// Simple bag store using localStorage
import { getFinalPrice } from '@/lib/openedBottle';

const BAG_KEY = 'spirits_bag';

export function getBagItems() {
  try {
    const items = localStorage.getItem(BAG_KEY);
    return items ? JSON.parse(items) : [];
  } catch {
    return [];
  }
}

export function addToBag(product) {
  const items = getBagItems();
  const existing = items.find(i => i.id === product.id);
  if (existing) {
    return null;
  } else {
    items.push({ ...product, quantity: 1 });
  }
  localStorage.setItem(BAG_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('bag-updated'));
  return items;
}

export function removeFromBag(productId) {
  const items = getBagItems().filter(i => i.id !== productId);
  localStorage.setItem(BAG_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('bag-updated'));
  return items;
}

export function updateBagQuantity(productId, quantity) {
  const items = getBagItems();
  const item = items.find(i => i.id === productId);
  if (item) {
    item.quantity = Math.min(1, Math.max(1, quantity));
  }
  localStorage.setItem(BAG_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('bag-updated'));
  return items;
}

export function clearBag() {
  localStorage.removeItem(BAG_KEY);
  window.dispatchEvent(new Event('bag-updated'));
  return [];
}

export function getBagCount() {
  return getBagItems().reduce((sum, i) => sum + (i.quantity || 1), 0);
}

export function getBagTotal() {
  return getBagItems().reduce((sum, i) => sum + (getFinalPrice(i) || 0) * (i.quantity || 1), 0);
}