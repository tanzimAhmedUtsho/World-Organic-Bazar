"use client";

import { useTransition } from "react";
import { setVideoPublished } from "@/actions/admin-videos";

export function VideoPublishButton({ id, published }: { id: string; published: boolean }) {
  const [pending, startTransition] = useTransition();
  return <button type="button" className="admin-secondary-button compact" disabled={pending} onClick={() => startTransition(() => void setVideoPublished(id, !published))}>{pending ? "…" : published ? "Unpublish" : "Publish"}</button>;
}
