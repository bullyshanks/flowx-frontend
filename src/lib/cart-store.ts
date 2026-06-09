// ─── Cart state ──
'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartItem, Product } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  subtotal: () => number;
  count: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (product, quantity) => {
        const qty = quantity ?? product.minQuantity;
        const existing = get().items.find((i) => i.productId === product.id);
        if (existing) {
          set({
            items: get().items.map((i) =>
              i.productId === product.id
                ? { ...i, quantity: Math.max(product.minQuantity, i.quantity + qty) }
                : i
            ),
          });
        } else {
          set({ items: [...get().items, { productId: product.id, product, quantity: qty }] });
        }
      },
      removeItem: (productId) =>
        set({ items: get().items.filter((i) => i.productId !== productId) }),
      updateQuantity: (productId, quantity) =>
        set({
          items: get().items.map((i) =>
            i.productId === productId
              ? { ...i, quantity: Math.max(i.product.minQuantity, quantity) }
              : i
          ),
        }),
      clear: () => set({ items: [] }),
      subtotal: () =>
        get().items.reduce((sum, i) => sum + Number(i.product.price) * i.quantity, 0),
      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    {
      name: 'flowx_cart',
      storage: createJSONStorage(() => {
        if (typeof window === 'undefined') {
          return {
            getItem: () => null,
            setItem: () => {},
            removeItem: () => {},
          };
        }
        return localStorage;
      }),
    }
  )
);
