import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  apiFetch,
  clearTokens,
  getAccessToken,
  setTokens,
} from "../api/client";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("api client", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("attaches bearer token when available", async () => {
    setTokens("access-token", "refresh-token");
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ success: true, data: { ok: true } }),
    );

    await apiFetch("/protected");

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/protected"),
      expect.objectContaining({
        headers: expect.any(Headers),
      }),
    );
    const headers = vi.mocked(fetch).mock.calls[0]?.[1]?.headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer access-token");
  });

  it("parses error envelopes into ApiError", async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse(
        {
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Ticket not found",
            details: [],
          },
        },
        404,
      ),
    );

    await expect(apiFetch("/tickets/missing")).rejects.toMatchObject({
      message: "Ticket not found",
      code: "NOT_FOUND",
    });
  });

  it("attempts refresh on 401 and retries the original request", async () => {
    setTokens("expired-token", "refresh-token");
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Unauthorized", details: [] },
          },
          401,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          success: true,
          data: { accessToken: "new-access-token", refreshToken: "new-refresh-token" },
        }),
      )
      .mockResolvedValueOnce(
        jsonResponse({ success: true, data: { email: "user@example.com" } }),
      );

    const data = await apiFetch<{ email: string }>("/auth/me");

    expect(data.email).toBe("user@example.com");
    expect(getAccessToken()).toBe("new-access-token");
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("clears tokens when refresh fails", async () => {
    setTokens("expired-token", "refresh-token");
    vi.mocked(fetch)
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Unauthorized", details: [] },
          },
          401,
        ),
      )
      .mockResolvedValueOnce(
        jsonResponse(
          {
            success: false,
            error: { code: "UNAUTHORIZED", message: "Unauthorized", details: [] },
          },
          401,
        ),
      );

    await expect(apiFetch("/auth/me")).rejects.toBeInstanceOf(ApiError);
    expect(getAccessToken()).toBeNull();
    clearTokens();
  });
});
