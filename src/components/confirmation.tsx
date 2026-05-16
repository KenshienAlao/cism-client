"use client";

import { useConfirmation } from "@/context/confirmation.context";
import { AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Confirmation() {
    const { state, closeConfirmation } = useConfirmation();
    const { isOpen, title, message, confirmText, type, onConfirm } = state;

    const isDanger = type === "danger";

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
                    {/* Backdrop Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15, ease: "linear" }}
                        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
                        onClick={closeConfirmation}
                    />

                    {/* Dialog Card Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98, y: 4 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.98, y: 4 }}
                        transition={{ duration: 0.15, ease: "easeOut" }}
                        role="alertdialog"
                        aria-modal="true"
                        className="relative w-full max-w-[320px] rounded-lg border border-border bg-card p-5 text-foreground"
                    >
                        {/* Content Layout */}
                        <div className="flex flex-col items-center text-center">
                            <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-md border ${
                                isDanger 
                                    ? "bg-orange-500/10 border-orange-500/20 text-orange-500" 
                                    : "bg-secondary border-border text-secondary-foreground"
                            }`}>
                                <AlertCircle className="h-5 w-5" />
                            </div>

                            <h2 className="text-sm font-medium tracking-tight">
                                {title || "Confirm Action"}
                            </h2>

                            <p className="mt-1.5 text-xs text-secondary-foreground leading-relaxed">
                                {message}
                            </p>
                        </div>

                        {/* Actions Stack Layout */}
                        <div className="mt-5 flex flex-col gap-2">
                            <button
                                type="button"
                                onClick={() => {
                                    onConfirm();
                                    closeConfirmation();
                                }}
                                className={`w-full rounded-md py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                                    isDanger
                                        ? "bg-orange-500 text-white hover:bg-orange-600"
                                        : "bg-foreground text-background hover:bg-foreground/90"
                                }`}
                            >
                                {confirmText || "Confirm"}
                            </button>

                            <button
                                type="button"
                                onClick={closeConfirmation}
                                className="w-full rounded-md border border-border bg-input py-2 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}