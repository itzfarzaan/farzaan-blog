import SiteHeader from '../components/SiteHeader';
import HomePageClient from '../components/HomePageClient';
import { fetchServerApi } from '../lib/api';

export const revalidate = 60;

async function getInitialData() {
    try {
        const [postsResponse, featuredResponse, tagsResponse] = await Promise.all([
            fetchServerApi('/posts'),
            fetchServerApi('/posts?featured=true'),
            fetchServerApi('/tags'),
        ]);

        return {
            posts: postsResponse.data || [],
            featured: featuredResponse.data || [],
            tags: tagsResponse.data || [],
        };
    } catch (error) {
        return {
            posts: [],
            featured: [],
            tags: [],
        };
    }
}

export default async function HomePage() {
    const { posts, featured, tags } = await getInitialData();

    return (
        <main className="page-shell">
            <SiteHeader adminLink />
            <HomePageClient initialPosts={posts} initialFeatured={featured} tags={tags} />
        </main>
    );
}
