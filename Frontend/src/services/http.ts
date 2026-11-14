/**
 * Central HTTP client for the future FastAPI backend.
 * Set VITE_API_URL (e.g. http://localhost:8000) to enable real calls.
 */
export const API_URL: string | undefined = import.meta.env["VITE_API_URL"];
export const isBackendConfigured = () => Boolean(API_URL);

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new ApiError(0, "Backend não configurado (VITE_API_URL ausente).");
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new ApiError(res.status, `Erro ${res.status} ao acessar ${path}`);
  return res.json() as Promise<T>;
}

export const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));
