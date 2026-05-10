'use client';

import { useAuth } from '@/hooks/use-auth';
import { useChatThreads } from '@/hooks/use-chat';
import { useGlobalChat } from '@/provider/chat-provider';
import { MessageCircle } from 'lucide-react';
import { ActiveChatView } from './chat/active-chat-view';
import { InboxView } from './chat/inbox-view';
import { usePathname } from 'next/navigation';

import { useRef, useState, useEffect } from 'react';
import { useDraggable } from '@/hooks/use-draggable';

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

    // Disable background scroll when chat is open on mobile
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
    ]

    if (isAuthPending || isThreadsPending || !profile || hideOnRoutesChatbox.includes(pathname)) return null;

    return (
        <>
            {isOpen ? (
                <div
                    ref={windowRef}
                    style={isMobile ? {} : windowDraggable.style}
                    className="fixed inset-0 md:inset-auto md:bottom-0 md:right-6 z-[110] w-full h-[100dvh] md:w-[450px] md:h-[600px] md:max-h-[85vh] flex flex-col overflow-hidden border-0 md:border border-neutral-100 bg-white md:rounded-t-lg shadow-2xl animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-300 ease-out select-none"
                >
                    {/* Drag Handle for Window - only visible and usable on desktop */}
                    <div
                        onMouseDown={!isMobile ? windowDraggable.handleMouseDown as any : undefined}
                        onTouchStart={!isMobile ? windowDraggable.handleTouchStart as any : undefined}
                        className={`h-2 w-full flex items-center justify-center bg-neutral-50/50 transition-colors shrink-0 ${!isMobile ? 'cursor-grab active:cursor-grabbing hover:bg-neutral-100' : 'hidden md:flex'}`}
                    >
                        <div className="w-10 h-1 bg-neutral-200 rounded-full" />
                    </div>
                    {activeChat ? <ActiveChatView /> : <InboxView />}
                </div>
            ) : (
                <div
                    ref={buttonRef}
                    style={buttonDraggable.style}
                    onMouseDown={buttonDraggable.handleMouseDown as any}
                    onTouchStart={buttonDraggable.handleTouchStart as any}
                    className="fixed bottom-24 md:bottom-6 right-4 md:right-6 z-[120] cursor-grab active:cursor-grabbing select-none"
                >
                    <button
                        onClick={() => {
                            if (!buttonDraggable.hasMoved) {
                                toggleChat();
                            }
                        }}
                        className="relative bg-orange-500 rounded-full text-white p-3.5 border-4 border-white shadow-xl transition-all duration-200 active:scale-95 pointer-events-auto"
                    >
                        <MessageCircle className="w-6 h-6" />
                        {threads.some(t => t.isUnread) && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 border-2 border-white rounded-full animate-bounce"></span>
                        )}
                    </button>
                </div>
            )}
        </>
    );
}
