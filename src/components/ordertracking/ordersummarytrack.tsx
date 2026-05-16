'use client';

import React from 'react';
import Image from 'next/image';
import { Order } from "@/model/order.model";

interface OrderSummaryTrackProps {
    order: Order;
}

export default function OrderSummaryTrack({ order }: OrderSummaryTrackProps) {
    return (
        <div className="w-full text-sm">
            <div className="flex items-center justify-between gap-3 pb-3.5 border-b border-border">
                <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Order Summary
                </h3>
                <span className="text-[10px] font-medium uppercase tracking-wider text-orange-500 bg-orange-500/10 px-2 py-0.5 border border-orange-500/20 rounded-md font-mono max-w-[150px] truncate">
                    {order.stallName}
                </span>
            </div>

            <div className="divide-y divide-border/60">
                {order.orderItems.map((item, index) => (
                    <div key={index} className="flex gap-3 items-center py-3 first:pt-3.5 last:pb-3.5">
                        <div className="w-10 h-10 rounded-md bg-secondary shrink-0 overflow-hidden border border-border relative">
                            <Image
                                src={item.image}
                                alt={item.itemName}
                                fill
                                className="object-cover select-none"
                                sizes="40px"
                            />
                        </div>
                    
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-foreground truncate">
                                {item.itemName}
                            </p>
                            <p className="text-[11px] text-secondary-foreground mt-0.5 font-mono">
                                {item.variationName ? `${item.variationName} • ` : ''}Qty: {item.quantity}
                            </p>
                        </div>
                    
                        <span className="text-xs font-medium text-foreground shrink-0 font-mono">
                            ₱{(item.priceAtPurchase * item.quantity).toFixed(2)}
                        </span>
                    </div>
                ))}
            </div>
            <div className="pt-3.5 border-t border-dashed border-border space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary-foreground">Subtotal</span>
                    <span className="text-foreground font-mono">₱{order.subtotal.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center text-xs">
                    <span className="text-secondary-foreground">Delivery Fee</span>
                    <span className="text-foreground font-mono">₱{order.deliveryFee.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center pt-2.5 border-t border-border">
                    <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Total
                    </span>
                    <span className="text-base font-bold text-orange-500 font-mono tracking-tight">
                        ₱{order.totalAmount.toFixed(2)}
                    </span>
                </div>
            </div>
        </div>
    );
}