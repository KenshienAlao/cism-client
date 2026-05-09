'use client';

import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChatHistory, useSendMessage } from '@/hooks/use-chat';
import { MessageCircle, X, Send } from 'lucide-react';

interface ChatboxProps {
    stallId: number;
    stallName: string;
    isOpen: boolean;
    onClose: () => void;
}

export function Chatbox({ stallId, stallName, isOpen, onClose }: ChatboxProps) {
    const { profile } = useAuth();
    const [content, setContent] = useState('');

    const { data: messages = [], isLoading } = useChatHistory(isOpen ? stallId : undefined);
    const sendMessage = useSendMessage();

    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim() || !profile) return;

        sendMessage.mutate({
            stallId,
            content,
        });
        setContent('');
    };

    if (!profile) return null;
    return (
        <div className="fixed bottom-6 right-6 z-50">
            {isOpen ? (
                <div className="w-80 md:w-96 bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-100 h-[28rem]">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 flex justify-between items-center shadow-md">
                        <div>
                            <h3 className="font-semibold">{stallName}</h3>
                            <p className="text-xs text-orange-100">Chat with Stall</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1 hover:bg-white/20 rounded-full transition"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {isLoading ? (
                            <div className="flex justify-center items-center h-full text-gray-400">
                                <span className="animate-pulse">Loading messages...</span>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="flex justify-center items-center h-full text-gray-400 text-sm text-center">
                                No messages yet.<br />Send a message to start chatting!
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isMe = msg.senderId === profile.user.id;
                                const showName = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId);

                                return (
                                    <div key={msg.id} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                        {showName && (
                                            <span className="text-xs text-gray-500 mb-1 ml-1">
                                                {msg.senderName}
                                            </span>
                                        )}
                                        <div className={`
                                            max-w-[80%] rounded-2xl px-4 py-2 text-sm
                                            ${isMe
                                                ? 'bg-orange-500 text-white rounded-br-none'
                                                : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                                            }
                                        `}>
                                            {msg.content}
                                        </div>
                                        <span className="text-[10px] text-gray-400 mt-1 mx-1">
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                                        </span>
                                    </div>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSend}
                        className="p-3 bg-white border-t border-gray-100 flex items-center gap-2"
                    >
                        <input
                            type="text"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 bg-gray-100 text-sm rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                        />
                        <button
                            type="submit"
                            disabled={!content.trim() || sendMessage.isPending}
                            className="bg-orange-500 text-white p-2.5 rounded-full hover:bg-orange-600 transition disabled:opacity-50 disabled:hover:bg-orange-500 flex-shrink-0"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            ) : null}
        </div>
    );
}
