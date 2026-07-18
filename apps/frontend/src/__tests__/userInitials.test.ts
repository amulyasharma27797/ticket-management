import { describe, expect, it } from "vitest";

import { userInitials } from "../utils/userInitials";

describe("userInitials", () => {
  it("returns up to two initials from a name", () => {
    expect(userInitials("Admin User")).toBe("AU");
    expect(userInitials("Agent User")).toBe("AU");
  });

  it("falls back when name is missing", () => {
    expect(userInitials()).toBe("U");
  });
});
