import { ProductCard } from "./productcard";
import { ItemResponse } from "@/model/product.model";

interface ProductGridProps {
    items: ItemResponse[];
    onAddToCart: (id: string) => void;
}

export function ProductGrid({ items, onAddToCart }: ProductGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {items.map((item) => (
                <ProductCard
                    key={item.id}
                    item={item}
                    image={item.image}
                    stallImage={item.image}
                    onAddToCart={onAddToCart}
                />
            ))}
        </div>
    );
}
