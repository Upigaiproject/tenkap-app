class NotificationService {
    private permission: NotificationPermission = 'default';

    async requestPermission(): Promise<boolean> {
        if (!('Notification' in window)) {
            console.warn('Notifications not supported');
            return false;
        }

        if (Notification.permission === 'granted') {
            this.permission = 'granted';
            return true;
        }

        if (Notification.permission !== 'denied') {
            const permission = await Notification.requestPermission();
            this.permission = permission;
            return permission === 'granted';
        }

        return false;
    }

    // Show notification with psychology-driven copy
    show(type: 'match' | 'nudge' | 'proximity', data: any) {
        if (this.permission !== 'granted') {
            console.warn('Notification permission not granted');
            return;
        }

        let title = '';
        let body = '';
        let icon = '/icons/notification-icon.png'; // Make sure this exists or use a generic one

        switch (type) {
            case 'match':
                title = '💫 Birisi yakında!';
                body = `${data.name} senin gibi ${data.sharedInterest} seviyor. ${data.distance}m mesafede.`;
                break;

            case 'nudge':
                title = (data.icon || '🔔') + ' ' + data.title;
                body = data.message;
                break;

            case 'proximity':
                title = '👀 Çok yakındasınız!';
                body = `${data.name} ile aynı yerde olabilirsiniz. Kulaklığını tak!`;
                break;
        }

        // Check if Service Worker is available for persistent notifications (PWA)
        // For MVP, standard Notification API is fine
        const notification = new Notification(title, {
            body,
            icon, // Browser may use default if 404
            badge: icon,
            tag: `tenkap-${type}-${Date.now()}`,
            requireInteraction: type === 'proximity', // Keep visible if proximity
        });

        notification.onclick = () => {
            window.focus();
            // Navigate to appropriate screen
            if (type === 'match') {
                window.location.hash = '#/matches';
            }
            notification.close();
        };

        return notification;
    }
}

export default new NotificationService();
