import SiteHeader from '../../../components/SiteHeader';
import MarkdownArticle from '../../../components/MarkdownArticle';
import { fetchServerApi } from '../../../lib/api';
import { formatDate } from '../../../lib/content';
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
            title: 'Post not found | Farzaan Ali Blog',
        };
    }

    return {
        title: `${post.title} | Farzaan Ali Blog`,
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
            <SiteHeader adminLink />
            <article className="article-shell">
                <header className="article-header">
                    <div className="post-meta">
                        <time dateTime={post.published_at}>{formatDate(post.published_at)}</time>
                        <span>{post.reading_time_minutes} min read</span>
                    </div>
                    <h1 className="article-title">{post.title}</h1>
                    {post.tags?.length ? (
                        <div className="tag-row">
                            {post.tags.map((tag) => (
                                <span key={tag.slug || tag.name} className="tag">
                                    {tag.name}
                                </span>
                            ))}
                        </div>
                    ) : null}
                </header>

                <MarkdownArticle content={post.content_markdown} />

                {post.assets?.length ? (
                    <section className="asset-list">
                        {post.assets.map((asset) => (
                            <a key={asset.id || `${asset.url}-${asset.label}`} className="asset-card" href={asset.url} target="_blank" rel="noreferrer">
                                <strong>{asset.label}</strong>
                                <div className="muted">{asset.asset_type}</div>
                            </a>
                        ))}
                    </section>
                ) : null}
            </article>
        </main>
    );
}
