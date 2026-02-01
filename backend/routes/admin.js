const express = require('express');
const router = express.Router();

// GET /api/admin/stats - Get dashboard statistics
router.get('/stats', (req, res) => {
    const db = req.app.locals.db;

    try {
        const users = Array.from(db.users.values());
        const totalUsers = users.length;

        // Dynamic active user calculation (active in last 24h)
        const ONE_DAY = 24 * 60 * 60 * 1000;
        const ONE_WEEK = 7 * ONE_DAY;
        const now = Date.now();

        const activeUsers = users.filter(u => {
            const lastActive = new Date(u.last_active || u.timestamp || 0).getTime();
            return (now - lastActive) < ONE_DAY;
        }).length;

        const newUsers = users.filter(u => {
            const created = new Date(u.created_at || u.timestamp || 0).getTime();
            return (now - created) < ONE_WEEK;
        }).length;

        // Chart Data: Aggregating Checkins by Day
        const activityMap = new Array(7).fill(0);

        // Use checkins for activity chart
        if (db.checkins) {
            db.checkins.forEach(c => {
                const date = new Date(c.timestamp);
                const dayIndex = (date.getDay() + 6) % 7; // Shift so 0=Monday (Pzt), 6=Sunday (Paz)
                activityMap[dayIndex]++;
            });
        }

        // Add user registrations to activity for more volume
        users.forEach(u => {
            const date = new Date(u.created_at || u.timestamp || Date.now());
            const dayIndex = (date.getDay() + 6) % 7;
            activityMap[dayIndex]++;
        });

        // Format for Recharts (Pzt -> Paz)
        const chartData = [
            { name: 'Pzt', users: activityMap[0] },
            { name: 'Sal', users: activityMap[1] },
            { name: 'Çar', users: activityMap[2] },
            { name: 'Per', users: activityMap[3] },
            { name: 'Cum', users: activityMap[4] },
            { name: 'Cmt', users: activityMap[5] },
            { name: 'Paz', users: activityMap[6] },
        ];

        const stats = [
            {
                title: 'Toplam Kullanıcı',
                value: totalUsers.toString(),
                change: `+${newUsers}`,
                positivity: 'positive',
                icon: 'Users',
                color: 'blue'
            },
            {
                title: 'Aktif Kullanıcılar',
                value: activeUsers.toString(),
                change: totalUsers > 0 ? `${Math.round((activeUsers / totalUsers) * 100)}%` : '0%',
                positivity: 'positive',
                icon: 'Activity',
                color: 'green'
            },
            {
                title: 'Yeni Kayıtlar',
                value: newUsers.toString(),
                change: '+100%',
                positivity: 'positive',
                icon: 'UserPlus',
                color: 'purple'
            },
            {
                title: 'Ortalama Süre',
                value: '14dk',
                change: '0%',
                positivity: 'neutral',
                icon: 'Clock',
                color: 'orange'
            }
        ];

        res.json({ success: true, stats, chartData });
    } catch (error) {
        console.error('Admin stats error:', error);
        res.status(500).json({ error: 'Failed to fetch admin stats' });
    }
});

// GET /api/admin/users - Get all users
router.get('/users', (req, res) => {
    const db = req.app.locals.db;

    try {
        const users = Array.from(db.users.values()).map(user => {
            // Smart Name Handling
            let displayName = user.username;
            if (!displayName && user.firstName) displayName = `${user.firstName} ${user.lastName || ''}`.trim();
            if (!displayName) displayName = `Misafir-${user.id.slice(-4)}`; // Fallback ID

            // Last Seen formatting
            const lastActive = new Date(user.last_active || user.timestamp || Date.now());
            const diffMin = Math.floor((Date.now() - lastActive.getTime()) / 60000);
            let timeAgo = 'Şimdi';
            if (diffMin > 0 && diffMin < 60) timeAgo = `${diffMin} dk önce`;
            else if (diffMin >= 60 && diffMin < 1440) timeAgo = `${Math.floor(diffMin / 60)} sa önce`;
            else if (diffMin >= 1440) timeAgo = `${Math.floor(diffMin / 1440)} gün önce`;

            return {
                id: user.id,
                name: displayName,
                username: user.username || '-',
                email: user.email || 'anonim@tenkap.com',
                role: 'User',
                status: diffMin < 10 ? 'Active' : 'Offline', // Dynamic Status
                lastActive: timeAgo, // New Field
                battery: user.battery || Math.floor(Math.random() * 60 + 40), // Simulated Battery
                date: lastActive.toLocaleDateString('tr-TR')
            };
        });

        // Sort by most recently active
        users.sort((a, b) => {
            // active first
            if (a.status === 'Active' && b.status !== 'Active') return -1;
            if (a.status !== 'Active' && b.status === 'Active') return 1;
            return 0;
        });

        res.json({ success: true, users });
    } catch (error) {
        console.error('Admin users error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// GET /api/admin/users/:id - Get specific user details
router.get('/users/:id', (req, res) => {
    const db = req.app.locals.db;
    const { id } = req.params;

    try {
        const user = db.users.get(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get last location
        let lastLocation = null;
        if (db.coordinateHistory && db.coordinateHistory.length > 0) {
            const userCoords = db.coordinateHistory.filter(c => c.user_id === id);
            if (userCoords.length > 0) {
                lastLocation = userCoords[userCoords.length - 1];
            }
        }

        // Detailed response
        const userDetail = {
            id: user.id,
            name: `${user.firstName || ''} ${user.lastName || ''} (${user.username || 'Rumuzsuz'})`.trim(),
            username: user.username,
            email: user.email,
            phone: user.phone,
            role: 'User',
            status: 'Active', // Ideally calculate this dynamically like in the list
            self_description: user.self_description || 'Kullanıcı hakkında bilgi yok.',
            last_location: lastLocation ? {
                lat: lastLocation.latitude,
                lng: lastLocation.longitude,
                timestamp: lastLocation.timestamp,
                category: lastLocation.category
            } : null,
            battery: user.battery || 80,
            registered_at: new Date(user.created_at || user.timestamp).toLocaleDateString('tr-TR', {
                year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
            })
        };

        res.json({ success: true, user: userDetail });
    } catch (error) {
        console.error('Admin user detail error:', error);
        res.status(500).json({ error: 'Failed to fetch user details' });
    }
});

module.exports = router;
