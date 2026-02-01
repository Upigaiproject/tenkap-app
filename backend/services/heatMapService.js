class HeatMapService {
    constructor(db) {
        this.db = db;
        this.subscribers = new Map(); // socketId -> filters
    }

    /**
     * Subscribe to heat map updates
     */
    subscribe(socketId, filters) {
        this.subscribers.set(socketId, filters);
        console.log(`📊 Heat map subscriber added: ${socketId}`);
    }

    /**
     * Unsubscribe from heat map updates
     */
    unsubscribe(socketId) {
        this.subscribers.delete(socketId);
        console.log(`📊 Heat map subscriber removed: ${socketId}`);
    }

    /**
     * Generate heat map data based on filters
     */
    generateHeatMapData(filters = {}) {
        const { category = 'all', timeRange = 'live' } = filters;

        // Calculate time threshold
        const now = Date.now();
        let timeThreshold = now;

        switch (timeRange) {
            case '1h':
                timeThreshold = now - (60 * 60 * 1000);
                break;
            case '24h':
                timeThreshold = now - (24 * 60 * 60 * 1000);
                break;
            case '7d':
                timeThreshold = now - (7 * 24 * 60 * 60 * 1000);
                break;
            case 'live':
            default:
                timeThreshold = now - (5 * 60 * 1000); // Last 5 minutes
        }

        // Get all users with recent activity
        const activeUsers = this.db.getActiveUsers();

        // Filter by category if specified
        let filteredUsers = activeUsers;
        if (category !== 'all') {
            filteredUsers = activeUsers.filter(u => u.current_category === category);
        }

        // Get coordinate history for time range
        const coordinateHistory = this.db.getCoordinateHistory(timeThreshold);

        // Aggregate points by location (grid cells)
        const gridSize = 0.001; // ~100m grid cells
        const grid = new Map();

        // Add current locations
        filteredUsers.forEach(user => {
            if (user.current_location) {
                const gridKey = this.getGridKey(
                    user.current_location.latitude,
                    user.current_location.longitude,
                    gridSize
                );

                if (!grid.has(gridKey)) {
                    grid.set(gridKey, {
                        latitude: user.current_location.latitude,
                        longitude: user.current_location.longitude,
                        userCount: 0,
                        categories: new Set()
                    });
                }

                const cell = grid.get(gridKey);
                cell.userCount++;
                if (user.current_category) {
                    cell.categories.add(user.current_category);
                }
            }
        });

        // Add historical coordinates
        coordinateHistory.forEach(coord => {
            if (category === 'all' || coord.category === category) {
                const gridKey = this.getGridKey(
                    coord.latitude,
                    coord.longitude,
                    gridSize
                );

                if (!grid.has(gridKey)) {
                    grid.set(gridKey, {
                        latitude: coord.latitude,
                        longitude: coord.longitude,
                        userCount: 0,
                        categories: new Set()
                    });
                }

                const cell = grid.get(gridKey);
                cell.userCount += 0.5; // Weight historical points less
                if (coord.category) {
                    cell.categories.add(coord.category);
                }
            }
        });

        // Convert grid to array and normalize intensity
        const maxUserCount = Math.max(...Array.from(grid.values()).map(c => c.userCount), 1);

        const points = Array.from(grid.values()).map(cell => ({
            latitude: cell.latitude,
            longitude: cell.longitude,
            intensity: cell.userCount / maxUserCount,
            userCount: Math.round(cell.userCount),
            category: Array.from(cell.categories)[0] || null
        }));

        // Calculate category distribution
        const categories = {};
        filteredUsers.forEach(user => {
            const cat = user.current_category || 'unknown';
            categories[cat] = (categories[cat] || 0) + 1;
        });

        return {
            points,
            totalUsers: filteredUsers.length,
            timeRange: {
                start: new Date(timeThreshold),
                end: new Date(now)
            },
            categories
        };
    }

    /**
     * Get grid key for coordinate clustering
     */
    getGridKey(lat, lon, gridSize) {
        const latGrid = Math.floor(lat / gridSize);
        const lonGrid = Math.floor(lon / gridSize);
        return `${latGrid},${lonGrid}`;
    }

    /**
     * Broadcast heat map update to all subscribers
     */
    broadcastUpdate(io) {
        this.subscribers.forEach((filters, socketId) => {
            const data = this.generateHeatMapData(filters);
            io.to(socketId).emit('heatmap:update', data);
        });
    }

    /**
     * Get heat map statistics
     */
    getStatistics() {
        const data = this.generateHeatMapData({ category: 'all', timeRange: '24h' });

        return {
            totalPoints: data.points.length,
            totalUsers: data.totalUsers,
            categories: data.categories,
            averageIntensity: data.points.reduce((sum, p) => sum + p.intensity, 0) / data.points.length,
            topLocations: data.points
                .sort((a, b) => b.userCount - a.userCount)
                .slice(0, 10)
        };
    }
}

module.exports = HeatMapService;
