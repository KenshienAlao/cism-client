"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createSyncStoragePersister } from "@tanstack/query-sync-storage-persister";
import { ReactNode, useState, useEffect } from "react";
import { WebSocketListener } from "@/components/websocket-listener";
import { ChatProvider } from "./chat-provider";
import { GlobalChatbox } from "@/components/global-chatbox";

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5,
        gcTime: 1000 * 60 * 60 * 24,
        retry: 1,
        refetchOnWindowFocus: true,
      },
    },
  }));

  const [persister, setPersister] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const p = createSyncStoragePersister({
        storage: window.localStorage,
        key: 'CISM_OFFLINE_CACHE_V1', // each updaate for the profile, it must update the version
      });
      setPersister(p);
    }
  }, []);

  if (!persister) {
    return (
      <QueryClientProvider client={queryClient}>
        <ChatProvider>
          <WebSocketListener />
          {children}
          <GlobalChatbox />
        </ChatProvider>
      </QueryClientProvider>
    );
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ 
        persister,
        maxAge: 1000 * 60 * 60 * 24, // 24 hours
      }}
    >
      <ChatProvider>
        <WebSocketListener />
        {children}
        <GlobalChatbox />
      </ChatProvider>
    </PersistQueryClientProvider>
  );
}
