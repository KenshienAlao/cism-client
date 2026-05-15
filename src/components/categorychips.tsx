"use client";

import { 
    CupSoda, 
    DollarSign, 
    Hamburger, 
    School, 
    Sparkles, 
    TrendingUp, 
    Utensils, 
    LayoutGrid 
} from 'lucide-react';
import { useState } from 'react';

const categories = [
    { id: 'all', label: 'All', Icon: LayoutGrid },
    { id: 'meals', label: 'Meals', Icon: Utensils },
    { id: 'drinks', label: 'Drinks', Icon: CupSoda },
    { id: 'snacks', label: 'Snacks', Icon: Hamburger },
    { id: 'business', label: 'School', Icon: School },
    { id: 'popular', label: 'Popular', Icon: TrendingUp },
    { id: 'fresh', label: 'Fresh', Icon: Sparkles },
    { id: 'budget', label: 'Budget', Icon: DollarSign }
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
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            {categories.map((cat) => {
                const isActive = selected === cat.id;
                const Icon = cat.Icon;

                return (
                    <button
                        key={cat.id}
                        onClick={() => handleSelect(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-200 whitespace-nowrap text-xs font-medium tracking-tight ${
                            isActive 
                                ? "bg-accent border-orange-500 text-orange-500 shadow-sm" 
                                : "bg-card border-border text-muted-foreground hover:border-orange-500/50 hover:text-foreground"
                        }`}
                    >
                        <Icon className={`w-3.5 h-3.5 ${isActive ? "text-orange-500" : "text-muted-foreground"}`} />
                        {cat.label}
                    </button>
                );
            })}
        </div>
    );
}