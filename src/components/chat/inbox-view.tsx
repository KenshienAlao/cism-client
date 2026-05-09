import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChatThreads } from '@/hooks/use-chat';
import { useGlobalChat } from '@/provider/chat-provider';
import { useItem } from '@/hooks/use-item';
import { X, Search, Inbox } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';

export function InboxView() {
    const { profile } = useAuth();
    const { closeChat, openChat } = useGlobalChat();
    const [searchQuery, setSearchQuery] = useState('');
    const { data: threads = [], isLoading: isLoadingThreads } = useChatThreads();
    const { items: allStalls } = useItem();

    const filteredStalls = allStalls.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const filteredThreads = threads.filter(t => {
        const name = t.customerId === profile?.user?.id ? t.stallName : t.customerName;
        return name.toLowerCase().includes(searchQuery.toLowerCase());
    });

    return (
        <>
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 pb-3 shadow-md z-10 flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-center">
                    <h3 className="font-bold text-lg">Messages</h3>
                    <button onClick={closeChat} className="p-1 hover:bg-white/20 rounded-full transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-orange-200" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search stalls..."
                        className="w-full bg-white/20 border border-white/20 rounded-full py-1.5 pl-9 pr-4 text-sm text-white placeholder:text-orange-100 focus:outline-none focus:bg-white/30 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-gray-50 p-2 space-y-1">
                {searchQuery.trim() ? (
                    filteredStalls.length === 0 && filteredThreads.length === 0 ? (
                        <div className="flex flex-col justify-center items-center h-full text-gray-400 text-sm text-center px-4 space-y-4 py-20">
                            <Search className="w-12 h-12 text-gray-200" />
                            <p>No stalls or conversations found matching "{searchQuery}"</p>
                        </div>
                    ) : (
                        <>
                            {filteredThreads.length > 0 && (
                                <div className="px-2 py-1">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Recent Conversations</span>
                                    {filteredThreads.map((thread, idx) => {
                                        const isCustomer = thread.customerId === profile?.user?.id;
                                        const name = isCustomer ? thread.stallName : thread.customerName;
                                        const image = isCustomer ? thread.stallImage : thread.customerImage;

                                        return (
                                            <button
                                                key={`thread-search-${idx}`}
                                                onClick={() => {
                                                    setSearchQuery('');
                                                    openChat({
                                                        stallId: thread.stallId,
                                                        stallName: thread.stallName,
                                                        stallImage: thread.stallImage,
                                                        customerId: !isCustomer ? thread.customerId : undefined,
                                                        customerName: !isCustomer ? thread.customerName : undefined,
                                                        customerImage: !isCustomer ? thread.customerImage : undefined
                                                    });
                                                }}
                                                className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-all text-left border border-transparent hover:border-gray-100 hover:shadow-sm mt-1"
                                            >
                                                <Avatar src={image} name={name} size="md" className="flex-shrink-0" />
                                                <div className="flex-1 overflow-hidden">
                                                    <h4 className="font-semibold text-sm text-gray-900 truncate">{name}</h4>
                                                    <p className="text-xs text-gray-500 truncate">{thread.lastMessage}</p>
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}

                            {filteredStalls.length > 0 && (
                                <div className="px-2 py-1 mt-4">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider px-2">Find Stalls</span>
                                    {filteredStalls.map((stall) => (
                                        <button
                                            key={`stall-search-${stall.id}`}
                                            onClick={() => {
                                                setSearchQuery('');
                                                openChat({
                                                    stallId: stall.id,
                                                    stallName: stall.name,
                                                    stallImage: stall.image
                                                });
                                            }}
                                            className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-all text-left border border-transparent hover:border-gray-100 hover:shadow-sm mt-1"
                                        >
                                            <Avatar src={stall.image} name={stall.name} size="md" className="flex-shrink-0" />
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="font-semibold text-sm text-gray-900 truncate">{stall.name}</h4>
                                                <p className="text-xs text-gray-500 truncate">Start a new conversation</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    )
                ) : isLoadingThreads ? (
                    <div className="flex justify-center items-center h-32 text-gray-400">
                        <span className="animate-pulse text-sm">Loading chats...</span>
                    </div>
                ) : threads.length === 0 ? (
                    <div className="flex flex-col justify-center items-center h-full text-gray-400 text-sm text-center px-4 space-y-4 py-20">
                        <Inbox className="w-12 h-12 text-gray-300" />
                        <p>No conversations yet.</p>
                    </div>
                ) : (
                    threads.map((thread, idx) => {
                        const isCustomer = thread.customerId === profile?.user?.id;
                        const name = isCustomer ? thread.stallName : thread.customerName;
                        const image = isCustomer ? thread.stallImage : thread.customerImage;

                        return (
                            <button
                                key={idx}
                                onClick={() => openChat({
                                    stallId: thread.stallId,
                                    stallName: thread.stallName,
                                    stallImage: thread.stallImage,
                                    customerId: !isCustomer ? thread.customerId : undefined,
                                    customerName: !isCustomer ? thread.customerName : undefined,
                                    customerImage: !isCustomer ? thread.customerImage : undefined
                                })}
                                className="w-full flex items-center gap-3 p-3 hover:bg-white rounded-xl transition-all text-left border border-transparent hover:border-gray-100 hover:shadow-sm"
                            >
                                <Avatar
                                    src={image}
                                    name={name}
                                    size="md"
                                    className="flex-shrink-0"
                                />
                                <div className="flex-1 overflow-hidden">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h4 className="font-semibold text-sm text-gray-900 truncate">
                                            {name}
                                        </h4>
                                        <span className="text-[10px] text-gray-400 flex-shrink-0 ml-2">
                                            {new Date(thread.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <p className={`text-xs truncate ${thread.isUnread ? 'text-gray-900 font-bold' : 'text-gray-500'}`}>
                                        {thread.lastMessage}
                                    </p>
                                </div>
                                {thread.isUnread && (
                                    <div className="w-2.5 h-2.5 bg-orange-500 rounded-full flex-shrink-0"></div>
                                )}
                            </button>
                        );
                    })
                )}
            </div>
        </>
    );
}
