"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { setCategoryActive } from "@/actions/admin-categories";

export function CategoryStatusButton({ id, active, name }: { id: string; active: boolean; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  return <><button className="admin-icon-button" title={active ? "Deactivate category" : "Activate category"} aria-label={`${active ? "Deactivate" : "Activate"} ${name}`} disabled={pending} onClick={() => { setError(""); startTransition(async () => { const result = await setCategoryActive(id, !active); if (!result.ok) setError(result.message); else router.refresh(); }); }}>{active ? <EyeOff size={14} /> : <Eye size={14} />}</button>{error && <span className="admin-inline-error" role="alert">{error}</span>}</>;
}
