export interface OrderItem {
    id: number;
    itemName: string;
    variationName?: string;
    quantity: number;
    priceAtPurchase: number;
    image: string;
}

export interface Order {
    id: number;
    receipt: string;
    subtotal: number;
    deliveryFee: number;
    totalAmount: number;
    deliveryMethod: string;
    paymentMethod: string;
    status: string;
    note: string;
    stallName: string;
    orderItems: OrderItem[];
    createdAt: string;
}

export interface OrderRequest {
    cartItemIds: number[];
    deliveryMethod: 'DELIVERY' | 'PICKUP';
    paymentMethod: string;
    note: string;
}
