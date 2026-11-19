"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
import { archiveProduct } from "@/actions/admin-products";

export function ArchiveProductButton({ productId, productName }: { productId: string; productName: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return <><button className="admin-icon-danger" title="Archive product" aria-label={`Archive ${productName}`} disabled={pending} onClick={() => { if (!window.confirm(`Archive ${productName}? It will disappear from the storefront and existing order history will remain.`)) return; setError(""); startTransition(async () => { const result = await archiveProduct(productId); if (!result.ok) setError(result.message); else router.refresh(); }); }}><Archive size={14} /></button>{error && <span className="admin-inline-error" role="alert">{error}</span>}</>;
}
