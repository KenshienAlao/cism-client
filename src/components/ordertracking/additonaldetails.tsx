'use client';

import React from 'react';
import { Order } from "@/model/order.model";
import { CreditCard, Truck } from "lucide-react";

export default function Additonaldetails({ order }: { order: Order }) {
    return (
        <div className="w-full text-sm space-y-3">
            <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center text-secondary-foreground/60">
                        <CreditCard className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <span className="text-xs text-secondary-foreground font-medium">
                        Payment
                    </span>
                </div>
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    {order.paymentMethod}
                </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-border/60">
                <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-md bg-secondary border border-border flex items-center justify-center text-secondary-foreground/60">
                        <Truck className="w-3.5 h-3.5" strokeWidth={2} />
                    </div>
                    <span className="text-xs text-secondary-foreground font-medium">
                        Delivery
                    </span>
                </div>
                <span className="text-xs font-semibold text-foreground uppercase tracking-wider font-mono">
                    {order.deliveryMethod}
                </span>
            </div>
            {order.cancelReason && order.status === 'CANCELLED' && (
                <div className="pt-2">
                    <p className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider mb-1.5">
                        Cancellation Note
                    </p>
                    <div className="bg-secondary border border-border p-3 rounded-md text-xs text-foreground/90 leading-normal italic">
                        &ldquo;{order.cancelReason}&rdquo;
                    </div>
                </div>
            )}
            {order.note && (
                <div className="pt-2">
                    <p className="text-[10px] font-semibold text-secondary-foreground uppercase tracking-wider mb-1.5">
                        My Note
                    </p>
                    <div className="bg-secondary/60 border border-border p-3 rounded-md text-xs text-secondary-foreground leading-normal">
                        {order.note}
                    </div>
                </div>
            )}
        </div>
    );
}