const express = require('express');
const {
    fetchPostBySlug,
    listPublishedPosts,
} = require('../utils/postRepository');

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const posts = await listPublishedPosts({
            q: req.query.q || '',
            featured: req.query.featured === 'true',
        });

        res.json({
            success: true,
            data: posts,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/:slug', async (req, res, next) => {
    try {
        const post = await fetchPostBySlug(req.params.slug, false);

        if (!post) {
            return res.status(404).json({
                success: false,
                error: 'Post not found.',
            });
        }

        return res.json({
            success: true,
            data: post,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
