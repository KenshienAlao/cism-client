'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ActiveChat {
    stallId: number;
    stallName: string;
    stallImage?: string | null;
    customerId?: number;
    customerName?: string;
    customerImage?: string | null;
}

interface ChatContextType {
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    activeChat: ActiveChat | null;
    openChat: (chat: ActiveChat) => void;
    closeChat: () => void;
    toggleChat: () => void;
    clearActiveChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);

    const openChat = (chat: ActiveChat) => {
        setActiveChat(chat);
        setIsOpen(true);
    };

    const closeChat = () => {
        setIsOpen(false);
        setActiveChat(null);
    };

    const toggleChat = () => {
        if (isOpen) {
            setIsOpen(false);
        } else {
            setIsOpen(true);
        }
    };

    const clearActiveChat = () => {
        setActiveChat(null);
    };

    return (
        <ChatContext.Provider value={{ isOpen, setIsOpen, activeChat, openChat, closeChat, toggleChat, clearActiveChat }}>
            {children}
        </ChatContext.Provider>
    );
}

export function useGlobalChat() {
    const context = useContext(ChatContext);
    if (context === undefined) {
        throw new Error('useGlobalChat must be used within a ChatProvider');
    }
    return context;
}
