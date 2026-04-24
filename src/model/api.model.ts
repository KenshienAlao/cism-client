export type ApiResponse<T> =
  | {
      data: T;
      message: string;
      code: string;
      error: null;
      status: number;
    }
  | {
      data: null;
      error: ApiError;
      status: number;
    };

type ApiError = {
  message: string;
  code: string;
  data?: any;
};
