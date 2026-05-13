'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fetchApi } from '../../lib/api';

export default function AdminGuard({ children }) {
    const router = useRouter();
    const [status, setStatus] = useState('checking');

    useEffect(() => {
        let cancelled = false;
        fetchApi('/auth/me')
            .then(() => {
                if (!cancelled) {
                    setStatus('ready');
                }
            })
            .catch(() => {
                if (!cancelled) {
                    router.replace('/admin/login');
                }
            });
        return () => {
            cancelled = true;
        };
    }, [router]);

    if (status !== 'ready') {
        return (
            <div className="admin-shell">
                <div className="admin-empty">Checking your admin session…</div>
            </div>
        );
    }

    return children;
}
