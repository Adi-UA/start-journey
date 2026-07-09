/** Turn a prompt into a safe PNG filename, e.g. "A cyberpunk dragon!" -> "a-cyberpunk-dragon.png". */
export function promptToFilename(prompt: string): string {
  const slug = prompt
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
  return `${slug || "start-journey"}.png`;
}

/** Trigger a browser download of a base64-encoded PNG. */
export function downloadImage(base64Png: string, filename: string): void {
  const link = document.createElement("a");
  link.href = `data:image/png;base64,${base64Png}`;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
