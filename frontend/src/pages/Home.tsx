// @ts-nocheck
import { useState, useEffect } from 'react';
import { MapPin, Coffee, ShoppingBag, TreePine, PartyPopper, Home as HomeIcon, LogOut, Dumbbell, User, Settings } from 'lucide-react';
import SelfDescriptionModal from '../components/SelfDescriptionModal';
import NotificationSettings from '../components/NotificationSettings';
import NotificationBell from '../components/NotificationBell';
import ProximityDetector from '../components/ProximityDetector';
import SuggestionsFeed from '../components/SuggestionsFeed';
import { API_URL } from '../config/api';
import { NotificationProvider } from '../hooks/useNotifications';

const CATEGORIES = [
    { id: 'mahalle', icon: HomeIcon, label: 'Mahallem', color: '#6366F1' },
    { id: 'kafe', icon: Coffee, label: 'Kafe/Restoran', color: '#F59E0B' },
    { id: 'spor', icon: Dumbbell, label: 'Spor', color: '#EF4444' },
    { id: 'alisveris', icon: ShoppingBag, label: 'Alışveriş', color: '#EC4899' },
    { id: 'acik', icon: TreePine, label: 'Açık Alan', color: '#10B981' },
    { id: 'etkinlik', icon: PartyPopper, label: 'Etkinlik', color: '#8B5CF6' }
];

const Home = () => {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [userId, setUserId] = useState<string | null>(null);

    // Initialize User ID
    useEffect(() => {
        let storedUserId = localStorage.getItem('userId');
        if (storedUserId && !storedUserId.startsWith('user_dev_')) {
            setUserId(storedUserId);
            return;
        }
        console.warn('⚠️ No valid User ID found in Home.');
    }, []);

    const startWatching = (highAccuracy = true) => {
        if (!('geolocation' in navigator)) {
            setGeoError("Tarayıcınız GPS desteklemiyor.");
            return () => { };
        }

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                setGeoError(null);
                const newLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                setUserLocation(newLocation);
                logCoordinate(newLocation);
            },
            (error) => {
                console.error('Location error:', error);
                if ((error.code === 3 || error.code === 2) && highAccuracy) {
                    navigator.geolocation.clearWatch(watchId);
                    startWatching(false);
                } else {
                    setGeoError(`GPS Hatası: ${error.message} (Kod: ${error.code})`);
                }
            },
            {
                enableHighAccuracy: highAccuracy,
                timeout: 15000,
                maximumAge: 10000
            }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    };

    useEffect(() => {
        const cleanup = startWatching(true);
        return cleanup;
    }, [activeCategory]);


    const logCoordinate = async (location: { lat: number; lng: number }) => {
        try {
            const userId = localStorage.getItem('userId');
            if (!userId) return;

            await fetch(`${API_URL}/api/tracking/log-coordinate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    latitude: location.lat,
                    longitude: location.lng,
                    category: activeCategory,
                    timestamp: new Date().toISOString()
                })
            });
        } catch (error) {
            console.error('Tracking failed:', error);
        }
    };

    const handleCheckIn = async (categoryId: string) => {
        if (!userLocation) {
            alert('Konum bilgisi alınamadı');
            return;
        }

        setLoading(true);

        try {
            const userId = localStorage.getItem('userId') || 'user_dev_123';

            const response = await fetch(`${API_URL}/api/checkin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId,
                    categoryId,
                    latitude: userLocation.lat,
                    longitude: userLocation.lng
                })
            });

            const data = await response.json();

            if (data.success) {
                setActiveCategory(categoryId);
                setSuggestions(data.suggestions || []);
            }
        } catch (error) {
            console.error('Check-in failed:', error);
            alert('Check-in başarısız oldu');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        try {
            const userId = localStorage.getItem('userId') || 'user_dev_123';
            await fetch(`${API_URL}/api/checkin/checkout`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId })
            });

            setActiveCategory(null);
            setSuggestions([]);
        } catch (error) {
            console.error('Checkout failed:', error);
        }
    };

    return (
        <NotificationProvider>
            <div style={{
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)',
                fontFamily: "'Inter', -apple-system, sans-serif",
                color: '#FFFFFF',
                padding: '20px',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: '10%',
                    left: '-10%',
                    width: '400px',
                    height: '400px',
                    background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4), transparent 70%)',
                    filter: 'blur(60px)',
                    pointerEvents: 'none'
                }} />

                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '40px',
                    position: 'relative',
                    zIndex: 100
                }}>
                    <div>
                        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0 }}>TENKAP</h1>
                        <span style={{ fontSize: '10px', background: '#3B82F6', color: 'white', padding: '2px 4px', borderRadius: '4px' }}>v3.1 FINAL</span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px' }}>
                        <button
                            onClick={() => {
                                if (confirm('Başla ekranına dönmek istiyor musunuz?')) {
                                    localStorage.removeItem('userId');
                                    window.location.reload();
                                }
                            }}
                            style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' }}
                        >
                            🔄
                        </button>

                        <button onClick={() => setIsNotificationModalOpen(true)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <Settings size={20} color="white" />
                        </button>

                        <button onClick={() => setIsDescriptionModalOpen(true)} style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                            <User size={20} color="white" />
                        </button>
                    </div>
                </div>

                <NotificationBell />

                <main style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '32px', fontWeight: 700, marginBottom: '12px', lineHeight: 1.2 }}>Neredesin?</h1>

                    {geoError && (
                        <div style={{ background: '#EF4444', color: 'white', padding: '10px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px' }}>⚠️ {geoError}</div>
                    )}
                    <div style={{ fontSize: '12px', color: userLocation ? '#10B981' : '#F59E0B', marginBottom: '10px', background: 'rgba(0,0,0,0.2)', padding: '5px', borderRadius: '4px' }}>
                        {userLocation ? `📍 Konum Hazır: ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)} ` : '🔄 Konum Bekleniyor...'}
                    </div>

                    <p style={{ fontSize: '16px', opacity: 0.9, marginBottom: '40px' }}>Kategorini seç, müsait ol</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '32px' }}>
                        {CATEGORIES.map((category) => {
                            const Icon = category.icon;
                            const isActive = activeCategory === category.id;

                            return (
                                <button
                                    key={category.id}
                                    onClick={() => handleCheckIn(category.id)}
                                    disabled={loading}
                                    style={{
                                        background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.1)',
                                        border: isActive ? '2px solid rgba(255, 255, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.15)',
                                        backdropFilter: 'blur(12px)',
                                        borderRadius: '20px',
                                        padding: '32px 20px',
                                        cursor: loading ? 'wait' : 'pointer',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        gap: '12px'
                                    }}
                                >
                                    <Icon size={36} strokeWidth={2} color="white" />
                                    <span style={{ fontSize: '15px', fontWeight: 600 }}>{category.label}</span>
                                </button>
                            );
                        })}

                        {activeCategory && (
                            <button
                                onClick={handleCheckOut}
                                style={{
                                    background: 'rgba(239, 68, 68, 0.2)',
                                    border: '1px solid rgba(239, 68, 68, 0.3)',
                                    backdropFilter: 'blur(12px)',
                                    borderRadius: '20px',
                                    padding: '32px 20px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '12px',
                                    gridColumn: 'span 2'
                                }}
                            >
                                <LogOut size={36} strokeWidth={2} color="white" />
                                <span style={{ fontSize: '15px', fontWeight: 600 }}>Çıkış Yap</span>
                            </button>
                        )}
                    </div>

                    {activeCategory && (
                        <div style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '20px', marginBottom: '24px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', marginBottom: '8px' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#10B981' }} />
                                <span style={{ fontSize: '16px', fontWeight: 600 }}>Müsaitsin</span>
                            </div>
                            <p style={{ fontSize: '14px', opacity: 0.8, margin: 0 }}>{CATEGORIES.find(c => c.id === activeCategory)?.label}</p>
                        </div>
                    )}

                    {suggestions.length > 0 && (
                        <div style={{ background: 'rgba(255, 255, 255, 0.1)', border: '1px solid rgba(255, 255, 255, 0.15)', backdropFilter: 'blur(12px)', borderRadius: '16px', padding: '20px', textAlign: 'left' }}>
                            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <MapPin size={20} /> Öneriler
                            </h3>
                            {suggestions.map((suggestion, index) => (
                                <div key={index} style={{ background: 'rgba(255, 255, 255, 0.1)', borderRadius: '12px', padding: '16px', marginBottom: index < suggestions.length - 1 ? '12px' : 0 }}>
                                    <p style={{ fontSize: '15px', fontWeight: 500, marginBottom: '8px' }}>{suggestion.message}</p>
                                    <div style={{ display: 'flex', gap: '16px', fontSize: '13px', opacity: 0.8 }}>
                                        <span>📍 {suggestion.distance_meters}m</span>
                                        <span>👥 {suggestion.user_count} kişi</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </main>

                {userId && (
                    <div style={{ maxWidth: '500px', margin: '0 auto 100px auto', padding: '0 20px' }}>
                        <SuggestionsFeed userId={userId} />
                    </div>
                )}

                <SelfDescriptionModal
                    isOpen={isDescriptionModalOpen}
                    onClose={() => setIsDescriptionModalOpen(false)}
                    onSave={(desc) => console.log('Saved desc:', desc)}
                />

                {isNotificationModalOpen && (
                    <NotificationSettings onClose={() => setIsNotificationModalOpen(false)} />
                )}

                <ProximityDetector />
            </div>
        </NotificationProvider >
    );
};

export default Home;
