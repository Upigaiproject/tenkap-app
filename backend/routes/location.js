const express = require('express');
const router = express.Router();

// Mock authentication middleware
const mockAuth = (req, res, next) => {
    // For development, allow userId from body or query params for testing
    // In production, this would come from JWT token
    const userId = (req.body && req.body.userId) || 
                   (req.query && req.query.userId) || 
                   (req.params && req.params.userId) || 
                   'user_dev_123';
    req.user = { id: userId, name: `User ${userId}` };
    next();
};

// POST /api/location/update
router.post('/update', mockAuth, async (req, res) => {
    const { latitude, longitude, accuracy, timestamp, place_name, place_type } = req.body;
    const userId = req.user.id;
    const db = req.app.locals.db;

    try {
        // Add location to database
        const location = await db.addLocationUpdate(userId, {
            latitude,
            longitude,
            accuracy,
            timestamp,
            place_name,
            place_type
        });

        // Update heat map
        const currentHour = new Date().getHours();
        const timeSlot = `${currentHour.toString().padStart(2, '0')}:00-${(currentHour + 1).toString().padStart(2, '0')}:00`;
        const dayOfWeek = new Date().getDay();

        await db.updateHeatMap(latitude, longitude, timeSlot, dayOfWeek);

        console.log(`📍 Location update: ${place_name || 'Unknown'} (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`);

        res.json({
            success: true,
            location,
            message: 'Location updated successfully'
        });
    } catch (error) {
        console.error('Location update error:', error);
        res.status(500).json({ error: 'Failed to update location' });
    }
});

// GET /api/location/nearby
router.get('/nearby', mockAuth, async (req, res) => {
    const userId = req.user.id;
    const db = req.app.locals.db;

    try {
        // Get user's recent locations
        const userLocations = await db.getUserLocations(userId, 1);

        if (userLocations.length === 0) {
            return res.json({
                matches: [],
                should_notify: false,
                count: 0,
                message: 'No location data yet'
            });
        }

        const { latitude, longitude } = userLocations[0];

        // Find nearby users
        const nearbyLocations = await db.getNearbyUsers(latitude, longitude, 500);

        // Filter out current user
        const nearbyUsers = nearbyLocations.filter(loc => loc.user_id !== userId);

        // Generate mock matches with scores
        const matches = nearbyUsers.map(loc => ({
            user_id: loc.user_id,
            distance_meters: Math.round(db.calculateDistance(
                latitude, longitude,
                loc.latitude, loc.longitude
            )),
            match_score: Math.random() * 0.4 + 0.6, // 0.6 - 1.0
            place_name: loc.place_name
        }));

        res.json({
            matches,
            should_notify: matches.length > 0,
            count: matches.length,
            your_location: { latitude, longitude, place_name: userLocations[0].place_name }
        });
    } catch (error) {
        console.error('Nearby matches error:', error);
        res.status(500).json({ error: 'Failed to fetch nearby matches' });
    }
});

// GET /api/location/history/:userId
router.get('/history/:userId', mockAuth, async (req, res) => {
    const userId = req.params.userId;
    const limit = parseInt(req.query.limit) || 50;
    const db = req.app.locals.db;

    try {
        const locations = await db.getUserLocations(userId, limit);
        res.json({
            history: locations,
            count: locations.length,
            userId: userId
        });
    } catch (error) {
        console.error('Location history error:', error);
        res.status(500).json({ error: 'Failed to fetch location history' });
    }
});

// GET /api/location/history (for authenticated user)
router.get('/history', mockAuth, async (req, res) => {
    const userId = req.user.id;
    const limit = parseInt(req.query.limit) || 50;
    const db = req.app.locals.db;

    try {
        const locations = await db.getUserLocations(userId, limit);
        res.json({
            history: locations,
            count: locations.length,
            userId: userId
        });
    } catch (error) {
        console.error('Location history error:', error);
        res.status(500).json({ error: 'Failed to fetch location history' });
    }
});

// GET /api/location/heatmap
router.get('/heatmap', mockAuth, async (req, res) => {
    const { latitude, longitude, radius } = req.query;
    const db = req.app.locals.db;

    try {
        const heatMaps = await db.getHeatMaps(
            parseFloat(latitude),
            parseFloat(longitude),
            parseInt(radius) || 1000
        );

        res.json({
            heat_maps: heatMaps,
            count: heatMaps.length
        });
    } catch (error) {
        console.error('Heatmap error:', error);
        res.status(500).json({ error: 'Failed to fetch heat map' });
    }
});

module.exports = router;
