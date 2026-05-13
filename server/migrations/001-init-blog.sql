CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE post_status AS ENUM ('draft', 'published');
CREATE TYPE post_asset_type AS ENUM ('image', 'file', 'pdf', 'spreadsheet', 'notebook', 'other');

CREATE TABLE IF NOT EXISTS posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    excerpt TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    status post_status NOT NULL DEFAULT 'draft',
    is_featured BOOLEAN NOT NULL DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reading_time_minutes INTEGER NOT NULL DEFAULT 1,
    search_vector tsvector
);

CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS post_tags (
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS post_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    url TEXT NOT NULL,
    asset_type post_asset_type NOT NULL DEFAULT 'other',
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION refresh_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION refresh_posts_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.excerpt, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.content_markdown, '')), 'C');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS posts_set_updated_at ON posts;
CREATE TRIGGER posts_set_updated_at
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION refresh_posts_updated_at();

DROP TRIGGER IF EXISTS posts_set_search_vector ON posts;
CREATE TRIGGER posts_set_search_vector
BEFORE INSERT OR UPDATE OF title, excerpt, content_markdown ON posts
FOR EACH ROW
EXECUTE FUNCTION refresh_posts_search_vector();

CREATE INDEX IF NOT EXISTS idx_posts_status_published_at
ON posts (status, published_at DESC);

CREATE INDEX IF NOT EXISTS idx_posts_featured_published
ON posts (is_featured, published_at DESC)
WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_posts_search_vector
ON posts USING GIN (search_vector);

CREATE INDEX IF NOT EXISTS idx_tags_slug
ON tags (slug);

CREATE INDEX IF NOT EXISTS idx_post_assets_post_id
ON post_assets (post_id, sort_order);
