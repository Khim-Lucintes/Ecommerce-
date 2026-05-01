import { Geist } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/layout/Navbar';

const geist = Geist({ subsets: ['latin'], variable: '--font-geist-sans' });

export const metadata = {
    title: 'ShopEasy — Multi-Vendor Marketplace',
    description: 'Discover products from thousands of sellers on ShopEasy.',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={`${geist.variable} h-full antialiased`}>
            <body className="min-h-full flex flex-col bg-gray-50 font-sans">
                <Navbar />
                <main className="flex-1">{children}</main>
                <footer className="border-t border-gray-100 bg-white py-6 text-center text-xs text-gray-400">
                    © {new Date().getFullYear()} ShopEasy. School Project.
                </footer>
            </body>
        </html>
    );
}
