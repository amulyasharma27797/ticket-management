import type { ApiResponse, TokenRefresh } from "./types";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000/api/v1";
export const API_DOCS_URL = `${API_URL}/docs`;
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export class ApiError extends Error {
  code: string;
  details: Array<{ field: string; message: string }>;

  constructor(message: string, code: string, details: Array<{ field: string; message: string }> = []) {
    super(message);
    this.code = code;
    this.details = details;
  }
}

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setTokens(accessToken: string, refreshToken: string): void {
  localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || body.success === false) {
    const apiError = new ApiError(
      body.error?.message ?? `HTTP ${response.status}`,
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.details ?? [],
    );
    throw apiError;
  }
  return body.data as T;
}

export async function apiFetchEnvelope<T>(
  path: string,
  init: RequestInit = {},
  retry = true,
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (response.status === 401 && retry && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetchEnvelope<T>(path, init, false);
    }
  }

  if (response.status === 204) {
    return { data: undefined as T };
  }

  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || body.success === false) {
    throw new ApiError(
      body.error?.message ?? `HTTP ${response.status}`,
      body.error?.code ?? "UNKNOWN_ERROR",
      body.error?.details ?? [],
    );
  }

  return { data: body.data as T, meta: body.meta };
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!response.ok) {
    clearTokens();
    return null;
  }

  const data = await parseResponse<TokenRefresh>(response);
  if (data.refreshToken) {
    setTokens(data.accessToken, data.refreshToken);
  } else {
    localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  }
  return data.accessToken;
}

export async function apiFetch<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers);
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const accessToken = getAccessToken();
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (response.status === 401 && retry && getRefreshToken()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      return apiFetch<T>(path, init, false);
    }
  }

  return parseResponse<T>(response);
}
