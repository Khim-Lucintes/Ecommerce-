import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';
import ConditionalLayoutWrapper from '@/components/layout/ConditionalLayoutWrapper';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata = {
    title: 'Lazapee — Multi-Vendor Marketplace',
    description: 'Discover products from thousands of sellers on Lazapee.',
    manifest: '/manifest.json',
};

export const viewport = {
    themeColor: '#4f46e5',
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${geist.variable} h-full antialiased`}>
            <head>
                <link rel="manifest" href="/manifest.json" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="Lazapee" />
                <link rel="apple-touch-icon" href="/icon-192.png" />
            </head>
            <body className="min-h-full flex flex-col bg-gray-50 font-sans">
                <ConditionalLayoutWrapper>
                    <Navbar />
                </ConditionalLayoutWrapper>
                <main className="flex-1">{children}</main>
                <ConditionalLayoutWrapper>
                    <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400">
                        © {new Date().getFullYear()} Lazapee. School Project.
                    </footer>
                </ConditionalLayoutWrapper>
            </body>
        </html>
    );
}
