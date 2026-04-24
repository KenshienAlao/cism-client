import { apiClient } from "@/lib/api";
import { ApiResponse } from "@/model/api.model";
import {
  LoginRequest,
  LoginResponse,
  OtpRequest,
  OtpResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/model/auth.model";
import { API_ENDPOINTS } from "@/config/app.config";

export const AuthService = {
  register(
    entity: Readonly<RegisterRequest>,
  ): Promise<ApiResponse<RegisterResponse>> {
    return apiClient.post<RegisterResponse>(
      API_ENDPOINTS.AUTH.REGISTER,
      entity,
    );
  },

  login(entity: Readonly<LoginRequest>): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, entity);
  },

  logout(): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT, {});
  },

  deleteAccount(): Promise<ApiResponse<void>> {
    return apiClient.delete<void>(API_ENDPOINTS.AUTH.DELETE_ACCOUNT);
  },


  validateEmailAddress(
    entity: Readonly<OtpRequest>,
  ): Promise<ApiResponse<OtpResponse>> {
    return apiClient.post<OtpResponse>(API_ENDPOINTS.OTP.SEND, entity);
  },

  validateCookie(): Promise<ApiResponse<LoginResponse>> {
    return apiClient.get<LoginResponse>(API_ENDPOINTS.AUTH.VALIDATE_COOKIE);
  },

  refresh(): Promise<ApiResponse<LoginResponse>> {
    return apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH, {});
  },

  async uploadAvatar(file: File): Promise<ApiResponse<string>> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}${API_ENDPOINTS.AUTH.UPLOAD_AVATAR}`,
      {
        method: "PATCH",
        credentials: "include",
        body: formData,
      },
    );

    const result = await response.json();

    if (!response.ok) {
      return {
        data: null,
        status: response.status,
        error: { message: result.message, code: result.code },
      };
    }
    return {
      data: result.data,
      message: result.message,
      code: result.code,
      status: response.status,
      error: null,
    };
  },
};
