'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../../lib/api';
import { setToken } from '../../../lib/admin-auth';
import AdminNavbar from '../../../components/admin/AdminNavbar';

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
            setError(loginError.message || 'Sign-in failed. Try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="admin-shell">
            <AdminNavbar minimal />
            <main className="login-shell">
                <form className="login-form" onSubmit={handleSubmit} noValidate>
                <label className="login-form__field">
                    <span>Username</span>
                    <input
                        className="input"
                        autoComplete="username"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        required
                    />
                </label>

                <label className="login-form__field">
                    <span>Password</span>
                    <input
                        className="input"
                        type="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </label>

                {error ? <div className="login-form__error" role="alert">{error}</div> : null}

                <button className="button" type="submit" disabled={loading}>
                    {loading ? 'Signing in…' : 'Sign in'}
                </button>
                </form>
            </main>
        </div>
    );
}
