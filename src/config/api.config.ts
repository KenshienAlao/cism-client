import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { ApiResponse } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/app.config";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

const instance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
    "X-App-Type": "client",
    "Cache-Control": "no-cache, no-store, must-revalidate",
    "Pragma": "no-cache",
    "Expires": "0"
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

instance.interceptors.response.use(
  (response) => {
    const data = response.data;
    return {
      data: data?.data ?? data,
      message: data?.message,
      status: response.status,
      success: data?.success ?? true,
    } as any;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    const skipRefreshEndpoints = [
      API_ENDPOINTS.AUTH.LOGIN,
      API_ENDPOINTS.AUTH.REFRESH,
      API_ENDPOINTS.AUTH.REGISTER,
    ];

    const isSkipRefresh = skipRefreshEndpoints.some(endpoint =>
      originalRequest.url === endpoint || originalRequest.url?.endsWith(endpoint)
    );

    if (error.response?.status === 401 && !originalRequest._retry && !isSkipRefresh) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return instance(originalRequest);
          })
          .catch(err => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {

        const res = await instance.post(API_ENDPOINTS.AUTH.REFRESH);

        if (!(res as any).success) {
          throw new Error("Refresh failed");
        }

        isRefreshing = false;
        processQueue(null);

        // Retry original request
        return instance(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        processQueue(refreshError);

        return Promise.resolve({
          data: null,
          status: 401,
          message: "Session expired",
          success: false,
        });
      }
    }

    return {
      data: null,
      status: error.response?.status || 500,
      message:
        (error.response?.data as any)?.message ||
        error.message ||
        "Something went wrong",
      success: false,
    } as any;
  }
);

export const apiClient = {
  post: <T>(url: string, body?: any): Promise<ApiResponse<T>> =>
    instance.post(url, body),

  postForm: <T>(url: string, formData: FormData): Promise<ApiResponse<T>> =>
    instance.post(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  get: <T>(url: string): Promise<ApiResponse<T>> => instance.get(url),

  put: <T>(url: string, body?: any): Promise<ApiResponse<T>> =>
    instance.put(url, body),

  putForm: <T>(url: string, formData: FormData): Promise<ApiResponse<T>> =>
    instance.put(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  delete: <T>(url: string): Promise<ApiResponse<T>> => instance.delete(url),

  patch: <T>(url: string, body?: any): Promise<ApiResponse<T>> =>
    instance.patch(url, body),

  patchForm: <T>(url: string, formData: FormData): Promise<ApiResponse<T>> =>
    instance.patch(url, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};
