"use client";
import { createContext, ReactNode, useContext, useState } from "react";

interface ConfirmationState {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    type?: "danger" | "primary";
    onConfirm: () => void;
}

interface ConfirmationContextType {
    showConfirmation: (params: Omit<ConfirmationState, "isOpen">) => void;
    closeConfirmation: () => void;
    state: ConfirmationState;
}

const ConfirmationContext = createContext<ConfirmationContextType | undefined>(undefined);

export function ConfirmationProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<ConfirmationState>({
        isOpen: false,
        title: "",
        message: "",
        onConfirm: () => { },
    });

    const showConfirmation = (params: Omit<ConfirmationState, "isOpen">) => {
        setState({ ...params, isOpen: true });
    };

    const closeConfirmation = () => {
        setState(prev => ({ ...prev, isOpen: false }));
    };

    return (
        <ConfirmationContext.Provider value={{ showConfirmation, closeConfirmation, state }}>
            {children}
        </ConfirmationContext.Provider>
    );
}

export const useConfirmation = () => {
    const context = useContext(ConfirmationContext);
    if (!context) {
        throw new Error("useConfirmation must be used within a ConfirmationProvider");
    }
    return context;
}