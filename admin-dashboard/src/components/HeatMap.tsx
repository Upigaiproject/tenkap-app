import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { io, Socket } from 'socket.io-client';

interface HeatMapProps {
    center?: [number, number];
    zoom?: number;
}

interface HeatMapPoint {
    latitude: number;
    longitude: number;
    intensity: number;
    category?: string;
    userCount: number;
}

interface HeatMapData {
    points: HeatMapPoint[];
    totalUsers: number;
    categories: Record<string, number>;
}

// Helper to update map center
const MapUpdater: React.FC<{ center: [number, number], zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom);
    }, [center, zoom, map]);
    return null;
};

const HeatMap: React.FC<HeatMapProps> = ({
    center = [41.0082, 28.9784], // Istanbul (Lat, Lng order for Leaflet)
    zoom = 11
}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [points, setPoints] = useState<HeatMapPoint[]>([]);
    const [activeCategory, setActiveCategory] = useState<string>('all');
    const [timeRange, setTimeRange] = useState<'live' | '1h' | '24h' | '7d'>('live');
    const [userCount, setUserCount] = useState(0);

    // WebSocket connection
    useEffect(() => {
        // Port 3002 is the new backend (bypassing 3001 zombie)
        const newSocket = io('http://localhost:3002');
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('🔌 Connected to heat map updates');
        });

        newSocket.on('heatmap:update', (data: HeatMapData) => {
            console.log('📊 Heat map data received:', data);
            setPoints(data.points);
            setUserCount(data.totalUsers);
        });

        // Request initial data
        newSocket.emit('heatmap:subscribe', {
            category: activeCategory,
            timeRange: timeRange
        });

        return () => {
            newSocket.close();
        };
    }, []);

    // Update filters
    useEffect(() => {
        if (socket) {
            socket.emit('heatmap:subscribe', {
                category: activeCategory,
                timeRange: timeRange
            });
        }
    }, [activeCategory, timeRange, socket]);

    const categories = [
        { id: 'all', label: 'Tümü', color: '#6B7280' },
        { id: 'kafe', label: 'Kafe', color: '#8B5CF6' },
        { id: 'alisveris', label: 'Alışveriş', color: '#EC4899' },
        { id: 'acik', label: 'Açık Alan', color: '#10B981' },
        { id: 'etkinlik', label: 'Etkinlik', color: '#F59E0B' },
        { id: 'mahalle', label: 'Mahalle', color: '#3B82F6' },
        { id: 'spor', label: 'Spor', color: '#EF4444' }
    ];

    const timeRanges = [
        { id: 'live', label: 'Canlı' },
        { id: '1h', label: 'Son 1s' },
        { id: '24h', label: 'Son 24s' },
        { id: '7d', label: 'Son 7g' }
    ];

    const getColor = (category: string) => {
        const cat = categories.find(c => c.id === category);
        return cat ? cat.color : '#888';
    };

    return (
        <div className="relative w-full h-full">
            <MapContainer
                center={center}
                zoom={zoom}
                style={{ height: '100%', width: '100%', borderRadius: '12px' }}
            >
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />
                <MapUpdater center={center} zoom={zoom} />

                {points.map((point, idx) => (
                    <CircleMarker
                        key={idx}
                        center={[point.latitude, point.longitude]}
                        radius={5 + (point.intensity * 10)}
                        pathOptions={{
                            color: getColor(point.category || 'unknown'),
                            fillColor: getColor(point.category || 'unknown'),
                            fillOpacity: 0.6,
                            weight: 1
                        }}
                    >
                        <Popup>
                            <div className="text-sm">
                                <strong className="block text-gray-800">{point.category || 'Unknown'}</strong>
                                <span className="text-gray-600">{point.userCount} Kullanıcı</span>
                            </div>
                        </Popup>
                    </CircleMarker>
                ))}
            </MapContainer>

            {/* Controls */}
            <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md rounded-xl shadow-xl p-4 space-y-4 max-w-xs border border-gray-200 z-[1000]">
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 font-medium">Aktif Kullanıcı</span>
                    <span className="text-2xl font-bold text-purple-600">{userCount}</span>
                </div>

                <div>
                    <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Kategori</p>
                    <div className="flex flex-wrap gap-2">
                        {categories.map(cat => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeCategory === cat.id
                                        ? 'bg-gray-800 text-white shadow-md scale-105'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                                style={{ backgroundColor: activeCategory === cat.id ? cat.color : undefined }}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <p className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Zaman</p>
                    <div className="grid grid-cols-2 gap-2">
                        {timeRanges.map(range => (
                            <button
                                key={range.id}
                                onClick={() => setTimeRange(range.id as any)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${timeRange === range.id
                                        ? 'bg-purple-600 text-white shadow-md'
                                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                                    }`}
                            >
                                {range.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Live Indicator */}
            {timeRange === 'live' && (
                <div className="absolute top-6 right-6 bg-red-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2 animate-pulse z-[1000]">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                    <span className="text-xs font-bold tracking-wider">CANLI</span>
                </div>
            )}
        </div>
    );
};

export default HeatMap;
