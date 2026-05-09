import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/config/api.config';
import { notifError } from '@/lib/toast';

export interface ChatMessage {
    id: number;
    senderId: number;
    senderName: string;
    stallId: number;
    customerId: number;
    customerName: string;
    content: string;
    isRead: boolean;
    isDeleted?: boolean;
    createdAt: string;
    status?: 'sending' | 'sent' | 'error'; // Local UI status
}

export interface ChatRequest {
    stallId: number;
    customerId?: number;
    content: string;
}

export interface ChatThread {
    stallId: number;
    stallName: string;
    stallImage: string;
    customerId: number;
    customerName: string;
    customerImage: string;
    lastMessage: string;
    lastMessageAt: string;
    isUnread: boolean;
}

export const CHAT_QUERY_KEY = ['chat'];

export const useChatHistory = (stallId?: number, customerId?: number) => {
    return useQuery<ChatMessage[]>({
        queryKey: [...CHAT_QUERY_KEY, stallId, customerId],
        queryFn: async () => {
            if (!stallId) return [];
            let url = `/api/v1/chat/stall/${stallId}`;
            if (customerId) {
                url += `?customerId=${customerId}`;
            }
            const res = await apiClient.get<ChatMessage[]>(url);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        enabled: !!stallId,
        refetchOnWindowFocus: false,
    });
};

export const useChatThreads = () => {
    return useQuery<ChatThread[]>({
        queryKey: [...CHAT_QUERY_KEY, 'threads'],
        queryFn: async () => {
            const res = await apiClient.get<ChatThread[]>('/api/v1/chat/threads');
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
    });
};

export const useMarkAsRead = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ stallId, customerId }: { stallId: number; customerId?: number }) => {
            let url = `/api/v1/chat/read/${stallId}`;
            if (customerId) url += `?customerId=${customerId}`;
            return await apiClient.put(url);
        },
        onSuccess: (_, { stallId, customerId }) => {
            queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, stallId, customerId] });
            queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, 'threads'] });
        }
    });
};

export const useSendMessage = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (request: ChatRequest) => {
            const res = await apiClient.post<ChatMessage>('/api/v1/chat', request);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        onMutate: async (newMsgRequest) => {
            const queryKey = [...CHAT_QUERY_KEY, newMsgRequest.stallId, newMsgRequest.customerId];
            await queryClient.cancelQueries({ queryKey });
            const previousMessages = queryClient.getQueryData<ChatMessage[]>(queryKey);

            if (previousMessages) {
                const optimisticMsg: ChatMessage = {
                    id: Date.now(), // Temp ID
                    senderId: 0, // Will be replaced by profile.user.id in UI or onSuccess
                    senderName: 'You',
                    stallId: newMsgRequest.stallId,
                    customerId: newMsgRequest.customerId || 0,
                    customerName: '',
                    content: newMsgRequest.content,
                    isRead: false,
                    createdAt: new Date().toISOString(),
                    status: 'sending'
                };
                queryClient.setQueryData<ChatMessage[]>(queryKey, [...previousMessages, optimisticMsg]);
            }

            return { previousMessages };
        },
        onSuccess: (newMsg, variables) => {
            const queryKey = [...CHAT_QUERY_KEY, variables.stallId, variables.customerId];
            queryClient.setQueryData<ChatMessage[]>(queryKey, (prev) => {
                const filtered = prev?.filter(m => m.status !== 'sending') || [];
                return [...filtered, { ...newMsg, status: 'sent' }];
            });
            queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, 'threads'] });
        },
        onError: (error: any, variables, context) => {
            const queryKey = [...CHAT_QUERY_KEY, variables.stallId, variables.customerId];
            if (context?.previousMessages) {
                queryClient.setQueryData(queryKey, context.previousMessages);
            }
            notifError(error?.message || 'Failed to send message');
        },
    });
};

export const useDeleteMessage = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (messageId: number) => {
            const res = await apiClient.delete<ChatMessage>(`/api/v1/chat/${messageId}`);
            if (!res.success) throw new Error(res.message);
            return res.data;
        },
        onSuccess: (deletedMsg) => {
            // Update all possible cache keys for this conversation
            const keysToUpdate = [
                [...CHAT_QUERY_KEY, deletedMsg.stallId, deletedMsg.customerId],
                [...CHAT_QUERY_KEY, deletedMsg.stallId, undefined],
            ];
            keysToUpdate.forEach(queryKey => {
                queryClient.setQueryData<ChatMessage[]>(queryKey, (prev) => {
                    if (!prev) return prev;
                    return prev.map(m =>
                        m.id === deletedMsg.id
                            ? { ...m, content: 'Message has been removed', isDeleted: true }
                            : m
                    );
                });
            });
            queryClient.invalidateQueries({ queryKey: [...CHAT_QUERY_KEY, 'threads'] });
        },
        onError: (error: any) => {
            notifError(error?.message || 'Failed to remove message');
        },
    });
};
