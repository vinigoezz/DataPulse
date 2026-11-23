/**
 * Cliente HTTP central para a API FastAPI (backend/).
 * O endereço vem de VITE_API_URL (Frontend/.env.local em desenvolvimento; painel da Vercel em
 * produção). Ele é gravado no código na hora do build.
 */
export const API_URL: string | undefined = import.meta.env["VITE_API_URL"];

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new ApiError(0, "Endereço da API não configurado (VITE_API_URL).");
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
