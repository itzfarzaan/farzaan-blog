import { siteConfig } from '../lib/site-config';

export default function SiteFooter() {
    const links = siteConfig.socials;

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                {links.map((link, index) => (
                    <span key={link.label} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.85rem' }}>
                        <a
                            className="footer__link"
                            href={link.href}
                            target={link.href.startsWith('http') ? '_blank' : undefined}
                            rel={link.href.startsWith('http') ? 'noreferrer' : undefined}
                        >
                            {link.label}
                        </a>
                        {index < links.length - 1 ? (
                            <span className="footer__sep" aria-hidden="true">·</span>
                        ) : null}
                    </span>
                ))}
            </div>
        </footer>
    );
}
