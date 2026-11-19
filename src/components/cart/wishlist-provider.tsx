"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type WishlistValue = { productIds: string[]; error: string; toggle: (productId: string) => Promise<string | null> };
const WishlistContext = createContext<WishlistValue | null>(null);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [productIds, setProductIds] = useState<string[]>([]);
  const [error, setError] = useState("");
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/wishlist", { cache: "no-store" });
      const body = await response.json();
      if (response.ok) setProductIds(body.productIds as string[]);
    } catch { /* Wishlist state can be loaded again from the API on the next visit. */ }
  }, []);
  useEffect(() => { void refresh(); }, [refresh]);
  const toggle = useCallback(async (productId: string) => {
    setError("");
    const response = await fetch("/api/wishlist", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ productId }) });
    const body = await response.json();
    if (!response.ok) {
      const message = body.error || "Could not update your wishlist.";
      setError(message);
      return message;
    }
    setProductIds((current) => body.saved ? [...new Set([...current, productId])] : current.filter((id) => id !== productId));
    return null;
  }, []);
  const value = useMemo(() => ({ productIds, error, toggle }), [productIds, error, toggle]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
