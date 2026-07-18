import { describe, expect, it } from "vitest";

import type { TicketStatus } from "../api/ticketTypes";
import {
  canTransitionStatus,
  getAllowedTransitions,
  getStatusSelectOptions,
} from "../utils/ticketTransitions";

const ALL_STATUSES: TicketStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "closed",
  "cancelled",
];

const VALID_TRANSITIONS: Array<[TicketStatus, TicketStatus]> = [
  ["open", "in_progress"],
  ["open", "cancelled"],
  ["in_progress", "resolved"],
  ["in_progress", "cancelled"],
  ["resolved", "closed"],
  ["resolved", "cancelled"],
];

const INVALID_TRANSITIONS = ALL_STATUSES.flatMap((current) =>
  ALL_STATUSES.filter((target) => target !== current && !canTransitionStatus(current, target)).map(
    (target) => [current, target] as [TicketStatus, TicketStatus],
  ),
);

describe("ticketTransitions", () => {
  it.each(VALID_TRANSITIONS)("allows %s -> %s", (current, target) => {
    expect(canTransitionStatus(current, target)).toBe(true);
  });

  it.each(INVALID_TRANSITIONS)("rejects %s -> %s", (current, target) => {
    expect(canTransitionStatus(current, target)).toBe(false);
  });

  it("allows same-status no-op transitions", () => {
    for (const status of ALL_STATUSES) {
      expect(canTransitionStatus(status, status)).toBe(true);
    }
  });

  it("allows valid transitions from open", () => {
    expect(getAllowedTransitions("open")).toEqual(["in_progress", "cancelled"]);
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
