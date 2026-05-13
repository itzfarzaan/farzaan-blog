const express = require('express');
const { listPublicTags } = require('../utils/postRepository');

const router = express.Router();

const MAX_TAG_LIMIT = 50;

router.get('/', async (req, res, next) => {
    try {
        const prefix = typeof req.query.prefix === 'string' ? req.query.prefix : '';
        const rawLimit = parseInt(req.query.limit, 10);
        const limit = Number.isFinite(rawLimit) && rawLimit > 0
            ? Math.min(rawLimit, MAX_TAG_LIMIT)
            : null;

        const tags = await listPublicTags({ prefix, limit });
        res.json({
            success: true,
            data: tags,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
