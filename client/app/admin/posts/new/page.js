import AdminGuard from '../../../../components/admin/AdminGuard';
import AdminNavbar from '../../../../components/admin/AdminNavbar';
import PostEditor from '../../../../components/admin/PostEditor';

export default function NewPostPage() {
    return (
        <AdminGuard>
            <main className="admin-shell">
                <AdminNavbar />
                <PostEditor />
            </main>
        </AdminGuard>
    );
}
