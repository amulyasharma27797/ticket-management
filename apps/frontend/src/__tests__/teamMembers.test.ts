import { describe, expect, it } from "vitest";

import type { TeamMember } from "../api/users";
import { teamMemberAvatarClass, teamMemberRoleLabel, teamMemberTitle } from "../utils/teamMembers";

const defaultMember: TeamMember = {
  id: "1",
  name: "Admin User",
  role: "admin",
  isDefault: true,
};

const regularMember: TeamMember = {
  id: "2",
  name: "Jane Doe",
  role: "user",
  isDefault: false,
};

describe("teamMembers", () => {
  it("describes default users in the hover title", () => {
    expect(teamMemberTitle(defaultMember)).toBe("Admin User - Pre Seeded Team member");
  });

  it("uses a plain title for registered users", () => {
    expect(teamMemberTitle(regularMember)).toBe("Jane Doe");
  });

  it("uses amber styling for default users", () => {
    expect(teamMemberAvatarClass(defaultMember)).toContain("amber");
    expect(teamMemberAvatarClass(regularMember)).toContain("slate");
  });

  it("maps roles to display labels", () => {
    expect(teamMemberRoleLabel("admin")).toBe("Admin");
    expect(teamMemberRoleLabel("agent")).toBe("Agent");
    expect(teamMemberRoleLabel("user")).toBe("User");
  });
});
