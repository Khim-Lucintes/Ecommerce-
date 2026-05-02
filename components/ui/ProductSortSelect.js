'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductSortSelect() {
    const router = useRouter();
    const searchParams = useSearchParams();
    
    const currentSort = searchParams.get('sort_by') || 'latest';

    const handleSortChange = (e) => {
        const newSort = e.target.value;
        const params = new URLSearchParams(searchParams.toString());
        params.set('sort_by', newSort);
        router.push(`/products?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500 hidden sm:inline-block">Sort by:</span>
            <select 
                value={currentSort} 
                onChange={handleSortChange}
                className="text-sm border border-gray-200 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 py-2 pl-3 pr-10 outline-none hover:border-gray-300 transition-colors bg-white cursor-pointer"
            >
                <option value="latest">Latest Arrivals</option>
                <option value="top_sales">Top Sales</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
            </select>
        </div>
    );
}
