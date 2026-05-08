"use client";
import { useConfirmation } from "@/context/confirmation.context";
import { AlertCircle } from "lucide-react";

export default function Confirmation() {
    const { state, closeConfirmation } = useConfirmation();

    if (!state.isOpen) return null;

    const isDanger = state.type === "danger";

    return (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-6">
            <div
                className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
                onClick={closeConfirmation}
            />
            <div className="relative w-full max-w-[320px] overflow-hidden rounded-[2rem] bg-white p-6 sm:p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className={`mb-5 flex h-12 w-12 items-center justify-center rounded-2xl ${isDanger ? "bg-rose-50 text-rose-500" : "bg-neutral-50 text-neutral-900"}`}>
                        <AlertCircle size={24} strokeWidth={2} />
                    </div>

                    <h2 className="text-sm font-black text-neutral-900 tracking-tight">
                        {state.title || "Confirm Action"}
                    </h2>

                    <p className="mt-2 text-xs font-medium leading-relaxed text-neutral-500 px-2">
                        {state.message}
                    </p>
                </div>

                <div className="mt-8 flex flex-col gap-2">
                    <button
                        onClick={() => {
                            state.onConfirm();
                            closeConfirmation();
                        }}
                        className={`w-full rounded-xl py-3.5 text-[11px] font-black uppercase tracking-widest transition-all active:scale-[0.97] ${isDanger
                            ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600"
                            : "bg-neutral-900 text-white hover:bg-neutral-800"
                            }`}
                    >
                        {state.confirmText || "Confirm"}
                    </button>

                    <button
                        onClick={closeConfirmation}
                        className="w-full rounded-xl py-3 text-[11px] font-bold uppercase tracking-widest text-neutral-400 transition-colors hover:text-neutral-900 active:scale-[0.98]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}