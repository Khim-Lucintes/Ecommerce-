'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function VoucherInput({ cartTotal, onApply }) {
    const [code, setCode]     = useState('');
    const [result, setResult] = useState(null);
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleApply = async (e) => {
        e.preventDefault();
        setError('');
        setResult(null);
        setLoading(true);

        const res = await fetch('/api/vouchers/apply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, cart_total: cartTotal }),
        });
        const data = await res.json();

        if (!res.ok) { setError(data.error); setLoading(false); return; }
        setResult(data);
        onApply?.(data);
        setLoading(false);
    };

    const handleRemove = () => {
        setResult(null);
        setCode('');
        onApply?.(null);
    };

    if (result) {
        return (
            <div className="rounded-xl bg-green-50 border border-green-200 px-4 py-3 flex items-center justify-between">
                <div>
                    <p className="text-xs font-semibold text-green-700">🎉 Voucher Applied: {result.code}</p>
                    <p className="text-xs text-green-600">
                        {result.discount_type === 'percentage'
                            ? `${result.discount_value}% off`
                            : `₱${result.discount_value} off`}
                        {' — '}You save ₱{result.discount.toLocaleString()}
                    </p>
                </div>
                <button onClick={handleRemove} className="text-xs text-red-400 hover:text-red-600 ml-3">Remove</button>
            </div>
        );
    }

    return (
        <form onSubmit={handleApply} className="flex gap-2 relative">
            <Input
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                placeholder="Voucher code"
                className="flex-1 uppercase"
            />
            <Button
                type="submit"
                variant="secondary"
                disabled={loading || !code.trim()}
            >
                {loading ? '…' : 'Apply'}
            </Button>
            {error && <p className="absolute -bottom-5 text-xs text-destructive">{error}</p>}
        </form>
    );
}
