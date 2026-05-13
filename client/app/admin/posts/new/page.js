import AdminGuard from '../../../../components/admin/AdminGuard';
import PostEditor from '../../../../components/admin/PostEditor';

export default function NewPostPage() {
    return (
        <AdminGuard>
            <main className="admin-shell">
                <PostEditor />
            </main>
        </AdminGuard>
    );
}
