const express = require('express');
const authRoutes = require('./auth');
const postsRoutes = require('./posts');
const tagsRoutes = require('./tags');
const adminRoutes = require('./admin');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/posts', postsRoutes);
router.use('/tags', tagsRoutes);
router.use('/admin', authenticateToken, adminRoutes);

module.exports = router;
