import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Map as MapIcon, RefreshCw, Layers } from 'lucide-react';

interface LocationData {
    id: string;
    latitude: number;
    longitude: number;
    count: number;
    category: string;
}

// Component to dynamically fit map bounds
const MapUpdater = ({ locations }: { locations: LocationData[] }) => {
    const map = useMap();

    useEffect(() => {
        if (locations.length > 0) {
            const bounds = locations.map(l => [l.latitude, l.longitude] as [number, number]);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 16 });
        }
    }, [locations, map]);

    return null;
};

const HeatMap = () => {
    const [locations, setLocations] = useState<LocationData[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHeatMapData = async () => {
        try {
            // Using /all endpoint for raw coordinates which equates to heat points
            const response = await fetch('http://localhost:3002/api/tracking/all?limit=500');
            const data = await response.json();

            if (data.locations) {
                setLocations(data.locations);
            }
        } catch (error) {
            console.error('HeatMap fetch err:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHeatMapData();
        const interval = setInterval(fetchHeatMapData, 30000); // 30s refresh
        return () => clearInterval(interval);
    }, []);

    const getCategoryColor = (category: string) => {
        if (!category) return '#3B82F6';
        switch (category.toLowerCase()) {
            case 'kafe': return '#F59E0B'; // Amber
            case 'spor': return '#EF4444'; // Red
            case 'mahalle': return '#6366F1'; // Indigo
            case 'alisveris': return '#EC4899'; // Pink
            case 'acik': return '#10B981'; // Green
            case 'etkinlik': return '#8B5CF6'; // Violet
            default: return '#3B82F6'; // Blue default
        }
    };

    return (
        <div style={{ padding: '32px', height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
            <header style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '24px', fontWeight: 700, color: 'white', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <MapIcon /> Sıcaklık Haritası
                    </h1>
                    <p style={{ color: '#A1A1AA' }}>Kullanıcı yoğunluğunun coğrafi dağılımı</p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        padding: '8px 16px',
                        background: '#27272A',
                        borderRadius: '99px',
                        color: '#A1A1AA',
                        fontSize: '13px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: '1px solid #3F3F46'
                    }}>
                        <Layers size={14} />
                        {locations.length} Veri Noktası
                    </div>
                    <button
                        onClick={() => fetchHeatMapData()}
                        style={{
                            padding: '10px',
                            background: '#3F3F46',
                            border: 'none',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            color: 'white',
                            display: 'flex'
                        }}
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </header>

            <div style={{
                flex: 1,
                background: '#18181B',
                borderRadius: '16px',
                overflow: 'hidden',
                border: '1px solid #3F3F46',
                position: 'relative',
                minHeight: '500px'
            }}>
                {loading && locations.length === 0 ? (
                    <div style={{
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#A1A1AA',
                        flexDirection: 'column',
                        gap: '12px'
                    }}>
                        <RefreshCw className="animate-spin" />
                        Harita verileri yükleniyor...
                    </div>
                ) : (
                    <MapContainer
                        center={[41.0082, 28.9784]} // Default Istanbul
                        zoom={13}
                        style={{ height: '100%', width: '100%' }}
                    >
                        {/* Dark Mode Map Tiles */}
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                        />

                        {/* Density Points */}
                        {locations.map((loc, idx) => (
                            <CircleMarker
                                key={`${loc.id}-${idx}`}
                                center={[loc.latitude, loc.longitude]}
                                radius={8}
                                pathOptions={{
                                    fillColor: getCategoryColor(loc.category),
                                    color: 'white',
                                    weight: 1,
                                    opacity: 0.5,
                                    fillOpacity: 0.6
                                }}
                            >
                                <Popup>
                                    <div style={{ color: 'black' }}>
                                        <strong>{loc.category ? loc.category.toUpperCase() : 'BİLİNMEYEN'}</strong>
                                        <br />
                                        Lat: {loc.latitude.toFixed(4)}
                                        <br />
                                        Lng: {loc.longitude.toFixed(4)}
                                    </div>
                                </Popup>
                            </CircleMarker>
                        ))}

                        <MapUpdater locations={locations} />

                    </MapContainer>
                )}

                {/* Legend Overlay */}
                <div style={{
                    position: 'absolute',
                    bottom: '20px',
                    left: '20px',
                    background: 'rgba(0,0,0,0.8)',
                    padding: '12px',
                    borderRadius: '8px',
                    zIndex: 1000,
                    backdropFilter: 'blur(4px)',
                    border: '1px solid #3F3F46'
                }}>
                    <div style={{ color: '#A1A1AA', fontSize: '11px', marginBottom: '8px', fontWeight: 600 }}>KATEGORİLER</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {['Mahalle', 'Kafe', 'Spor', 'Alışveriş', 'Açık Alan', 'Etkinlik'].map(cat => {
                            const color = getCategoryColor(cat.toLowerCase().replace(' ', '').replace('ş', 's').replace('ç', 'c'));
                            return (
                                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'white' }}>
                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                                    {cat}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HeatMap;
