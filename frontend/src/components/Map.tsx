import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker as LeafletMarker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './Map.css';

// Fix default icon issue in Leaflet
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

interface MapProps {
    center: [number, number]; // [lng, lat] for Mapbox -> [lat, lng] for Leaflet !!
    zoom?: number;
    markers?: Marker[];
    onMarkerClick?: (markerId: string) => void;
}

export interface Marker {
    id: string;
    position: [number, number]; // [lng, lat]
    type: 'user' | 'match' | 'hotspot';
    data?: any;
}

// Internal component to handle view updates
const MapUpdater: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        // Leaflet takes [lat, lng], but our app uses [lng, lat] (GeoJSON standard)
        // We must swap them for Leaflet methods
        map.flyTo([center[1], center[0]], zoom, {
            animate: true,
            duration: 1.5
        });
    }, [center, zoom, map]);
    return null;
};

const Map: React.FC<MapProps> = ({
    center,
    zoom = 14,
    markers = [],
    onMarkerClick
}) => {
    // Convert GeoJSON [lng, lat] to Leaflet [lat, lng]
    const leafletCenter: [number, number] = [center[1], center[0]];

    return (
        <MapContainer
            center={leafletCenter}
            zoom={zoom}
            className="w-full h-full rounded-3xl overflow-hidden shadow-2xl bg-[#1a1a1a]"
            style={{ height: '100%', minHeight: '100%' }}
            zoomControl={false}
        >
            <MapUpdater center={center} zoom={zoom} />

            {/* DARK MODE TILES - The Secret Sauce for Premium Look */}
            {/* CartoDB Dark Matter: Beautiful, free, dark tiles */}
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />

            {markers.map((marker) => (
                <LeafletMarker
                    key={marker.id}
                    position={[marker.position[1], marker.position[0]]} // Swap to [lat, lng]
                    icon={createCustomIcon(marker.type)}
                    eventHandlers={{
                        click: () => onMarkerClick && onMarkerClick(marker.id)
                    }}
                />
            ))}
        </MapContainer>
    );
};

// Create Custom Premium Icons using L.DivIcon
function createCustomIcon(type: 'user' | 'match' | 'hotspot') {
    let html = '';
    let className = 'custom-marker';

    if (type === 'user') {
        html = `
            <div class="user-marker">
                <div class="pulse-ring"></div>
                <div class="user-dot"></div>
            </div>
        `;
    } else if (type === 'match') {
        html = `
            <div class="match-marker">
                <div class="match-icon">❤️</div>
                <div class="match-glow"></div>
            </div>
        `;
    } else if (type === 'hotspot') {
        html = `
            <div class="hotspot-marker">
                <div class="hotspot-ring"></div>
            </div>
        `;
    }

    return L.divIcon({
        html: html,
        className: className,
        iconSize: [40, 40],
        iconAnchor: [20, 20] // Center it
    });
}

export default Map;
