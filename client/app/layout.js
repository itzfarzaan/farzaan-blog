import './globals.css';
import 'highlight.js/styles/github.css';

const siteUrl = 'https://blog.farzaanali.com';

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: 'Farzaan Ali',
    description: 'Notes and essays by Farzaan Ali.',
    manifest: '/site.webmanifest',
    icons: {
        icon: [
            { url: '/favicon.ico' },
            { url: '/favicon.svg', type: 'image/svg+xml' },
            { url: '/favicon-96x96.png', type: 'image/png', sizes: '96x96' },
        ],
        shortcut: '/favicon.ico',
        apple: [
            { url: '/apple-touch-icon.png', sizes: '180x180' },
        ],
    },
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
    colorScheme: 'light',
};

const themeInitScript = `(function(){try{var t=localStorage.getItem('farzaan_blog_theme');if(t==='dark'){document.documentElement.setAttribute('data-theme','dark');}else{document.documentElement.removeAttribute('data-theme');}}catch(e){}})();`;

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
