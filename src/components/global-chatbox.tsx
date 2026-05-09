'use client';

import { useAuth } from '@/hooks/use-auth';
import { useChatThreads } from '@/hooks/use-chat';
import { useGlobalChat } from '@/provider/chat-provider';
import { MessageCircle } from 'lucide-react';
import { ActiveChatView } from './chat/active-chat-view';
import { InboxView } from './chat/inbox-view';

export function GlobalChatbox() {
    const { profile } = useAuth();
    const { isOpen, toggleChat, activeChat } = useGlobalChat();
    const { data: threads = [] } = useChatThreads();

    if (!profile) return null;

    return (
        <>
            {isOpen ? (
                <div className="fixed inset-0 md:inset-auto md:bottom-0 md:right-4 z-[10000] w-full h-[100dvh] md:w-[700px] md:h-[800px] md:max-h-[85vh] shadow-2xl rounded-t-2xl flex flex-col overflow-hidden border-0 md:border border-gray-200/50 bg-white animate-in slide-in-from-bottom-4 md:zoom-in-95 duration-300 ease-out">
                    {activeChat ? <ActiveChatView /> : <InboxView />}
                </div>
            ) : (
                <div className="fixed bottom-28 md:bottom-6 right-4 md:right-6 z-[9999]">
                    <button
                        onClick={toggleChat}
                        className="relative bg-orange-500 text-white p-4 rounded-full hover:bg-orange-600 hover:scale-105 transition-all duration-200 border-4 border-white"
                    >
                        <MessageCircle className="w-7 h-7" />
                        {threads.some(t => t.isUnread) && (
                            <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 border-2 border-white rounded-full animate-bounce"></span>
                        )}
                    </button>
                </div>
            )}
        </>
    );
}
