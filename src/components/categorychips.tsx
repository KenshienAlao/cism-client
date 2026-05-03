import { CupSoda, Hamburger, School, Utensils } from 'lucide-react';
import { useState } from 'react';

const categories = [
    { id: 'all', label: 'All', emoji: null },
    { id: 'meals', label: 'Meals', emoji: Utensils },
    { id: 'drinks', label: 'Drinks', emoji: CupSoda },
    { id: 'snacks', label: 'Snacks', emoji: Hamburger },
    { id: 'business', label: 'School Item', emoji: School }
];

interface CategoryChipsProps {
    onCategoryChange?: (category: string) => void;
}

export function CategoryChips({ onCategoryChange }: CategoryChipsProps) {
    const [selected, setSelected] = useState('all');

    const handleSelect = (id: string) => {
        setSelected(id);
        onCategoryChange?.(id);
    };

    return (
        <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
            <div className="flex gap-2 pb-2">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleSelect(cat.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${selected === cat.id
                            ? 'bg-orange-500 text-white shadow-md'
                            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                            }`}
                    >
                        {cat.emoji && (
                            <cat.emoji className="w-4 h-4" />
                        )}
                        <span>{cat.label}</span>
                    </button>
                ))}
            </div>
        </div>
    );
}
