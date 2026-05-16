'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useChatThreads } from '@/hooks/use-chat';
import { useGlobalChat } from '@/provider/chat-provider';
import { useItem } from '@/hooks/use-item';
import { Search, Inbox } from 'lucide-react';
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
            className="w-full flex items-center gap-3 p-4 bg-card border-b border-border hover:bg-secondary/50 active:bg-secondary transition-colors text-left focus:outline-none"
        >
            <div className="relative shrink-0">
                <Avatar src={image} name={name} size="md" className="rounded-md" />
                {presence?.isOnline && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-card rounded-md" />
                )}
            </div>
            <div className="flex-1 overflow-hidden">
                <div className="flex justify-between items-baseline gap-2 mb-0.5">
                    <h4 className="text-sm font-semibold text-card-foreground truncate">
                        {name}
                    </h4>
                    <span className="text-xs text-muted-foreground/60 shrink-0">
                        {formatDate(thread.lastMessageAt)}
                    </span>
                </div>
                <p className={`text-xs truncate ${thread.isUnread ? 'text-card-foreground font-semibold' : 'text-muted-foreground'}`}>
                    {thread.lastMessage}
                </p>
            </div>
            {thread.isUnread && (
                <div className="w-2 h-2 bg-orange-500 rounded-md shrink-0" />
            )}
        </button>
    );
}

export function InboxView() {
    const { profile } = useAuth();
    const { openChat } = useGlobalChat();
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
        <div className="flex flex-col h-full bg-background">
            {/* Search Section */}
            <div className="bg-card border-b border-border p-4 flex flex-col gap-3 shrink-0">
                <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search stalls..."
                        className="w-full bg-input border border-border rounded-md py-2 px-9 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                    />
                </div>
            </div>

            {/* Conversation List / Scrollable Container */}
            <div className="flex-1 overflow-y-auto bg-background">
                {searchQuery.trim() ? (
                    filteredStalls.length === 0 && filteredThreads.length === 0 ? (
                        <div className="flex flex-col justify-center items-center py-16 px-4 text-center gap-2">
                            <Search className="w-8 h-8 text-muted-foreground/40" />
                            <p className="text-xs font-medium text-muted-foreground">No results found for "{searchQuery}"</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {filteredThreads.length > 0 && (
                                <div className="mb-4">
                                    <span className="text-[11px] font-bold text-orange-500 uppercase tracking-wider px-4 block mb-1">Conversations</span>
                                    {filteredThreads.map((thread, idx) => (
                                        <ThreadItem key={`thread-search-${idx}`} thread={thread} profile={profile} openChat={openChat} />
                                    ))}
                                </div>
                            )}

                            {filteredStalls.length > 0 && (
                                <div>
                                    <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider px-4 block mb-1">Find Stalls</span>
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
                                            className="w-full flex items-center gap-3 p-4 bg-card border-b border-border hover:bg-secondary/50 active:bg-secondary transition-colors text-left focus:outline-none"
                                        >
                                            <Avatar src={stall.image} name={stall.name} size="md" className="shrink-0 rounded-md" />
                                            <div className="flex-1 overflow-hidden">
                                                <h4 className="text-sm font-semibold text-card-foreground truncate">{stall.name}</h4>
                                                <p className="text-xs text-muted-foreground truncate">Start conversation</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    )
                ) : isLoadingThreads ? (
                    <div className="flex justify-center items-center py-16 text-muted-foreground">
                        <span className="text-xs font-medium tracking-wide">Loading conversations...</span>
                    </div>
                ) : threads.length === 0 ? (
                    <div className="flex flex-col justify-center items-center py-16 px-4 text-center gap-2">
                        <Inbox className="w-8 h-8 text-muted-foreground/40" />
                        <p className="text-xs font-medium text-muted-foreground">No conversations yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-border/40">
                        {threads.map((thread, idx) => (
                            <ThreadItem key={idx} thread={thread} profile={profile} openChat={openChat} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}