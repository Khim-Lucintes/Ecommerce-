import { getProducts } from '@/services/products';
import { getCategories } from '@/services/categories';
import ProductCard from '@/components/ui/ProductCard';
import ProductSortSelect from '@/components/ui/ProductSortSelect';
import ProductSearchBar from '@/components/ui/ProductSearchBar';
import Link from 'next/link';
import { Suspense } from 'react';

export const metadata = {
    title: 'Products — Lazapee',
    description: 'Browse products from our multi-vendor marketplace.',
};

export default async function ProductsPage({ searchParams }) {
    const query = await searchParams;
    const category_id = query.category_id ? Number(query.category_id) : undefined;
    const sort_by = query.sort_by || 'latest';
    const q = query.q?.trim() || undefined;

    const [products, categories] = await Promise.all([
        getProducts({ category_id, sort_by, q, limit: 24 }),
        getCategories(),
    ]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
                    <p className="text-sm text-gray-500 mt-1">
                        {q
                            ? <>{products.length} result{products.length !== 1 ? 's' : ''} for &ldquo;<span className="font-medium text-indigo-600">{q}</span>&rdquo;</>
                            : <>{products.length} item{products.length !== 1 ? 's' : ''} found</>
                        }
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Search bar requires useSearchParams — wrap in Suspense */}
                    <Suspense fallback={
                        <div className="w-full sm:w-80 h-9 rounded-xl bg-gray-100 animate-pulse" />
                    }>
                        <ProductSearchBar />
                    </Suspense>
                    <ProductSortSelect />
                </div>
            </div>

            <div className="flex flex-col gap-8 lg:flex-row">

                {/* Sidebar — categories filter */}
                <aside className="w-full lg:w-56 shrink-0">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3 uppercase tracking-wide">Categories</h2>
                    <ul className="space-y-1">
                        <li>
                            <Link
                                href={q ? `/products?q=${encodeURIComponent(q)}` : '/products'}
                                className={`block rounded-lg px-3 py-2 text-sm transition ${!category_id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                                All
                            </Link>
                        </li>
                        {categories.map(cat => (
                            <li key={cat.category_id}>
                                <Link
                                    href={`/products?category_id=${cat.category_id}${q ? `&q=${encodeURIComponent(q)}` : ''}`}
                                    className={`block rounded-lg px-3 py-2 text-sm transition ${category_id === cat.category_id ? 'bg-indigo-50 text-indigo-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {cat.category_name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </aside>

                {/* Product grid */}
                <main className="flex-1">
                    {products.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center">
                            {q ? (
                                <>
                                    <p className="text-gray-400 text-lg">No products match &ldquo;<span className="font-medium text-gray-600">{q}</span>&rdquo;.</p>
                                    <p className="text-gray-400 text-sm mt-1">Try a different keyword or browse by category.</p>
                                    <Link href="/products" className="mt-4 text-sm text-indigo-600 hover:underline">Clear search</Link>
                                </>
                            ) : (
                                <>
                                    <p className="text-gray-400 text-lg">No products found.</p>
                                    <p className="text-gray-400 text-sm mt-1">Try a different category or check back later.</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                            {products.map(product => (
                                <ProductCard key={product.product_id} product={product} />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
