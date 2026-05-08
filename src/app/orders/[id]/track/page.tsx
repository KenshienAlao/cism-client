'use client';

import { useParams, useRouter } from 'next/navigation';
import { useOrder } from '@/hooks/use-order';
import { OrderTracking } from '@/components/ordertracking';
import Loading from '@/components/ui/loading';

export default function TrackOrderPage() {
    const params = useParams();
    const router = useRouter();
    const { useTrackOrder } = useOrder();

    const orderId = params.id ? Number(params.id) : null;
    const { data: order, isLoading } = useTrackOrder(orderId);

    if (isLoading) return <Loading />;
    if (!order) return <div className="p-10 text-center font-bold">Order not found</div>;

    return (
        <OrderTracking
            order={order}
            onBack={() => router.back()}
            onReview={() => router.push(`/item/${order.orderItems[0].id}`)} // Simplified for now
        />
    );
}
