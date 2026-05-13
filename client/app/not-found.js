import SiteHeader from '../components/SiteHeader';
import SiteFooter from '../components/SiteFooter';

export const metadata = {
    title: 'Page not found',
    robots: { index: false, follow: false },
};

export default function NotFound() {
    return (
        <>
            <main className="page-shell">
                <SiteHeader />
                <section className="not-found">
                    <p className="not-found__eyebrow">404</p>
                    <h1 className="not-found__heading">This page wandered off.</h1>
                    <p className="not-found__text">
                        The page you tried to reach doesn’t exist, or has moved somewhere quieter.
                    </p>
                    <a className="not-found__link" href="/">← Back to home</a>
                </section>
            </main>
            <SiteFooter />
        </>
    );
}
