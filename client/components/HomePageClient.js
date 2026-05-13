'use client';

import { useEffect, useMemo, useState } from 'react';
import { fetchApi } from '../lib/api';
import { formatDate } from '../lib/content';

function PostCard({ post }) {
    return (
        <article className="post-card">
            <div className="post-card__meta">
                <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                <span>{post.reading_time_minutes} min read</span>
            </div>
            <h3>
                <a href={`/posts/${post.slug}`}>{post.title}</a>
            </h3>
            <p className="post-card__excerpt">{post.excerpt}</p>
            {post.tags?.length ? (
                <div className="tag-row">
                    {post.tags.map((tag) => (
                        <span key={tag.slug || tag.name} className="tag">
                            {tag.name}
                        </span>
                    ))}
                </div>
            ) : null}
        </article>
    );
}

export default function HomePageClient({ initialPosts, initialFeatured, tags }) {
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

    const featured = useMemo(() => {
        if (query.trim()) {
            return posts.filter((post) => post.is_featured);
        }

        return initialFeatured;
    }, [initialFeatured, posts, query]);

    return (
        <>
            <section className="hero-card">
                <h2>Words for the long road.</h2>
                <p>
                    A quiet place for essays, field notes, code-heavy writeups, and the occasional useful rabbit hole.
                    Posts support Markdown, images, links, tables, and downloadable resources.
                </p>
            </section>

            <section className="home-grid">
                <div className="panel">
                    <div className="search-box">
                        <label htmlFor="search">Search posts</label>
                        <input
                            id="search"
                            className="input"
                            placeholder="Search by title or content"
                            value={query}
                            onChange={(event) => setQuery(event.target.value)}
                        />
                        {isSearching ? <span className="muted">Searching...</span> : null}
                        {error ? <div className="notice error">{error}</div> : null}
                    </div>

                    <div className="posts-stack">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                        {!posts.length ? (
                            <div className="notice">
                                {query.trim() ? 'No published posts matched that search.' : 'No published posts yet.'}
                            </div>
                        ) : null}
                    </div>
                </div>

                <aside className="panel stack">
                    <div>
                        <h3>Featured</h3>
                        <div className="featured-list">
                            {featured.map((post) => (
                                <div key={post.id} className="featured-item">
                                    <a href={`/posts/${post.slug}`}>{post.title}</a>
                                    <div className="post-card__meta">
                                        <span>{formatDate(post.published_at)}</span>
                                        <span>{post.reading_time_minutes} min read</span>
                                    </div>
                                </div>
                            ))}
                            {!featured.length ? <span className="muted">No featured posts yet.</span> : null}
                        </div>
                    </div>

                    <div>
                        <h3>Topics</h3>
                        <div className="tag-row">
                            {tags.map((tag) => (
                                <span key={tag.slug} className="tag">
                                    {tag.name} - {tag.post_count}
                                </span>
                            ))}
                            {!tags.length ? <span className="muted">Tags will appear here after publishing posts.</span> : null}
                        </div>
                    </div>
                </aside>
            </section>
        </>
    );
}
