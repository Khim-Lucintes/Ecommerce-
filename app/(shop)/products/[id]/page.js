import { getProductById } from '@/services/products';
import { getProductRating } from '@/services/reviews';
import { isWishlisted } from '@/services/wishlist';
import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { notFound } from 'next/navigation';

import Link from 'next/link';
import AddToCartButton from '@/components/ui/AddToCartButton';
import BuyNowButton from '@/components/ui/BuyNowButton';
import ReviewList from '@/components/ui/ReviewList';
import ReviewSection from '@/components/ui/ReviewSection';
import WishlistButton from '@/components/ui/WishlistButton';
import ChatWindow from '@/components/ui/ChatWindow';
import ImageZoomModal from '@/components/ui/ImageZoomModal';
import { Badge } from '@/components/ui/badge';

export async function generateMetadata({ params }) {
    const { id } = await params;
    const product = await getProductById(Number(id));
    if (!product) return { title: 'Not Found — Lazapee' };
    return {
        title: `${product.product_name} — Lazapee`,
        description: product.description || `Buy ${product.product_name} at Lazapee.`,
    };
}

export default async function ProductDetailPage({ params }) {
    const { id } = await params;

    const cookieStore = await cookies();
    const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);

    const [product, ratingData] = await Promise.all([
        getProductById(Number(id)),
        getProductRating(Number(id)),
    ]);

    if (!product) notFound();

    const wishlisted = payload ? await isWishlisted(payload.id, Number(id)) : false;

    const formattedPrice = Number(product.price).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    const isLoggedIn  = !!payload;
    const isCustomer  = payload?.role === 'customer';
    const isBuyer     = isCustomer;
    const sellerId    = product.owner_id; // store owner

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
                <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                <span>/</span>
                <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
                <span>/</span>
                <span className="text-foreground truncate max-w-[200px]">{product.product_name}</span>
            </nav>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

                {/* Product image — click to open lightbox zoom */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 shadow-sm">
                    {product.image_url ? (
                        <ImageZoomModal
                            src={product.image_url}
                            alt={product.product_name}
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center text-gray-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </div>
                    )}
                </div>

                {/* Product details */}
                <div className="flex flex-col">
                    <div className="mb-3 flex items-center gap-2">
                        <Badge variant="secondary" className="font-medium text-primary">
                            {product.category_name}
                        </Badge>
                        <Badge variant={product.stock > 0 ? 'default' : 'destructive'} className={product.stock > 0 ? 'bg-green-100 text-green-700 hover:bg-green-100' : ''}>
                            {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </Badge>
                    </div>
                    <h1 className="text-2xl font-bold text-foreground leading-tight">{product.product_name}</h1>

                    <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                        <span>Sold by</span>
                        <Link href={`/products?store_id=${product.store_id}`} className="text-primary hover:underline font-medium">
                            {product.store_name}
                        </Link>
                    </div>

                    {/* Inline rating badge */}
                    {ratingData.count > 0 && (
                        <div className="mt-3 flex items-center gap-2">
                            <span className="text-amber-400 text-sm">{'★'.repeat(Math.round(ratingData.average))}{'☆'.repeat(5 - Math.round(ratingData.average))}</span>
                            <span className="text-sm font-semibold text-foreground">{ratingData.average}</span>
                            <span className="text-xs text-muted-foreground">({ratingData.count} review{ratingData.count !== 1 ? 's' : ''})</span>
                        </div>
                    )}

                    <p className="mt-6 text-3xl font-extrabold text-primary">{formattedPrice}</p>

                    {/* Description */}
                    {product.description && (
                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                        </div>
                    )}

                    {/* Actions: Add to Cart + Wishlist */}
                    <div className="mt-8 flex gap-3">
                        <div className="flex flex-1 flex-col gap-3">
                            <BuyNowButton productId={product.product_id} stock={product.stock} />
                            <AddToCartButton productId={product.product_id} stock={product.stock} />
                        </div>
                        <WishlistButton productId={product.product_id} initialWishlisted={wishlisted} />
                    </div>

                    {/* Chat with Seller */}
                    {isBuyer && sellerId && payload.id !== sellerId && (
                        <p className="mt-3 text-xs text-gray-400 text-center">
                            💬 Chat with seller available below ↘
                        </p>
                    )}
                </div>
            </div>

            {/* Reviews section */}
            <ReviewList productId={product.product_id} />

            <div className="mt-8">
                <ReviewSection
                    productId={product.product_id}
                    isLoggedIn={isLoggedIn}
                    isCustomer={isCustomer}
                />
            </div>

            {/* Floating Chat Window (buyer only) */}
            {isBuyer && sellerId && payload?.id !== sellerId && (
                <ChatWindow
                    currentUserId={payload.id}
                    otherId={sellerId}
                    otherName={product.store_name}
                    productId={product.product_id}
                />
            )}
        </div>
    );
}
