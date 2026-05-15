import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChatHistory, useSendMessage, useMarkAsRead, useDeleteMessage } from '@/hooks/use-chat';
import { useGlobalChat } from '@/provider/chat-provider';
import { useRouter } from 'next/navigation';
import { ArrowLeft, X, Send, User, Circle } from 'lucide-react';
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
        staleTime: Infinity, // Rely on WebSocket updates
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
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Mark as read — fires whenever unread stall messages exist (covers new incoming messages)
    useEffect(() => {
        if (!activeChat || !profile?.user || messages.length === 0) return;

        const unreadCount = messages.filter(m => !m.readByCustomer && m.sentByStall).length;
        if (unreadCount > 0) {
            markAsRead.mutate({ stallId: activeChat.stallId, customerId: activeChat.customerId });
        }
    }, [activeChat?.stallId, activeChat?.customerId, messages.length]);


    // Scroll to bottom on new messages
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

    // Close menu on scroll/click
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
        <>
            {/* Header */}
            <div className="bg-white border-b border-neutral-100 p-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={clearActiveChat} className="p-1.5 active:bg-neutral-50 rounded-md transition-colors text-neutral-400">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-widest leading-none">
                                {activeChat.customerName ? activeChat.customerName : activeChat.stallName}
                            </h3>
                            {isOnline && <div className="w-2 h-2 bg-emerald-500 rounded-full" />}
                        </div>
                        <p className="text-[9px] text-orange-500 uppercase tracking-widest font-bold mt-1">
                            {isOnline ? 'Online' : getRoleLabel()}
                        </p>
                    </div>
                </div>
                <button onClick={closeChat} className="p-1.5 active:bg-neutral-50 rounded-md transition-colors text-neutral-400">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-neutral-50 relative">
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full text-neutral-300">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>
                    </div>
                ) : (
                    <>
                        {/* Profile Starting Section */}
                        <div className="flex flex-col items-center py-16 px-6 text-center">
                            <div className="relative mb-6">
                                <Avatar
                                    src={activeChat.customerImage || activeChat.stallImage}
                                    name={activeChat.customerName || activeChat.stallName}
                                    size="lg"
                                    className="w-24 h-24 rounded-md border border-neutral-100"
                                />
                                <div className={`absolute -bottom-1 -right-1 w-5 h-5 border-4 border-neutral-50 rounded-full
                                    ${isOnline ? 'bg-emerald-500' : 'bg-neutral-300'}`}>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <h2 className="text-xl font-bold text-neutral-900 uppercase tracking-tight">
                                    {activeChat.customerName || activeChat.stallName}
                                </h2>
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                                    {getRoleLabel()}
                                </p>
                            </div>

                            <div className="mt-8">
                                {!activeChat.customerName && (
                                    <button
                                        onClick={() => {
                                            router.push(`/stall?name=${activeChat.stallName}`);
                                            closeChat();
                                        }}
                                        className="flex items-center gap-2 px-6 py-2.5 bg-white border border-neutral-100 text-neutral-900 text-[10px] font-bold uppercase tracking-widest rounded-md active:bg-neutral-50 transition-colors"
                                    >
                                        <User className="w-3.5 h-3.5 text-orange-500" />
                                        View Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {messages.length === 0 ? (
                            <div className="py-12 text-center">
                                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest">
                                    No conversation yet
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
                                // A message is "mine" (from customer) when sentByStall === false, or it's optimistic
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
            </div >

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-neutral-100 flex items-center gap-2 shrink-0">
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-neutral-50 text-[11px] font-bold uppercase tracking-widest rounded-md px-4 py-3 focus:outline-none focus:bg-white focus:ring-1 focus:ring-orange-500/20 transition-all placeholder:text-neutral-300 placeholder:font-medium"
                />
                <button
                    type="submit"
                    disabled={!content.trim() || sendMessage.isPending}
                    className="bg-orange-500 text-white p-3 rounded-md active:bg-orange-600 transition-colors disabled:opacity-50 shrink-0"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form>
        </>
    );
}
