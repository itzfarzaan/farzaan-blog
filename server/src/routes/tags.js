const express = require('express');
const { listPublicTags } = require('../utils/postRepository');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const tags = await listPublicTags();
        res.json({
            success: true,
            data: tags,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
