const express = require('express');
const router = express.Router();
const crypto = require('crypto');

// In-memory code storage (use Redis in production)
const verificationCodes = new Map();

// POST /api/auth/send-code - Send SMS verification code
router.post('/send-code', async (req, res) => {
    const { phone } = req.body;

    try {
        // Generate 6-digit code
        const code = Math.floor(100000 + Math.random() * 900000).toString();

        // Store code with 5 minute expiry
        verificationCodes.set(phone, {
            code,
            expiresAt: Date.now() + 5 * 60 * 1000
        });

        // TODO: Send actual SMS (Twilio, etc.)
        console.log(`📱 SMS Code for ${phone}: ${code}`);

        // For development, return code
        res.json({
            success: true,
            message: 'Code sent',
            // Remove in production:
            devCode: code
        });
    } catch (error) {
        console.error('Send code error:', error);
        res.status(500).json({ error: 'Failed to send code' });
    }
});

// POST /api/auth/verify-code - Verify SMS code
router.post('/verify-code', async (req, res) => {
    const { phone, code } = req.body;

    try {
        const stored = verificationCodes.get(phone);

        if (!stored) {
            return res.status(400).json({ error: 'No code found' });
        }

        if (Date.now() > stored.expiresAt) {
            verificationCodes.delete(phone);
            return res.status(400).json({ error: 'Code expired' });
        }

        if (stored.code !== code) {
            return res.status(400).json({ error: 'Invalid code' });
        }

        // Code is valid
        verificationCodes.delete(phone);

        console.log(`✅ Phone verified: ${phone}`);

        res.json({
            success: true,
            verified: true
        });
    } catch (error) {
        console.error('Verify code error:', error);
        res.status(500).json({ error: 'Verification failed' });
    }
});

// POST /api/auth/register - Complete user registration
router.post('/register', async (req, res) => {
    const {
        phone,
        firstName,
        lastName,
        username, // Added username
        email,
        age,
        gender,
        bio,
        timestamp
    } = req.body;

    const db = req.app.locals.db;

    try {
        // Create user ID
        const userId = `user_${Date.now()}_${crypto.randomBytes(4).toString('hex')}`;

        // Generate simple token (use JWT in production)
        const token = crypto.randomBytes(32).toString('hex');

        // Create user object
        const user = {
            id: userId,
            phone,
            firstName,
            lastName,
            username, // Added username
            email,
            age: age || null,
            gender: gender || null,
            bio: bio || null,
            self_description: null,
            profile_photo: null,
            current_category: null,
            current_location: null,
            is_available: false,
            is_active: true,
            created_at: timestamp,
            last_active: timestamp,
            token
        };

        // Save to database
        db.users.set(userId, user);

        console.log(`👤 New user registered: ${firstName} ${lastName} (${userId})`);

        res.json({
            success: true,
            userId,
            token,
            user: {
                id: userId,
                firstName,
                lastName,
                email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

// GET /api/auth/me - Get current user info (with token)
router.get('/me', async (req, res) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    const db = req.app.locals.db;

    if (!token) {
        return res.status(401).json({ error: 'No token provided' });
    }

    try {
        // Find user by token
        const user = Array.from(db.users.values()).find(u => u.token === token);

        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }

        res.json({
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
                age: user.age,
                gender: user.gender,
                bio: user.bio,
                self_description: user.self_description,
                current_category: user.current_category,
                is_available: user.is_available
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

module.exports = router;
