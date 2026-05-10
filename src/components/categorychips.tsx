import { ChevronDown, CupSoda, DollarSign, Hamburger, School, Sparkles, TrendingUp, Utensils } from 'lucide-react';
import { useState } from 'react';

const categories = [
    { id: 'all', label: 'All', emoji: null },
    { id: 'meals', label: 'Meals', emoji: Utensils },
    { id: 'drinks', label: 'Drinks', emoji: CupSoda },
    { id: 'snacks', label: 'Snacks', emoji: Hamburger },
    { id: 'business', label: 'School Item', emoji: School },
    { id: 'popular', label: 'Popular', emoji: TrendingUp },
    { id: 'fresh', label: 'Fresh Drop', emoji: Sparkles },
    { id: 'budget', label: 'Budget', emoji: DollarSign }
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
        <div className="relative max-w-[200px]">
            <select
                value={selected}
                onChange={(e) => handleSelect(e.target.value)}
                className="w-full appearance-none bg-white border border-neutral-100 rounded-md px-4 py-3 pr-10 text-[10px] font-bold uppercase tracking-widest text-neutral-500 outline-none active:border-orange-500 transition-colors cursor-pointer"
            >
                {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                        {cat.label.toUpperCase()}
                    </option>
                ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-300 pointer-events-none" />
        </div>
    );
}
