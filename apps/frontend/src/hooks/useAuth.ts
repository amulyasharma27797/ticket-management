import { useContext } from "react";

import { AuthContext } from "../context/authContext";
import type { AuthContextValue } from "../context/authContextTypes";

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
