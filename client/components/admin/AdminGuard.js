'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { clearToken, getToken } from '../../lib/admin-auth';
import { fetchApi } from '../../lib/api';

export default function AdminGuard({ children }) {
    const router = useRouter();
    const [status, setStatus] = useState('checking');

    useEffect(() => {
        const token = getToken();

        if (!token) {
            router.replace('/admin/login');
            return;
        }

        fetchApi('/auth/me', {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then(() => setStatus('ready'))
            .catch(() => {
                clearToken();
                router.replace('/admin/login');
            });
    }, [router]);

    if (status !== 'ready') {
        return (
            <div className="admin-shell">
                <div className="panel">Checking your admin session...</div>
            </div>
        );
    }

    return children;
}
