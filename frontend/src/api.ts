// Empty base means same-origin ("/api/..."). In production the backend serves
// the frontend, so this just works; in dev, Vite proxies /api to the backend.
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export type GenerateParams = {
  prompt: string;
  steps?: number;
  guidanceScale?: number;
};

export type ProgressEvent = {
  type: "progress";
  step: number;
  total: number;
  elapsed_seconds: number;
  eta_seconds: number | null;
};

export type ResultEvent = {
  type: "result";
  image: string;
  device: string;
  steps: number;
  guidance_scale: number;
  elapsed_seconds: number;
};

type ErrorEvent = { type: "error"; detail: string };
type StreamEvent = ProgressEvent | ResultEvent | ErrorEvent;

/**
 * Generate an image, reporting per-step progress via `onProgress`.
 * Reads the backend's newline-delimited JSON stream and resolves with the
 * final result event.
 */
export async function generateImageStream(
  params: GenerateParams,
  onProgress: (event: ProgressEvent) => void,
): Promise<ResultEvent> {
  const response = await fetch(`${API_BASE}/api/generate/stream`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      prompt: params.prompt,
      steps: params.steps,
      guidance_scale: params.guidanceScale,
    }),
  });

  if (!response.ok || !response.body) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let result: ResultEvent | null = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let newline: number;
    while ((newline = buffer.indexOf("\n")) >= 0) {
      const line = buffer.slice(0, newline).trim();
      buffer = buffer.slice(newline + 1);
      if (!line) continue;

      const event = JSON.parse(line) as StreamEvent;
      if (event.type === "progress") {
        onProgress(event);
      } else if (event.type === "result") {
        result = event;
      } else if (event.type === "error") {
        throw new Error(event.detail || "Image generation failed");
      }
    }
  }

  if (!result) {
    throw new Error("Stream ended without a result");
  }
  return result;
}
