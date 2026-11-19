export function getVideoPresentation(rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return { type: "external" as const, url: "" };
    if (url.hostname === "youtu.be") {
      const id = url.pathname.slice(1);
      return id ? { type: "embed" as const, url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` } : { type: "external" as const, url: "" };
    }
    if (url.hostname === "www.youtube.com" || url.hostname === "youtube.com") {
      const id = url.searchParams.get("v") || (url.pathname.startsWith("/embed/") ? url.pathname.split("/")[2] : "");
      return id ? { type: "embed" as const, url: `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}` } : { type: "external" as const, url: "" };
    }
    if (url.hostname === "vimeo.com" || url.hostname === "www.vimeo.com") {
      const id = url.pathname.split("/").filter(Boolean).at(-1);
      return id && /^\d+$/.test(id) ? { type: "embed" as const, url: `https://player.vimeo.com/video/${id}` } : { type: "external" as const, url: "" };
    }
    if (/\.(mp4|webm|ogg)$/i.test(url.pathname)) return { type: "video" as const, url: url.toString() };
    return { type: "external" as const, url: url.toString() };
  } catch {
    return { type: "external" as const, url: "" };
  }
}
