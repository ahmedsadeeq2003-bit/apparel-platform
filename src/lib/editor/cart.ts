import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * The shape a real order line item would need. No checkout/payment system
 * exists yet (see CLAUDE.md -- Paystack isn't wired up), so this is
 * deliberately just the data structure plus local persistence, not a real
 * order pipeline. `unitPriceCents`/totals are intentionally absent: pricing
 * is server-computed from `pricing_rules` at actual checkout time, never a
 * client-side literal.
 */
export type CartItem = {
  id: string;
  productId: string;
  productName: string;
  productColorId: string;
  productColorName: string;
  productColorHex: string;
  size: string;
  quantity: number;
  frontCanvasJson: object | null;
  backCanvasJson: object | null;
  addedAt: string;
};

type CartState = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id" | "addedAt">) => void;
  removeItem: (id: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (item) =>
        set((state) => ({
          items: [
            ...state.items,
            { ...item, id: crypto.randomUUID(), addedAt: new Date().toISOString() },
          ],
        })),
      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),
      clear: () => set({ items: [] }),
    }),
    { name: "stitch-cart" },
  ),
);

export const SIZES = ["XS", "S", "M", "L", "XL", "XXL"] as const;
export type Size = (typeof SIZES)[number];
