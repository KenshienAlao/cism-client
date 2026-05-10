import { Clock, Truck, ArrowLeft, Star, Receipt, ChevronRight } from 'lucide-react';
import { Order } from '@/model/order.model';
import { formatDate } from '@/lib/utils/formatDate';
import { STATUS, STATUS_ORDER } from '@/config/track.config';
import Timeline from './ordertracking/timeline';
import { OrderSummary } from './checkout/order-summary';
import OrderSummaryTrack from './ordertracking/ordersummarytrack';
import Additonaldetails from './ordertracking/additonaldetails';
import Buttonupdate from './ordertracking/buttonupdate';
import Orderinfo from './ordertracking/orderinfo';
import Headertrack from './ordertracking/headertrack';

export type OrderStatus = 'PENDING' | 'PREPARING' | 'READY' | 'COMPLETED' | 'CANCELLED';

interface OrderTrackingProps {
    order: Order;
    onBack: () => void;
    onReview?: () => void;
    onReceive?: () => void;
    isProcessing?: boolean;
}

export function OrderTracking({
    order,
    onBack,
    onReview,
    onReceive,
    isProcessing
}: OrderTrackingProps) {
    const currentStatusIndex = order.status === 'CANCELLED'
        ? -2
        : STATUS_ORDER.indexOf(order.status as OrderStatus);

    return (
        <div className="min-h-screen bg-neutral-50 pb-32">
            <Headertrack onBack={onBack} />

            <main className="max-w-2xl mx-auto px-4 py-8 space-y-6">
                <Orderinfo order={order} />

                <Timeline
                    order={order}
                    currentStatusIndex={currentStatusIndex}
                />

                <OrderSummaryTrack order={order} />

                <Additonaldetails order={order} />

                <Buttonupdate
                    order={order}
                    onReceive={onReceive}
                    onReview={onReview}
                    isProcessing={!!isProcessing}
                />
            </main>
        </div>
    );
}