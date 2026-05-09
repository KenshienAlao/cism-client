import { useState, useRef, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChatHistory, useSendMessage, useMarkAsRead, useDeleteMessage } from '@/hooks/use-chat';
import { useGlobalChat } from '@/provider/chat-provider';
import { ArrowLeft, X, Send } from 'lucide-react';
import { MessageBubble } from './message-bubble';

export function ActiveChatView() {
    const { profile } = useAuth();
    const { closeChat, activeChat, clearActiveChat } = useGlobalChat();
    const [content, setContent] = useState('');
    const [activeMessageMenu, setActiveMessageMenu] = useState<number | null>(null);

    const { data: messages = [], isLoading: isLoadingMessages } = useChatHistory(
        activeChat?.stallId,
        activeChat?.customerId
    );
    const sendMessage = useSendMessage();
    const markAsRead = useMarkAsRead();
    const deleteMessage = useDeleteMessage();
    
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Close message menu on click away or scroll
    useEffect(() => {
        const handleClick = () => setActiveMessageMenu(null);
        if (activeMessageMenu !== null) {
            document.addEventListener('click', handleClick);
            const container = chatContainerRef.current;
            if (container) {
                container.addEventListener('scroll', handleClick);
            }
            return () => {
                document.removeEventListener('click', handleClick);
                if (container) {
                    container.removeEventListener('scroll', handleClick);
                }
            };
        }
    }, [activeMessageMenu]);

    const handleDeleteMessage = useCallback((msgId: number) => {
        deleteMessage.mutate(msgId);
        setActiveMessageMenu(null);
    }, [deleteMessage]);

    useEffect(() => {
        if (activeChat && profile?.user) {
            scrollToBottom();
            const unreadCount = messages.filter(m => !m.isRead && m.senderId !== profile?.user?.id).length;
            if (unreadCount > 0) {
                markAsRead.mutate({ stallId: activeChat.stallId, customerId: activeChat.customerId });
            }
        }
    }, [messages, activeChat, profile?.user?.id, markAsRead]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !profile || !activeChat) return;

        sendMessage.mutate({
            stallId: activeChat.stallId,
            customerId: activeChat.customerId,
            content,
        });
        setContent('');
    };

    if (!activeChat || !profile) return null;

    return (
        <>
            {/* Header */}
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-3 flex justify-between items-center shadow-md shrink-0">
                <div className="flex items-center gap-3">
                    <button onClick={clearActiveChat} className="p-1.5 hover:bg-white/20 rounded-full transition">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h3 className="font-semibold text-sm">
                            {activeChat.customerName ? activeChat.customerName : activeChat.stallName}
                        </h3>
                        <p className="text-[10px] text-orange-100">
                            {activeChat.customerName ? 'Customer' : 'Stall'}
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
                ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-gray-400 text-sm text-center">
                        No messages yet.<br />Send a message to start chatting!
                    </div>
                ) : (
                    messages.map((msg, idx) => {
                        const isMe = msg.senderId === profile?.user?.id || msg.status === 'sending';
                        const prevMsg = idx > 0 ? messages[idx - 1] : null;
                        const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;

                        const prevIsMe = prevMsg ? (prevMsg.senderId === profile?.user?.id || prevMsg.status === 'sending') : false;
                        const nextIsMe = nextMsg ? (nextMsg.senderId === profile?.user?.id || nextMsg.status === 'sending') : false;

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
                            />
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center gap-2 shrink-0">
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
            </form>
        </>
    );
}
