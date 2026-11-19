"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { StoreProduct, StoreVariant } from "@/lib/products";

export type CartLine = { id: string; product: StoreProduct; variant: StoreVariant; quantity: number };
type CartContextValue = {
  lines: CartLine[];
  count: number;
  subtotal: number;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  add: (product: StoreProduct, variantId: string, quantity?: number) => Promise<void>;
  setQuantity: (line: CartLine, quantity: number) => Promise<void>;
  remove: (lineId: string) => Promise<void>;
};
const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/cart", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok) throw new Error(body.error || "Could not load basket.");
      setLines(body.items as CartLine[]);
      setError(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load basket.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void refresh(); }, [refresh]);

  const add = useCallback(async (product: StoreProduct, variantId: string, quantity = 1) => {
    const response = await fetch("/api/cart", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ variantId, quantity }) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Could not add this product.");
    await refresh();
  }, [refresh]);

  const setQuantity = useCallback(async (line: CartLine, quantity: number) => {
    if (quantity < 1) return;
    const response = await fetch("/api/cart", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ itemId: line.id, variantId: line.variant.id, quantity }) });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Could not update this quantity.");
    await refresh();
  }, [refresh]);

  const remove = useCallback(async (lineId: string) => {
    const response = await fetch(`/api/cart?itemId=${encodeURIComponent(lineId)}`, { method: "DELETE" });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || "Could not remove this item.");
    await refresh();
  }, [refresh]);

  const value = useMemo(() => ({
    lines,
    count: lines.reduce((sum, line) => sum + line.quantity, 0),
    subtotal: lines.reduce((sum, line) => sum + line.variant.price * line.quantity, 0),
    loading,
    error,
    refresh,
    add,
    setQuantity,
    remove,
  }), [lines, loading, error, refresh, add, setQuantity, remove]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used inside CartProvider");
  return context;
}
