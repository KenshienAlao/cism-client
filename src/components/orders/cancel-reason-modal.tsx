'use client';

import { useState, useEffect } from 'react';
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

    if (!isOpen) return null;

    const handleConfirm = () => {
        if (!reason.trim()) return;
        onConfirm(reason);
    };

    return (
        <div className="fixed inset-0 z-[1000] flex items-end md:items-center justify-center p-0 md:p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-neutral-900/60 transition-opacity"
                onClick={onClose}
            />

            {/* Modal Content */}
            <div className="relative w-full md:max-w-md bg-white border-t md:border border-neutral-200 shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-neutral-50">
                    <div className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-orange-500" />
                        <h2 className="text-sm md:text-base font-black uppercase tracking-[0.2em] text-neutral-900">
                            Cancel Order
                        </h2>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-1 text-neutral-400 hover:text-neutral-900 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    <div className="space-y-3">
                        <label className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest block">
                            Reason for Cancellation
                        </label>
                        
                        {/* Preset Reasons (Auto-generate text tabs) */}
                        <div className="flex flex-wrap gap-2">
                            {PRESET_REASONS.map((preset) => (
                                <button
                                    key={preset}
                                    onClick={() => setReason(preset)}
                                    className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider border transition-all ${
                                        reason === preset 
                                            ? 'bg-orange-500 border-orange-500 text-white' 
                                            : 'bg-white border-neutral-200 text-neutral-500'
                                    }`}
                                >
                                    {preset}
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="Tell us why you're cancelling..."
                            className="w-full h-32 p-4 text-sm bg-neutral-50 border border-neutral-200 focus:border-orange-500 focus:ring-0 outline-none resize-none placeholder:text-neutral-300 font-medium"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-0 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-4 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] text-neutral-400 border border-neutral-200"
                    >
                        Keep Order
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={!reason.trim() || isPending}
                        className="flex-1 py-4 text-[10px] md:text-xs font-black uppercase tracking-[0.3em] bg-orange-500 text-white disabled:bg-neutral-100 disabled:text-neutral-300 transition-colors flex items-center justify-center gap-2"
                    >
                        {isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Confirm Cancel"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
