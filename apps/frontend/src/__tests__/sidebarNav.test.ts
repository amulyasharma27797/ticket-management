import { describe, expect, it } from "vitest";

import { SIDEBAR_NAV_ITEMS } from "../utils/sidebarNav";

describe("sidebarNav", () => {
  it("only exposes required sidebar links", () => {
    expect(SIDEBAR_NAV_ITEMS).toHaveLength(1);
    expect(SIDEBAR_NAV_ITEMS[0]?.label).toBe("Docs");
    expect(SIDEBAR_NAV_ITEMS[0]?.external).toBe(true);
  });
});
