'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default function BuyNowButton({ productId, stock }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleBuyNow = async () => {
        if (stock < 1) return;
        setLoading(true);
        
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

            // Regardless of whether it succeeds or fails (e.g. already in cart),
            // redirect the user to the cart to proceed to checkout.
            router.refresh();
            router.push('/cart');
        } catch (err) {
            console.error('Failed to buy now', err);
            setLoading(false);
        }
    };

    if (stock < 1) return null;

    return (
        <Button
            onClick={handleBuyNow}
            disabled={loading}
            size="lg"
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-md transition-all hover:-translate-y-0.5"
        >
            {loading ? 'Processing...' : 'Buy Now'}
        </Button>
    );
}
