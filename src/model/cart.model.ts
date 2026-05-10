export interface CartResponse {
    id: number;
    itemId: number;
    variationId: number | null;
    name: string;
    price: number;
    image: string;
    stallName: string;
    quantity: number;
    variationName?: string;
}
