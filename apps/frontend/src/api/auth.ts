import { apiFetch, clearTokens, setTokens } from "./client";
import type { AuthTokens, User } from "./types";

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthTokens> {
  const data = await apiFetch<AuthTokens>("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function loginUser(payload: { email: string; password: string }): Promise<AuthTokens> {
  const data = await apiFetch<AuthTokens>("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  setTokens(data.accessToken, data.refreshToken);
  return data;
}

export async function logoutUser(): Promise<void> {
  const refreshToken = localStorage.getItem("refresh_token");
  try {
    await apiFetch<void>("/auth/logout", {
      method: "POST",
      body: JSON.stringify({ refreshToken }),
    });
  } finally {
    clearTokens();
  }
}

export async function fetchCurrentUser(): Promise<User> {
  return apiFetch<User>("/auth/me");
}
