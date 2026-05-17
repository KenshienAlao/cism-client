import { apiClient } from "@/config/api.config";
import { ApiResponse } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/app.config";

export interface PreorderRequest {
    itemId: number;
    variationId: number | null;
    quantity: number;
}

export interface PreorderResponse {
    id: number;
    itemId: number;
    itemName: string;
    price: number;
    variationId: number | null;
    variationName: string | null;
    stallId: number;
    stallName: string;
    initialStock: number;
    quantity: number;
    createdAt: string;
}

export const preorderService = {
    addPreorder(request: PreorderRequest): Promise<ApiResponse<PreorderResponse>> {
        return apiClient.post<PreorderResponse>(API_ENDPOINTS.PREORDER.ADD, request);
    },

    deletePreorder(itemId: number, variationId: number | null): Promise<ApiResponse<string>> {
        const query = variationId ? `?variationId=${variationId}` : '';
        return apiClient.delete<string>(`${API_ENDPOINTS.PREORDER.DELETE}/${itemId}${query}`);
    },

    getPreorders(): Promise<ApiResponse<PreorderResponse[]>> {
        return apiClient.get<PreorderResponse[]>(API_ENDPOINTS.PREORDER.GET_ALL);
    },

    getPreordersSuccess(): Promise<ApiResponse<PreorderResponse[]>> {
        return apiClient.get<PreorderResponse[]>(API_ENDPOINTS.PREORDER.GET_ALL_SUCCESS);
    }
};
