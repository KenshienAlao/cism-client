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
        ? `${isFirstInGroup ? 'rounded-t-md' : 'rounded-t-sm'} ${isLastInGroup ? 'rounded-bl-md rounded-br-sm' : 'rounded-b-sm'} rounded-l-md`
        : `${isFirstInGroup ? 'rounded-t-md' : 'rounded-t-sm'} ${isLastInGroup ? 'rounded-br-md rounded-bl-sm' : 'rounded-b-sm'} rounded-r-md`;

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
            <div className={`flex flex-col relative ${isMe ? 'items-end' : 'items-start'} ${isLastInGroup ? 'mb-2' : 'mb-0.5'}`}>
                <div className="flex items-center gap-2 relative group/msg">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-dashed border-neutral-100 bg-neutral-50/50">
                        <Ban className="w-3 h-3 text-neutral-300" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
                            {isMe ? 'Message removed' : 'Removed'}
                        </span>
                    </div>
                    <div
                        className={`
                            absolute top-1/2 -translate-y-1/2 z-10
                            opacity-0 group-hover/msg:opacity-100 transition-all
                            ${isMe ? 'right-full mr-2' : 'left-full ml-2'}
                        `}
                        ref={buttonRef}
                    >
                        <button
                            onClick={handleMenuToggle}
                            className={`p-1 text-neutral-400 active:text-neutral-900 active:bg-neutral-100 rounded-md transition-colors ${activeMessageMenu === msg.id ? 'opacity-100 text-neutral-900 bg-neutral-100' : ''}`}
                        >
                            <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {activeMessageMenu === msg.id && (
                            <div
                                className={`
                                    absolute z-[100] bg-white rounded-md shadow-sm border border-neutral-100 py-1 min-w-[120px]
                                    ${isMe ? 'right-0' : 'left-0'}
                                    ${menuDirection === 'up'
                                        ? 'bottom-full mb-1.5'
                                        : 'top-full mt-1.5'
                                    }
                                `}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    onClick={() => handleDeleteMessage(msg.id, true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600 active:bg-neutral-50 transition-colors"
                                >
                                    <Trash2 className="w-3 h-3 opacity-70" />
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
                <span className="text-[9px] text-neutral-400 mb-1.5 ml-2 font-bold uppercase tracking-[0.2em]">
                    {msg.senderName}
                </span>
            )}

            <div className={`flex items-end gap-2 max-w-[90%] group relative ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                {!isMe && isLastInGroup && (
                    <Avatar
                        src={activeChat?.stallId === msg.senderId ? activeChat?.stallImage : (activeChat?.customerId === msg.senderId ? activeChat?.customerImage : '')}
                        name={msg.senderName}
                        size="xs"
                        className="mb-0.5 rounded-md"
                    />
                )}
                {!isMe && !isLastInGroup && <div className="w-6" />}

                <div className={`flex flex-col relative ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 relative group/msg">
                        <div className={`
                            relative transition-colors cursor-default select-text overflow-hidden
                            ${bubbleCorners}
                            ${isMe
                                ? (msg.status === 'sending'
                                    ? 'bg-orange-100 text-orange-600/60'
                                    : 'bg-orange-500 text-white')
                                : 'bg-white text-neutral-900 border border-neutral-100'
                            }
                        `}>
                            {isImage(msg.content) ? (
                                <div className="p-0.5">
                                    <img
                                        src={msg.content}
                                        alt="Media"
                                        className="max-w-[240px] md:max-w-[320px] rounded-md object-cover transition-opacity cursor-pointer active:opacity-90"
                                        onClick={() => window.open(msg.content, '_blank')}
                                    />
                                </div>
                            ) : (
                                <div className="px-3.5 py-2 text-[12px] font-medium leading-relaxed break-words whitespace-pre-wrap tracking-wide">
                                    {msg.content}
                                </div>
                            )}
                        </div>

                        {/* Minimalist Floating Options Button */}
                        {msg.status !== 'sending' && (
                            <div
                                className={`
                                    absolute top-1/2 -translate-y-1/2 z-10
                                    opacity-0 group-hover/msg:opacity-100 transition-all
                                    ${isMe ? 'right-full mr-2' : 'left-full ml-2'}
                                `}
                                ref={buttonRef}
                            >
                                <button
                                    onClick={handleMenuToggle}
                                    className={`p-1 text-neutral-300 active:text-neutral-900 active:bg-neutral-100 rounded-md transition-colors ${activeMessageMenu === msg.id ? 'opacity-100 text-neutral-900 bg-neutral-100' : ''}`}
                                >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                </button>

                                {activeMessageMenu === msg.id && (
                                    <div
                                        className={`
                                            absolute z-[100] bg-white rounded-md shadow-sm border border-neutral-100 py-1 min-w-[120px]
                                            ${isMe ? 'right-0' : 'left-0'}
                                            ${menuDirection === 'up'
                                                ? 'bottom-full mb-1.5'
                                                : 'top-full mt-1.5'
                                            }
                                        `}
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <button
                                            onClick={() => handleDeleteMessage(msg.id, true)}
                                            className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-neutral-600 active:bg-neutral-50 transition-colors"
                                        >
                                            <Trash2 className="w-3 h-3 opacity-70" />
                                            <span>Remove</span>
                                        </button>
                                        {isMe && (
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id, false)}
                                                className="w-full flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-rose-500 active:bg-rose-50 transition-colors"
                                            >
                                                <Ban className="w-3 h-3 opacity-70" />
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
                                <Circle className="w-2 h-2 text-orange-300" strokeWidth={3} />
                            ) : (msg.readByStall && isLastRead) ? (
                                <Avatar
                                    src={activeChat?.stallImage}
                                    name={activeChat?.stallName}
                                    size="xs"
                                    className="w-3 h-3 rounded-md"
                                />
                            ) : msg.readByStall ? (
                                null
                            ) : (
                                <div className="bg-orange-50 rounded-md p-0.5">
                                    <Check className="w-1.5 h-1.5 text-orange-500" strokeWidth={5} />
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {isLastInGroup && (
                <span className={`text-[8px] font-bold text-neutral-300 uppercase tracking-widest mt-1.5 ${isMe ? 'mr-0.5' : 'ml-8'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                </span>
            )}
        </div>
    );

}
