import { siteConfig } from '../lib/site-config';

export default function SiteFooter() {
    const links = siteConfig.socials;
    const year = new Date().getFullYear();

    return (
        <footer className="site-footer">
            <div className="site-footer__inner">
                <div className="site-footer__links">
                    {links.map((link, index) => (
                        <span key={link.label} className="site-footer__entry">
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
                <p className="site-footer__copy">© {siteConfig.copyrightName}, {year}</p>
            </div>
        </footer>
    );
}
