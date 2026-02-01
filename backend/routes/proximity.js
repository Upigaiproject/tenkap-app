const express = require('express');
const router = express.Router();

module.exports = (io, proximityService) => {

    // Socket.io events
    io.on('connection', (socket) => {
        // console.log('🔌 User connected:', socket.id);
        let currentUserId = null;

        // User registers for proximity detection
        socket.on('proximity:register', (data) => {
            const { userId, location } = data;
            currentUserId = userId;

            proximityService.registerUser(userId, location, socket.id);

            socket.emit('proximity:registered', {
                success: true,
                activeUsers: proximityService.getActiveUsersCount()
            });
        });

        // Location update from GPS
        socket.on('location:update', (data) => {
            const { userId, location } = data;
            proximityService.updateLocation(userId, location);
        });

        // NFC proximity detected (client-side)
        socket.on('proximity:detected', (data) => {
            const { userId, nearbyUserId, method } = data;

            console.log(`🔵 NFC proximity detected: ${userId} <-> ${nearbyUserId}`);

            // Fetch both user details
            const user1SocketId = socket.id;
            // We need to find the socket ID of the nearby user.
            // Ideally proximityService tracks this, but for NFC scan without prior registration, we might need a lookup.
            // Assuming nearbyUserId is registered in activeUsers:
            const user2 = proximityService.activeUsers.get(nearbyUserId);

            if (user2) {
                // Notify both users
                socket.emit('proximity:match', {
                    userId: nearbyUserId,
                    distance: 0.1, // NFC means very close
                    method: 'nfc',
                    timestamp: Date.now()
                });

                io.to(user2.socketId).emit('proximity:match', {
                    userId,
                    distance: 0.1,
                    method: 'nfc',
                    timestamp: Date.now()
                });

                // Log to database
                const db = socket.request.app?.locals?.db || req?.app?.locals?.db; // Fallback attempt
                // Accessing db via app locals might be tricky inside socket context directly if not bound.
                // We will pass db reference to this router wrapper appropriately or use proximityService.db if available.
                if (proximityService.db && proximityService.db.logProximityEvent) {
                    proximityService.db.logProximityEvent({
                        user1: userId,
                        user2: nearbyUserId,
                        method: 'nfc',
                        timestamp: Date.now()
                    });
                }
            }
        });

        // Handle disconnect
        socket.on('disconnect', () => {
            if (currentUserId) {
                proximityService.unregisterUser(currentUserId);
            }
            // console.log('🔌 User disconnected:', socket.id);
        });
    });

    // Listen for proximity matches from service
    proximityService.on('proximity:matches', ({ userId, matches }) => {
        const user = proximityService.activeUsers.get(userId);
        if (!user) return;

        matches.forEach(match => {
            // Notify primary user
            io.to(user.socketId).emit('proximity:match', {
                userId: match.userId,
                distance: match.distance,
                method: 'gps',
                timestamp: Date.now()
            });

            // Notify matched user
            io.to(match.socketId).emit('proximity:match', {
                userId,
                distance: match.distance,
                method: 'gps',
                timestamp: Date.now()
            });

            // Log to database
            if (proximityService.db && proximityService.db.logProximityEvent) {
                proximityService.db.logProximityEvent({
                    user1: userId,
                    user2: match.userId,
                    method: 'gps',
                    distance: match.distance,
                    timestamp: Date.now()
                });
            }
        });
    });

    // REST API endpoints

    // GET /api/proximity/active - Get active users count
    router.get('/active', (req, res) => {
        res.json({
            activeUsers: proximityService.getActiveUsersCount()
        });
    });

    // GET /api/proximity/history - Get proximity history for user
    router.get('/history/:userId', (req, res) => {
        const { userId } = req.params;
        const db = req.app.locals.db;
        const events = db.getProximityHistory ? db.getProximityHistory(userId) : [];
        res.json({ events });
    });

    // GET /api/proximity/recent - Get recent proximity events (admin)
    router.get('/recent', (req, res) => {
        const minutes = parseInt(req.query.minutes) || 10;
        const events = proximityService.getRecentProximityEvents(minutes);
        res.json({ events });
    });

    // GET /api/proximity/stats - Get general stats
    router.get('/stats', (req, res) => {
        const db = req.app.locals.db;
        const stats = db.getProximityStats ? db.getProximityStats() : {};
        res.json(stats);
    });

    return router;
};
