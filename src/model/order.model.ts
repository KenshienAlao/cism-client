export interface OrderItem {
    id: number;
    itemName: string;
    variationName?: string;
    quantity: number;
    priceAtPurchase: number;
    image: string;
    itemId: number;
}

export interface Order {
    id: string;
    orderCode: string;
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    deliveryMethod: 'DELIVER' | 'PICKUP';
    paymentMethod: string;
    status: string;
    note: string;
    stallName: string;
    stallImage?: string;
    orderItems: OrderItem[];
    createdAt: string;
    stallId: number;
    cancelReason?: string;
    cancelledBy?: 'CUSTOMER' | 'STALL';
    deletedByCustomer: boolean;
    deletedByStall: boolean;
}

export interface OrderRequest {
    cartItemIds: number[];
    buyNowItem?: {
        stallId: number;
        itemId: number;
        variationId: number;
        quantity: number;
    };
    deliveryMethod: 'DELIVER' | 'PICKUP';
    paymentMethod: string;
    note: string;
}
