export type ApiErrorBody = {
  code: string;
  message: string;
  details: Array<{ field: string; message: string }>;
};

export type ApiResponse<T> = {
  success: boolean;
  data?: T;
  meta?: Record<string, unknown>;
  error?: ApiErrorBody;
};

export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "agent" | "user";
  createdAt: string;
  updatedAt: string;
};

export type AuthTokens = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export type TokenRefresh = {
  accessToken: string;
  refreshToken?: string;
};
