"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { getVariant } from "@/lib/catalog";
import { MAX_QUANTITY } from "@/lib/pricing";

export type CartLine = {
  slug: string;
  variantId: string;
  quantity: number;
  personalization?: string;
};

type CartContextValue = {
  lines: CartLine[];
  /** False until the cart has been read from localStorage. */
  loaded: boolean;
  count: number;
  add: (line: CartLine) => void;
  setQuantity: (index: number, quantity: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const STORAGE_KEY = "eshop-cart-v1";
const CartContext = createContext<CartContextValue | null>(null);

function sameItem(a: CartLine, b: CartLine) {
  return a.slug === b.slug && a.variantId === b.variantId && (a.personalization ?? "") === (b.personalization ?? "");
}

/** Drop lines whose product or variant no longer exists in the catalog. */
function sanitize(raw: unknown): CartLine[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter(
      (l): l is CartLine =>
        typeof l?.slug === "string" &&
        typeof l?.variantId === "string" &&
        Number.isInteger(l?.quantity) &&
        getVariant(l.slug, l.variantId)?.product.orderType === "cart",
    )
    .map((l) => ({ ...l, quantity: Math.min(Math.max(l.quantity, 1), MAX_QUANTITY) }));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reading external storage once on mount
      setLines(sanitize(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]")));
    } catch {
      // ignore unreadable storage
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // storage full or blocked: cart still works for this visit
    }
  }, [lines, loaded]);

  const add = useCallback((line: CartLine) => {
    setLines((current) => {
      const index = current.findIndex((l) => sameItem(l, line));
      if (index === -1) return [...current, line];
      return current.map((l, i) =>
        i === index ? { ...l, quantity: Math.min(l.quantity + line.quantity, MAX_QUANTITY) } : l,
      );
    });
    setDrawerOpen(true);
  }, []);

  const setQuantity = useCallback((index: number, quantity: number) => {
    setLines((current) =>
      current.map((l, i) => (i === index ? { ...l, quantity: Math.min(Math.max(quantity, 1), MAX_QUANTITY) } : l)),
    );
  }, []);

  const remove = useCallback((index: number) => {
    setLines((current) => current.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => setLines([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo(
    () => ({
      lines,
      loaded,
      count: lines.reduce((sum, l) => sum + l.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      drawerOpen,
      openDrawer,
      closeDrawer,
    }),
    [lines, loaded, add, setQuantity, remove, clear, drawerOpen, openDrawer, closeDrawer],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
