import { Order } from "@/model/order.model";
import { Star } from "lucide-react";


interface ButtonupdateProps {
    order: Order;
    onReceive?: () => void;
    onReview?: () => void;
    isProcessing: boolean;
}


export default function Buttonupdate({ order, onReceive, onReview, isProcessing }: ButtonupdateProps) {
    return (
        <>
            {order.status === 'READY' && onReceive && (
                <button
                    onClick={onReceive}
                    disabled={isProcessing}
                    className="w-full bg-emerald-500 text-white py-4 rounded-md font-bold uppercase tracking-widest text-[10px] active:bg-emerald-600 transition-colors flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
                >
                    {isProcessing ? 'Processing...' : 'Mark as Received'}
                </button>
            )}
            {order.status === 'COMPLETED' && onReview && (
                <button
                    onClick={onReview}
                    className="w-full bg-orange-500 text-white py-4 rounded-md font-bold uppercase tracking-widest text-[10px] active:bg-orange-600 transition-colors flex items-center justify-center gap-2 mt-8"
                >
                    <Star className="w-3.5 h-3.5" strokeWidth={2.5} />
                    Leave a Review
                </button>
            )}
        </>
    )
}