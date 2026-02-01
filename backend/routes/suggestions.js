const express = require('express');
const router = express.Router();

module.exports = (io, suggestionEngine) => {

    // POST /api/suggestions/generate - Manual trigger
    router.post('/generate', async (req, res) => {
        try {
            const { userId, currentLocation, currentCategory } = req.body;

            if (!userId || !currentLocation) {
                return res.status(400).json({ error: 'Missing userId or currentLocation' });
            }

            console.log(`✨ Generating suggestions for ${userId}...`);
            const suggestions = await suggestionEngine.generateSuggestions(
                userId,
                currentLocation,
                currentCategory
            );

            // Save to DB
            const db = req.app.locals.db;
            await db.saveSuggestions(userId, suggestions);

            res.json({
                success: true,
                count: suggestions.length,
                suggestions
            });

        } catch (error) {
            console.error('Suggestion generation error:', error);
            res.status(500).json({ error: 'Failed to generate suggestions' });
        }
    });

    // GET /api/suggestions/:userId - Fetch active suggestions
    router.get('/:userId', async (req, res) => {
        try {
            const { userId } = req.params;
            const db = req.app.locals.db;
            const allSuggestions = await db.getUserSuggestions(userId);

            // Filter pending only
            const active = allSuggestions.filter(s => s.status === 'pending');

            res.json({ suggestions: active });
        } catch (error) {
            console.error('Fetch suggestions error:', error);
            res.status(500).json({ error: 'Failed to fetch suggestions' });
        }
    });

    return router;
};
