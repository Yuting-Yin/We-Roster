// src/lib/api.ts

export const API_BASE: string =
  process.env.EXPO_PUBLIC_API_BASE ?? "http://localhost:8080";

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

let authTokenGetter: (() => string | undefined) | undefined;
export function setAuthTokenGetter(getter: () => string | undefined) {
  authTokenGetter = getter;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function fetchJson<T>(
  path: string,
  options: {
    method?: HttpMethod;
    body?: any;
    signal?: AbortSignal;
    headers?: Record<string, string>;
    timeoutMs?: number;
  } = {}
): Promise<T> {
  const { method = "GET", body, signal, headers = {}, timeoutMs = 15000 } =
    options;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const token = authTokenGetter?.();
  console.log('🔍 fetchJson - Token retrieved:', token ? 'Token present' : 'No token');
  console.log('🔍 fetchJson - AuthTokenGetter available:', !!authTokenGetter);
  
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: mergeSignals(signal, controller.signal),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new ApiError(res.status, text || res.statusText);
    }

    return (await res.json()) as T;
  } catch (e: any) {
    if (e?.name === "AbortError") throw new ApiError(408, "Request timeout");
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function mergeSignals(a?: AbortSignal, b?: AbortSignal): AbortSignal | undefined {
  if (!a) return b;
  if (!b) return a;
  const merged = new AbortController();
  const abort = () => merged.abort();
  a.addEventListener("abort", abort);
  b.addEventListener("abort", abort);
  if (a.aborted || b.aborted) merged.abort();
  return merged.signal;
}
