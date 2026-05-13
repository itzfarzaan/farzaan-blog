const pool = require('../config/db');
const { slugify, uniqueTrimmed, isValidHttpUrl } = require('./strings');
const { calculateReadingTime } = require('./content');

function normalizePostInput(body) {
    const title = String(body.title || '').trim();
    const slug = slugify(body.slug || title);
    const excerpt = String(body.excerpt || '').trim();
    const contentMarkdown = String(body.content_markdown || '').trim();
    const status = body.status === 'published' ? 'published' : 'draft';
    const isFeatured = Boolean(body.is_featured);
    const tags = uniqueTrimmed(body.tags);
    const assets = (body.assets || []).map((asset, index) => ({
        label: String(asset.label || '').trim(),
        url: String(asset.url || '').trim(),
        asset_type: asset.asset_type || 'other',
        sort_order: Number.isInteger(asset.sort_order) ? asset.sort_order : index,
    }));

    if (!slug) {
        const error = new Error('A slug could not be generated.');
        error.statusCode = 400;
        error.publicMessage = 'A slug could not be generated.';
        throw error;
    }

    for (const asset of assets) {
        if (!isValidHttpUrl(asset.url)) {
            const error = new Error(`Invalid asset URL: ${asset.url}`);
            error.statusCode = 400;
            error.publicMessage = 'All asset URLs must be valid http/https URLs.';
            throw error;
        }
    }

    return {
        title,
        slug,
        excerpt,
        contentMarkdown,
        status,
        isFeatured,
        tags,
        assets,
        readingTimeMinutes: calculateReadingTime(contentMarkdown),
    };
}

function mapPostRow(row) {
    if (!row) {
        return null;
    }

    return {
        id: row.id,
        title: row.title,
        slug: row.slug,
        excerpt: row.excerpt,
        content_markdown: row.content_markdown,
        status: row.status,
        is_featured: row.is_featured,
        reading_time_minutes: row.reading_time_minutes,
        published_at: row.published_at,
        created_at: row.created_at,
        updated_at: row.updated_at,
        tags: row.tags || [],
        assets: row.assets || [],
    };
}

async function syncTags(client, postId, tagNames) {
    await client.query('DELETE FROM post_tags WHERE post_id = $1', [postId]);

    for (const tagName of tagNames) {
        const tagSlug = slugify(tagName);

        const tagResult = await client.query(
            `
            INSERT INTO tags (name, slug)
            VALUES ($1, $2)
            ON CONFLICT (slug)
            DO UPDATE SET name = EXCLUDED.name
            RETURNING id
            `,
            [tagName, tagSlug]
        );

        await client.query(
            'INSERT INTO post_tags (post_id, tag_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
            [postId, tagResult.rows[0].id]
        );
    }
}

async function syncAssets(client, postId, assets) {
    await client.query('DELETE FROM post_assets WHERE post_id = $1', [postId]);

    for (const asset of assets) {
        await client.query(
            `
            INSERT INTO post_assets (post_id, label, url, asset_type, sort_order)
            VALUES ($1, $2, $3, $4, $5)
            `,
            [postId, asset.label, asset.url, asset.asset_type, asset.sort_order]
        );
    }
}

async function createPost(body) {
    const normalized = normalizePostInput(body);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const publishedAt = normalized.status === 'published' ? new Date() : null;
        const result = await client.query(
            `
            INSERT INTO posts (
                title,
                slug,
                excerpt,
                content_markdown,
                status,
                is_featured,
                published_at,
                reading_time_minutes
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING *
            `,
            [
                normalized.title,
                normalized.slug,
                normalized.excerpt,
                normalized.contentMarkdown,
                normalized.status,
                normalized.isFeatured,
                publishedAt,
                normalized.readingTimeMinutes,
            ]
        );

        const post = result.rows[0];
        await syncTags(client, post.id, normalized.tags);
        await syncAssets(client, post.id, normalized.assets);
        await client.query('COMMIT');

        return fetchPostById(post.id, true);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function updatePost(postId, body) {
    const normalized = normalizePostInput(body);
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        const existing = await client.query('SELECT id, status, published_at FROM posts WHERE id = $1', [postId]);
        if (!existing.rows.length) {
            const error = new Error('Post not found');
            error.statusCode = 404;
            error.publicMessage = 'Post not found.';
            throw error;
        }

        const current = existing.rows[0];
        const publishedAt = normalized.status === 'published'
            ? (current.published_at || new Date())
            : null;

        await client.query(
            `
            UPDATE posts
            SET title = $1,
                slug = $2,
                excerpt = $3,
                content_markdown = $4,
                status = $5,
                is_featured = $6,
                published_at = $7,
                reading_time_minutes = $8
            WHERE id = $9
            `,
            [
                normalized.title,
                normalized.slug,
                normalized.excerpt,
                normalized.contentMarkdown,
                normalized.status,
                normalized.isFeatured,
                publishedAt,
                normalized.readingTimeMinutes,
                postId,
            ]
        );

        await syncTags(client, postId, normalized.tags);
        await syncAssets(client, postId, normalized.assets);
        await client.query('COMMIT');

        return fetchPostById(postId, true);
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
}

async function fetchPostById(postId, includeDrafts = false) {
    const values = [postId];
    let statusClause = '';

    if (!includeDrafts) {
        values.push('published');
        statusClause = 'AND p.status = $2';
    }

    const result = await pool.query(
        `
        SELECT
            p.*,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
                FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
            ) AS tags,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                    'id', a.id,
                    'label', a.label,
                    'url', a.url,
                    'asset_type', a.asset_type,
                    'sort_order', a.sort_order
                )) FILTER (WHERE a.id IS NOT NULL),
                '[]'::json
            ) AS assets
        FROM posts p
        LEFT JOIN post_tags pt ON pt.post_id = p.id
        LEFT JOIN tags t ON t.id = pt.tag_id
        LEFT JOIN post_assets a ON a.post_id = p.id
        WHERE p.id = $1 ${statusClause}
        GROUP BY p.id
        `,
        values
    );

    return mapPostRow(result.rows[0]);
}

async function fetchPostBySlug(slug, includeDrafts = false) {
    const values = [slug];
    let statusClause = '';

    if (!includeDrafts) {
        values.push('published');
        statusClause = 'AND p.status = $2';
    }

    const result = await pool.query(
        `
        SELECT
            p.*,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object('id', t.id, 'name', t.name, 'slug', t.slug))
                FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
            ) AS tags,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object(
                    'id', a.id,
                    'label', a.label,
                    'url', a.url,
                    'asset_type', a.asset_type,
                    'sort_order', a.sort_order
                )) FILTER (WHERE a.id IS NOT NULL),
                '[]'::json
            ) AS assets
        FROM posts p
        LEFT JOIN post_tags pt ON pt.post_id = p.id
        LEFT JOIN tags t ON t.id = pt.tag_id
        LEFT JOIN post_assets a ON a.post_id = p.id
        WHERE p.slug = $1 ${statusClause}
        GROUP BY p.id
        `,
        values
    );

    return mapPostRow(result.rows[0]);
}

async function listPublishedPosts({ q = '', featured = false }) {
    const values = ['published'];
    const conditions = ['p.status = $1'];

    if (featured) {
        values.push(true);
        conditions.push(`p.is_featured = $${values.length}`);
    }

    if (q.trim()) {
        values.push(q.trim());
        conditions.push(`p.search_vector @@ websearch_to_tsquery('english', $${values.length})`);
    }

    const searchRank = q.trim()
        ? `ts_rank(p.search_vector, websearch_to_tsquery('english', $${values.length})) AS rank,`
        : '';
    const orderBy = q.trim() ? 'rank DESC, p.published_at DESC' : 'p.published_at DESC';

    const result = await pool.query(
        `
        SELECT
            p.id,
            p.title,
            p.slug,
            p.excerpt,
            p.reading_time_minutes,
            p.is_featured,
            p.published_at,
            ${searchRank}
            COALESCE(
                json_agg(DISTINCT jsonb_build_object('name', t.name, 'slug', t.slug))
                FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
            ) AS tags
        FROM posts p
        LEFT JOIN post_tags pt ON pt.post_id = p.id
        LEFT JOIN tags t ON t.id = pt.tag_id
        WHERE ${conditions.join(' AND ')}
        GROUP BY p.id
        ORDER BY ${orderBy}
        `,
        values
    );

    return result.rows.map(mapPostRow);
}

async function listAdminPosts() {
    const result = await pool.query(
        `
        SELECT
            p.id,
            p.title,
            p.slug,
            p.excerpt,
            p.status,
            p.is_featured,
            p.reading_time_minutes,
            p.published_at,
            p.created_at,
            p.updated_at,
            COALESCE(
                json_agg(DISTINCT jsonb_build_object('name', t.name, 'slug', t.slug))
                FILTER (WHERE t.id IS NOT NULL),
                '[]'::json
            ) AS tags
        FROM posts p
        LEFT JOIN post_tags pt ON pt.post_id = p.id
        LEFT JOIN tags t ON t.id = pt.tag_id
        GROUP BY p.id
        ORDER BY COALESCE(p.published_at, p.updated_at) DESC
        `
    );

    return result.rows.map(mapPostRow);
}

async function publishPost(postId) {
    const result = await pool.query(
        `
        UPDATE posts
        SET status = 'published',
            published_at = COALESCE(published_at, NOW())
        WHERE id = $1
        RETURNING id
        `,
        [postId]
    );

    if (!result.rows.length) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        error.publicMessage = 'Post not found.';
        throw error;
    }

    return fetchPostById(postId, true);
}

async function unpublishPost(postId) {
    const result = await pool.query(
        `
        UPDATE posts
        SET status = 'draft',
            published_at = NULL
        WHERE id = $1
        RETURNING id
        `,
        [postId]
    );

    if (!result.rows.length) {
        const error = new Error('Post not found');
        error.statusCode = 404;
        error.publicMessage = 'Post not found.';
        throw error;
    }

    return fetchPostById(postId, true);
}

async function listPublicTags() {
    const result = await pool.query(
        `
        SELECT
            t.id,
            t.name,
            t.slug,
            COUNT(pt.post_id)::int AS post_count
        FROM tags t
        JOIN post_tags pt ON pt.tag_id = t.id
        JOIN posts p ON p.id = pt.post_id
        WHERE p.status = 'published'
        GROUP BY t.id
        ORDER BY t.name ASC
        `
    );

    return result.rows;
}

module.exports = {
    createPost,
    updatePost,
    fetchPostById,
    fetchPostBySlug,
    listPublishedPosts,
    listAdminPosts,
    publishPost,
    unpublishPost,
    listPublicTags,
};
