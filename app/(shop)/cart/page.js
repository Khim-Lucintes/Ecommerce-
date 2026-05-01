'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function CartPage() {
    const router = useRouter();
    const [items, setItems]       = useState([]);
    const [total, setTotal]       = useState('0.00');
    const [loading, setLoading]   = useState(true);
    const [checking, setChecking] = useState(false);
    const [error, setError]       = useState('');

    const fetchCart = useCallback(async () => {
        try {
            const res = await fetch('/api/cart');
            if (res.status === 401) { router.push('/login?redirect=/cart'); return; }
            const data = await res.json();
            setItems(data.items || []);
            setTotal(data.total || '0.00');
        } catch {
            setError('Failed to load cart.');
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => { fetchCart(); }, [fetchCart]);

    const updateQty = async (cart_item_id, quantity) => {
        if (quantity < 1) return removeItem(cart_item_id);
        await fetch(`/api/cart/${cart_item_id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ quantity }),
        });
        fetchCart();
    };

    const removeItem = async (cart_item_id) => {
        await fetch(`/api/cart/${cart_item_id}`, { method: 'DELETE' });
        fetchCart();
    };

    const checkout = async () => {
        setChecking(true);
        setError('');
        try {
            const res = await fetch('/api/orders', { method: 'POST' });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Checkout failed.'); }
            else { router.push(`/checkout/${data.order_id}`); }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setChecking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-64 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">Your Cart</h1>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            {items.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 py-24 text-center">
                    <p className="text-gray-400 text-lg">Your cart is empty.</p>
                    <Link href="/products" className="mt-4 inline-block text-sm font-medium text-indigo-600 hover:text-indigo-500">
                        Browse Products →
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

                    {/* Items list */}
                    <div className="lg:col-span-2 space-y-4">
                        {items.map(item => (
                            <div key={item.cart_item_id} className="flex gap-4 rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                                <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                                    {item.image_url ? (
                                        <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-gray-300 text-2xl">📦</div>
                                    )}
                                </div>

                                <div className="flex flex-1 flex-col gap-1">
                                    <p className="text-sm font-semibold text-gray-900 line-clamp-1">{item.product_name}</p>
                                    <p className="text-xs text-gray-400">{item.store_name}</p>
                                    <p className="text-sm font-bold text-indigo-600">
                                        ₱{Number(item.price).toLocaleString()}
                                    </p>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => updateQty(item.cart_item_id, item.quantity - 1)}
                                                className="h-7 w-7 rounded-full border text-gray-600 hover:bg-gray-100 flex items-center justify-center text-lg font-bold">−</button>
                                            <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                                            <button onClick={() => updateQty(item.cart_item_id, item.quantity + 1)}
                                                className="h-7 w-7 rounded-full border text-gray-600 hover:bg-gray-100 flex items-center justify-center text-lg font-bold">+</button>
                                        </div>
                                        <button onClick={() => removeItem(item.cart_item_id)}
                                            className="text-xs text-red-400 hover:text-red-600">Remove</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order summary */}
                    <div className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100 h-fit">
                        <h2 className="text-base font-semibold text-gray-900 mb-4">Order Summary</h2>
                        <div className="space-y-2 text-sm text-gray-600">
                            <div className="flex justify-between">
                                <span>Items ({items.length})</span>
                                <span>₱{Number(total).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping</span>
                                <span className="text-green-600">Free</span>
                            </div>
                        </div>
                        <div className="mt-4 border-t pt-4 flex justify-between font-bold text-gray-900">
                            <span>Total</span>
                            <span>₱{Number(total).toLocaleString()}</span>
                        </div>
                        <button
                            onClick={checkout}
                            disabled={checking}
                            className="mt-6 w-full rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition"
                        >
                            {checking ? 'Processing…' : 'Proceed to Payment'}
                        </button>
                        <Link href="/products" className="mt-3 block text-center text-xs text-gray-400 hover:text-gray-600">
                            Continue Shopping
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}
