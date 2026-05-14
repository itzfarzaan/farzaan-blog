import SiteHeader from './SiteHeader';

export default function SkeletonPage({ kind = 'home' }) {
    const isAdmin = kind === 'admin';

    return (
        <main className={isAdmin ? 'admin-shell' : 'page-shell'}>
            {isAdmin ? null : <SiteHeader />}
            <div className={`skeleton-page skeleton-page--${kind}`} aria-hidden="true">
                <div className="skeleton-line skeleton-line--short" />
                <div className="skeleton-line skeleton-line--title" />
                <div className="skeleton-line" />
                <div className="skeleton-line skeleton-line--wide" />
                <div className="skeleton-block" />
                <div className="skeleton-list">
                    <div className="skeleton-row" />
                    <div className="skeleton-row" />
                    <div className="skeleton-row" />
                </div>
            </div>
        </main>
    );
}
