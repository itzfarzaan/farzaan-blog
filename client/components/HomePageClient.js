'use client';

import { useEffect, useState } from 'react';
import IntroBand from './IntroBand';
import { fetchApi } from '../lib/api';
import { formatDate, readingPhrase } from '../lib/content';

function PostRow({ post }) {
    return (
        <article className="post-row">
            <time className="post-row__date" dateTime={post.published_at}>
                {formatDate(post.published_at)}
            </time>
            <div className="post-row__body">
                <a className="post-row__title" href={`/posts/${post.slug}`}>{post.title}</a>
                <span className="post-row__meta">{readingPhrase(post.reading_time_minutes)}</span>
            </div>
        </article>
    );
}

function FeaturedRow({ post }) {
    return (
        <div className="featured-row">
            <a className="featured-row__title" href={`/posts/${post.slug}`}>{post.title}</a>
            <span className="featured-row__meta">
                {formatDate(post.published_at)} · {post.reading_time_minutes} min
            </span>
        </div>
    );
}

const TAG_QUERY_PATTERN = /^#([\w-]+)$/;

function parseSearchQuery(raw) {
    const trimmed = raw.trim();
    if (!trimmed) {
        return { mode: 'idle' };
    }
    const match = trimmed.match(TAG_QUERY_PATTERN);
    if (match) {
        return { mode: 'tag', value: match[1].toLowerCase() };
    }
    return { mode: 'text', value: trimmed };
}

export default function HomePageClient({ initialPosts, initialFeatured, initialTag = '' }) {
    const [query, setQuery] = useState(initialTag ? `#${initialTag}` : '');
    const [posts, setPosts] = useState(initialPosts);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const parsed = parseSearchQuery(query);
        const isInitialTagQuery = parsed.mode === 'tag' && parsed.value === initialTag;

        const timer = setTimeout(async () => {
            if (parsed.mode === 'idle') {
                setPosts(initialPosts);
                setError('');
                return;
            }

            // Server already rendered the matching posts for the initial tag — skip the refetch.
            if (isInitialTagQuery) {
                return;
            }

            try {
                setIsSearching(true);
                const path = parsed.mode === 'tag'
                    ? `/posts?tag=${encodeURIComponent(parsed.value)}`
                    : `/posts?q=${encodeURIComponent(parsed.value)}`;
                const response = await fetchApi(path, { signal: controller.signal });
                setPosts(response.data);
                setError('');
            } catch (fetchError) {
                if (fetchError.name !== 'AbortError') {
                    setError(fetchError.message);
                }
            } finally {
                setIsSearching(false);
            }
        }, 250);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [query, initialPosts, initialTag]);

    const isSearchActive = Boolean(query.trim());

    return (
        <>
            <IntroBand
                query={query}
                onQueryChange={setQuery}
                isSearching={isSearching}
                forceOpen={Boolean(initialTag)}
            />

            {error ? <div className="notice error" style={{ marginBottom: '1rem' }}>{error}</div> : null}

            <div className="home-grid">
                <div className="posts-list">
                    {posts.map((post) => (
                        <PostRow key={post.id} post={post} />
                    ))}
                    {!posts.length ? (
                        <div className="posts-empty">
                            {isSearchActive ? 'No posts matched that search.' : 'No published posts yet.'}
                        </div>
                    ) : null}
                </div>

                {/*
                  FEATURED SECTION — currently disabled.
                  To restore: uncomment the <aside> below AND restore the two-column
                  rule in globals.css (.home-grid). The fetch in app/page.js and the
                  initialFeatured prop are still wired up, so no other changes needed.

                <aside className="featured">
                    <span className="featured__label">Featured</span>
                    {initialFeatured.length ? (
                        initialFeatured.map((post) => <FeaturedRow key={post.id} post={post} />)
                    ) : (
                        <span className="posts-empty">Nothing featured yet.</span>
                    )}
                </aside>
                */}
            </div>
        </>
    );
}
