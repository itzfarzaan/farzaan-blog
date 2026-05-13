'use client';

import { usePathname, useRouter } from 'next/navigation';
import ThemeToggle from '../ThemeToggle';
import { signOut } from '../../lib/admin-auth';
import { siteConfig } from '../../lib/site-config';

function NavLink({ href, label, active }) {
    return (
        <a
            className="navbar__link"
            href={href}
            aria-current={active ? 'page' : undefined}
        >
            {label}
        </a>
    );
}

function isPostsActive(path) {
    return path === '/admin/posts' || /^\/admin\/posts\/\d+/.test(path);
}

export default function AdminNavbar({ minimal = false }) {
    const pathname = usePathname() || '';
    const router = useRouter();

    async function handleSignOut() {
        await signOut();
        router.replace('/admin/login');
    }

    return (
        <header className="navbar">
            <a className="navbar__brand" href="/admin/posts">{siteConfig.brand}</a>
            <nav className="navbar__right">
                {minimal ? null : (
                    <>
                        <NavLink href="/admin/posts" label="Posts" active={isPostsActive(pathname)} />
                        <span className="navbar__sep" aria-hidden="true">·</span>
                        <NavLink href="/admin/posts/new" label="New" active={pathname === '/admin/posts/new'} />
                        <span className="navbar__sep" aria-hidden="true">·</span>
                    </>
                )}
                <a className="navbar__link" href="/" target={minimal ? undefined : '_blank'} rel={minimal ? undefined : 'noreferrer'}>
                    Site
                </a>
                {minimal ? null : (
                    <>
                        <span className="navbar__sep" aria-hidden="true">·</span>
                        <button type="button" className="navbar__link navbar__signout" onClick={handleSignOut}>
                            Sign out
                        </button>
                    </>
                )}
                <span className="navbar__sep" aria-hidden="true">·</span>
                <ThemeToggle />
            </nav>
        </header>
    );
}
