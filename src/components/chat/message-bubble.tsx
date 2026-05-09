import { ChatMessage } from '@/hooks/use-chat';
import { Avatar } from '@/components/ui/avatar';
import { Check, Circle, Trash2, Ban, MoreVertical } from 'lucide-react';
import { useRef, useState } from 'react';

interface MessageBubbleProps {
    msg: ChatMessage;
    isMe: boolean;
    isFirstInGroup: boolean;
    isLastInGroup: boolean;
    activeMessageMenu: number | null;
    setActiveMessageMenu: (id: number | null) => void;
    handleDeleteMessage: (id: number, forMe: boolean) => void;
    activeChat: any;
    isLastRead?: boolean;
}

export function MessageBubble({
    msg, isMe, isFirstInGroup, isLastInGroup, activeMessageMenu, setActiveMessageMenu, handleDeleteMessage, activeChat, isLastRead
}: MessageBubbleProps) {
    const showName = isFirstInGroup && !isMe;
    const bubbleCorners = isMe
        ? `${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-md'} ${isLastInGroup ? 'rounded-bl-2xl rounded-br-md' : 'rounded-b-md'} rounded-l-2xl`
        : `${isFirstInGroup ? 'rounded-t-2xl' : 'rounded-t-md'} ${isLastInGroup ? 'rounded-br-2xl rounded-bl-md' : 'rounded-b-md'} rounded-r-2xl`;

    const [menuDirection, setMenuDirection] = useState<'up' | 'down'>('up');
    const buttonRef = useRef<HTMLDivElement>(null);

    const isImage = (url: string) => {
        return url.match(/\.(jpeg|jpg|gif|png|webp|svg)$/) != null || url.startsWith('data:image/');
    };

    const handleMenuToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeMessageMenu !== msg.id) {
            if (buttonRef.current) {
                const rect = buttonRef.current.getBoundingClientRect();
                // If there's less than 200px space above, open downwards
                setMenuDirection(rect.top < 200 ? 'down' : 'up');
            }
            setActiveMessageMenu(msg.id);
        } else {
            setActiveMessageMenu(null);
        }
    };

    if (msg.isDeleted) {
        return (
            <div className={`flex flex-col relative group ${isMe ? 'items-end' : 'items-start'} ${isLastInGroup ? 'mb-2' : 'mb-0.5'}`}>
                <div className="flex items-center gap-2 relative group/msg">
                    <div className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-dashed border-gray-200 bg-gray-50/50">
                        <Ban className="w-3.5 h-3.5 text-gray-300" />
                        <span className="text-[13px] italic text-gray-400">
                            {isMe ? 'You removed a message' : `${msg.senderName} removed a message`}
                        </span>
                    </div>
                    <div
                        className={`
                            absolute top-1/2 -translate-y-1/2 z-10
                            opacity-0 group-hover/msg:opacity-100 transition-all duration-200
                            ${isMe ? 'right-full mr-2' : 'left-full ml-2'}
                        `}
                        ref={buttonRef}
                    >
                        <button
                            onClick={handleMenuToggle}
                            className={`p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-all ${activeMessageMenu === msg.id ? 'opacity-100 text-gray-600 bg-gray-100' : ''}`}
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMessageMenu === msg.id && (
                            <div
                                className={`
                                    absolute z-[100] bg-white/95 backdrop-blur-sm rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] 
                                    border border-gray-100 py-1 min-w-[150px] animate-in fade-in zoom-in-95 duration-200
                                    ${isMe ? 'right-0' : 'left-0'}
                                    ${menuDirection === 'up'
                                        ? 'bottom-full mb-1.5 slide-in-from-bottom-1'
                                        : 'top-full mt-1.5 slide-in-from-top-1'
                                    }
                                `}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => handleDeleteMessage(msg.id, true)}
                                    className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
                                >
                                    <Trash2 className="w-3.5 h-3.5 opacity-70" />
                                    <span>Remove</span>
                                </button>
                            </div>
                        )}
                    </div>
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

                <div className={`flex flex-col relative ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 relative group/msg">
                        <div className={`
                            relative transition-all duration-200 cursor-default select-text overflow-hidden
                            ${bubbleCorners}
                            ${isMe
                                ? (msg.status === 'sending'
                                    ? 'bg-orange-200 text-orange-700/70 animate-pulse'
                                    : 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-md')
                                : 'bg-white text-[#050505] border border-gray-100 shadow-sm'
                            }
                        `}>
                            {isImage(msg.content) ? (
                                <div className="p-1">
                                    <img
                                        src={msg.content}
                                        alt="Shared pic"
                                        className="max-w-[240px] md:max-w-[320px] rounded-xl object-cover hover:opacity-95 transition-opacity cursor-pointer"
                                        onClick={() => window.open(msg.content, '_blank')}
                                    />
                                </div>
                            ) : (
                                <div className="px-4 py-2.5 text-[13.5px] leading-relaxed break-words whitespace-pre-wrap">
                                    {msg.content}
                                </div>
                            )}
                        </div>

                        {/* Minimalist Floating Options Button */}
                        {msg.status !== 'sending' && (
                            <div
                                className={`
                                    absolute top-1/2 -translate-y-1/2 z-10
                                    opacity-0 group-hover/msg:opacity-100 transition-all duration-200
                                    ${isMe ? 'right-full mr-2' : 'left-full ml-2'}
                                `}
                                ref={buttonRef}
                            >
                                <button
                                    onClick={handleMenuToggle}
                                    className={`p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 rounded-lg transition-all ${activeMessageMenu === msg.id ? 'opacity-100 text-gray-600 bg-gray-100' : ''}`}
                                >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {activeMessageMenu === msg.id && (
                                    <div
                                        className={`
                                            absolute z-[100] bg-white/95 backdrop-blur-sm rounded-xl shadow-[0_4px_20px_rgb(0,0,0,0.08)] 
                                            border border-gray-100 py-1 min-w-[150px] animate-in fade-in zoom-in-95 duration-200
                                            ${isMe ? 'right-0' : 'left-0'}
                                            ${menuDirection === 'up'
                                                ? 'bottom-full mb-1.5 slide-in-from-bottom-1'
                                                : 'top-full mt-1.5 slide-in-from-top-1'
                                            }
                                        `}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id, true)}
                                            className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-gray-600 hover:bg-gray-50 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5 opacity-70" />
                                            <span>Remove</span>
                                        </button>
                                        {isMe && (
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id, false)}
                                                className="w-full flex items-center gap-2 px-3 py-1.5 text-[13px] text-red-500 hover:bg-red-50 transition-colors"
                                            >
                                                <Ban className="w-3.5 h-3.5 opacity-70" />
                                                <span>Unsend</span>
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Status Indicators */}
                    {isMe && isLastInGroup && (
                        <div className="mt-1 flex items-center gap-1">
                            {msg.status === 'sending' ? (
                                <Circle className="w-2.5 h-2.5 text-orange-300 animate-pulse" strokeWidth={3} />
                            ) : (msg.readByStall && isLastRead) ? (
                                <Avatar
                                    src={activeChat?.stallImage}
                                    name={activeChat?.stallName}
                                    size="xs"
                                    className="w-3.5 h-3.5 border border-white shadow-sm ring-1 ring-orange-100"
                                />
                            ) : msg.readByStall ? (
                                null
                            ) : (
                                <div className="bg-orange-100 rounded-full p-0.5">
                                    <Check className="w-2 h-2 text-orange-600" strokeWidth={4} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isLastInGroup && (
                <span className={`text-[9px] text-gray-400 mt-1.5 font-medium tracking-tight ${isMe ? 'mr-1' : 'ml-8'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
            )}
        </div>
    );

}
