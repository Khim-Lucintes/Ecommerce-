'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckoutPaymentPage({ params }) {
    const router = useRouter();
    const [orderId, setOrderId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        params.then(p => setOrderId(p.id));
    }, [params]);

    const handlePayment = async (method) => {
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/payments/${orderId}/complete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ payment_method: method }),
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Payment failed.');
                setLoading(false);
                return;
            }
            // Payment success — redirect to order confirmation
            router.push(`/orders/${orderId}`);
        } catch {
            setError('Network error during payment.');
            setLoading(false);
        }
    };

    if (!orderId) {
        return <div className="flex h-64 items-center justify-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>;
    }

    return (
        <div className="mx-auto max-w-lg px-4 py-16 sm:px-6">
            <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Complete Payment</h1>
                <p className="text-sm text-gray-500 mt-2">Select a mock payment method to complete your order.</p>
            </div>

            {error && (
                <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 text-center">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <button
                    onClick={() => handlePayment('gcash')}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 rounded-xl bg-blue-500 py-4 font-bold text-white hover:bg-blue-600 disabled:opacity-60 transition shadow-sm"
                >
                    <span className="text-xl">📱</span> Pay with GCash
                </button>

                <button
                    onClick={() => handlePayment('paypal')}
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-3 rounded-xl bg-[#00457C] py-4 font-bold text-white hover:bg-[#003666] disabled:opacity-60 transition shadow-sm"
                >
                    <span className="text-xl">💳</span> Pay with PayPal
                </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-8">
                This is a simulated payment gateway. No real charges will be made.
            </p>
        </div>
    );
}
