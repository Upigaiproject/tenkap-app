import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';

interface NotificationPermissionStatus {
    granted: boolean;
    denied: boolean;
    default: boolean;
}

interface NotificationContextType {
    permission: NotificationPermissionStatus;
    preferences: any;
    requestPermission: () => Promise<boolean>;
    updatePreference: (key: string, value: any) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [permission, setPermission] = useState<NotificationPermissionStatus>({
        granted: false,
        denied: false,
        default: true
    });
    const [preferences, setPreferences] = useState<any>(null);

    useEffect(() => {
        if ('Notification' in window) {
            updatePermissionState();
            checkSubscription();
            fetchPreferences();
        }
    }, []);

    const fetchPreferences = async () => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;
        try {
            const res = await fetch(`/api/notifications/preferences/${userId}`);
            const data = await res.json();
            setPreferences(data.preferences);
        } catch (e) {
            console.error('Failed to fetch prefs', e);
        }
    };

    const updatePreference = async (key: string, value: any) => {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        setPreferences((prev: any) => ({ ...prev, [key]: value }));

        try {
            await fetch(`/api/notifications/preferences/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value })
            });
        } catch (error) {
            console.error('Failed to update preference:', error);
        }
    };

    const updatePermissionState = () => {
        setPermission({
            granted: Notification.permission === 'granted',
            denied: Notification.permission === 'denied',
            default: Notification.permission === 'default'
        });
    };

    const checkSubscription = async () => {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready;
            await registration.pushManager.getSubscription();
        }
    };

    const requestPermission = useCallback(async (): Promise<boolean> => {
        if (!('Notification' in window)) return false;

        try {
            const result = await Notification.requestPermission();
            updatePermissionState();

            if (result === 'granted') {
                const success = await registerServiceWorkerAndSubscribe();
                if (success) {
                    await updatePreference('enabled', true);
                }
                return success;
            }
            return false;
        } catch (error) {
            console.error('Permission request failed', error);
            return false;
        }
    }, []);

    const registerServiceWorkerAndSubscribe = async (): Promise<boolean> => {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('/service-worker.js');
                await navigator.serviceWorker.ready;

                const publicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
                if (!publicKey) return false;

                const sub = await registration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(publicKey)
                });


                await saveSubscriptionToBackend(sub);
                return true;
            } catch (error) {
                console.error(error);
                return false;
            }
        }
        return false;
    };

    const saveSubscriptionToBackend = async (sub: PushSubscription) => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    subscription: sub.toJSON()
                })
            });
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <NotificationContext.Provider value={{ permission, preferences, requestPermission, updatePreference }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

// Utility
function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
