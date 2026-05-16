import { ProductCard } from "./productcard";
import { ItemResponse } from "@/model/product.model";

interface ProductGridProps {
    items: ItemResponse[];
    priorityFirstItem?: boolean;
}

export function ProductGrid({ items, priorityFirstItem = false }: ProductGridProps) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {items.map((item, index) => (
                <ProductCard
                    key={item.id}
                    item={item}
                    image={item.image}
                    stallImage={item.stallImage}
                    priority={priorityFirstItem && index === 0}
                />
            ))}
        </div>
    );
}