import { useMemo } from 'react';
import { StallItems } from '@/model/stall.model';
import { ItemResponse } from '@/model/product.model';

export function useEnrichedItems(stalls: StallItems[]) {
    return useMemo(() => {
        return stalls.flatMap(stall => {
            return stall.items.map(item => {
                const itemReviews = stall.reviews.filter(r => r.itemId === item.id);
                const avgRating = itemReviews.length > 0
                    ? itemReviews.reduce((acc, r) => acc + r.star, 0) / itemReviews.length
                    : 0;

                const variations = item.variations || [];
                const displayPrice = variations.length > 0
                    ? Math.min(...variations.map(v => v.price))
                    : item.price;
                const displayStock = variations.length > 0
                    ? variations.reduce((acc, v) => acc + (Number(v.stock) || Number((v as any).stocks) || 0), 0)
                    : (Number(item.stocks) || Number((item as any).stock) || 0);

                const defaultCategory = stall.role === 'BUSINESS' ? 'SCHOOL_ITEM' : 'General';

                return {
                    ...item,
                    id: String(item.id),
                    price: displayPrice,
                    stock: displayStock,
                    stallName: stall.name || `Stall ${stall.id}`,
                    stallImage: stall.image ?? null,
                    stallRole: stall.role,
                    rating: avgRating,
                    reviewCount: itemReviews.length,
                    image: typeof item.image === 'string' ? item.image : '',
                    category: item.category || defaultCategory,
                } as ItemResponse;
            });
        });
    }, [stalls]);
}

export function enrichStall(stall: StallItems): ItemResponse[] {
    return stall.items.map(item => {
        const itemReviews = stall.reviews.filter(r => r.itemId === item.id);
        const avgRating = itemReviews.length > 0
            ? itemReviews.reduce((acc, r) => acc + r.star, 0) / itemReviews.length
            : 0;

        const variations = item.variations || [];
        const displayPrice = variations.length > 0
            ? Math.min(...variations.map(v => v.price))
            : item.price;
        const displayStock = variations.length > 0
            ? variations.reduce((acc, v) => acc + (Number(v.stock) || Number((v as any).stocks) || 0), 0)
            : (Number(item.stocks) || Number((item as any).stock) || 0);

        const defaultCategory = stall.role === 'BUSINESS' ? 'SCHOOL_ITEM' : 'General';

        return {
            ...item,
            id: String(item.id),
            price: displayPrice,
            stock: displayStock,
            stallName: stall.name || `Stall ${stall.id}`,
            stallImage: stall.image ?? null,
            rating: avgRating,
            reviewCount: itemReviews.length,
            image: typeof item.image === 'string' ? item.image : '',
            category: item.category || defaultCategory,
        } as ItemResponse;
    });
}
