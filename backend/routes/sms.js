const express = require('express');
const router = express.Router();

module.exports = (smsService) => {

    // POST /api/sms/send-code - Send verification code
    router.post('/send-code', async (req, res) => {
        try {
            const { phoneNumber } = req.body;

            if (!phoneNumber) {
                return res.status(400).json({
                    error: 'Phone number is required'
                });
            }

            const result = await smsService.sendVerificationCode(phoneNumber);

            res.json({
                success: true,
                message: 'Verification code sent successfully',
                messageSid: result.messageSid,
                mockCode: result.mockCode // Include mock code in response for dev convenience if present
            });

        } catch (error) {
            console.error('Failed to send verification code:', error);

            res.status(500).json({
                error: error.message || 'Failed to send verification code'
            });
        }
    });

    // POST /api/sms/verify-code - Verify SMS code
    router.post('/verify-code', (req, res) => {
        try {
            const { phoneNumber, code } = req.body;

            if (!phoneNumber || !code) {
                return res.status(400).json({
                    error: 'Phone number and code are required'
                });
            }

            const result = smsService.verifyCode(phoneNumber, code);

            if (!result.success) {
                return res.status(400).json(result);
            }

            res.json({
                success: true,
                message: 'Phone number verified successfully'
            });

        } catch (error) {
            console.error('Failed to verify code:', error);

            res.status(500).json({
                error: 'Failed to verify code'
            });
        }
    });

    // GET /api/sms/stats - Get SMS statistics (admin)
    router.get('/stats', (req, res) => {
        try {
            const stats = smsService.getStatistics();
            res.json(stats);
        } catch (error) {
            console.error('Failed to get SMS stats:', error);
            res.status(500).json({ error: 'Failed to get stats' });
        }
    });

    return router;
};
