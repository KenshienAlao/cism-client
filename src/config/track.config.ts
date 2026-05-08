import { OrderStatus } from "@/components/ordertracking";
import { Clock, Package, Truck, CheckCircle } from "lucide-react";

export const STATUS: Record<string, any> = {
    PENDING: {
        label: 'Order Pending',
        description: 'Waiting for vendor confirmation',
        icon: Clock,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-500',
    },
    PREPARING: {
        label: 'Preparing',
        description: 'Your order is being prepared',
        icon: Package,
        color: 'text-blue-500',
        bgColor: 'bg-blue-500',
    },
    READY: {
        label: 'Ready for Pickup',
        description: 'Your order is ready!',
        icon: Truck,
        color: 'text-purple-500',
        bgColor: 'bg-purple-500',
    },
    COMPLETED: {
        label: 'Completed',
        description: 'Order picked up successfully',
        icon: CheckCircle,
        color: 'text-green-500',
        bgColor: 'bg-green-500',
    },
    CANCELLED: {
        label: 'Cancelled',
        description: 'Order has been cancelled',
        icon: CheckCircle,
        color: 'text-red-500',
        bgColor: 'bg-red-500',
    }
};

export const STATUS_ORDER: OrderStatus[] = ['PENDING', 'PREPARING', 'READY', 'COMPLETED'];
