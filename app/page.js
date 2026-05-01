import { getProducts } from '@/services/products';
import { getCategories } from '@/services/categories';
import ProductCard from '@/components/ui/ProductCard';
import Link from 'next/link';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const metadata = {
    title: 'Lazapee — Multi-Vendor Marketplace',
    description: 'Discover products from thousands of sellers.',
};

export default async function HomePage() {
    const [featured, categories] = await Promise.all([
        getProducts({ limit: 8 }),
        getCategories(),
    ]);

    return (
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-12">

            {/* Hero */}
            <section className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-600 px-8 py-16 text-center text-white shadow-xl">
                <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                    Your One-Stop Marketplace
                </h1>
                <p className="mt-4 text-primary-foreground/90 text-lg max-w-xl mx-auto">
                    Browse thousands of products from trusted sellers. Fast. Easy. Affordable.
                </p>
                <div className="mt-8 flex justify-center">
                    <Link href="/products" className={cn(buttonVariants({ size: 'lg', variant: 'secondary' }), "rounded-xl font-bold px-8 shadow")}>
                        Shop Now →
                    </Link>
                </div>
            </section>

            {/* Categories */}
            {categories.length > 0 && (
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Browse by Category</h2>
                    <div className="flex flex-wrap gap-3">
                        {categories.map(cat => (
                            <Link
                                key={cat.category_id}
                                href={`/products?category_id=${cat.category_id}`}
                                className={cn(buttonVariants({ variant: 'outline' }), "rounded-full px-4")}
                            >
                                {cat.category_name}
                            </Link>
                        ))}
                    </div>
                </section>
            )}

            {/* Featured products */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-gray-900">Featured Products</h2>
                    <Link href="/products" className={cn(buttonVariants({ variant: 'link' }), "px-0")}>
                        View all →
                    </Link>
                </div>

                {featured.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 py-20 text-center text-gray-400">
                        <p className="text-lg">No products yet.</p>
                        <p className="text-sm mt-1">Sellers — register and start listing!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                        {featured.map(p => (
                            <ProductCard key={p.product_id} product={p} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}
