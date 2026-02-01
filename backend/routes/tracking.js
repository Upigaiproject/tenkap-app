const express = require('express');
const router = express.Router();

// POST /api/tracking/log-coordinate - Log every coordinate change
router.post('/log-coordinate', async (req, res) => {
    const { userId, latitude, longitude, category, timestamp } = req.body;
    const db = req.app.locals.db;

    try {
        // Use the centralized method for logging
        db.logCoordinate({ userId, latitude, longitude, category });

        // Update real-time user state for "Live" view
        if (db.users.has(userId)) {
            const user = db.users.get(userId);
            user.current_location = { latitude, longitude };
            user.last_active = new Date().toISOString();
            if (category) user.current_category = category;
        } else {
            // Create transient user if not exists (for demo)
            db.users.set(userId, {
                id: userId,
                name: `User ${userId.substr(0, 5)}`,
                current_location: { latitude, longitude },
                current_category: category,
                last_active: new Date().toISOString(),
                is_active: true
            });
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Coordinate logging error:', error);
        res.status(500).json({ error: 'Failed to log coordinate' });
    }
});

// GET /api/tracking/user/:userId - Get all coordinates for a user
router.get('/user/:userId', async (req, res) => {
    const { userId } = req.params;
    const { limit = 100, category } = req.query;
    const db = req.app.locals.db;

    try {
        let userCoords = (db.coordinateHistory || []).filter(c => c.user_id === userId);

        if (category) {
            userCoords = userCoords.filter(c => c.category === category);
        }

        userCoords = userCoords.slice(-parseInt(limit));

        res.json({
            coordinates: userCoords,
            count: userCoords.length,
            userId
        });
    } catch (error) {
        console.error('User tracking error:', error);
        res.status(500).json({ error: 'Failed to get user coordinates' });
    }
});

// GET /api/tracking/all - Get all recent coordinates (admin)
router.get('/all', async (req, res) => {
    const { limit = 1000, category } = req.query;
    const db = req.app.locals.db;

    try {
        let coords = db.coordinateHistory || [];

        if (category) {
            coords = coords.filter(c => c.category === category);
        }

        coords = coords.slice(-parseInt(limit));

        res.json({
            coordinates: coords,
            count: coords.length,
            total: (db.coordinateHistory || []).length
        });
    } catch (error) {
        console.error('All tracking error:', error);
        res.status(500).json({ error: 'Failed to get coordinates' });
    }
});

module.exports = router;
