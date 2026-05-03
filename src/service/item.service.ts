import { apiClient } from "@/config/api.config";
import { ApiResponse } from "@/lib/api";
import { StallItems } from "@/model/stall.model";
import { API_ENDPOINTS } from "@/config/app.config";
import { Review, ReviewRequest } from "@/model/review.model";

export const itemService = {
  getAllItems(): Promise<ApiResponse<StallItems[]>> {
    return apiClient.get<StallItems[]>(API_ENDPOINTS.ITEM.GET_ALL);
  },

  createReview(review: ReviewRequest): Promise<ApiResponse<Review>> {
    return apiClient.post<Review>(API_ENDPOINTS.ITEM.CREATE_REVIEW, review);
  }

};