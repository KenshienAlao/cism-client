'use client';

import React from 'react';
import { formatDate } from "@/lib/utils/formatDate";
import { Order } from "@/model/order.model";
import { Receipt } from "lucide-react";

export default function Orderinfo({ order }: { order: Order }) {
    return (
        <div className="flex items-start gap-3.5 w-full text-left">
            <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-md bg-secondary border border-border text-orange-500">
                <Receipt className="w-4 h-4" strokeWidth={2} />
            </div>
            <div className="min-w-0 flex-1 flex flex-col justify-center">
                <div className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-xs font-medium text-secondary-foreground uppercase tracking-wider font-mono">
                        Order
                    </span>
                    <h2 className="text-sm font-semibold tracking-tight text-foreground font-mono truncate">
                        #{order.orderCode}
                    </h2>
                </div>
                
                <p className="text-xs text-secondary-foreground/80 mt-0.5">
                    {formatDate(order.createdAt)}
                </p>
            </div>
        </div>
    );
}