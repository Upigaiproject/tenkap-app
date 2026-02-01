const http = require('http');

const get = (path) => {
    return new Promise((resolve, reject) => {
        http.get(`http://localhost:3001${path}`, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve({ error: 'Invalid JSON', raw: data });
                }
            });
        }).on('error', reject);
    });
};

const run = async () => {
    try {
        console.log('--- Checking Backend Status ---');

        // Check Users
        const users = await get('/api/admin/users');
        console.log(`Users Count: ${users.users ? users.users.length : 'Error'}`);
        if (users.users && users.users.length > 0) {
            console.log('Last User:', JSON.stringify(users.users[users.users.length - 1], null, 2));
        } else {
            console.log('Users Response:', users);
        }

        // Check Stats
        const stats = await get('/api/admin/stats');
        console.log('\nStats:', JSON.stringify(stats, null, 2));

        // Check Tracking/Checkins
        const allCoords = await get('/api/tracking/all?limit=5');
        console.log(`\nCoordinate Count: ${allCoords.count}`);

    } catch (error) {
        console.error('Diagnostic failed:', error.message);
    }
};

run();
