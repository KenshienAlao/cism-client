export default function Loading() {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-[9999]">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-[3px] border-neutral-100" />
                <div className="absolute inset-0 w-12 h-12 rounded-full border-[3px] border-orange-500 border-t-transparent animate-[spin_0.8s_linear_infinite]" />
                <div className="absolute inset-0 flex items-center justify-center" />
            </div>
        </div>
    );
}