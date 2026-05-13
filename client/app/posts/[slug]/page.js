import SiteHeader from '../../../components/SiteHeader';
import SiteFooter from '../../../components/SiteFooter';
import MarkdownArticle from '../../../components/MarkdownArticle';
import { fetchServerApi } from '../../../lib/api';
import { formatDate } from '../../../lib/content';
import { siteConfig } from '../../../lib/site-config';
import { notFound } from 'next/navigation';

export const revalidate = 60;

async function getPost(slug) {
    try {
        const response = await fetchServerApi(`/posts/${slug}`);
        return response.data;
    } catch (error) {
        return null;
    }
}

export async function generateMetadata({ params }) {
    const resolvedParams = await params;
    const post = await getPost(resolvedParams.slug);

    if (!post) {
        return {
            title: 'Post not found',
        };
    }

    return {
        title: post.title,
        description: post.excerpt,
        alternates: {
            canonical: `/posts/${post.slug}`,
        },
        openGraph: {
            type: 'article',
            title: post.title,
            description: post.excerpt,
            url: `/posts/${post.slug}`,
            publishedTime: post.published_at || undefined,
            tags: post.tags?.map((tag) => tag.name),
        },
        twitter: {
            card: 'summary',
            title: post.title,
            description: post.excerpt,
        },
    };
}

export default async function PostPage({ params }) {
    const resolvedParams = await params;
    const post = await getPost(resolvedParams.slug);

    if (!post) {
        notFound();
    }

    return (
        <main className="page-shell">
            <SiteHeader />
            <article className="article-shell">
                <header className="article-header">
                    <h1 className="article-title">{post.title}</h1>
                    <div className="article-meta">
                        <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                        <span aria-hidden="true">·</span>
                        <span>{siteConfig.name}</span>
                        <span aria-hidden="true">·</span>
                        <span>{post.reading_time_minutes} min read</span>
                    </div>
                </header>

                <MarkdownArticle content={post.content_markdown} />

                {post.assets?.length ? (
                    <section className="article-resources">
                        <span className="article-resources__label">Resources</span>
                        {post.assets.map((asset) => (
                            <a
                                key={asset.id || `${asset.url}-${asset.label}`}
                                className="resource-link"
                                href={asset.url}
                                target="_blank"
                                rel="noreferrer"
                            >
                                <span className="resource-link__label">{asset.label}</span>
                                <span className="resource-link__type">{asset.asset_type}</span>
                            </a>
                        ))}
                    </section>
                ) : null}

                <a className="back-link" href="/">← All posts</a>

                {post.tags?.length ? (
                    <footer className="article-tags">
                        <span className="article-tags__label">Tagged</span>
                        <div className="article-tags__list">
                            {post.tags.map((tag, index) => (
                                <span key={tag.slug || tag.name}>
                                    <a
                                        className="article-tags__link"
                                        href={`/?tag=${encodeURIComponent(tag.slug || tag.name)}`}
                                    >
                                        {tag.name}
                                    </a>
                                    {index < post.tags.length - 1 ? (
                                        <span className="article-tags__sep" aria-hidden="true"> · </span>
                                    ) : null}
                                </span>
                            ))}
                        </div>
                    </footer>
                ) : null}
            </article>
            <SiteFooter />
        </main>
    );
}
