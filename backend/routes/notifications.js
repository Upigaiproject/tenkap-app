const express = require('express');
const router = express.Router();

module.exports = (notificationService) => {

    // POST /api/notifications/subscribe - Subscribe to push notifications
    router.post('/subscribe', async (req, res) => {
        try {
            const { userId, subscription } = req.body;

            if (!userId || !subscription) {
                return res.status(400).json({ error: 'Missing userId or subscription' });
            }

            // Save subscription to database via service/db
            notificationService.db.saveNotificationSubscription(userId, subscription);

            res.json({ success: true });
        } catch (error) {
            console.error('Failed to save push subscription:', error);
            res.status(500).json({ error: 'Failed to save subscription' });
        }
    });

    // GET /api/notifications/preferences/:userId - Get user preferences
    router.get('/preferences/:userId', (req, res) => {
        try {
            const { userId } = req.params;
            const preferences = notificationService.db.getUserNotificationPreferences(userId);

            res.json({ preferences });
        } catch (error) {
            console.error('Failed to get preferences:', error);
            res.status(500).json({ error: 'Failed to get preferences' });
        }
    });

    // PATCH /api/notifications/preferences/:userId - Update preferences
    router.patch('/preferences/:userId', async (req, res) => {
        try {
            const { userId } = req.params;
            const updates = req.body;

            const preferences = notificationService.db.updateNotificationPreferences(userId, updates);

            res.json({ preferences });
        } catch (error) {
            console.error('Failed to update preferences:', error);
            res.status(500).json({ error: 'Failed to update preferences' });
        }
    });

    // PATCH /api/notifications/preferences/:userId/type/:type - Update specific type preference
    router.patch('/preferences/:userId/type/:type', async (req, res) => {
        try {
            const { userId, type } = req.params;
            const updates = req.body;

            const preferences = notificationService.db.updateNotificationPreferences(userId, {
                types: {
                    [type]: updates
                }
            });

            res.json({ preferences });
        } catch (error) {
            console.error('Failed to update type preferences:', error);
            res.status(500).json({ error: 'Failed to update type preferences' });
        }
    });

    // POST /api/notifications/test - Send test notification
    router.post('/test', async (req, res) => {
        try {
            const { userId } = req.body;

            const sent = await notificationService.sendNotification(userId, {
                type: 'reminder',
                title: '🧪 Test Bildirimi',
                body: 'Bu Tenkap sisteminden gelen bir test bildirimidir.',
                icon: '/pwa-192x192.png',
                priority: 'normal',
                requireInteraction: true
            });

            if (sent) {
                res.json({ success: true });
            } else {
                res.status(400).json({ success: false, message: 'Notification failed (disabled or no subscription)' });
            }
        } catch (error) {
            console.error('Failed to send test notification:', error);
            res.status(500).json({ error: 'Failed to send test notification' });
        }
    });

    return router;
};
