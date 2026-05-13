'use client';

import { useEffect, useMemo, useState } from 'react';
import AdminGuard from '../../../components/admin/AdminGuard';
import AdminNavbar from '../../../components/admin/AdminNavbar';
import { fetchApi } from '../../../lib/api';
import { formatDate } from '../../../lib/content';

const PAGE_SIZE = 15;

export default function AdminPostsPage() {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');
    const [page, setPage] = useState(1);

    useEffect(() => {
        fetchApi('/admin/posts')
            .then((response) => setPosts(response.data))
            .catch((fetchError) => {
                if (fetchError.message === 'Session expired') {
                    window.location.href = '/admin/login';
                    return;
                }

                setError(fetchError.message);
            });
    }, []);

    const totalPages = Math.max(1, Math.ceil(posts.length / PAGE_SIZE));
    const visiblePosts = useMemo(() => {
        const start = (page - 1) * PAGE_SIZE;
        return posts.slice(start, start + PAGE_SIZE);
    }, [posts, page]);

    return (
        <AdminGuard>
            <main className="admin-shell">
                <AdminNavbar />

                {error ? <div className="login-form__error" role="alert">{error}</div> : null}

                {posts.length === 0 && !error ? (
                    <div className="admin-empty">No posts yet. Start with a new one.</div>
                ) : (
                    <>
                        <div className="table-wrap">
                            <table className="admin-table">
                                <thead>
                                    <tr>
                                        <th>Title</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {visiblePosts.map((post) => (
                                        <tr key={post.id}>
                                            <td>
                                                <a className="admin-table__title" href={`/admin/posts/${post.id}`}>
                                                    {post.title || 'Untitled'}
                                                </a>
                                                <div className="admin-table__slug">/{post.slug}</div>
                                            </td>
                                            <td>
                                                <span className="status-badge" data-status={post.status}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="admin-table__date">
                                                {post.published_at ? formatDate(post.published_at) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalPages > 1 ? (
                            <div className="admin-pagination">
                                <button
                                    type="button"
                                    className="admin-pagination__btn"
                                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                                    disabled={page === 1}
                                >
                                    Previous
                                </button>
                                <span className="admin-pagination__status">Page {page} of {totalPages}</span>
                                <button
                                    type="button"
                                    className="admin-pagination__btn"
                                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                                    disabled={page === totalPages}
                                >
                                    Next
                                </button>
                            </div>
                        ) : null}
                    </>
                )}
            </main>
        </AdminGuard>
    );
}
