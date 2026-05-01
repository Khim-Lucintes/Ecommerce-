import Link from 'next/link';
import Image from 'next/image';

export default function ProductCard({ product }) {
    const {
        product_id,
        product_name,
        price,
        stock,
        image_url,
        store_name,
        category_name,
    } = product;

    const formattedPrice = Number(price).toLocaleString('en-PH', {
        style: 'currency',
        currency: 'PHP',
    });

    return (
        <Link
            href={`/products/${product_id}`}
            className="group flex flex-col rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
            {/* Product image */}
            <div className="relative aspect-square bg-gray-100 overflow-hidden">
                {image_url ? (
                    <Image
                        src={image_url}
                        alt={product_name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center text-gray-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Out of stock badge */}
                {stock === 0 && (
                    <span className="absolute top-2 left-2 rounded-full bg-gray-800/80 px-2 py-0.5 text-xs text-white">
                        Out of stock
                    </span>
                )}
            </div>

            {/* Info */}
            <div className="flex flex-1 flex-col p-4 gap-1">
                <p className="text-xs text-indigo-500 font-medium truncate">{category_name}</p>
                <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug">
                    {product_name}
                </h3>
                <p className="text-xs text-gray-400 truncate">{store_name}</p>
                <p className="mt-auto pt-2 text-base font-bold text-indigo-600">{formattedPrice}</p>
            </div>
        </Link>
    );
}
