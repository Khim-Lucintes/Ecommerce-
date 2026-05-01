'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function WishlistButton({ productId, initialWishlisted = false }) {
    const router = useRouter();
    const [wishlisted, setWishlisted] = useState(initialWishlisted);
    const [loading, setLoading]       = useState(false);

    const toggle = async () => {
        setLoading(true);
        const method = wishlisted ? 'DELETE' : 'POST';
        const res = await fetch('/api/wishlist', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId }),
        });

        if (res.status === 401) { router.push('/login'); return; }
        if (res.ok) setWishlisted(w => !w);
        setLoading(false);
    };

    return (
        <Button
            onClick={toggle}
            disabled={loading}
            variant={wishlisted ? "secondary" : "outline"}
            size="icon"
            title={wishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            className={`rounded-full transition-all ${
                wishlisted
                    ? 'border-red-200 bg-red-50 text-red-500 hover:bg-red-100'
                    : 'text-muted-foreground hover:border-red-200 hover:text-red-400'
            }`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
        </Button>
    );
}
