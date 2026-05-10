interface CartHeaderProps {
    cartItems: Array<{ id: number }>;
    selectedIds: Set<number>;
    setSelectedIds: (ids: Set<number>) => void;
}

export function CartHeader({ cartItems, selectedIds, setSelectedIds }: CartHeaderProps) {
    const allSelected = selectedIds.size === cartItems.length && cartItems.length > 0;

    return (
        <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
            <div className="max-w-4xl mx-auto px-4 md:px-8 h-14 md:h-20 flex items-center justify-between gap-4">
                <div className="flex flex-col justify-center">
                    <h1 className="text-sm md:text-2xl font-black text-neutral-900 uppercase tracking-[0.15em] leading-none">
                        My Cart
                    </h1>
                    <p className="text-[9px] md:text-xs font-bold text-neutral-400 uppercase tracking-widest mt-0.5 md:mt-1">
                        {cartItems.length} {cartItems.length === 1 ? 'Item' : 'Items'}
                    </p>
                </div>

                <button
                    onClick={() => {
                        if (allSelected) setSelectedIds(new Set());
                        else setSelectedIds(new Set(cartItems.map(i => i.id)));
                    }}
                    className={`text-[10px] md:text-xs font-black uppercase tracking-widest shrink-0 ${allSelected ? 'text-orange-500' : 'text-neutral-400'}`}
                >
                    {allSelected ? 'Deselect All' : 'Select All'}
                </button>
            </div>
        </header>
    );
}