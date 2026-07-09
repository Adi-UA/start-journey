import axios from "axios";

// Empty base means same-origin: "/api/generate". In production the backend
// serves the frontend, so this just works. In dev, Vite proxies /api to the
// backend. Override with VITE_API_BASE only if the backend runs elsewhere.
const API_BASE = import.meta.env.VITE_API_BASE ?? "";

export type GenerateResponse = {
  image: string;
  device: string;
  steps: number;
  guidance_scale: number;
};

export async function generateImage(prompt: string): Promise<GenerateResponse> {
  const { data } = await axios.post<GenerateResponse>(`${API_BASE}/api/generate`, {
    prompt,
  });
  return data;
}
