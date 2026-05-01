'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import VoucherInput from '@/components/ui/VoucherInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export default function CartPage() {
    const router = useRouter();
    const [items, setItems]         = useState([]);
    const [total, setTotal]         = useState('0.00');
    const [loading, setLoading]     = useState(true);
    const [checking, setChecking]   = useState(false);
    const [error, setError]         = useState('');
    const [voucher, setVoucher]     = useState(null); // { discount, final_total, ... }

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

    const cartTotal = Number(total);
    const finalTotal = voucher ? voucher.final_total : cartTotal;
    const savings    = voucher ? voucher.discount : 0;

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
                            <Card key={item.cart_item_id} className="overflow-hidden">
                                <CardContent className="flex gap-4 p-4">
                                    <div className="relative h-20 w-20 shrink-0 rounded-xl overflow-hidden bg-muted">
                                        {item.image_url ? (
                                            <Image src={item.image_url} alt={item.product_name} fill className="object-cover" />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground text-2xl">📦</div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col gap-1">
                                        <p className="text-sm font-semibold text-foreground line-clamp-1">{item.product_name}</p>
                                        <p className="text-xs text-muted-foreground">{item.store_name}</p>
                                        <p className="text-sm font-bold text-primary">₱{Number(item.price).toLocaleString()}</p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center gap-2">
                                                <Button onClick={() => updateQty(item.cart_item_id, item.quantity - 1)}
                                                    variant="outline" size="icon" className="h-7 w-7 rounded-full shrink-0">−</Button>
                                                <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
                                                <Button onClick={() => updateQty(item.cart_item_id, item.quantity + 1)}
                                                    variant="outline" size="icon" className="h-7 w-7 rounded-full shrink-0">+</Button>
                                            </div>
                                            <Button onClick={() => removeItem(item.cart_item_id)}
                                                variant="ghost" size="sm" className="h-auto px-2 py-1 text-xs text-destructive hover:text-destructive">Remove</Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Order summary */}
                    <Card className="h-fit">
                        <CardHeader className="pb-4">
                            <CardTitle className="text-base">Order Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Voucher input */}
                            <div className="relative">
                                <VoucherInput cartTotal={cartTotal} onApply={setVoucher} />
                            </div>

                            <div className="space-y-2 text-sm text-muted-foreground border-t pt-3">
                                <div className="flex justify-between">
                                    <span>Subtotal ({items.length} items)</span>
                                    <span>₱{cartTotal.toLocaleString()}</span>
                                </div>
                                {savings > 0 && (
                                    <div className="flex justify-between text-green-600">
                                        <span>Discount</span>
                                        <span>-₱{savings.toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span>Shipping</span>
                                    <span className="text-green-600">Free</span>
                                </div>
                            </div>
                            <div className="border-t pt-3 flex justify-between font-bold text-foreground text-base">
                                <span>Total</span>
                                <span>₱{finalTotal.toLocaleString()}</span>
                            </div>
                            <Button
                                onClick={checkout}
                                disabled={checking}
                                className="w-full"
                                size="lg"
                            >
                                {checking ? 'Processing…' : 'Proceed to Payment'}
                            </Button>
                            <Link href="/products" className={cn(buttonVariants({ variant: 'link' }), "w-full h-auto p-0 text-muted-foreground")}>
                                Continue Shopping
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
