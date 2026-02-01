const CATEGORIES = {
    MAHALLE: { id: 'mahalle', icon: '🏠', label: 'Mahallem', radius: 200 },
    KAFE: { id: 'kafe', icon: '☕', label: 'Kafe/Restoran', radius: 100 },
    SPOR: { id: 'spor', icon: '💪', label: 'Spor', radius: 150 },
    ALISVERIS: { id: 'alisveris', icon: '🛍️', label: 'Alışveriş', radius: 200 },
    ACIK: { id: 'acik', icon: '🌳', label: 'Açık Alan', radius: 300 },
    ETKINLIK: { id: 'etkinlik', icon: '🎉', label: 'Etkinlik', radius: 150 }
};

class MockDatabase {
    constructor() {
        this.users = new Map();
        this.checkins = [];  // Historic check-ins for pattern analysis
        this.locationHistory = [];
        this.matches = new Map();
        this.nudges = [];
        this.heatMaps = new Map();
        this.userPatterns = new Map(); // AI detected patterns per user
        this.suggestions = new Map(); // AI suggestions per user
        this.proximityEvents = [];
        this.coordinateHistory = [];
        this.selfDescriptionHistory = [];
        this.notificationPreferences = new Map();
        this.notifications = [];

        // Load fake users on initialization
        this.loadFakeUsers();
    }

    loadFakeUsers() {
        try {
            const path = require('path');
            const fs = require('fs');
            const fakeUsersPath = path.join(__dirname, 'data/fakeUsers.json');

            if (fs.existsSync(fakeUsersPath)) {
                const fakeUsers = require(fakeUsersPath);

                fakeUsers.forEach(user => {
                    this.users.set(user.id, user);

                    // Add their location to history so they appear on map headers
                    this.locationHistory.push({
                        id: `loc_${Date.now()}_${user.id}`,
                        user_id: user.id,
                        latitude: user.location.latitude,
                        longitude: user.location.longitude,
                        timestamp: user.last_active, // Use their last active time
                        latitudeDelta: 0,
                        longitudeDelta: 0
                    });
                });

                console.log(`✅ Loaded ${fakeUsers.length} fake users into mock database`);
            }
        } catch (error) {
            console.log('ℹ️  No fake users found, starting with empty database', error);
        }
    }

    // NEW METHOD: Category Check-in
    async createCheckin(userId, categoryId, location) {
        const checkin = {
            id: `checkin_${Date.now()}`,
            user_id: userId,
            category_id: categoryId,
            latitude: location.latitude,
            longitude: location.longitude,
            timestamp: new Date().toISOString(),
            is_active: true
        };

        this.checkins.push(checkin);

        // Update user status
        const user = this.users.get(userId);
        if (user) {
            user.current_category = categoryId;
            user.current_location = location;
            user.is_available = true;
            user.last_active = new Date().toISOString();
        }

        return checkin;
    }

    // NEW METHOD: Checkout (user closes app)
    async checkout(userId) {
        const user = this.users.get(userId);
        if (user) {
            user.is_available = false;
            user.current_category = null;

            // Mark recent check-ins as inactive
            this.checkins
                .filter(c => c.user_id === userId && c.is_active)
                .forEach(c => c.is_active = false);
        }
    }

    // NEW METHOD: Build Heat Map (Pattern Detection)
    async buildHeatMap() {
        const now = new Date();
        const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

        const recentCheckins = this.checkins.filter(
            c => new Date(c.timestamp) >= sevenDaysAgo
        );

        const patterns = {};

        recentCheckins.forEach(checkin => {
            const date = new Date(checkin.timestamp);
            const hour = date.getHours();
            const day = date.getDay(); // 0-6 (Sunday-Saturday)

            // Create location grid (100m precision)
            const latGrid = Math.round(checkin.latitude * 1000);
            const lngGrid = Math.round(checkin.longitude * 1000);

            const key = `${latGrid}_${lngGrid}_${day}_${hour}_${checkin.category_id}`;

            if (!patterns[key]) {
                patterns[key] = {
                    location: { lat: checkin.latitude, lng: checkin.longitude },
                    category: checkin.category_id,
                    day,
                    hour,
                    users: new Set(),
                    count: 0
                };
            }

            patterns[key].users.add(checkin.user_id);
            patterns[key].count++;
        });

        // Convert to array and sort by frequency
        this.patterns = Object.values(patterns)
            .map(p => ({ ...p, users: Array.from(p.users) }))
            .sort((a, b) => b.count - a.count);

        return this.patterns;
    }

    // NEW METHOD: Generate Smart Suggestions
    async generateSuggestions(userId, categoryId, currentLocation) {
        await this.buildHeatMap();

        const now = new Date();
        const currentHour = now.getHours();
        const currentDay = now.getDay();

        // Find relevant patterns
        const relevantPatterns = this.patterns.filter(p =>
            p.category === categoryId &&
            p.day === currentDay &&
            Math.abs(p.hour - currentHour) <= 1 && // ±1 hour
            !p.users.includes(userId) && // Don't include self
            this.calculateDistance(currentLocation.latitude, currentLocation.longitude, p.location.lat, p.location.lng) <= 500 // Within 500m
        );

        const suggestions = [];

        for (const pattern of relevantPatterns.slice(0, 3)) {
            // Check if users from this pattern are currently active
            const activeUsers = Array.from(this.users.values()).filter(u =>
                pattern.users.includes(u.id) &&
                u.is_available &&
                u.current_category === categoryId
            );

            if (activeUsers.length > 0) {
                const distance = Math.round(this.calculateDistance(currentLocation.latitude, currentLocation.longitude, pattern.location.lat, pattern.location.lng));

                suggestions.push({
                    id: `suggestion_${Date.now()}_${Math.random()}`,
                    type: 'proximity',
                    category: categoryId,
                    location: pattern.location,
                    user_count: activeUsers.length,
                    distance_meters: distance,
                    message: this.generateSuggestionMessage(categoryId, distance, activeUsers.length),
                    created_at: new Date().toISOString()
                });
            }
        }

        // Save suggestions
        this.suggestions.push(...suggestions);

        return suggestions;
    }

    // NEW METHOD: Natural Language Suggestion Generator
    generateSuggestionMessage(categoryId, distance, userCount) {
        const templates = {
            kafe: [
                `İstersen kahveyi ${distance}m ilerideki kafeden al`,
                `${userCount} kişi yakındaki kafede, sen de katıl`,
                `${distance}m ileride güzel bir kafe var`
            ],
            spor: [
                `${userCount} kişi seninle aynı salonda ter döküyor 💪`,
                `Antrenman sonrası protein shake? ${distance}m ileride birileri var`,
                `Spor salonunda ${userCount} kişi aktif, partner bulabilirsin`
            ],
            mahalle: [
                `Mahallede ${userCount} kişi dışarıda, hadi ya`,
                `26'da bir kahve içmek ister misin?`,
                `İstersen aşağı in, ${userCount} kişi var`
            ],
            alisveris: [
                `Patatesini ${distance}m ilerideki marketten al istersen`,
                `${userCount} kişi yakındaki AVM'de`,
                `İlerideki markete baksana`
            ],
            acik: [
                `Park'ta ${userCount} kişi var, istersen yürüyüş`,
                `${distance}m ileride güzel bir alan var`,
                `Sahil'e in, oralarda birileri var`
            ],
            etkinlik: [
                `Etkinlikte ${userCount} kişi var`,
                `${distance}m ileride bir şeyler oluyor`,
                `Orada birkaç kişi var, ilginç olabilir`
            ]
        };

        const categoryTemplates = templates[categoryId] || templates.mahalle;
        return categoryTemplates[Math.floor(Math.random() * categoryTemplates.length)];
    }

    // USER OPERATIONS
    async createUser(userData) {
        const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const user = {
            id: userId,
            ...userData,
            created_at: new Date().toISOString()
        };
        this.users.set(userId, user);
        return user;
    }

    async getUserById(userId) {
        return this.users.get(userId) || null;
    }

    async getUserByPhone(phoneNumber) {
        for (const user of this.users.values()) {
            if (user.phone_number === phoneNumber) {
                return user;
            }
        }
        return null;
    }

    // LOCATION OPERATIONS
    async addLocationUpdate(userId, locationData) {
        const location = {
            id: `loc_${Date.now()}`,
            user_id: userId,
            ...locationData,
            timestamp: new Date().toISOString()
        };
        this.locationHistory.push(location);

        // Keep only last 1000 location records
        if (this.locationHistory.length > 1000) {
            this.locationHistory = this.locationHistory.slice(-1000);
        }

        return location;
    }

    async getUserLocations(userId, limit = 10) {
        return this.locationHistory
            .filter(loc => loc.user_id === userId)
            .slice(-limit)
            .reverse();
    }

    async getNearbyUsers(latitude, longitude, radiusMeters = 500) {
        const recentLocations = this.locationHistory.filter(loc => {
            const timeDiff = Date.now() - new Date(loc.timestamp).getTime();
            return timeDiff < 10 * 60 * 1000; // Last 10 minutes
        });

        // Simple distance calculation (Haversine)
        const nearby = recentLocations.filter(loc => {
            const distance = this.calculateDistance(
                latitude, longitude,
                loc.latitude, loc.longitude
            );
            return distance <= radiusMeters;
        });

        // Group by user_id and get latest location for each
        const userLocations = new Map();
        nearby.forEach(loc => {
            if (!userLocations.has(loc.user_id)) {
                userLocations.set(loc.user_id, loc);
            }
        });

        return Array.from(userLocations.values());
    }

    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Earth radius in meters
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }

    // MATCH OPERATIONS
    async createMatch(user1Id, user2Id, score) {
        const matchId = `match_${Date.now()}`;
        const match = {
            id: matchId,
            user_1_id: user1Id,
            user_2_id: user2Id,
            match_score: score,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        this.matches.set(matchId, match);
        return match;
    }

    async getUserMatches(userId) {
        return Array.from(this.matches.values()).filter(
            match => match.user_1_id === userId || match.user_2_id === userId
        );
    }

    // NUDGE OPERATIONS
    async createNudge(userId, nudgeData) {
        const nudge = {
            id: `nudge_${Date.now()}`,
            user_id: userId,
            ...nudgeData,
            sent_at: new Date().toISOString()
        };
        this.nudges.push(nudge);
        return nudge;
    }

    async getUserNudges(userId, limit = 10) {
        return this.nudges
            .filter(n => n.user_id === userId)
            .slice(-limit)
            .reverse();
    }

    // HEAT MAP OPERATIONS
    async updateHeatMap(latitude, longitude, timeSlot, dayOfWeek) {
        const gridLat = Math.round(latitude * 1000) / 1000;
        const gridLng = Math.round(longitude * 1000) / 1000;
        const key = `${gridLat},${gridLng},${timeSlot},${dayOfWeek}`;

        const existing = this.heatMaps.get(key) || {
            latitude: gridLat,
            longitude: gridLng,
            time_slot: timeSlot,
            day_of_week: dayOfWeek,
            user_count: 0
        };

        existing.user_count++;
        existing.last_updated = new Date().toISOString();
        this.heatMaps.set(key, existing);

        return existing;
    }

    async getHeatMaps(latitude, longitude, radius = 1000) {
        // Return all heat maps (for development)
        return Array.from(this.heatMaps.values());
    }

    // STATS
    getStats() {
        return {
            total_users: this.users.size,
            total_locations: this.locationHistory.length,
            total_matches: this.matches.size,
            total_nudges: this.nudges.length,
            heat_maps: this.heatMaps.size,
            checkins: this.checkins.length, // Added stats
            patterns: this.userPatterns.size // Fixed: use userPatterns.size instead of undefined patterns.length
        };
    }

    // --- Proximity Methods ---

    logProximityEvent(event) {
        this.proximityEvents = this.proximityEvents || [];
        const newEvent = {
            id: `proximity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            user1: event.user1,
            user2: event.user2,
            method: event.method,
            distance: event.distance || null,
            timestamp: event.timestamp,
            created_at: new Date().toISOString()
        };
        this.proximityEvents.push(newEvent);
        console.log(`✨ Proximity event logged: ${event.user1} <-> ${event.user2} (${event.method})`);
        return newEvent;
    }

    getProximityHistory(userId) {
        this.proximityEvents = this.proximityEvents || [];
        return this.proximityEvents
            .filter(e => e.user1 === userId || e.user2 === userId)
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 50);
    }

    getProximityEvents(minutes = 10) {
        this.proximityEvents = this.proximityEvents || [];
        const threshold = Date.now() - (minutes * 60 * 1000);
        return this.proximityEvents
            .filter(e => e.timestamp > threshold)
            .sort((a, b) => b.timestamp - a.timestamp);
    }

    getProximityStats() {
        this.proximityEvents = this.proximityEvents || [];
        return {
            total: this.proximityEvents.length,
            nfc: this.proximityEvents.filter(e => e.method === 'nfc').length,
            gps: this.proximityEvents.filter(e => e.method === 'gps').length,
            last24h: this.proximityEvents.filter(e =>
                e.timestamp > Date.now() - (24 * 60 * 60 * 1000)
            ).length
        };
    }

    // RESET (for development)
    reset() {
        this.users.clear();
        this.locationHistory = [];
        this.matches.clear();
        this.nudges = [];
        this.heatMaps.clear();
        this.checkins = [];
        this.patterns = [];
        this.suggestions = [];
        console.log('🔄 Database reset');
    }
    // --- AI PATTERN SYSTEM METHODS ---

    // 1. Check-in Logging (Rich Data)
    async logCheckIn(userId, category, location) {
        const now = new Date();
        const checkIn = {
            id: `ci_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            userId,
            category,
            entryTime: now.toISOString(),
            exitTime: null,
            entryCoordinate: location,
            dayOfWeek: now.getDay(), // 0-6
            hourOfDay: now.getHours(),
            duration: 0
        };

        this.checkins.push(checkIn);

        // Also update user state
        const user = this.users.get(userId);
        if (user) {
            user.current_category = category;
            user.current_location = location;
            user.last_active = now.toISOString();
            user.is_available = true;
        }

        console.log(`📝 Check-in logged: ${userId} at ${category} (${now.toLocaleTimeString()})`);
        return checkIn;
    }

    async getUserCheckIns(userId) {
        return this.checkins.filter(ci => ci.userId === userId);
    }

    // 2. Pattern Management
    async saveUserPattern(userId, pattern) {
        this.userPatterns.set(userId, {
            ...pattern,
            lastUpdated: new Date().toISOString()
        });
        console.log(`🧠 Pattern updated for ${userId}`);
    }

    async getUserPattern(userId) {
        return this.userPatterns.get(userId) || null;
    }

    async getAllUsers() { // Helper for suggestion engine
        return Array.from(this.users.values());
    }

    // 3. Suggestion Management
    async saveSuggestions(userId, newSuggestions) {
        const existing = this.suggestions.get(userId) || [];
        const updated = [...existing, ...newSuggestions];
        this.suggestions.set(userId, updated);
        return updated;
    }

    async getUserSuggestions(userId) {
        return this.suggestions.get(userId) || [];
    }

    async updateSuggestionStatus(suggestionId, status) {
        for (const [userId, userSuggestions] of this.suggestions.entries()) {
            const suggestion = userSuggestions.find(s => s.id === suggestionId);
            if (suggestion) {
                suggestion.status = status;
                return suggestion;
            }
        }
        return null;
    }
    // 4. Heat Map Analytics
    logCoordinate(data) {
        if (!this.coordinateHistory) {
            this.coordinateHistory = [];
        }

        this.coordinateHistory.push({
            userId: data.userId,
            latitude: data.latitude,
            longitude: data.longitude,
            category: data.category || null,
            timestamp: Date.now(),
            created_at: new Date().toISOString()
        });

        // Keep only last 10000 coordinates
        if (this.coordinateHistory.length > 10000) {
            this.coordinateHistory.shift();
        }
    }

    getCoordinateHistory(sinceTimestamp = 0) {
        if (!this.coordinateHistory) return [];
        return this.coordinateHistory.filter(c => c.timestamp >= sinceTimestamp);
    }

    getActiveUsers() {
        // Return users who have checked in or updated location recently
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        return Array.from(this.users.values()).filter(u => {
            const lastActive = new Date(u.last_active).getTime();
            return lastActive > fiveMinutesAgo;
        });
    }

    // --- NOTIFICATION OPERATIONS ---

    getUserNotificationPreferences(userId) {
        if (!this.notificationPreferences.has(userId)) {
            // Default preferences
            this.notificationPreferences.set(userId, {
                userId,
                enabled: false, // Default to false until explicitly enabled
                quietHours: { start: '22:00', end: '08:00' },
                types: {
                    proximity: { enabled: true, sound: true },
                    suggestion: { enabled: true, sound: true },
                    match: { enabled: true, sound: true },
                    timing: { enabled: true, sound: true },
                    social: { enabled: true, sound: true },
                    reminder: { enabled: true, sound: true }
                }
            });
        }
        return this.notificationPreferences.get(userId);
    }

    updateNotificationPreferences(userId, updates) {
        const prefs = this.getUserNotificationPreferences(userId);

        // Deep merge updates
        if (updates.quietHours) {
            prefs.quietHours = { ...prefs.quietHours, ...updates.quietHours };
        }

        if (updates.types) {
            Object.keys(updates.types).forEach(type => {
                if (!prefs.types[type]) prefs.types[type] = {};
                prefs.types[type] = { ...prefs.types[type], ...updates.types[type] };
            });
        }

        // Top level properties
        if (typeof updates.enabled !== 'undefined') prefs.enabled = updates.enabled;

        this.notificationPreferences.set(userId, prefs);
        return prefs;
    }

    saveNotificationSubscription(userId, subscription) {
        const prefs = this.getUserNotificationPreferences(userId);
        prefs.pushSubscription = subscription;
        prefs.enabled = true; // Auto-enable on subscribe
        this.notificationPreferences.set(userId, prefs);
        console.log(`📡 Push subscription saved for ${userId}`);
    }

    createNotification(notification) {
        const newNotification = {
            id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            status: 'pending',
            createdAt: new Date().toISOString(),
            ...notification
        };
        this.notifications.push(newNotification);
        return newNotification;
    }

    updateNotification(id, updates) {
        const notification = this.notifications.find(n => n.id === id);
        if (notification) {
            Object.assign(notification, updates);
            return notification;
        }
        return null;
    }
}

module.exports = new MockDatabase();
