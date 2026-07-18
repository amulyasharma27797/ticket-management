import type { ReactNode } from "react";

import { API_DOCS_URL } from "../api/client";
import { DocsIcon } from "./sidebarIcons";

export type NavItem = {
  label: string;
  to: string;
  icon: ReactNode;
  external?: boolean;
};

export const SIDEBAR_NAV_ITEMS: NavItem[] = [
  { label: "Docs", to: API_DOCS_URL, icon: <DocsIcon />, external: true },
];

export function isNavItemActive(pathname: string, item: NavItem): boolean {
  return !item.external && item.to === "/" && pathname === "/";
}
