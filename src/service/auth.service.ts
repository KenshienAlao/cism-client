import { apiClient } from "@/config/api.config";
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
} from "@/model/auth.model";
import { API_ENDPOINTS } from "@/config/app.config";
import { UpdateUserRequest } from "@/model/user.model";

// ─── Auth Service ───────────────────────────────────────────────────────────

export const authService = {
  login: (data: LoginRequest) =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, data),

  register: (data: RegisterRequest) =>
    apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, data),

  logout: () =>
    apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT),

  deleteAccount: () =>
    apiClient.delete<void>(API_ENDPOINTS.AUTH.DELETE_ACCOUNT),

  validateCookie: () =>
    apiClient.get<LoginResponse>(API_ENDPOINTS.AUTH.VALIDATE_COOKIE),

  refresh: () =>
    apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REFRESH),

  uploadAvatar: (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient.patchForm<string>(API_ENDPOINTS.AUTH.UPLOAD_AVATAR, formData);
  },

  updateProfile: (data: UpdateUserRequest) =>
    apiClient.patch<void>(API_ENDPOINTS.AUTH.UPDATE_PROFILE, data),
};
