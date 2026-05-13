const jwt = require('jsonwebtoken');

const AUTH_COOKIE_NAME = 'farzaan_blog_session';

function extractToken(req) {
    if (req.cookies && req.cookies[AUTH_COOKIE_NAME]) {
        return req.cookies[AUTH_COOKIE_NAME];
    }

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }

    return null;
}

function authenticateToken(req, res, next) {
    const token = extractToken(req);

    if (!token) {
        return res.status(401).json({
            success: false,
            error: 'Access denied. No token provided.',
        });
    }

    try {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            error: 'Invalid or expired token.',
        });
    }
}

function cookieOptionsForAuth() {
    const isProd = process.env.NODE_ENV === 'production';
    return {
        httpOnly: true,
        sameSite: 'lax',
        secure: isProd,
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    };
}

module.exports = {
    authenticateToken,
    cookieOptionsForAuth,
    AUTH_COOKIE_NAME,
};
