import { describe, expect, it, beforeEach } from "vitest";

import { THEME_STORAGE_KEY, applyTheme, getStoredTheme, resolveInitialTheme, storeTheme } from "../utils/theme";

describe("theme utils", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove("dark");
  });

  it("returns null when no theme is stored", () => {
    expect(getStoredTheme()).toBeNull();
  });

  it("stores and reads theme preference", () => {
    storeTheme("dark");
    expect(getStoredTheme()).toBe("dark");
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe("dark");
  });

  it("applies dark class to the document root", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("resolves stored theme before system preference", () => {
    storeTheme("light");
    expect(resolveInitialTheme()).toBe("light");
  });
});
