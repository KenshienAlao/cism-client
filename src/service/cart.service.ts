import { apiClient } from "@/config/api.config";
import { ApiResponse } from "@/lib/api";
import { API_ENDPOINTS } from "@/config/app.config";

import { CartRequest } from "@/validation/cart.validation";
import { CartResponse } from "@/model/cart.model";

export const cartService = {
    addToCart(request: CartRequest): Promise<ApiResponse<CartResponse>> {
        return apiClient.post<CartResponse>(API_ENDPOINTS.CART.ADD, request);
    },

    removeToCart(cartId: number): Promise<ApiResponse<string>> {
        return apiClient.delete<string>(`${API_ENDPOINTS.CART.DELETE}/${cartId}`);
    },

    updateToCart(cartId: number, quantity: number): Promise<ApiResponse<CartResponse>> {
        return apiClient.patch<CartResponse>(`${API_ENDPOINTS.CART.UPDATE}/${cartId}?quantity=${quantity}`, undefined);
    },

    getCart(): Promise<ApiResponse<CartResponse[]>> {
        return apiClient.get<CartResponse[]>(API_ENDPOINTS.CART.GET_ALL);
    },

    clearCart(): Promise<ApiResponse<string>> {
        return apiClient.delete<string>(API_ENDPOINTS.CART.DELETE_ALL);
    }
};
