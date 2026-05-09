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
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={clearActiveChat} className="p-1.5 hover:bg-white/20 rounded-full transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="font-bold text-sm leading-none">
                                {activeChat.customerName ? activeChat.customerName : activeChat.stallName}
                            </h3>
                            {isOnline && <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.6)]" />}
                        </div>
                        <p className="text-[10px] text-orange-100 uppercase tracking-wider font-bold mt-1">
                            {isOnline ? 'Active now' : getRoleLabel()}
                        </p>
                    </div>
                </div>
                <button onClick={closeChat} className="p-1 hover:bg-white/20 rounded-full transition">
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Messages Area */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 relative">
                {isLoadingMessages ? (
                    <div className="flex justify-center items-center h-full text-gray-400">
                        <span className="animate-pulse text-sm">Loading messages...</span>
                    </div>
                ) : (
                    <>
                        {/* Profile Starting Section */}
                        <div className="flex flex-col items-center py-14 px-4 text-center">
                            <div className="relative mb-5 group/profile">
                                <Avatar
                                    src={activeChat.customerImage || activeChat.stallImage}
                                    name={activeChat.customerName || activeChat.stallName}
                                    size="lg"
                                    className="w-28 h-28 shadow-2xl border-4 border-white ring-1 ring-gray-100 transition-transform group-hover/profile:scale-105 duration-300"
                                />
                                <div className={`absolute bottom-1.5 right-1.5 w-7 h-7 border-4 border-white rounded-full shadow-sm transition-all duration-500
                                    ${isOnline ? 'bg-green-500 scale-110 shadow-[0_0_12px_rgba(34,197,94,0.4)]' : 'bg-gray-400'}`}>
                                </div>
                            </div>

                            <div className="space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                                    {activeChat.customerName || activeChat.stallName}
                                </h2>
                                <p className="text-[14px] text-gray-500 font-semibold uppercase tracking-widest flex items-center justify-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-orange-500 rounded-full"></span>
                                    {getRoleLabel()}
                                </p>
                                <p className="text-[13px] text-gray-400 font-medium">
                                    Member since {new Date().getFullYear()}
                                </p>
                            </div>

                            <div className="flex gap-3 mt-8 animate-in fade-in slide-in-from-bottom-3 duration-700">
                                {!activeChat.customerName && (
                                    <button
                                        onClick={() => {
                                            router.push(`/stall?name=${activeChat.stallName}`);
                                            closeChat();
                                        }}
                                        className="flex items-center gap-2.5 px-6 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 text-[13px] font-bold rounded-full shadow-sm hover:shadow transition-all active:scale-95"
                                    >
                                        <User className="w-4 h-4 text-gray-400" />
                                        View Profile
                                    </button>
                                )}
                            </div>
                        </div>

                        {messages.length === 0 ? (
                            <div className="py-10 text-center">
                                <p className="text-[13px] text-gray-400 font-medium italic">
                                    Send a message to start chatting with {activeChat.customerName || activeChat.stallName}
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
            < form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0" >
                <input
                    type="text"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                />
                <button
                    type="submit"
                    disabled={!content.trim() || sendMessage.isPending}
                    className="bg-orange-500 text-white p-2.5 rounded-full hover:bg-orange-600 transition disabled:opacity-50 disabled:hover:bg-orange-500 flex-shrink-0"
                >
                    <Send className="w-4 h-4" />
                </button>
            </form >
        </>
    );
}
