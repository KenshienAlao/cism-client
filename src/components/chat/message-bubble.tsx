import { ChatMessage } from '@/hooks/use-chat';
import { Avatar } from '@/components/ui/avatar';
import { Check, Circle, Trash2, Ban, MoreVertical } from 'lucide-react';

interface MessageBubbleProps {
    msg: ChatMessage;
    isMe: boolean;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
    activeMessageMenu: number | null;
    setActiveMessageMenu: (id: number | null) => void;
    handleDeleteMessage: (id: number) => void;
    activeChat: any;
}

export function MessageBubble({
    msg, isMe, isFirstInGroup, isLastInGroup, activeMessageMenu, setActiveMessageMenu, handleDeleteMessage, activeChat
}: MessageBubbleProps) {
    const showName = isFirstInGroup && !isMe;
    const bubbleCorners = isMe
        ? `${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-md'} ${isLastInGroup ? 'rounded-bl-2xl rounded-br-md' : 'rounded-b-md'} rounded-l-2xl`
        : `${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-md'} ${isLastInGroup ? 'rounded-br-2xl rounded-bl-md' : 'rounded-b-md'} rounded-r-2xl`;

    if (msg.isDeleted) {
        return (
            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isLastInGroup ? 'mb-2' : 'mb-0.5'}`}>
                <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50">
                    <Ban className="w-3.5 h-3.5 text-gray-300" />
                    <span className="text-[13px] italic text-gray-400">
                        {isMe ? 'You removed a message' : `${msg.senderName} removed a message`}
                    </span>
                </div>
            </div>
        );
    }

    return (
        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} ${isLastInGroup ? 'mb-2' : 'mb-0.5'}`}>
            {showName && (
                <span className="text-[10px] text-gray-400 mb-1 ml-2 font-semibold uppercase tracking-wider">
                    {msg.senderName}
                </span>
            )}

            <div className={`flex items-end gap-2 max-w-[85%] group relative ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && isLastInGroup && (
                    <Avatar
                        src={activeChat?.stallId === msg.senderId ? activeChat?.stallImage : (activeChat?.customerId === msg.senderId ? activeChat?.customerImage : '')}
                        name={msg.senderName}
                        size="xs"
                        className="mb-1"
                    />
                )}
                {!isMe && !isLastInGroup && <div className="w-6" />}

                <div className="flex flex-col items-end relative">
                    <div className="flex items-center gap-2">
                        {/* Options Button */}
                        {isMe && msg.status !== 'sending' && (
                            <div className="relative">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveMessageMenu(activeMessageMenu === msg.id ? null : msg.id);
                                    }}
                                    className={`p-1.5 text-gray-400 hover:bg-gray-100 rounded-full transition-all md:opacity-0 md:group-hover:opacity-100 ${activeMessageMenu === msg.id ? 'opacity-100 bg-gray-100' : ''}`}
                                >
                                    <MoreVertical className="w-4 h-4" />
                                </button>

                                {activeMessageMenu === msg.id && (
                                    <div
                                        className="absolute right-8 bottom-0 z-50 bg-white rounded-xl shadow-xl border border-gray-100 py-1.5 min-w-[120px] animate-in fade-in zoom-in-95 duration-150"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="font-medium">Remove</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        <div className={`
                            px-4 py-2 text-[13.5px] leading-relaxed shadow-sm transition-all duration-200 cursor-default select-text break-words whitespace-pre-wrap
                            ${bubbleCorners}
                            ${isMe
                                ? (msg.status === 'sending'
                                    ? 'bg-orange-200 text-orange-700/70 animate-pulse'
                                    : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white')
                                : 'bg-[#F0F2F5] text-[#050505]'
                            }
                        `}>
                            {msg.content}
                        </div>
                    </div>

                    {/* Status Indicators */}
                    {isMe && isLastInGroup && (
                        <div className="mt-1">
                            {msg.status === 'sending' ? (
                                <Circle className="w-3 h-3 text-orange-300" strokeWidth={1.5} />
                            ) : msg.isRead ? (
                                <Avatar
                                    src={activeChat?.stallImage || activeChat?.customerImage}
                                    name={activeChat?.stallName || activeChat?.customerName}
                                    size="xs"
                                    className="w-3.5 h-3.5 border border-white"
                                />
                            ) : (
                                <div className="bg-gray-200 rounded-full p-0.5">
                                    <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isLastInGroup && (
                <span className={`text-[9px] text-gray-400 mt-1 ${isMe ? 'mr-1' : 'ml-8'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
            )}
        </div>
    );
}
