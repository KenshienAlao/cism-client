import { apiClient } from "@/config/api.config";
import { ApiResponse } from "@/lib/api";
import { Order, OrderRequest } from "@/model/order.model";
import { ORDER_API_ENDPOINTS } from "@/config/order.config";

export const orderService = {
    addOrder(request: OrderRequest): Promise<ApiResponse<Order[]>> {
        return apiClient.post<Order[]>(ORDER_API_ENDPOINTS.CUSTOMER.ADD_ORDER, request);
    },

    getMyOrders(): Promise<ApiResponse<Order[]>> {
        return apiClient.get<Order[]>(ORDER_API_ENDPOINTS.CUSTOMER.GET_MY_ORDERS);
    },

    cancelOrder(id: number): Promise<ApiResponse<Order>> {
        return apiClient.post<Order>(ORDER_API_ENDPOINTS.CUSTOMER.CANCEL_ORDER(id));
    },

    getStallOrders(stallId: number): Promise<ApiResponse<Order[]>> {
        return apiClient.get<Order[]>(ORDER_API_ENDPOINTS.STALL.GET_STALL_ORDERS(stallId));
    },

    updateOrderStatus(id: number, status: string): Promise<ApiResponse<Order>> {
        return apiClient.post<Order>(ORDER_API_ENDPOINTS.STALL.UPDATE_STATUS(id), { status });
    },

    getOrderById(id: number): Promise<ApiResponse<Order>> {
        return apiClient.get<Order>(`${ORDER_API_ENDPOINTS.CUSTOMER.GET_MY_ORDERS}/${id}`);
    },
    
    deleteOrder(id: number): Promise<ApiResponse<string>> {
        return apiClient.post<string>(ORDER_API_ENDPOINTS.CUSTOMER.DELETE_ORDER(id));
    }
};