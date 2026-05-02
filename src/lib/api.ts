export type ApiResponse<T> =
  | { data: T; message: string; status: number; success: true }
  | { data: null; message: string; status: number; success: false };
