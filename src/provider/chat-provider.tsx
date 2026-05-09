'use client';

import { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';

interface ActiveChat {
    stallId: number;
    stallName: string;
    stallImage?: string | null;
    stallRole?: string;
    customerId?: number;
    customerName?: string;
    customerImage?: string | null;
    conversationId?: string;
    status?: 'active' | 'away' | 'offline';
    lastActive?: string;
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
    const { profile } = useAuth();
    const prevUserId = useRef(profile?.user?.id);

    useEffect(() => {
        if (profile?.user?.id !== prevUserId.current) {
            setActiveChat(null);
            setIsOpen(false);
            prevUserId.current = profile?.user?.id;
        }
    }, [profile?.user?.id]);

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
