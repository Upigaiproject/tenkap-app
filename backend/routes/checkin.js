const express = require('express');
const router = express.Router();

// Mock auth middleware (reuse from location.js)
const mockAuth = (req, res, next) => {
    const userId = req.body.userId || req.query.userId || req.params.userId || 'user_dev_123';
    req.user = { id: userId, name: `User ${userId}` };
    next();
};

// POST /api/checkin - User checks in to a category
router.post('/', mockAuth, async (req, res) => {
    const { categoryId, latitude, longitude } = req.body;
    const userId = req.user.id;
    const db = req.app.locals.db;

    try {
        // Create check-in using new rich data logger
        const checkin = await db.logCheckIn(userId, categoryId, { latitude, longitude });

        // Generate suggestions behavior is TBD for Phase 3, keeping existing logic for now if any
        // For now just logging it

        console.log(`✅ Check-in: ${userId} → ${categoryId}`);

        res.json({
            success: true,
            checkin,
            suggestions: [], // Will populate in Phase 3
            message: `Checked in to ${categoryId}`
        });
    } catch (error) {
        console.error('Check-in error:', error);
        res.status(500).json({ error: 'Failed to check in' });
    }
});

// POST /api/checkin/generate-patterns - Trigger pattern analysis manually
router.post('/generate-patterns', mockAuth, async (req, res) => {
    const userId = req.user.id;
    const db = req.app.locals.db;

    // Lazy load service if not global
    const PatternService = require('../services/patternService');
    const patternService = new PatternService(db);

    try {
        const success = await patternService.refreshUserPatterns(userId);
        const patterns = await db.getUserPattern(userId);

        res.json({
            success,
            patterns,
            message: success ? 'Patterns generated successfully' : 'Not enough data for patterns'
        });
    } catch (error) {
        console.error('Pattern generation error:', error);
        res.status(500).json({ error: 'Failed to generate patterns' });
    }
});

// POST /api/checkout - User closes app or leaves
router.post('/checkout', mockAuth, async (req, res) => {
    const userId = req.user.id;
    const db = req.app.locals.db;

    try {
        await db.checkout(userId);

        console.log(`👋 Checkout: ${userId}`);

        res.json({
            success: true,
            message: 'Checked out successfully'
        });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ error: 'Failed to check out' });
    }
});

// GET /api/patterns - Get heat map patterns (for admin/debugging)
router.get('/patterns', async (req, res) => {
    const db = req.app.locals.db;

    try {
        const patterns = await db.buildHeatMap();

        res.json({
            patterns: patterns.slice(0, 50), // Top 50 patterns
            count: patterns.length,
            generated_at: new Date().toISOString()
        });
    } catch (error) {
        console.error('Patterns error:', error);
        res.status(500).json({ error: 'Failed to get patterns' });
    }
});

// GET /api/suggestions/:userId - Get suggestions for user
router.get('/suggestions/:userId', async (req, res) => {
    const { userId } = req.params;
    const db = req.app.locals.db;

    try {
        const userSuggestions = db.suggestions.filter(s => s.user_id === userId);

        res.json({
            suggestions: userSuggestions,
            count: userSuggestions.length
        });
    } catch (error) {
        console.error('Suggestions error:', error);
        res.status(500).json({ error: 'Failed to get suggestions' });
    }
});

module.exports = router;
