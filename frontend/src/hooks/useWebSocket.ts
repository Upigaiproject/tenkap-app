import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

import { API_URL } from '../config/api';

// Singleton socket instance to avoid multiple connections
let socketInstance: Socket | null = null;

export const useWebSocket = () => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        if (!socketInstance) {
            // Use centralized API URL
            socketInstance = io(API_URL, {
                path: '/socket.io',
                transports: ['websocket'],
                autoConnect: true
            });

            socketInstance.on('connect', () => {
                console.log('✅ WebSocket connected:', socketInstance?.id);
            });
        }
        setSocket(socketInstance);

        // Cleanup isn't strictly necessary for a singleton that persists, 
        // but we could enforce disconnect on unmount if we didn't want singleton.
        // For this app, persisting connection is fine.
    }, []);

    return { socket };
};
