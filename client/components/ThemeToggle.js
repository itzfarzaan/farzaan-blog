'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = 'farzaan_blog_theme';

function readInitialTheme() {
    if (typeof document === 'undefined') {
        return 'light';
    }
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export default function ThemeToggle() {
    const [theme, setTheme] = useState('light');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setTheme(readInitialTheme());
        setMounted(true);
    }, []);

    function toggle() {
        const next = theme === 'dark' ? 'light' : 'dark';
        setTheme(next);
        if (next === 'dark') {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        try {
            window.localStorage.setItem(STORAGE_KEY, next);
        } catch (_) {
            // ignore
        }
    }

    const isDark = theme === 'dark';
    const label = isDark ? 'Switch to light theme' : 'Switch to dark theme';

    return (
        <button
            type="button"
            className="theme-toggle"
            onClick={toggle}
            aria-label={label}
            title={label}
            suppressHydrationWarning
        >
            {mounted && isDark ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="4" />
                    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
                </svg>
            )}
        </button>
    );
}
