/** True when a UTF-8 field was irreversibly saved as question marks. */
export function isPlaceholderText(value: string | null | undefined): boolean {
  const text = value?.trim();
  if (!text) return true;
  const visible = text.replace(/[\s?.,!·:;…—–-]/g, "");
  return visible.length === 0 && text.includes("?");
}

export function displayText(value: string | null | undefined, fallback: string): string {
  return isPlaceholderText(value) ? fallback : value!.trim();
}
