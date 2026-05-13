import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';
import HomePageClient from '../components/HomePageClient';
import { fetchServerApi } from '../lib/api';

export const revalidate = 60;

async function getInitialData() {
    try {
        const [postsResponse, featuredResponse] = await Promise.all([
            fetchServerApi('/posts'),
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

export default async function HomePage() {
    const { posts, featured } = await getInitialData();

    return (
        <main className="page-shell">
            <SiteHeader />
            <HomePageClient initialPosts={posts} initialFeatured={featured} />
            <SiteFooter />
        </main>
    );
}
