import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import HomePageClient from '../components/HomePageClient';
import { fetchServerApi } from '../lib/api';

export const revalidate = 60;

function normalizeTag(value) {
    if (!value) {
        return '';
    }
    const raw = Array.isArray(value) ? value[0] : value;
    return String(raw).trim().toLowerCase();
}

async function getInitialData(tag) {
    try {
        const postsPath = tag ? `/posts?tag=${encodeURIComponent(tag)}` : '/posts';
        const [postsResponse, featuredResponse] = await Promise.all([
            fetchServerApi(postsPath),
            fetchServerApi('/posts?featured=true'),
        ]);

        return {
            posts: postsResponse.data || [],
            featured: featuredResponse.data || [],
        };
    } catch (error) {
        return {
            posts: [],
            featured: [],
        };
    }
}

export default async function HomePage({ searchParams }) {
    const resolvedSearchParams = (await searchParams) || {};
    const initialTag = normalizeTag(resolvedSearchParams.tag);
    const { posts, featured } = await getInitialData(initialTag);

    return (
        <>
            <main className="page-shell">
                <SiteHeader />
                <HomePageClient initialPosts={posts} initialFeatured={featured} initialTag={initialTag} />
            </main>
            <SiteFooter />
        </>
    );
}
