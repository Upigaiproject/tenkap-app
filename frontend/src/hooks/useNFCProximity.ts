import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface ProximityEvent {
    userId: string;
    distance: number;
    method: 'nfc' | 'gps';
    timestamp: number;
}

export const useNFCProximity = () => {
    const [hasNFC, setHasNFC] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [proximityEvents, setProximityEvents] = useState<ProximityEvent[]>([]);
    const { socket } = useWebSocket();

    // Check NFC availability
    useEffect(() => {
        const checkNFC = async () => {
            if ('NDEFReader' in window) {
                try {
                    // Verify permission/capability
                    // Note: scan() usually prompts permission, so maybe don't call it immediately on mount
                    // just check for existence.
                    setHasNFC(true);
                } catch (error) {
                    console.log('❌ NFC unavailable:', error);
                    setHasNFC(false);
                }
            } else {
                setHasNFC(false);
            }
        };

        checkNFC();
    }, []);

    // Start NFC scanning
    const startNFCScanning = useCallback(async () => {
        if (!hasNFC) return;

        try {
            // @ts-ignore - NDEFReader is not in standard types yet
            const nfcReader = new NDEFReader();
            await nfcReader.scan();
            setIsScanning(true);

            nfcReader.addEventListener('reading', ({ message, serialNumber }: any) => {
                console.log('🔵 NFC tag detected:', serialNumber);

                // Parse Tenkap user data from NFC tag
                // Assuming the tag contains a text record with userId
                const userRecord = message.records.find((r: any) => r.recordType === 'text');
                if (userRecord) {
                    const decoder = new TextDecoder();
                    const nearbyUserId = decoder.decode(userRecord.data);

                    const myUserId = localStorage.getItem('userId');

                    // Emit proximity event to backend
                    socket?.emit('proximity:detected', {
                        userId: myUserId,
                        nearbyUserId: nearbyUserId,
                        method: 'nfc',
                        timestamp: Date.now()
                    });
                }
            });

            nfcReader.addEventListener('readingerror', () => {
                console.error('❌ NFC reading error');
            });

        } catch (error) {
            console.error('❌ NFC scanning failed:', error);
            setIsScanning(false);
        }
    }, [hasNFC, socket]);

    // Stop NFC scanning
    const stopNFCScanning = useCallback(() => {
        setIsScanning(false);
        // NDEFReader doesn't have a stop method, it stops when page unloads or abort controller used (if supported)
    }, []);

    // Listen for proximity matches from backend
    useEffect(() => {
        if (!socket) return;

        socket.on('proximity:match', (data: ProximityEvent) => {
            console.log('✨ Proximity match detected!', data);
            setProximityEvents(prev => [...prev, data]);

            // Trigger notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('✨ Yakınınızda Biri Var!', {
                    body: `${data.distance.toFixed(1)}m mesafede birileri var. Bakmak ister misin?`,
                    icon: '/tenkap-icon.png', // Ensure these exist or use placeholders
                    tag: 'proximity',
                    requireInteraction: true
                });
            }

            // Play subtle sound
            try {
                // const audio = new Audio('/sounds/proximity-ping.mp3');
                // audio.volume = 0.3;
                // audio.play().catch(() => {});
            } catch (e) {
                // sound might fail
            }

            // Vibrate (mobile)
            if ('vibrate' in navigator) {
                navigator.vibrate([100, 50, 100]);
            }
        });

        return () => {
            socket.off('proximity:match');
        };
    }, [socket]);

    return {
        hasNFC,
        isScanning,
        proximityEvents,
        startNFCScanning,
        stopNFCScanning
    };
};
