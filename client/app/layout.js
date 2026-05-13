import './globals.css';
import 'highlight.js/styles/github.css';

const siteUrl = 'https://blog.farzaanali.com';

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: 'Farzaan Ali',
    description: 'Notes and essays by Farzaan Ali.',
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        url: siteUrl,
        siteName: 'Farzaan Ali',
        title: 'Farzaan Ali',
        description: 'Notes and essays by Farzaan Ali.',
    },
    twitter: {
        card: 'summary',
        title: 'Farzaan Ali',
        description: 'Notes and essays by Farzaan Ali.',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('farzaan_blog_theme');if(!t){t=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}}catch(e){}})();`;

export default function RootLayout({ children }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
            </head>
            <body>{children}</body>
        </html>
    );
}
