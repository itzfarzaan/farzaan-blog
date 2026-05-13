'use client';

import { useEffect, useState } from 'react';
import AdminGuard from '../../../components/admin/AdminGuard';
import { clearToken, getToken } from '../../../lib/admin-auth';
import { fetchApi } from '../../../lib/api';
import { formatDate } from '../../../lib/content';

export default function AdminPostsPage() {
    const [posts, setPosts] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        const token = getToken();
        if (!token) {
            return;
        }

        fetchApi('/admin/posts', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => setPosts(response.data))
            .catch((fetchError) => {
                if (fetchError.message === 'Session expired') {
                    clearToken();
                    window.location.href = '/admin/login';
                    return;
                }

                setError(fetchError.message);
            });
    }, []);

    return (
        <AdminGuard>
            <main className="admin-shell">
                <div className="editor-card stack">
                    <div className="admin-toolbar">
                        <div>
                            <div className="muted">Content dashboard</div>
                            <h1 style={{ margin: '0.35rem 0 0' }}>Posts</h1>
                        </div>
                        <div className="button-row">
                            <a className="button-secondary" href="/">View site</a>
                            <a className="button" href="/admin/posts/new">New post</a>
                        </div>
                    </div>

                    {error ? <div className="notice error">{error}</div> : null}

                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Status</th>
                                    <th>Published</th>
                                    <th>Reading time</th>
                                    <th>Tags</th>
                                </tr>
                            </thead>
                            <tbody>
                                {posts.map((post) => (
                                    <tr key={post.id}>
                                        <td>
                                            <a href={`/admin/posts/${post.id}`}><strong>{post.title}</strong></a>
                                            <div className="muted">{post.slug}</div>
                                        </td>
                                        <td>
                                            <span className="status-badge" data-status={post.status}>
                                                {post.status}
                                            </span>
                                        </td>
                                        <td>{formatDate(post.published_at)}</td>
                                        <td>{post.reading_time_minutes} min</td>
                                        <td>{(post.tags || []).map((tag) => tag.name).join(', ') || '-'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </AdminGuard>
    );
}
