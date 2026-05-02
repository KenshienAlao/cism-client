import { apiClient } from "@/config/api.config";
import { ApiResponse } from "@/lib/api";
import { StallItems } from "@/model/stall.model";
import { API_ENDPOINTS } from "@/config/app.config";

export const itemService = {
  getAllItems(): Promise<ApiResponse<StallItems[]>> {
    return apiClient.get<StallItems[]>(API_ENDPOINTS.ITEM.GET_ALL);
  },
  
};