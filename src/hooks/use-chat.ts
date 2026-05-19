import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/config/api.config';
import { notifError } from '@/lib/toast';
import { useAuth } from './use-auth';

export interface ChatMessage {
    id: number;
    conversationId: string;
    senderId: number;
    senderName: string;
    stallId: number;
    customerId: number;
    customerName: string;
    content: string;
    readByCustomer: boolean;
    readByStall: boolean;
    isDeleted?: boolean;
    sentByStall: boolean;
    createdAt: string;
    status?: 'sending' | 'sent' | 'error';
}

export interface ChatRequest {
    conversationId?: string;
    stallId: number;
    customerId?: number;
    content: string;
}

export interface ChatThread {
    conversationId: string;
    stallId: number;
    stallName: string;
    stallImage: string;
    stallRole?: string;
    customerId: number;
    customerName: string;
    customerImage: string;
    lastMessage: string;
    lastMessageAt: string;
    isUnread: boolean;
}

export const CHAT_QUERY_KEY = ['chat'];

export const getChatKey = (stallId?: number, customerId?: number, conversationId?: string) => {
    return [...CHAT_QUERY_KEY, Number(stallId), Number(customerId), conversationId || 'none'];
};

export const useChatHistory = (stallId?: number, customerId?: number, conversationId?: string) => {
    const { profile } = useAuth();
    const finalCustomerId = Number(customerId || profile?.user?.id);
    const queryKey = getChatKey(stallId, finalCustomerId, conversationId);

    return useQuery<ChatMessage[]>({
        queryKey,
        queryFn: async () => {
            if (!stallId && !conversationId) return [];
            let url = `/api/v1/chat/stall/${stallId || 0}`;
            const params = new URLSearchParams();
            if (finalCustomerId) params.append('customerId', finalCustomerId.toString());
            if (conversationId && conversationId !== 'undefined' && conversationId !== 'null') params.append('conversationId', conversationId);
            params.append('_t', Date.now().toString());

            const res = await apiClient.get<ChatMessage[]>(`${url}?${params.toString()}`);
            if (!res.success) throw new Error(res.message);
            return res.data || [];
        },
        enabled: !!stallId || !!conversationId,
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 10,
        staleTime: 0,
    });
};

export const useChatThreads = () => {
    const { profile } = useAuth();
    return useQuery<ChatThread[]>({
        queryKey: [...CHAT_QUERY_KEY, 'threads', profile?.user?.id],
        queryFn: async () => {
            const res = await apiClient.get<ChatThread[]>(`/api/v1/chat/threads?_t=${Date.now()}`);
            if (!res.success) throw new Error(res.message);
            return res.data || [];
        },
        enabled: !!profile,
        refetchOnWindowFocus: true,
        refetchInterval: 1000 * 5,
        staleTime: 30_000,
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    return useMutation({
        mutationFn: async ({ stallId, customerId }: { stallId: number; customerId?: number }) => {
            let url = `/api/v1/chat/read/${stallId}`;
            if (customerId) url += `?customerId=${customerId}`;
            return await apiClient.put(url);
        },
        onMutate: async ({ stallId, customerId }) => {
            const finalCustomerId = Number(customerId || profile?.user?.id);
            // Use prefix key to match all variants (with/without conversationId)
            const baseKey = [...CHAT_QUERY_KEY, Number(stallId), finalCustomerId];
            await queryClient.cancelQueries({ queryKey: baseKey });
            // Optimistically update: customer is reading, so mark stall's messages as readByCustomer
            queryClient.setQueriesData<ChatMessage[]>({ queryKey: baseKey }, (prev) => {
                if (!prev) return prev;
                return prev.map(m => m.sentByStall ? { ...m, readByCustomer: true } : m);
            });
            // Update thread status locally
            queryClient.setQueryData<ChatThread[]>([...CHAT_QUERY_KEY, 'threads', profile?.user?.id], (old) => {
                if (!old) return old;
                return old.map(t => t.stallId === stallId ? { ...t, isUnread: false } : t);
            });
        },
        onError: (_, { stallId, customerId }) => {
            // On error, invalidate to restore correct state from server
            const baseKey = [...CHAT_QUERY_KEY, Number(stallId), Number(customerId || profile?.user?.id)];
            queryClient.invalidateQueries({ queryKey: baseKey, exact: false });
        },
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();
    const { profile } = useAuth();

    return useMutation({
        mutationFn: async (request: ChatRequest) => {
            const res = await apiClient.post<ChatMessage>('/api/v1/chat', request);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        onMutate: async (newMsgRequest) => {
            const finalCustomerId = Number(newMsgRequest.customerId || profile?.user?.id);
            const queryKey = getChatKey(newMsgRequest.stallId, finalCustomerId, newMsgRequest.conversationId);
            
            await queryClient.cancelQueries({ queryKey });
            const previousMessages = queryClient.getQueryData<ChatMessage[]>(queryKey);

            if (previousMessages) {
                const optimisticMsg: ChatMessage = {
                    id: Date.now(),
                    conversationId: newMsgRequest.conversationId ?? '',
                    senderId: profile?.user?.id || 0,
                    senderName: 'You',
                    stallId: newMsgRequest.stallId,
                    customerId: finalCustomerId,
                    customerName: '',
                    content: newMsgRequest.content,
                    readByCustomer: false,
                    readByStall: false,
                    sentByStall: false,
                    createdAt: new Date().toISOString(),
                    status: 'sending'
                };
                queryClient.setQueryData<ChatMessage[]>(queryKey, (prev) => [...(prev || []), optimisticMsg]);
            }

            return { previousMessages };
        },
        onSuccess: (newMsg, variables) => {
            const finalCustomerId = Number(variables.customerId || profile?.user?.id);
            const queryKey = getChatKey(variables.stallId, finalCustomerId, variables.conversationId);
            queryClient.setQueryData<ChatMessage[]>(queryKey, (prev) => {
                if (!prev) return [{ ...newMsg, status: 'sent' as const }];
                
                if (prev.some(m => m.id === newMsg.id)) {
                    return prev.map(m => m.id === newMsg.id ? { ...m, status: 'sent' as const } : m);
                }

                const updated = [...prev];
                const optimisticIdx = updated.findIndex(m => m.status === 'sending' && m.content === newMsg.content);
                if (optimisticIdx !== -1) {
                    updated[optimisticIdx] = { ...newMsg, status: 'sent' as const };
                    return updated;
                }
                
                return [...prev, { ...newMsg, status: 'sent' as const }];
            });
        },
        onError: (error: any, variables, context) => {
            const finalCustomerId = variables.customerId || profile?.user?.id;
            const queryKey = getChatKey(variables.stallId, finalCustomerId, variables.conversationId);
            if (context?.previousMessages) {
                queryClient.setQueryData(queryKey, context.previousMessages);
            }
            notifError(error?.message || 'Failed to send message');
        },
    });
};

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();
    const { profile } = useAuth();
    return useMutation({
        mutationFn: async ({ messageId, forMe = false }: { messageId: number; forMe?: boolean }) => {
            const res = await apiClient.delete<ChatMessage>(`/api/v1/chat/${messageId}?forMe=${forMe}`);
            if (!res.success) throw new Error(res.message);
            return { deletedMsg: res.data, forMe };
        },
        onSuccess: ({ deletedMsg, forMe }) => {
            // Update all possible cache keys for this conversation
            const keysToUpdate = [
                [...CHAT_QUERY_KEY, deletedMsg.stallId, deletedMsg.customerId],
                [...CHAT_QUERY_KEY, deletedMsg.stallId, profile?.user?.id],
            ];
            keysToUpdate.forEach(queryKey => {
                queryClient.setQueryData<ChatMessage[]>(queryKey, (prev) => {
                    if (!prev) return prev;
                    if (forMe) {
                        return prev.filter(m => m.id !== deletedMsg.id);
                    }
                    return prev.map(m =>
                        m.id === deletedMsg.id
                            ? { ...m, content: 'Message has been removed', isDeleted: true }
                            : m
                    );
                });
            });
            // NO invalidateQueries — WebSocket handles sync
        },
        onError: (error: any) => {
            notifError(error?.message || 'Failed to remove message');
        },
    });
};
