export default function SiteHeader({ adminLink = false }) {
    return (
        <header className="site-header">
            <div className="site-header__brand">
                <span className="muted">blog.farzaanali.com</span>
                <h1 className="site-header__title">
                    <a href="/">Farzaan Ali</a>
                </h1>
                <span className="site-header__subtitle">
                    Essays, notes, experiments, and things worth keeping.
                </span>
            </div>
            {adminLink ? (
                <a className="pill-link" href="/admin/posts">
                    Admin
                </a>
            ) : null}
        </header>
    );
}
