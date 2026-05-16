'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, AlertCircle } from 'lucide-react';

interface CancelReasonModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (reason: string) => void;
    isPending: boolean;
}

const PRESET_REASONS = [
    "Changed my mind",
    "Found a better price",
    "Ordered by mistake",
    "Incorrect delivery details",
    "Delivery takes too long"
];

export function CancelReasonModal({ isOpen, onClose, onConfirm, isPending }: CancelReasonModalProps) {
    const [reason, setReason] = useState('');

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
            setReason('');
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleConfirm = () => {
        if (!reason.trim() || isPending) return;
        onConfirm(reason);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-1000 flex items-end md:items-center justify-center p-0 md:p-4 overflow-hidden">
                    
                    {/* Backdrop */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: 'linear' }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-none"
                        onClick={onClose}
                    />

                    <motion.div 
                        initial={{ y: '100%', opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: '100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 16, stiffness: 160 }}
                        className="relative w-full md:max-w-md bg-card border-t md:border border-border rounded-t-lg md:rounded-lg shadow-none overflow-hidden flex flex-col text-foreground max-h-[92dvh]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-secondary/40">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <h2 className="text-xs font-semibold uppercase tracking-wider text-foreground/80">
                                    Cancel Order
                                </h2>
                            </div>
                            <button 
                                onClick={onClose}
                                className="p-1 text-foreground/40 hover:text-foreground transition-colors rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Body Input Content */}
                        <div className="p-5 space-y-5 overflow-y-auto no-scrollbar">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-semibold text-foreground/40 uppercase tracking-wider block">
                                    Reason for Cancellation
                                </label>
                                
                                {/* Selectors */}
                                <div className="flex flex-wrap gap-1.5">
                                    {PRESET_REASONS.map((preset) => {
                                        const isSelected = reason === preset;
                                        return (
                                            <button
                                                key={preset}
                                                type="button"
                                                onClick={() => setReason(preset)}
                                                className={`px-2.5 py-1.5 text-xs font-medium transition-colors border rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                                    isSelected 
                                                        ? 'bg-accent border-orange-500/30 text-orange-500' 
                                                        : 'bg-input border-border text-foreground/60 hover:text-foreground hover:bg-secondary'
                                                }`}
                                            >
                                                {preset}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Custom Text Area */}
                                <textarea
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    placeholder="Tell us why you're cancelling..."
                                    rows={4}
                                    className="w-full p-3 text-sm bg-input border border-border text-foreground placeholder:text-foreground/30 rounded-md outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/20 resize-none transition-all font-normal"
                                />
                            </div>
                        </div>

                        {/* Action Buttons Footer */}
                        <div className="p-5 pt-0 flex gap-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2 text-xs font-semibold uppercase tracking-wider text-foreground/60 bg-input border border-border rounded-md hover:bg-secondary transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Keep Order
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirm}
                                disabled={!reason.trim() || isPending}
                                className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-md flex items-center justify-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-ring transition-colors ${
                                    reason.trim() && !isPending
                                        ? 'bg-orange-500 text-white hover:bg-orange-600'
                                        : 'bg-secondary text-foreground/30 cursor-not-allowed'
                                }`}
                            >
                                {isPending ? (
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                    "Confirm Cancel"
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}