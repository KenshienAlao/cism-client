"use client";
import { useConfirmation } from "@/context/confirmation.context";
import { AlertCircle } from "lucide-react";

export default function Confirmation() {
    const { state, closeConfirmation } = useConfirmation();

    if (!state.isOpen) return null;

    const isDanger = state.type === "danger";

    return (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-neutral-900/40 backdrop-blur-md transition-opacity"
                onClick={closeConfirmation}
            />
            <div className="relative w-full max-w-75 overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-neutral-100 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex flex-col items-center text-center">
                    <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-[1.2rem] ${isDanger ? "bg-red-50 text-red-500" : "bg-neutral-50 text-neutral-900"}`}>
                        <AlertCircle size={28} strokeWidth={1.5} />
                    </div>

                    <h2 className="text-[11px] font-bold uppercase tracking-[0.3em] text-neutral-900">
                        {state.title || "Confirm Transaction"}
                    </h2>

                    <p className="mt-4 text-[10px] font-medium leading-relaxed tracking-tight text-neutral-400">
                        {state.message}
                    </p>
                </div>

                <div className="mt-10 flex flex-col gap-3">
                    <button
                        onClick={() => {
                            state.onConfirm();
                            closeConfirmation();
                        }}
                        className={`w-full rounded-2xl py-4 text-[10px] font-bold uppercase tracking-[0.2em] transition-all active:scale-[0.98] ${isDanger
                            ? "bg-red-500 text-white shadow-lg shadow-red-500/20 hover:bg-red-600"
                            : "bg-neutral-900 text-white hover:bg-black shadow-xl shadow-neutral-900/10"
                            }`}
                    >
                        {state.confirmText || "Confirm"}
                    </button>

                    <button
                        onClick={closeConfirmation}
                        className="w-full rounded-2xl py-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-300 transition-colors hover:text-neutral-900 active:scale-[0.99]"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}