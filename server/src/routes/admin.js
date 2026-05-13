const express = require('express');
const { validateBody } = require('../middleware/validation');
const {
    createPost,
    updatePost,
    fetchPostById,
    listAdminPosts,
    publishPost,
    unpublishPost,
} = require('../utils/postRepository');

const router = express.Router();

router.get('/posts', async (req, res, next) => {
    try {
        const posts = await listAdminPosts();
        res.json({
            success: true,
            data: posts,
        });
    } catch (error) {
        next(error);
    }
});

router.get('/posts/:id', async (req, res, next) => {
    try {
        const post = await fetchPostById(req.params.id, true);

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

router.post('/posts', validateBody('postWrite', 'create'), async (req, res, next) => {
    try {
        const post = await createPost(req.body);
        res.status(201).json({
            success: true,
            data: post,
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                error: 'A post with that slug already exists.',
            });
        }

        next(error);
    }
});

router.put('/posts/:id', validateBody('postWrite', 'create'), async (req, res, next) => {
    try {
        const post = await updatePost(req.params.id, req.body);
        res.json({
            success: true,
            data: post,
        });
    } catch (error) {
        if (error.code === '23505') {
            return res.status(409).json({
                success: false,
                error: 'A post with that slug already exists.',
            });
        }

        next(error);
    }
});

router.post('/posts/:id/publish', async (req, res, next) => {
    try {
        const post = await publishPost(req.params.id);
        res.json({
            success: true,
            data: post,
        });
    } catch (error) {
        next(error);
    }
});

router.post('/posts/:id/unpublish', async (req, res, next) => {
    try {
        const post = await unpublishPost(req.params.id);
        res.json({
            success: true,
            data: post,
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
