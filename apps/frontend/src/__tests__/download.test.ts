import { describe, expect, it } from "vitest";

import { parseContentDispositionFilename } from "../utils/download";

describe("parseContentDispositionFilename", () => {
  it("parses quoted filenames", () => {
    expect(parseContentDispositionFilename('attachment; filename="my-tickets.csv"')).toBe(
      "my-tickets.csv",
    );
  });

  it("parses utf-8 encoded filenames", () => {
    expect(parseContentDispositionFilename("attachment; filename*=UTF-8''my-tickets.csv")).toBe(
      "my-tickets.csv",
    );
  });

  it("returns null when header is missing", () => {
    expect(parseContentDispositionFilename(null)).toBeNull();
  });
});
