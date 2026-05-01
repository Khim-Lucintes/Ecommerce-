'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddToCartButton({ productId, stock }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [added, setAdded] = useState(false);
    const [error, setError] = useState('');

    const handleAdd = async () => {
        if (stock < 1) return;
        setLoading(true);
        setError('');
        
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product_id: productId, quantity: 1 }),
            });

            if (res.status === 401) {
                router.push('/login');
                return;
            }

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Failed to add to cart.');
                setLoading(false);
                return;
            }

            setAdded(true);
            router.refresh();
            setTimeout(() => setAdded(false), 2000);
        } catch (err) {
            setError('Network error. Please try again.');
        }
        setLoading(false);
    };

    if (stock < 1) {
        return (
            <button disabled className="w-full rounded-xl bg-gray-100 py-3 text-sm font-semibold text-gray-400 cursor-not-allowed">
                Out of Stock
            </button>
        );
    }

    return (
        <div className="space-y-2">
            <button
                onClick={handleAdd}
                disabled={loading || added}
                className={`w-full rounded-xl py-3 text-sm font-semibold transition flex items-center justify-center gap-2
                    ${added ? 'bg-green-500 text-white' : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60'}`}
            >
                {added ? (
                    <>
                        <span>✓</span> Added to Cart
                    </>
                ) : loading ? (
                    'Adding...'
                ) : (
                    <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Add to Cart
                    </>
                )}
            </button>
            {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>
    );
}
