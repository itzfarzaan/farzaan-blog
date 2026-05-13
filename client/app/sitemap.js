import { fetchServerApi } from '../lib/api';

const SITE_URL = 'https://blog.farzaanali.com';

export const revalidate = 60;

export default async function sitemap() {
    const entries = [
        {
            url: SITE_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
    ];

    try {
        const response = await fetchServerApi('/posts');
        const posts = response.data || [];
        for (const post of posts) {
            entries.push({
                url: `${SITE_URL}/posts/${post.slug}`,
                lastModified: post.published_at ? new Date(post.published_at) : new Date(),
                changeFrequency: 'monthly',
                priority: 0.8,
            });
        }
    } catch (error) {
        // empty / failure: still return the home entry
    }

    return entries;
}
