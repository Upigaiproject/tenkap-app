const twilio = require('twilio');
const crypto = require('crypto');

class SMSService {
    constructor() {
        // Initialize Twilio client
        // For development, we allow missing credentials to mock the service
        if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
            this.client = twilio(
                process.env.TWILIO_ACCOUNT_SID,
                process.env.TWILIO_AUTH_TOKEN
            );
        } else {
            console.warn('⚠️ Twilio credentials missing. SMS Service running in mock mode.');
        }

        this.fromNumber = process.env.TWILIO_PHONE_NUMBER;

        // In-memory storage for codes (use Redis in production)
        this.verificationCodes = new Map();

        // Rate limiting
        this.rateLimits = new Map(); // phone -> { count, resetTime }
    }

    /**
     * Send verification code via SMS
     */
    async sendVerificationCode(phoneNumber) {
        try {
            // Validate phone number format
            const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
            if (!this.isValidPhoneNumber(normalizedPhone)) {
                throw new Error('Invalid phone number format');
            }

            // Check rate limiting
            if (!this.checkRateLimit(normalizedPhone)) {
                throw new Error('Too many SMS requests. Please try again later.');
            }

            // Generate 6-digit code
            const code = this.generateCode();

            // Store code with 5-minute expiry
            this.verificationCodes.set(normalizedPhone, {
                code,
                expiresAt: Date.now() + (5 * 60 * 1000), // 5 minutes
                attempts: 0,
                createdAt: Date.now()
            });

            // MOCK MODE: If no client, just log the code and return success
            if (!this.client) {
                console.log(`[MOCK SMS] To: ${normalizedPhone} | Code: ${code}`);
                return {
                    success: true,
                    messageSid: 'mock_sid_' + Date.now(),
                    mockCode: code // Return code for debugging/development convenience
                };
            }

            // Send SMS via Twilio
            const message = await this.client.messages.create({
                body: `Tenkap doğrulama kodunuz: ${code}\n\nBu kodu kimseyle paylaşmayın.`,
                from: this.fromNumber,
                to: normalizedPhone
            });

            console.log(`✅ SMS sent to ${normalizedPhone}: ${message.sid}`);

            return {
                success: true,
                messageSid: message.sid
            };

        } catch (error) {
            console.error('Failed to send SMS:', error);
            throw error;
        }
    }

    /**
     * Verify SMS code
     */
    verifyCode(phoneNumber, code) {
        const normalizedPhone = this.normalizePhoneNumber(phoneNumber);
        const stored = this.verificationCodes.get(normalizedPhone);

        if (!stored) {
            return {
                success: false,
                error: 'No verification code found. Please request a new code.'
            };
        }

        // Check expiry
        if (Date.now() > stored.expiresAt) {
            this.verificationCodes.delete(normalizedPhone);
            return {
                success: false,
                error: 'Verification code expired. Please request a new code.'
            };
        }

        // Check attempts (max 3)
        if (stored.attempts >= 3) {
            this.verificationCodes.delete(normalizedPhone);
            return {
                success: false,
                error: 'Too many failed attempts. Please request a new code.'
            };
        }

        // Verify code
        if (stored.code !== code) {
            stored.attempts++;
            return {
                success: false,
                error: `Invalid code. ${3 - stored.attempts} attempts remaining.`
            };
        }

        // Success - remove code
        this.verificationCodes.delete(normalizedPhone);

        console.log(`✅ Phone verified: ${normalizedPhone}`);

        return {
            success: true
        };
    }

    /**
     * Generate random 6-digit code
     */
    generateCode() {
        return crypto.randomInt(100000, 999999).toString();
    }

    /**
     * Normalize phone number to E.164 format
     */
    normalizePhoneNumber(phoneNumber) {
        // Remove all non-numeric characters
        let cleaned = phoneNumber.replace(/\D/g, '');

        // Add +90 for Turkish numbers if not present
        if (cleaned.startsWith('0')) {
            cleaned = '90' + cleaned.substring(1);
        }
        if (!cleaned.startsWith('90')) {
            cleaned = '90' + cleaned;
        }

        return '+' + cleaned;
    }

    /**
     * Validate phone number format
     */
    isValidPhoneNumber(phoneNumber) {
        // E.164 format: +[country code][number]
        // Turkish mobile: +905xxxxxxxxx (13 digits total with +)
        // Adjusted regex to be slightly more lenient for generic checks if needed, but sticking to user spec
        const pattern = /^\+90[0-9]{10}$/;
        return pattern.test(phoneNumber);
    }

    /**
     * Check rate limiting (max 3 SMS per hour per phone)
     */
    checkRateLimit(phoneNumber) {
        const now = Date.now();
        const limit = this.rateLimits.get(phoneNumber);

        if (!limit) {
            this.rateLimits.set(phoneNumber, {
                count: 1,
                resetTime: now + (60 * 60 * 1000) // 1 hour
            });
            return true;
        }

        // Reset if time passed
        if (now > limit.resetTime) {
            this.rateLimits.set(phoneNumber, {
                count: 1,
                resetTime: now + (60 * 60 * 1000)
            });
            return true;
        }

        // Check limit
        if (limit.count >= 3) {
            return false;
        }

        // Increment count
        limit.count++;
        return true;
    }

    /**
     * Get verification code statistics
     */
    getStatistics() {
        const now = Date.now();
        const activeCodes = Array.from(this.verificationCodes.values()).filter(
            v => v.expiresAt > now
        );

        return {
            activeVerifications: activeCodes.length,
            totalRateLimited: this.rateLimits.size,
            averageAttempts: activeCodes.length > 0 ? activeCodes.reduce((sum, v) => sum + v.attempts, 0) / activeCodes.length : 0
        };
    }

    /**
     * Cleanup expired codes (run periodically)
     */
    cleanup() {
        const now = Date.now();

        // Remove expired verification codes
        for (const [phone, data] of this.verificationCodes.entries()) {
            if (now > data.expiresAt) {
                this.verificationCodes.delete(phone);
            }
        }

        // Remove expired rate limits
        // Note: Rate limits should technically persist longer than codes, but for cleaning memory:
        for (const [phone, data] of this.rateLimits.entries()) {
            if (now > data.resetTime) {
                this.rateLimits.delete(phone);
            }
        }

        console.log('🧹 SMS service cleanup completed');
    }
}

module.exports = SMSService;
