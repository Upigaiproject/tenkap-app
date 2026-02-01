const webpush = require('web-push');

class NotificationService {
    constructor(db) {
        this.db = db;

        // Configure web-push (VAPID keys)
        // Keys should be loaded from .env
        if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
            webpush.setVapidDetails(
                'mailto:admin@tenkap.com',
                process.env.VAPID_PUBLIC_KEY,
                process.env.VAPID_PRIVATE_KEY
            );
            console.log('✅ Web Push initialized');
        } else {
            console.warn('⚠️ VAPID keys missing, push notifications will fail');
        }
    }

    /**
     * Send notification to user
     */
    async sendNotification(userId, notification) {
        try {
            // Get user preferences
            const preferences = this.db.getUserNotificationPreferences(userId);

            // Check if notifications enabled
            if (!preferences || !preferences.enabled) {
                console.log(`❌ Notifications disabled for user ${userId}`);
                return false;
            }

            // Check quiet hours
            if (this.isQuietHours(preferences.quietHours)) {
                console.log(`🔇 Quiet hours for user ${userId}`);
                // Can optionally queue for later, but for now we skip
                return false;
            }

            // Check type preferences
            const typePrefs = preferences.types?.[notification.type];
            if (typePrefs && typePrefs.enabled === false) { // Explicitly check false
                console.log(`❌ Notification type ${notification.type} disabled for user ${userId}`);
                return false;
            }

            // Apply sound/vibration preferences
            if (typePrefs) {
                notification.silent = !typePrefs.sound;
                notification.vibrate = typePrefs.vibration ? [100, 50, 100] : [];
            }

            // Save to database
            const savedNotification = this.db.createNotification({
                ...notification,
                userId,
                status: 'pending'
            });

            // Send push notification if subscription exists
            if (preferences.pushSubscription) {
                await this.sendPushNotification(preferences.pushSubscription, notification);

                this.db.updateNotification(savedNotification.id, {
                    status: 'sent',
                    sentAt: new Date()
                });
            } else {
                console.log(`ℹ️ No push subscription for user ${userId}`);
            }

            return true;

        } catch (error) {
            console.error(`Failed to send notification to user ${userId}:`, error);
            return false;
        }
    }

    /**
     * Send push notification via Web Push API
     */
    async sendPushNotification(subscription, notification) {
        const payload = JSON.stringify({
            title: notification.title,
            body: notification.body,
            icon: notification.icon || '/icon-192x192.png',
            badge: notification.badge || '/icon-192x192.png',
            image: notification.image,
            data: notification.data,
            actions: notification.actions,
            vibrate: notification.vibrate,
            requireInteraction: notification.requireInteraction,
            tag: notification.type
        });

        try {
            await webpush.sendNotification(subscription, payload);
            console.log(`✅ Push notification sent: ${notification.title}`);
        } catch (error) {
            console.error('Failed to send push notification:', error);

            // If subscription is invalid (410 Gone), remove it
            if (error.statusCode === 410 || error.statusCode === 404) {
                console.log('Push subscription expired/invalid.');
                // In a real app, remove subscription from DB
            }

            throw error;
        }
    }

    /**
     * Check if current time is in quiet hours
     */
    isQuietHours(quietHours) {
        if (!quietHours || !quietHours.start || !quietHours.end) return false;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute;

        const [startHour, startMinute] = quietHours.start.split(':').map(Number);
        const [endHour, endMinute] = quietHours.end.split(':').map(Number);

        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        if (startTime < endTime) {
            // e.g., 09:00 - 17:00
            return currentTime >= startTime && currentTime < endTime;
        } else {
            // e.g., 22:00 - 08:00 (crosses midnight)
            return currentTime >= startTime || currentTime < endTime;
        }
    }
}

module.exports = NotificationService;
