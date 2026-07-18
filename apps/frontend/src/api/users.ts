import { apiFetch } from "./client";

export type TeamMember = {
  id: string;
  name: string;
  role: "admin" | "agent" | "user";
  isDefault: boolean;
};

export async function fetchTeamMembers(): Promise<TeamMember[]> {
  return apiFetch<TeamMember[]>("/users/team");
}
