import AdminGuard from '../../../../components/admin/AdminGuard';
import AdminNavbar from '../../../../components/admin/AdminNavbar';
import PostEditor from '../../../../components/admin/PostEditor';

export default async function EditPostPage({ params }) {
    const resolvedParams = await params;

    return (
        <AdminGuard>
            <main className="admin-shell">
                <AdminNavbar />
                <PostEditor postId={resolvedParams.id} />
            </main>
        </AdminGuard>
    );
}
