const pool = require('../db/connection');

class DatabaseService {

    // --- USERS ---

    async createUser(userData) {
        const query = `
            INSERT INTO users (
                phone, first_name, last_name, email, age, gender,
                bio, profile_photo, token, is_active, is_available
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true, true)
            ON CONFLICT (phone) DO UPDATE 
            SET token = EXCLUDED.token, last_active = NOW()
            RETURNING *
        `;

        const values = [
            userData.phone,
            userData.firstName || 'User',
            userData.lastName || '',
            userData.email || null,
            userData.age || null,
            userData.gender || null,
            userData.bio || null,
            userData.profilePhoto || null,
            userData.token
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating user:', error);
            throw error;
        }
    }

    async getUser(userId) {
        // Support querying by ID or Phone (if passed as string that looks like phone)
        const isPhone = userId.startsWith('+');
        const query = isPhone
            ? 'SELECT * FROM users WHERE phone = $1'
            : 'SELECT * FROM users WHERE id = $1';

        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (error) {
            console.error('Error getting user:', error);
            return null;
        }
    }

    async updateUserLocation(userId, latitude, longitude, category) {
        const query = `
            UPDATE users
            SET 
                current_location = ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
                current_category = $4,
                last_active = NOW()
            WHERE id = $1
            RETURNING *
        `;

        try {
            const result = await pool.query(query, [userId, longitude, latitude, category]);
            return result.rows[0];
        } catch (error) {
            console.error('Error updating location:', error);
            throw error;
        }
    }

    async getNearbyUsers(latitude, longitude, radiusMeters = 1000, category = null) {
        // Uses the SQL function find_nearby_users we defined in schema
        // Or we can write raw query here. Let's use raw query for flexibility if function not present.

        let query = `
            SELECT 
                id, first_name, last_name, profile_photo, bio, current_category,
                ST_Y(current_location::geometry) as latitude,
                ST_X(current_location::geometry) as longitude,
                ST_Distance(
                    current_location,
                    ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography
                ) as distance
            FROM users
            WHERE 
                is_active = true 
                AND is_available = true
                AND id != $4 -- Exclude self if passed (handled in controller usually, but good to have)
                AND ST_DWithin(
                    current_location,
                    ST_SetSRID(ST_MakePoint($2, $1), 4326)::geography,
                    $3
                )
        `;

        const params = [latitude, longitude, radiusMeters, '00000000-0000-0000-0000-000000000000']; // Default dummy UUID to avoid error if no ID passed

        if (category && category !== 'Tumu') {
            query += ` AND current_category = $${params.length + 1}`;
            params.push(category);
        }

        query += ` ORDER BY distance ASC`;

        try {
            const result = await pool.query(query, params);
            return result.rows;
        } catch (error) {
            console.error('Error finding nearby users:', error);
            return [];
        }
    }

    // --- CHECK-INS ---

    async createCheckIn(userId, category, latitude, longitude) {
        const query = `
            INSERT INTO checkins (
                user_id, category, entry_time, entry_coordinate
            ) VALUES ($1, $2, NOW(), ST_SetSRID(ST_MakePoint($4, $3), 4326)::geography)
            RETURNING *
        `;
        try {
            const result = await pool.query(query, [userId, category, latitude, longitude]);
            return result.rows[0];
        } catch (error) {
            console.error('Error creating checkin:', error);
            throw error;
        }
    }

    // --- MOCK COMPATIBILITY (Getters) ---
    // These are needed because the current controller accesses direct properties like db.users.size
    // We need to refactor controllers to use async methods instead of sync property access.
    // For now, in the first pass, we focus on the core methods. 
    // Controllers WILL need refactoring.
}

module.exports = new DatabaseService();
