'use client';

import { useAuth } from '@/hooks/use-auth';
import { useChatThreads } from '@/hooks/use-chat';
import { useGlobalChat } from '@/provider/chat-provider';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { ActiveChatView } from './chat/active-chat-view';
import { InboxView } from './chat/inbox-view';
import { usePathname } from 'next/navigation';

import { useRef, useState, useEffect } from 'react';
import { useDraggable } from '@/hooks/use-draggable';
import { motion, AnimatePresence } from 'framer-motion';

export function GlobalChatbox() {
    const { profile, isLoading: isAuthPending } = useAuth();
    const { isOpen, toggleChat, activeChat } = useGlobalChat();
    const { data: threads = [], isPending: isThreadsPending } = useChatThreads();
    const pathname = usePathname();

    const windowRef = useRef<HTMLDivElement>(null);
    const buttonRef = useRef<HTMLDivElement>(null);

    const windowDraggable = useDraggable(windowRef, 'cism-client-chat-window-pos');
    const buttonDraggable = useDraggable(buttonRef, 'cism-client-chat-button-pos');

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (isOpen && isMobile) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, isMobile]);

    const hideOnRoutesChatbox = [
        "/login",
        "/register",
    ];

    if (isAuthPending || isThreadsPending || !profile || hideOnRoutesChatbox.includes(pathname)) return null;

    const unreadCount = threads.filter(t => t.isUnread).length;
    const hasUnread = unreadCount > 0;

    return (
        <>
            <AnimatePresence mode="wait">
                {isOpen ? (
                    <motion.div
                        key="chat-window-wrapper"
                        initial={{ opacity: 0, y: isMobile ? 20 : 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: isMobile ? 20 : 10 }}
                        transition={{ duration: 0.15, ease: 'easeOut' }}
                        className="fixed inset-0 md:inset-auto md:bottom-6 md:right-6 z-100 pointer-events-none"
                    >
                        <div
                            ref={windowRef}
                            style={isMobile ? {} : windowDraggable.style}
                            className="pointer-events-auto w-full h-dvh md:w-[400px] md:h-[580px] flex flex-col overflow-hidden border-0 md:border border-border bg-background md:rounded-lg text-foreground select-none shadow-2xl"
                        >
                            <div
                                onMouseDown={!isMobile ? windowDraggable.handleMouseDown as any : undefined}
                                onTouchStart={!isMobile ? windowDraggable.handleTouchStart as any : undefined}
                                className={`h-9 px-3 w-full flex items-center justify-between bg-secondary border-b border-border shrink-0 ${
                                    !isMobile ? 'cursor-grab active:cursor-grabbing' : ''
                                }`}
                            >
                                <div className="flex items-center gap-1.5 text-xs text-secondary-foreground font-medium">
                                    <span className={`w-1.5 h-1.5 rounded-full ${hasUnread ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                                    Messages
                                </div>
                                
                                {/* Window Actions */}
                                <div className="flex items-center gap-1">
                                    <button 
                                        onClick={toggleChat}
                                        className="p-1 rounded-md text-secondary-foreground hover:bg-background transition-colors"
                                        title="Minimize"
                                    >
                                        <Minimize2 className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>

                            {/* View Container with structural view transitions */}
                            <div className="flex-1 overflow-hidden relative bg-card text-card-foreground">
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={activeChat ? `chat-${activeChat}` : 'inbox'}
                                        initial={{ opacity: 0, x: activeChat ? 10 : -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: activeChat ? -10 : 10 }}
                                        transition={{ duration: 0.12, ease: 'easeInOut' }}
                                        className="w-full h-full flex flex-col"
                                    >
                                        {activeChat ? <ActiveChatView /> : <InboxView />}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="chat-trigger-wrapper"
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed bottom-6 right-6 z-50 pointer-events-none"
                    >
                        <div
                            ref={buttonRef}
                            style={buttonDraggable.style}
                            onMouseDown={buttonDraggable.handleMouseDown as any}
                            onTouchStart={buttonDraggable.handleTouchStart as any}
                            className="pointer-events-auto cursor-grab active:cursor-grabbing select-none"
                        >
                            <button
                                onClick={() => {
                                    if (!buttonDraggable.hasMoved) {
                                        toggleChat();
                                    }
                                }}
                                className="relative bg-orange-500 hover:bg-orange-600 text-white p-3 border border-orange-600 rounded-lg transition-colors pointer-events-auto flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                            >
                                <MessageCircle className="w-5 h-5" />
                                {hasUnread && (
                                    <span className="absolute -top-1.5 -right-1.5 min-w-[20px] h-[20px] px-1 bg-white text-orange-600 text-[10px] font-bold rounded-full flex items-center justify-center shadow-md border border-orange-100">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}