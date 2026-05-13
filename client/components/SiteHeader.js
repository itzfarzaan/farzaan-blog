import ThemeToggle from './ThemeToggle';
import { siteConfig } from '../lib/site-config';

export default function SiteHeader() {
    return (
        <header className="navbar">
            <a className="navbar__brand" href="/">{siteConfig.name}</a>
            <nav className="navbar__right">
                <a className="navbar__link" href={siteConfig.portfolioUrl} target="_blank" rel="noreferrer">
                    Portfolio
                </a>
                <span className="navbar__sep" aria-hidden="true">·</span>
                <ThemeToggle />
            </nav>
        </header>
    );
}
