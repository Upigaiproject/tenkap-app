const express = require('express');
const router = express.Router();

// GET /api/matches/nearby
router.get('/nearby', async (req, res) => {
    const { latitude, longitude, radius = 5000 } = req.query;
    const db = req.app.locals.db; // Access the shared DB instance

    if (!latitude || !longitude) {
        return res.status(400).json({ error: 'Location required' });
    }

    try {
        // Get users from our persistent mock database
        // We use a larger radius for demo purposes to ensure we see people
        const nearbyUsers = await db.getNearbyUsers(
            parseFloat(latitude),
            parseFloat(longitude),
            parseInt(radius) || 5000
        );

        // Convert to "Match" format expected by frontend
        const matches = nearbyUsers.map((locOrUser) => {
            // getNearbyUsers returns location objects in some implementations, 
            // but we need the full user profile.
            // Let's check if we got a user object or location object.
            // In our current MockDatabase implementation:
            // getNearbyUsers returns values from `userLocations` map, which are location objects.
            // We need to fetch the full user details.

            const userId = locOrUser.user_id || locOrUser.id; // handle both cases
            const fullProfile = db.users.get(userId);

            if (!fullProfile) return null;

            return {
                id: fullProfile.id,
                name: fullProfile.name,
                age: fullProfile.age,
                gender: fullProfile.gender,
                bio: fullProfile.bio,
                interests: fullProfile.interests,
                photos: fullProfile.photos,
                matchScore: fullProfile.match_score, // from generator
                distance: fullProfile.distance_meters, // static for demo simplicity or recalc
                location: fullProfile.location,
                isOnline: fullProfile.is_online,
                lastActive: fullProfile.last_active
            };
        }).filter(Boolean); // Remove nulls

        // Sort by match score
        matches.sort((a, b) => b.matchScore - a.matchScore);

        res.json({
            matches: matches,
            count: matches.length,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('Error fetching matches:', error);
        res.status(500).json({ error: 'Failed to fetch matches' });
    }
});

module.exports = router;
