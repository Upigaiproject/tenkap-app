import { useStore } from '../store/useStore';
import axios from 'axios';

class LocationTracker {
    private watchId: number | null = null;
    private lastKnownPosition: GeolocationCoordinates | null = null;
    private isTracking: boolean = false;

    constructor() {
        // Singleton behavior if needed, or just export instance
    }

    public startTracking() {
        if (!('geolocation' in navigator)) {
            console.error("Geolocation not supported");
            return;
        }

        if (this.isTracking) return;

        this.isTracking = true;
        console.log("Starting location tracking...");

        this.watchId = navigator.geolocation.watchPosition(
            this.handlePosition.bind(this),
            this.handleError.bind(this),
            {
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
        );
    }

    public stopTracking() {
        if (this.watchId !== null) {
            navigator.geolocation.clearWatch(this.watchId);
            this.watchId = null;
        }
        this.isTracking = false;
        console.log("Stopped location tracking.");
    }

    private handlePosition(position: GeolocationPosition) {
        const { latitude, longitude, accuracy } = position.coords;

        // Update local store
        useStore.getState().setLocation({
            latitude,
            longitude,
            placeName: 'Tespit Ediliyor...', // Ideally reverse geocode here or in backend response
        });

        console.log(`Location updated: ${latitude}, ${longitude} (Acc: ${accuracy}m)`);

        // Send to backend
        this.sendLocationToBackend({
            latitude,
            longitude,
            accuracy,
            timestamp: new Date().toISOString()
        });

        this.lastKnownPosition = position.coords;
    }

    private handleError(error: GeolocationPositionError) {
        console.error("Location tracking error:", error.message);
    }

    private async sendLocationToBackend(data: any) {
        try {
            // In a real app, use the actual backend URL
            // await axios.post('http://localhost:3000/api/location/update', data);
            console.log("Mock sending to backend:", data);

            // Mock proximity check response
            // const nearby = await axios.get('http://localhost:3000/api/location/nearby');
            // useStore.getState().setNudges(nearby.data.matches...);
        } catch (error) {
            console.error("Failed to sync location to backend", error);
        }
    }
}

export const locationTracker = new LocationTracker();
