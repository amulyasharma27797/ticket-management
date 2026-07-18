import { describe, expect, it } from "vitest";

import { buildTicketListQuery } from "../utils/ticketListQuery";

describe("buildTicketListQuery", () => {
  it("returns an empty string when no params are provided", () => {
    expect(buildTicketListQuery()).toBe("");
  });

  it("serializes search, filters, and pagination params", () => {
    const query = buildTicketListQuery({
      page: 2,
      pageSize: 25,
      search: " login ",
      status: "open",
      priority: "high",
    });

    expect(query).toBe("?page=2&pageSize=25&search=login&status=open&priority=high");
  });
});
