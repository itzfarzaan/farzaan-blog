import { fetchServerApi } from '../../lib/api';
import { siteConfig } from '../../lib/site-config';

const SITE_URL = 'https://blog.farzaanali.com';
const FEED_TITLE = `${siteConfig.name} — Notes`;
const FEED_DESCRIPTION = siteConfig.intro;

export const revalidate = 60;

function escapeXml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function toRfc822(value) {
    const date = value ? new Date(value) : new Date();
    return date.toUTCString();
}

export async function GET() {
    let posts = [];
    try {
        const response = await fetchServerApi('/posts');
        posts = response.data || [];
    } catch (error) {
        // fall through with empty feed
    }

    const items = posts
        .map((post) => {
            const link = `${SITE_URL}/posts/${post.slug}`;
            return `        <item>
            <title>${escapeXml(post.title)}</title>
            <link>${link}</link>
            <guid isPermaLink="true">${link}</guid>
            <description>${escapeXml(post.excerpt || '')}</description>
            <pubDate>${toRfc822(post.published_at)}</pubDate>
        </item>`;
        })
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
        <title>${escapeXml(FEED_TITLE)}</title>
        <link>${SITE_URL}</link>
        <description>${escapeXml(FEED_DESCRIPTION)}</description>
        <language>en-us</language>
        <lastBuildDate>${toRfc822()}</lastBuildDate>
        <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
${items}
    </channel>
</rss>
`;

    return new Response(xml, {
        headers: {
            'Content-Type': 'application/rss+xml; charset=utf-8',
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
    });
}
