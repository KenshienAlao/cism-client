'use client';

import { useWebSocket } from '@/hooks/use-websocket';

export function WebSocketListener() {
    useWebSocket();
    return null;
}
