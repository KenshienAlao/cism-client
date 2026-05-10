export const ORDER_API_ENDPOINTS = {
    CUSTOMER: {
        ADD_ORDER: "/api/customer/order/add-order",
        GET_MY_ORDERS: "/api/customer/order/my-orders",
        CANCEL_ORDER: (id: string) => `/api/customer/order/cancel-order/${id}`,
        RECEIVE_ORDER: (id: string) => `/api/customer/order/receive-order/${id}`,
        DELETE_ORDER: (id: string) => `/api/customer/order/delete-order/${id}`,
    },
    STALL: {
        GET_STALL_ORDERS: (stallId: number) => `/api/stall/order/stall/${stallId}`,
        UPDATE_STATUS: (id: string) => `/api/stall/order/update-status/${id}`,
    }
} as const;