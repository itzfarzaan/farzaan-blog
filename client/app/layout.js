import './globals.css';
import 'highlight.js/styles/github.css';

const siteUrl = 'https://blog.farzaanali.com';

export const metadata = {
    metadataBase: new URL(siteUrl),
    title: 'Farzaan Ali Blog',
    description: 'Thoughts, essays, notes, and experiments by Farzaan Ali.',
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        url: siteUrl,
        siteName: 'Farzaan Ali Blog',
        title: 'Farzaan Ali Blog',
        description: 'Thoughts, essays, notes, and experiments by Farzaan Ali.',
    },
    twitter: {
        card: 'summary',
        title: 'Farzaan Ali Blog',
        description: 'Thoughts, essays, notes, and experiments by Farzaan Ali.',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
