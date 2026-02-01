import { create } from 'zustand';

interface Location {
    latitude: number;
    longitude: number;
    placeName?: string;
    placeType?: string;
}

interface Nudge {
    id: string;
    type: 'coffee' | 'explore' | 'match' | 'question';
    title: string;
    subtitle: string;
    targetLocation?: { lat: number; lng: number };
}

interface AppState {
    currentLocation: Location | null;
    nearbyCount: number;
    matchProbability: number; // 0-100
    nudges: Nudge[];
    streak: number;

    setLocation: (loc: Location) => void;
    setNudges: (nudges: Nudge[]) => void;
    updateNearbyStats: (count: number, prob: number) => void;
}

export const useStore = create<AppState>((set) => ({
    currentLocation: null, // { latitude: 40.9876, longitude: 29.0234, placeName: 'Moda Sahil' }, // Mock default?
    nearbyCount: 0,
    matchProbability: 0,
    nudges: [
        { id: '1', type: 'coffee', title: '☕ Kahve molası zamanı!', subtitle: "Narr Cafe'de birkaç kişi var." },
        { id: '2', type: 'match', title: '💫 Birisi yakında', subtitle: "Senin gibi düşünen biri 200m mesafede." },
    ], // Mock data
    streak: 5,

    setLocation: (loc) => set({ currentLocation: loc }),
    setNudges: (nudges) => set({ nudges }),
    updateNearbyStats: (count, prob) => set({ nearbyCount: count, matchProbability: prob }),
}));
