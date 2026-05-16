'use client';

import React from 'react';
import { STATUS, STATUS_ORDER } from "@/config/track.config";
import { Order } from "@/model/order.model";
import { Clock } from "lucide-react";
import { motion } from "framer-motion";

interface TimelineProps {
    order: Order;
    currentStatusIndex: number;
}

export default function Timeline({ order, currentStatusIndex }: TimelineProps) {
    return (
        <div className="w-full text-sm">
            <div className="relative">
                {order.status === 'CANCELLED' ? (
                    <motion.div
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="flex flex-col items-start text-left p-1"
                    >
                        <div className="w-8 h-8 rounded-md bg-secondary border border-border flex items-center justify-center mb-2.5">
                            <Clock className="w-4 h-4 text-destructive" strokeWidth={2} />
                        </div>
                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                            Order Cancelled
                        </h3>
                        <p className="text-xs text-secondary-foreground mt-1 max-w-sm leading-normal">
                            {order.cancelledBy === 'CUSTOMER'
                                ? "This order was cancelled by you."
                                : "This order was cancelled by the stall. See details below."}
                        </p>
                    </motion.div>
                ) : (
                    <>
                        <div className="absolute left-4 top-4 bottom-4 w-px bg-border -translate-x-1/2" />
                        <motion.div
                            className="absolute left-4 top-4 bottom-4 w-px bg-orange-500 origin-top -translate-x-1/2"
                            initial={{ scaleY: 0 }}
                            animate={{
                                scaleY: currentStatusIndex >= 0
                                    ? currentStatusIndex / (STATUS_ORDER.length - 1)
                                    : 0
                            }}
                            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                        />

                        <div className="space-y-5">
                            {STATUS_ORDER.map((statusKey, index) => {
                                const config = { ...STATUS[statusKey] };

                                if (statusKey === 'READY') {
                                    if (order.deliveryMethod === 'PICKUP') {
                                        config.label = 'Ready for Pickup';
                                        config.description = `Collect your order from ${order.stallName}.`;
                                    } else {
                                        config.label = 'Out for Delivery';
                                        config.description = 'Please stay at your pinned location.';
                                    }
                                }
                                const Icon = config.icon;
                                const isActive = index <= currentStatusIndex;
                                const isCurrent = index === currentStatusIndex;

                                return (
                                    <motion.div
                                        key={statusKey}
                                        initial={{ opacity: 0, y: 4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.03, duration: 0.2 }}
                                        className="relative flex items-start gap-3.5"
                                    >
                                        <div
                                            className={`relative z-10 w-8 h-8 rounded-md flex items-center justify-center border transition-colors duration-200 ${
                                                isCurrent 
                                                    ? 'bg-orange-500 border-orange-500 text-white' 
                                                    : isActive 
                                                    ? 'bg-secondary border-border text-foreground' 
                                                    : 'bg-background border-border/60 text-secondary-foreground/40'
                                            }`}
                                        >
                                            <Icon
                                                className="w-3.5 h-3.5"
                                                strokeWidth={2}
                                            />
                                        </div>
                                        <div className="flex-1 pt-0.5 min-w-0">
                                            <h3 className={`text-xs font-semibold uppercase tracking-wider transition-colors duration-200 ${
                                                isCurrent 
                                                    ? 'text-orange-500' 
                                                    : isActive 
                                                    ? 'text-foreground' 
                                                    : 'text-secondary-foreground/40'
                                            }`}>
                                                {config.label}
                                            </h3>
                                            <p className={`text-xs mt-0.5 leading-normal transition-colors duration-200 ${
                                                isActive 
                                                    ? 'text-secondary-foreground' 
                                                    : 'text-secondary-foreground/30'
                                            }`}>
                                                {config.description}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}