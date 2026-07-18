export type ApiResponse<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
};
