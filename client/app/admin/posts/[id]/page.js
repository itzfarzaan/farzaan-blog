import AdminGuard from '../../../../components/admin/AdminGuard';
import PostEditor from '../../../../components/admin/PostEditor';

export default async function EditPostPage({ params }) {
    const resolvedParams = await params;

    return (
        <AdminGuard>
            <main className="admin-shell">
                <PostEditor postId={resolvedParams.id} />
            </main>
        </AdminGuard>
    );
}
