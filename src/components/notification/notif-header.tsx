export default function NotifHeader({clearAll}: {clearAll: () => void}) {
    return (
          <header className="sticky top-0 z-40 bg-white border-b border-neutral-100">
                <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
                    <h1 className="text-sm font-bold text-neutral-900 uppercase tracking-widest">Activity</h1>
                    <button
                        onClick={clearAll}
                        className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest"
                    >
                        Mark all read
                    </button>
                </div>
            </header>
    )
}