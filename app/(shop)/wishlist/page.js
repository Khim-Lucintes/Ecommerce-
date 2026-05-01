import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getWishlist } from '@/services/wishlist';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

export const metadata = { title: 'My Wishlist — Lazapee' };

export default async function WishlistPage() {
    const cookieStore = await cookies();
    const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
    if (!payload) redirect('/login');

    const items = await getWishlist(payload.id);

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">My Wishlist</h1>

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center">
                    <div className="text-5xl mb-4">🤍</div>
                    <p className="text-gray-400 mb-4">Your wishlist is empty.</p>
                    <Link href="/products" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">Browse Products →</Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                    {items.map(item => (
                        <Link
                            key={item.wishlist_id}
                            href={`/products/${item.product_id}`}
                            className="group rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-all overflow-hidden"
                        >
                            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                                {item.image_url ? (
                                    <Image
                                        src={item.image_url}
                                        alt={item.product_name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-4xl text-gray-200">📦</div>
                                )}
                                {item.stock < 1 && (
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white bg-red-500 px-2 py-1 rounded-full">Out of Stock</span>
                                    </div>
                                )}
                            </div>
                            <div className="p-3">
                                <p className="text-xs text-indigo-500 font-medium">{item.category_name}</p>
                                <p className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mt-0.5">{item.product_name}</p>
                                <p className="text-xs text-gray-400 mt-0.5">{item.store_name}</p>
                                <p className="text-sm font-bold text-indigo-600 mt-1">₱{Number(item.price).toLocaleString()}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
