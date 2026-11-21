/**
 * Cliente HTTP central para a API FastAPI (backend/).
 * Com VITE_API_URL definido (ex.: http://localhost:8000) as features chamam a API;
 * sem ele, cada feature usa seus dados de demonstração.
 */
export const API_URL: string | undefined = import.meta.env["VITE_API_URL"];
export const isBackendConfigured = () => Boolean(API_URL);

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new ApiError(0, "Backend não configurado (VITE_API_URL ausente).");
  const res = await fetchOrNetworkError(`${API_URL}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new ApiError(res.status, await errorMessage(res, path));
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

async function fetchOrNetworkError(url: string, init: RequestInit): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch {
    throw new ApiError(0, "Não foi possível conectar à API. Verifique se ela está rodando.");
  }
}

/** A API responde erros esperados como {"detail": "mensagem para o usuário"}. */
async function errorMessage(res: Response, path: string): Promise<string> {
  const body: unknown = await res.json().catch(() => null);
  if (body && typeof body === "object" && "detail" in body && typeof body.detail === "string") {
    return body.detail;
  }
  return `Erro ${res.status} ao acessar ${path}`;
}

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
