import { ArrowLeft } from "lucide-react";

interface HeadertrackProps {
    onBack: () => void;
}

export default function Headertrack({ onBack }: HeadertrackProps) {
    return (
        <header className="sticky top-0 z-40 bg-white border-b border-neutral-100">
            <div className="max-w-2xl mx-auto px-4 h-14 flex items-center">
                <button
                    onClick={onBack}
                    className="w-8 h-8 flex items-center justify-center rounded-md bg-neutral-50 text-neutral-600 active:bg-neutral-100 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" strokeWidth={2.5} />
                </button>
            </div>
        </header>
    )
}