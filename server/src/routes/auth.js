const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validateLogin } = require('../middleware/validation');
const { authenticateToken, cookieOptionsForAuth, AUTH_COOKIE_NAME } = require('../middleware/auth');

const router = express.Router();

router.post('/login', validateLogin, async (req, res, next) => {
    try {
        const { username, password } = req.body;

        if (username !== process.env.ADMIN_USERNAME) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials.',
            });
        }

        const isMatch = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials.',
            });
        }

        const token = jwt.sign(
            { username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.cookie(AUTH_COOKIE_NAME, token, cookieOptionsForAuth());

        return res.json({
            success: true,
            user: { username },
        });
    } catch (error) {
        next(error);
    }
});

router.post('/logout', (req, res) => {
    res.clearCookie(AUTH_COOKIE_NAME, { ...cookieOptionsForAuth(), maxAge: undefined });
    return res.json({ success: true });
});

router.get('/me', authenticateToken, (req, res) => {
    res.json({
        success: true,
        user: {
            username: req.user.username,
        },
    });
});

module.exports = router;
