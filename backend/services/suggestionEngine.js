/**
 * TENKAP Suggestion Engine
 * Generates contextual suggestions based on User Patterns and Real-time context.
 */
class SuggestionEngine {
    constructor(db, patternService) {
        this.db = db;
        this.patternService = patternService;
    }

    /**
     * Master method to generate all suggestions
     */
    async generateSuggestions(userId, currentLocation, currentCategory) {
        const suggestions = [];

        // 1. Location-based (Nearby & Relevant)
        const locSuggestions = await this.generateLocationSuggestions(userId, currentLocation, currentCategory);
        suggestions.push(...locSuggestions);

        // 2. Timing-based (Habitual)
        const timeSuggestions = await this.generateTimingSuggestions(userId);
        suggestions.push(...timeSuggestions);

        // 3. Social (Friends/Similar Users)
        const socialSuggestions = await this.generateSocialSuggestions(userId, currentLocation, currentCategory);
        suggestions.push(...socialSuggestions);

        // Sort by confidence
        return this.rankSuggestions(suggestions);
    }

    /**
     * 1. Location Suggestions
     * "100m away there is a cafe you might like"
     */
    async generateLocationSuggestions(userId, currentLocation, currentCategory) {
        const suggestions = [];
        const radius = 500; // 500m

        // Get nearby users/activity from DB
        const nearbyUsers = await this.db.getNearbyUsers(currentLocation.latitude, currentLocation.longitude, radius);

        // Simple Logic: If many people are at a nearby spot, suggest it
        const clusters = new Map(); // "lat,lng" -> count
        nearbyUsers.forEach(u => {
            if (u.user_id === userId) return;
            // Round to 50m precision
            const key = `${Math.round(u.latitude * 2000) / 2000},${Math.round(u.longitude * 2000) / 2000}`;
            clusters.set(key, (clusters.get(key) || 0) + 1);
        });

        for (const [key, count] of clusters.entries()) {
            if (count >= 2) { // At least 2 people
                const [lat, lng] = key.split(',').map(Number);
                const distance = Math.round(this.db.calculateDistance(currentLocation.latitude, currentLocation.longitude, lat, lng));

                suggestions.push({
                    id: `loc_${Date.now()}_${Math.random()}`,
                    userId,
                    type: 'location',
                    location: { latitude: lat, longitude: lng, distance },
                    confidence: 0.7 + (count * 0.05), // More people = higher confidence
                    reasoning: `${distance}m ileride ${count} kişi var, ilgini çekebilir.`,
                    status: 'pending',
                    createdAt: new Date()
                });
            }
        }
        return suggestions;
    }

    /**
     * 2. Timing Suggestions
     * "You usually drink coffee at this hour"
     */
    async generateTimingSuggestions(userId) {
        const suggestions = [];
        const pattern = await this.db.getUserPattern(userId);
        if (!pattern || !pattern.timePatterns) return [];

        const now = new Date();
        const currentHour = now.getHours();

        // Check preferred hours
        const relevantHour = pattern.timePatterns.preferredHours.find(h =>
            Math.abs(h.hourOfDay - currentHour) <= 1
        );

        if (relevantHour && relevantHour.frequency > 0.3) {
            // Found a strong habit. suggestions.push(...)
            suggestions.push({
                id: `time_${Date.now()}_${Math.random()}`,
                userId,
                type: 'timing',
                timing: { hour: relevantHour.hourOfDay },
                confidence: relevantHour.frequency, // Habit strength
                reasoning: `Genelde bu saatte aktifsin (${relevantHour.hourOfDay}:00). Bir şeyler yapmak ister misin?`,
                status: 'pending',
                createdAt: new Date()
            });
        }

        return suggestions;
    }

    /**
     * 3. Social Suggestions (Simplified)
     * "Someone compatible is nearby"
     */
    async generateSocialSuggestions(userId, currentLocation, currentCategory) {
        // For MVP, look for nearby users in same category
        const suggestions = [];
        const nearby = await this.db.getNearbyUsers(currentLocation.latitude, currentLocation.longitude, 300);

        const compatibleUsers = nearby.filter(u =>
            u.user_id !== userId &&
            // Mock compatibility check: same category logic is handled by frontend mostly, 
            // but let's say "is_available" is true
            u.user_id // Just existence for now
        );

        if (compatibleUsers.length > 0) {
            const bestMatch = compatibleUsers[0]; // Just take first for now
            suggestions.push({
                id: `social_${Date.now()}_${Math.random()}`,
                userId,
                type: 'person',
                person: { userId: bestMatch.user_id, name: "Gizemli Biri" },
                confidence: 0.8,
                reasoning: `Yakınlarda seninle uyumlu biri var.`,
                status: 'pending',
                createdAt: new Date()
            });
        }

        return suggestions;
    }

    rankSuggestions(suggestions) {
        return suggestions.sort((a, b) => b.confidence - a.confidence).slice(0, 5);
    }
}

module.exports = SuggestionEngine;
