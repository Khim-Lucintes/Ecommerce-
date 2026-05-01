import { getProductById } from '@/services/products';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

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
    const product = await getProductById(Number(id));

    if (!product) notFound();

    const formattedPrice = Number(product.price).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    return (
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">

            {/* Breadcrumb */}
            <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
                <Link href="/" className="hover:text-gray-600">Home</Link>
                <span>/</span>
                <Link href="/products" className="hover:text-gray-600">Products</Link>
                <span>/</span>
                <span className="text-gray-600 truncate max-w-[200px]">{product.product_name}</span>
            </nav>

            <div className="grid grid-cols-1 gap-10 md:grid-cols-2">

                {/* Product image */}
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100">
                    {product.image_url ? (
                        <Image
                            src={product.image_url}
                            alt={product.product_name}
                            fill
                            className="object-cover"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
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
                    <p className="text-sm font-medium text-indigo-500 mb-1">{product.category_name}</p>
                    <h1 className="text-2xl font-bold text-gray-900 leading-tight">{product.product_name}</h1>

                    <div className="mt-1 flex items-center gap-2 text-sm text-gray-400">
                        <span>Sold by</span>
                        <Link href={`/products?store_id=${product.store_id}`} className="text-indigo-600 hover:underline">
                            {product.store_name}
                        </Link>
                    </div>

                    <p className="mt-4 text-3xl font-extrabold text-indigo-600">{formattedPrice}</p>

                    {/* Stock */}
                    <p className={`mt-1 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </p>

                    {/* Description */}
                    {product.description && (
                        <div className="mt-6 border-t border-gray-100 pt-6">
                            <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
                        </div>
                    )}

                    {/* Add to cart button */}
                    <div className="mt-8">
                        <Link
                            href="/cart"
                            className={`flex items-center justify-center gap-2 w-full rounded-xl py-3 text-sm font-semibold transition
                                ${product.stock > 0
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'}`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
<p className="mt-4 text-3xl font-extrabold text-indigo-600">{formattedPrice}</p>

{/* Stock */ }
<p className={`mt-1 text-sm font-medium ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
    {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
</p>

{/* Description */ }
{
    product.description && (
        <div className="mt-6 border-t border-gray-100 pt-6">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">Description</h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
    )
}

{/* Add to cart */ }
<div className="mt-8">
    <AddToCartButton productId={product.product_id} stock={product.stock} />
</div>
                </div >
            </div >

    {/* Reviews section */ }
    < ReviewList productId = { product.product_id } />

        <div className="mt-8">
            <ReviewSection
                productId={product.product_id}
                isLoggedIn={isLoggedIn}
                isCustomer={isCustomer}
            />
        </div>
        </div >
    );
}
