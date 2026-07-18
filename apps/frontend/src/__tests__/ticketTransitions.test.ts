import { describe, expect, it } from "vitest";

import type { TicketStatus } from "../api/ticketTypes";
import {
  canTransitionStatus,
  getAllowedTransitions,
  getStatusSelectOptions,
} from "../utils/ticketTransitions";

describe("ticketTransitions", () => {
  it("allows valid transitions from open", () => {
    expect(getAllowedTransitions("open")).toEqual(["in_progress", "cancelled"]);
    expect(canTransitionStatus("open", "in_progress")).toBe(true);
    expect(canTransitionStatus("open", "cancelled")).toBe(true);
    expect(canTransitionStatus("open", "closed")).toBe(false);
  });

  it("allows valid transitions from in_progress", () => {
    expect(getAllowedTransitions("in_progress")).toEqual(["resolved", "cancelled"]);
  });

  it("allows resolved to closed or cancelled", () => {
    expect(getAllowedTransitions("resolved")).toEqual(["closed", "cancelled"]);
  });

  it("returns current status only for terminal states", () => {
    expect(getStatusSelectOptions("closed")).toEqual(["closed"]);
    expect(getStatusSelectOptions("cancelled")).toEqual(["cancelled"]);
  });

  it("includes current and allowed next statuses in select options", () => {
    const options = getStatusSelectOptions("open");
    expect(options).toEqual(["open", "in_progress", "cancelled"] satisfies TicketStatus[]);
  });
});
