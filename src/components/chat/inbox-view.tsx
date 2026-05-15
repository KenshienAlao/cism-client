import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChatThreads } from '@/hooks/use-chat';
import { useGlobalChat } from '@/provider/chat-provider';
import { useItem } from '@/hooks/use-item';
import { X, Search, Inbox } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/config/api.config';
import { formatDate } from '@/lib/utils/formatDate';

function ThreadItem({ thread, profile, openChat }: { thread: any, profile: any, openChat: (chat: any) => void }) {
    const isCustomer = thread.customerId === profile?.user?.id;
    const name = isCustomer ? thread.stallName : thread.customerName;
    const image = isCustomer ? thread.stallImage : thread.customerImage;

    const { data: presence } = useQuery<any>({
        queryKey: ['presence', isCustomer ? thread.stallId : thread.customerId, isCustomer ? 'STALL' : 'CLIENT'],
        queryFn: async () => {
            const type = isCustomer ? 'STALL' : 'CLIENT';
            const id = isCustomer ? thread.stallId : thread.customerId;
            const res = await apiClient.get<any>(`/api/v1/chat/presence/${type}/${id}`);
            return res.data;
        },
        staleTime: Infinity,
    });

    return (
        <button
            onClick={() => openChat({
                stallId: thread.stallId,
                stallName: thread.stallName,
                stallImage: thread.stallImage,
                stallRole: thread.stallRole,
                conversationId: thread.conversationId,
                customerId: !isCustomer ? thread.customerId : undefined,
                customerName: !isCustomer ? thread.customerName : undefined,
                customerImage: !isCustomer ? thread.customerImage : undefined
            })}
            className="w-full flex items-center gap-3 p-3.5 bg-white border-b border-neutral-50 active:bg-neutral-50 transition-colors text-left"
        >
            <div className="relative shrink-0">
                <Avatar src={image} name={name} size="md" className="rounded-md" />
                {presence?.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                )}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline mb-1">
                    <h4 className="text-[11px] font-bold text-neutral-900 uppercase tracking-widest truncate">
                        {name}
                    </h4>
                    <span className="text-[9px] font-bold text-neutral-400 tracking-widest shrink-0 ml-2">
                        {formatDate(thread.lastMessageAt)}
                    </span>
                </div>
                <p className={`text-[10px] tracking-wide truncate ${thread.isUnread ? 'text-neutral-900 font-bold' : 'text-neutral-400 font-medium'}`}>
                    {thread.lastMessage}
                </p>
            </div>
            {thread.isUnread && (
                <div className="w-2 h-2 bg-orange-500 rounded-full shrink-0"></div>
            )}
        </button>
    );
}

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
            <div className="bg-white border-b border-neutral-100 p-4 flex flex-col gap-3 shrink-0">
                <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-neutral-900 uppercase tracking-[0.2em]">Messages</h3>
                    <button onClick={closeChat} className="p-1.5 active:bg-neutral-50 rounded-md transition-colors text-neutral-400">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-300" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search stalls..."
                        className="w-full bg-neutral-50 border border-neutral-100 rounded-md py-2.5 pl-9 pr-4 text-[11px] font-bold uppercase tracking-widest text-neutral-900 placeholder:text-neutral-300 placeholder:font-medium focus:outline-none focus:bg-white focus:border-orange-500/30 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-y-auto bg-neutral-50">
                {searchQuery.trim() ? (
                    filteredStalls.length === 0 && filteredThreads.length === 0 ? (
                        <div className="flex flex-col justify-center items-center py-24 px-6 text-center space-y-4">
                            <Search className="w-10 h-10 text-neutral-200" />
                            <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No results for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="space-y-4 py-4">
                            {filteredThreads.length > 0 && (
                                <div>
                                    <span className="text-[9px] font-bold text-orange-500 uppercase tracking-[0.2em] px-4 block mb-2">Conversations</span>
                                    {filteredThreads.map((thread, idx) => (
                                        <ThreadItem key={`thread-search-${idx}`} thread={thread} profile={profile} openChat={openChat} />
                                    ))}
                                </div>
                            )}

                            {filteredStalls.length > 0 && (
                                <div>
                                    <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-[0.2em] px-4 block mb-2 mt-2">Find Stalls</span>
                                    {filteredStalls.map((stall) => (
                                        <button
                                            key={`stall-search-${stall.id}`}
                                            onClick={() => {
                                                setSearchQuery('');
                                                openChat({
                                                    stallId: stall.id,
                                                    stallName: stall.name,
                                                    stallImage: stall.image,
                                                    stallRole: stall.role
                                                });
                                            }}
                                            className="w-full flex items-center gap-3 p-3.5 bg-white border-b border-neutral-50 active:bg-neutral-50 transition-colors text-left"
                                        >
                                            <Avatar src={stall.image} name={stall.name} size="md" className="shrink-0 rounded-md" />
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="text-[11px] font-bold text-neutral-900 uppercase tracking-widest truncate">{stall.name}</h4>
                                                <p className="text-[10px] font-medium text-neutral-400 uppercase tracking-widest truncate">Start conversation</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                ) : isLoadingThreads ? (
                    <div className="flex justify-center items-center py-20 text-neutral-300">
                        <span className="text-[10px] font-bold uppercase tracking-widest">Loading...</span>
                    </div>
                ) : threads.length === 0 ? (
                    <div className="flex flex-col justify-center items-center py-24 px-6 text-center space-y-4">
                        <Inbox className="w-10 h-10 text-neutral-200" />
                        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">No conversations</p>
                    </div>
                ) : (
                    <div className="bg-white">
                        {threads.map((thread, idx) => (
                            <ThreadItem key={idx} thread={thread} profile={profile} openChat={openChat} />
                        ))}
                    </div>
                )}
            </div>
        </>
    );
}
