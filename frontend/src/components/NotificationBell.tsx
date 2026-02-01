import React, { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationBellProps {
    onClick?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({ onClick }) => {
    const { permission, requestPermission, preferences, updatePreference } = useNotifications();
    const [isHovered, setIsHovered] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Active means: Permission granted AND App preference is enabled
    const isActive = permission.granted && preferences?.enabled !== false;
    const isMuted = permission.granted && preferences?.enabled === false;

    const handleClick = async () => {
        if (!permission.granted) {
            // First time: Request permission
            if (onClick) onClick(); // Fallback to external handler if provided (e.g. open modal)
            else await requestPermission();
        } else {
            // Toggle Logic
            const newState = !preferences?.enabled;
            await updatePreference('enabled', newState);
        }
    };

    return (
        <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
                position: 'fixed',
                top: '24px',
                right: '120px', // Shifted left to avoid overlapping profile buttons
                zIndex: 10000,
                width: '48px',
                height: '48px',
                borderRadius: '16px',
                background: isActive
                    ? 'rgba(16, 185, 129, 0.8)' // Green when active (#10B981)
                    : isMuted
                        ? 'rgba(239, 68, 68, 0.8)' // Red when muted (#EF4444)
                        : 'rgba(239, 68, 68, 0.8)', // Red when denied/inactive
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                boxShadow: isHovered
                    ? `0 8px 32px ${isActive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(0,0,0,0.2)'}`
                    : '0 4px 16px rgba(0, 0, 0, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                transform: mounted ? (isHovered ? 'scale(1.05) rotate(5deg)' : 'scale(1)') : 'scale(0)',
                opacity: mounted ? 1 : 0
            }}
        >
            {/* Inner Glow Effect */}
            <div style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '16px',
                background: 'radial-gradient(circle at 50% 0%, rgba(255,255,255,0.4), transparent 70%)',
                pointerEvents: 'none'
            }} />

            {/* Icon */}
            <Bell
                size={22}
                color="white"
                style={{
                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))',
                    transform: isActive && !isHovered ? 'rotate(0deg)' : undefined,
                    transition: 'transform 0.3s ease'
                }}
                className={!isActive && !isMuted ? 'animate-pulse-slow' : ''}
            />

            {/* Status Indicator (Jewel) */}
            <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: isActive ? '#4ADE80' : '#F43F5E',
                boxShadow: isActive ? '0 0 8px #4ADE80' : '0 0 8px #F43F5E',
                transition: 'all 0.3s ease'
            }} />

            {/* Tooltip on Hover */}
            {isHovered && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '8px',
                    padding: '6px 12px',
                    background: 'rgba(0,0,0,0.8)',
                    backdropFilter: 'blur(4px)',
                    borderRadius: '8px',
                    color: 'white',
                    fontSize: '10px',
                    fontWeight: 500,
                    whiteSpace: 'nowrap',
                    pointerEvents: 'none',
                    animation: 'fadeIn 0.2s ease-out'
                }}>
                    {isActive ? 'Bildirimler Açık' : isMuted ? 'Bildirimler Kapalı' : 'Bildirimleri Aç'}
                </div>
            )}
        </button>
    );
};

export default NotificationBell;
