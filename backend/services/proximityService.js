const EventEmitter = require('events');

class ProximityService extends EventEmitter {
    constructor(db) {
        super();
        this.db = db;
        this.activeUsers = new Map(); // userId -> { location, socketId, lastUpdate }
        this.proximityThreshold = 2000; // 2km threshold for easier testing (subway/indoor GPS is bad)
    }

    // Register active user with location
    registerUser(userId, location, socketId) {
        this.activeUsers.set(userId, {
            location,
            socketId,
            lastUpdate: Date.now()
        });

        console.log(`📍 User ${userId} registered at location`);

        // Check for nearby users immediately
        this.checkProximity(userId);
    }

    // Update user location
    updateLocation(userId, location) {
        const user = this.activeUsers.get(userId);
        if (user) {
            user.location = location;
            user.lastUpdate = Date.now();

            // Check proximity on every location update
            this.checkProximity(userId);
        }
    }

    // Check proximity to other active users
    checkProximity(userId) {
        const user = this.activeUsers.get(userId);
        if (!user) {
            console.log(`❌ checkProximity failed: User ${userId} not found in activeUsers`);
            return;
        }

        console.log(`🔍 Checking proximity for ${userId} at [${user.location.latitude}, ${user.location.longitude}]`);
        const matches = [];

        for (const [otherUserId, otherUser] of this.activeUsers.entries()) {
            if (otherUserId === userId) continue;

            const distance = this.calculateDistance(
                user.location.latitude,
                user.location.longitude,
                otherUser.location.latitude,
                otherUser.location.longitude
            );

            console.log(`📏 Distance between ${userId} and ${otherUserId}: ${distance.toFixed(2)}m (Threshold: ${this.proximityThreshold}m)`);

            if (distance <= this.proximityThreshold) {
                console.log(`✅ MATCH FOUND! ${userId} <-> ${otherUserId}`);
                matches.push({
                    userId: otherUserId,
                    distance,
                    socketId: otherUser.socketId
                });
            }
        }

        if (matches.length > 0) {
            console.log(`✨ Proximity matches for ${userId}:`, matches.length);
            this.emit('proximity:matches', { userId, matches });
        }

        return matches;
    }

    // Haversine distance calculation
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371000; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c; // distance in meters
    }

    // Remove inactive user
    unregisterUser(userId) {
        this.activeUsers.delete(userId);
        console.log(`👋 User ${userId} unregistered`);
    }

    // Cleanup stale users (inactive > 30 seconds)
    cleanupStaleUsers() {
        const now = Date.now();
        const staleThreshold = 30000; // 30 seconds

        for (const [userId, user] of this.activeUsers.entries()) {
            if (now - user.lastUpdate > staleThreshold) {
                this.unregisterUser(userId);
            }
        }
    }

    // Get active users count
    getActiveUsersCount() {
        return this.activeUsers.size;
    }

    // Get all proximity events in last N minutes
    getRecentProximityEvents(minutes = 10) {
        // This would fetch from database in production
        if (this.db && this.db.getProximityEvents) {
            return this.db.getProximityEvents(minutes);
        }
        return [];
    }
}

module.exports = ProximityService;
