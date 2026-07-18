import { describe, expect, it } from "vitest";

import { ApiError } from "../api/client";
import { getAuthErrorMessage, parseApiError } from "../utils/authErrors";

describe("parseApiError", () => {
  it("maps validation details to field errors", () => {
    const error = new ApiError("Please fix the highlighted fields.", "VALIDATION_ERROR", [
      { field: "password", message: "Password must be at least 8 characters with 1 letter and 1 digit" },
      { field: "email", message: "Enter a valid email address" },
    ]);

    const parsed = parseApiError(error);

    expect(parsed.message).toBeNull();
    expect(parsed.fieldErrors.password).toContain("Password must be at least 8 characters");
    expect(parsed.fieldErrors.email).toContain("valid email");
  });

  it("returns a general message when no field details exist", () => {
    const error = new ApiError("Invalid email or password", "UNAUTHORIZED");

    const parsed = parseApiError(error);

    expect(parsed.message).toBe("Invalid email or password");
    expect(parsed.fieldErrors).toEqual({});
  });
});

describe("getAuthErrorMessage", () => {
  it("joins field errors when details are present", () => {
    const error = new ApiError("Please fix the highlighted fields.", "VALIDATION_ERROR", [
      { field: "name", message: "Name must be at least 2 characters" },
    ]);

    expect(getAuthErrorMessage(error)).toBe("name: Name must be at least 2 characters");
  });
});
