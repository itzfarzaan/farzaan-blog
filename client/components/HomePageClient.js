'use client';

import { useEffect, useState } from 'react';
import IntroBand from './IntroBand';
import { fetchApi } from '../lib/api';
import { formatDate } from '../lib/content';

function PostRow({ post }) {
    return (
        <article className="post-row">
            <time className="post-row__date" dateTime={post.published_at}>
                {formatDate(post.published_at)}
            </time>
            <div className="post-row__body">
                <a className="post-row__title" href={`/posts/${post.slug}`}>{post.title}</a>
                <span className="post-row__meta">a {post.reading_time_minutes} minute{post.reading_time_minutes === 1 ? '' : 's'} read</span>
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

export default function HomePageClient({ initialPosts, initialFeatured }) {
    const [query, setQuery] = useState('');
    const [posts, setPosts] = useState(initialPosts);
    const [isSearching, setIsSearching] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const controller = new AbortController();
        const timer = setTimeout(async () => {
            if (!query.trim()) {
                setPosts(initialPosts);
                setError('');
                return;
            }

            try {
                setIsSearching(true);
                const response = await fetchApi(`/posts?q=${encodeURIComponent(query)}`, {
                    signal: controller.signal,
                });
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
    }, [query, initialPosts]);

    const isSearchActive = Boolean(query.trim());

    return (
        <>
            <IntroBand query={query} onQueryChange={setQuery} isSearching={isSearching} />

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

                <aside className="featured">
                    <span className="featured__label">Featured</span>
                    {initialFeatured.length ? (
                        initialFeatured.map((post) => <FeaturedRow key={post.id} post={post} />)
                    ) : (
                        <span className="posts-empty">Nothing featured yet.</span>
                    )}
                </aside>
            </div>
        </>
    );
}
