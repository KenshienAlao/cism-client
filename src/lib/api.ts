import { ApiResponse } from "@/model/api.model";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const config: RequestInit = {
    ...options,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    const isJson = response.headers
      .get("content-type")
      ?.includes("application/json");

    const result = isJson ? await response.json() : null;

    if (!response.ok) {
      return {
        data: null,
        status: response.status,
        error: {
          message: result?.message || "Something went wrong",
          code: result?.code || "UNEXPECTED_ERROR",
        },
      };
    }

    return {
      data: result.data as T,
      message: result.message,
      code: result.code,
      status: response.status,
      error: null,
    };
  } catch (error: any) {
    return {
      data: null,
      status: 500,
      error: {
        message: error.message || "Something went wrong",
        code: "INTERNAL_SERVER_ERROR",
      },
    };
  }
}

export const apiClient = {
  post: <T>(url: string, body: any) =>
    request<T>(url, { method: "POST", body: JSON.stringify(body) }),

  get: <T>(url: string) => request<T>(url, { method: "GET" }),

  put: <T>(url: string, body: any) =>
    request<T>(url, { method: "PUT", body: JSON.stringify(body) }),

  delete: <T>(url: string) => request<T>(url, { method: "DELETE" }),
};
