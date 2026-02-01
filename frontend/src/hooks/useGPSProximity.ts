import { useState, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

interface GPSPosition {
    latitude: number;
    longitude: number;
    accuracy: number;
}

export const useGPSProximity = () => {
    const [position, setPosition] = useState<GPSPosition | null>(null);
    const [isTracking, setIsTracking] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { socket } = useWebSocket();

    const startGPSTracking = useCallback(() => {
        if (!('geolocation' in navigator)) {
            setError('GPS not supported');
            return;
        }

        setIsTracking(true);

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const newPosition = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };

                setPosition(newPosition);
                setError(null);

                const userId = localStorage.getItem('userId');

                // Emit location to backend for proximity check
                if (userId && socket) {
                    // Register first then update
                    socket.emit('proximity:register', {
                        userId,
                        location: newPosition
                    });

                    socket.emit('location:update', {
                        userId,
                        location: newPosition,
                        timestamp: Date.now()
                    });
                }
            },
            (error) => {
                console.error('GPS error:', error);
                setError(error.message);
            },
            {
                enableHighAccuracy: true,
                maximumAge: 2000, // 2 seconds cache
                timeout: 5000
            }
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
            setIsTracking(false);
        };
    }, [socket]);

    return {
        position,
        isTracking,
        error,
        startGPSTracking
    };
};
