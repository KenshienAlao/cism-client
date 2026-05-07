export type ItemResponse = {
    stallId: number;
    id: string;
    image: string;
    name: string;
    category: string;
    price: number;
    stallName: string;
    rating: number;
    reviewCount: number;
    stock: number;
    stallRole?: string;
    stallImage?: string | null;
    createdAt?: string;
};