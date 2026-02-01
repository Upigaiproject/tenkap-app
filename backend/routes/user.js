const express = require('express');
const router = express.Router();

// POST /api/user/self-description - Save user's self description
router.post('/self-description', async (req, res) => {
    const { userId, description, timestamp } = req.body;
    const db = req.app.locals.db;

    try {
        const user = db.users.get(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user with self description
        user.self_description = description;
        user.self_description_updated_at = timestamp;

        // Log the update
        if (!db.selfDescriptionHistory) {
            db.selfDescriptionHistory = [];
        }

        db.selfDescriptionHistory.push({
            id: `desc_${Date.now()}`,
            user_id: userId,
            description,
            timestamp
        });

        console.log(`📝 Self-description updated: ${userId} → "${description}"`);

        res.json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                self_description: user.self_description
            }
        });
    } catch (error) {
        console.error('Self-description error:', error);
        res.status(500).json({ error: 'Failed to save self-description' });
    }
});

// GET /api/user/:userId/self-description - Get user's self description
router.get('/:userId/self-description', async (req, res) => {
    const { userId } = req.params;
    const db = req.app.locals.db;

    try {
        const user = db.users.get(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            userId: user.id,
            name: user.name,
            self_description: user.self_description || null,
            updated_at: user.self_description_updated_at || null
        });
    } catch (error) {
        console.error('Get self-description error:', error);
        res.status(500).json({ error: 'Failed to get self-description' });
    }
});

module.exports = router;
