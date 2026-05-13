'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import { setToken } from '../../../lib/admin-auth';

export default function AdminLoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();

        try {
            setLoading(true);
            setError('');
            const response = await fetchApi('/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password }),
            });

            setToken(response.token);
            router.replace('/admin/posts');
        } catch (loginError) {
            setError(loginError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="admin-shell">
            <div className="editor-card" style={{ maxWidth: 540, margin: '6rem auto 0' }}>
                <div className="stack">
                    <div>
                        <div className="muted">Admin access</div>
                        <h1 style={{ margin: '0.3rem 0 0' }}>Sign in to the blog CMS</h1>
                    </div>

                    {error ? <div className="notice error">{error}</div> : null}

                    <form className="form-grid" onSubmit={handleSubmit}>
                        <label>
                            Username
                            <input className="input" value={username} onChange={(event) => setUsername(event.target.value)} />
                        </label>

                        <label>
                            Password
                            <input
                                className="input"
                                type="password"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                            />
                        </label>

                        <button className="button" type="submit" disabled={loading}>
                            {loading ? 'Signing in...' : 'Sign in'}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    );
}
