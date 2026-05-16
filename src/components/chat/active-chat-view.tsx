'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChatHistory, useSendMessage, useMarkAsRead, useDeleteMessage } from '@/hooks/use-chat';
import { useGlobalChat } from '@/provider/chat-provider';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Send, User } from 'lucide-react';
import { MessageBubble } from './message-bubble';
import { Avatar } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/config/api.config';

export function ActiveChatView() {
    const router = useRouter();
    const { profile } = useAuth();
    const { closeChat, activeChat, clearActiveChat } = useGlobalChat();
    const [content, setContent] = useState('');
    const [activeMessageMenu, setActiveMessageMenu] = useState<number | null>(null);

    // Fetch Presence Status
    const { data: presence } = useQuery<any>({
        queryKey: ['presence', activeChat?.stallId, 'STALL'],
        queryFn: async () => {
            const res = await apiClient.get<any>(`/api/v1/chat/presence/STALL/${activeChat?.stallId}`);
            return res.data;
        },
        enabled: !!activeChat?.stallId,
        staleTime: Infinity,
    });

    const { data: messages = [], isLoading: isLoadingMessages } = useChatHistory(
        activeChat?.stallId,
        activeChat?.customerId,
        activeChat?.conversationId
    );
    const sendMessage = useSendMessage();
    const markAsRead = useMarkAsRead();
    const deleteMessage = useDeleteMessage();

    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const isOnline = presence?.isOnline;

    const getRoleLabel = () => {
        if (activeChat?.customerName) return 'Business';
        if (activeChat?.stallRole === 'BUSINESS') return 'Business Stall';
        if (activeChat?.stallRole === 'STALL') return 'Food Stall';
        return 'Stall';
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!activeChat || !profile?.user || messages.length === 0) return;

        const unreadCount = messages.filter(m => !m.readByCustomer && m.sentByStall).length;
        if (unreadCount > 0) {
            markAsRead.mutate({ stallId: activeChat.stallId, customerId: activeChat.customerId });
        }
    }, [activeChat?.stallId, activeChat?.customerId, messages.length]);

    useEffect(() => {
        if (messages.length > 0) {
            scrollToBottom();
        }
    }, [messages.length]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !profile || !activeChat) return;

        sendMessage.mutate({
            stallId: activeChat.stallId,
            customerId: activeChat.customerId,
            conversationId: activeChat.conversationId,
            content,
        });
        setContent('');
    };

    const handleDeleteMessage = useCallback((msgId: number, forMe: boolean) => {
        deleteMessage.mutate({ messageId: msgId, forMe });
        setActiveMessageMenu(null);
    }, [deleteMessage]);

    useEffect(() => {
        const handleClick = () => setActiveMessageMenu(null);
        if (activeMessageMenu !== null) {
            document.addEventListener('click', handleClick);
            const container = chatContainerRef.current;
            if (container) container.addEventListener('scroll', handleClick);
            return () => {
                document.removeEventListener('click', handleClick);
                if (container) container.removeEventListener('scroll', handleClick);
            };
        }
    }, [activeMessageMenu]);

    if (!activeChat || !profile) return null;

    return (
        <div className="flex flex-col h-full bg-background text-foreground">
            <div className="bg-card border-b border-border p-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-2.5">
                    <button 
                        onClick={clearActiveChat} 
                        className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                    </button>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-sm font-semibold text-card-foreground leading-tight truncate max-w-[180px] md:max-w-[220px]">
                                {activeChat.customerName ? activeChat.customerName : activeChat.stallName}
                            </h3>
                            {isOnline && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-md shrink-0" />}
                        </div>
                        <p className="text-[11px] font-medium text-orange-500 mt-0.5">
                            {isOnline ? 'Online' : getRoleLabel()}
                        </p>
                    </div>
                </div>
                <button 
                    onClick={closeChat} 
                    className="p-1 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>

            <div 
                ref={chatContainerRef} 
                className="flex-1 overflow-y-auto p-4 space-y-3 bg-background relative"
            >
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full text-muted-foreground">
                        <span className="text-xs font-medium tracking-wide">Loading messages...</span>
                    </div>
                ) : (
                    <>
                        <div className="flex flex-col items-center py-8 px-4 text-center border-b border-border/40 mb-4 bg-card/20 rounded-lg p-4">
                            <div className="relative mb-3 shrink-0">
                                <Avatar
                                    src={activeChat.customerImage || activeChat.stallImage}
                                    name={activeChat.customerName || activeChat.stallName}
                                    size="2xl"
                                    className="border border-border"
                                />
                                <div className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 border-2 border-card rounded-md
                                    ${isOnline ? 'bg-emerald-500' : 'bg-muted-foreground/40'}`}>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <h2 className="text-base font-bold text-foreground">
                                    {activeChat.customerName || activeChat.stallName}
                                </h2>
                                <p className="text-xs text-muted-foreground font-medium">
                                    {getRoleLabel()}
                                </p>
                            </div>

                            {!activeChat.customerName && (
                                <button
                                    onClick={() => {
                                        router.push(`/stall?name=${activeChat.stallName}`);
                                        closeChat();
                                    }}
                                    className="mt-3 flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-secondary-foreground text-xs font-medium rounded-md hover:bg-secondary/80 transition-colors border border-border"
                                >
                                    <User className="w-3.5 h-3.5 text-orange-500" />
                                    View Profile
                                </button>
                            )}
                        </div>
                        {messages.length === 0 ? (
                            <div className="py-8 text-center">
                                <p className="text-xs text-muted-foreground font-medium">
                                    No conversation history yet
                                </p>
                            </div>
                        ) : (() => {
                            const lastMsg = messages[messages.length - 1];
                            const lastMsgIsFromOther = lastMsg && (lastMsg.sentByStall && lastMsg.status !== 'sending');

                            const lastReadMessageId = lastMsgIsFromOther
                                ? null
                                : [...messages]
                                    .reverse()
                                    .find(m => (!m.sentByStall) && m.readByStall)
                                    ?.id;

                            return messages.map((msg, idx) => {
                                const isMe = !msg.sentByStall || msg.status === 'sending';
                                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;

                                const prevIsMe = prevMsg ? (!prevMsg.sentByStall || prevMsg.status === 'sending') : false;
                                const nextIsMe = nextMsg ? (!nextMsg.sentByStall || nextMsg.status === 'sending') : false;

                                const isFirstInGroup = !prevMsg || prevIsMe !== isMe;
                                const isLastInGroup = !nextMsg || nextIsMe !== isMe;

                                return (
                                    <MessageBubble
                                        key={msg.id}
                                        msg={msg}
                                        isMe={isMe}
                                        isFirstInGroup={isFirstInGroup}
                                        isLastInGroup={isLastInGroup}
                                        activeMessageMenu={activeMessageMenu}
                                        setActiveMessageMenu={setActiveMessageMenu}
                                        handleDeleteMessage={handleDeleteMessage}
                                        activeChat={activeChat}
                                        isLastRead={msg.id === lastReadMessageId}
                                    />
                                );
                            });
                        })()}
                    </>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-3 bg-card border-t border-border flex items-center gap-2 shrink-0">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-input border border-border text-sm rounded-md px-3 py-2 text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                />
                <button
                    type="submit"
                    disabled={!content.trim() || sendMessage.isPending}
                    className="bg-orange-500 hover:bg-orange-600 disabled:hover:bg-orange-500 text-white p-2 rounded-md transition-colors disabled:opacity-40 shrink-0 flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </div>
    );
}