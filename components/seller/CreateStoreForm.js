'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateStoreForm() {
    const router = useRouter();
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const res = await fetch('/api/stores/mine', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ store_name: name, description: desc }),
        });
        const data = await res.json();

        if (res.ok) {
            router.refresh();
        } else {
            setError(data.error || 'Failed to create store.');
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-2">Set Up Your Store</h2>
            <p className="text-sm text-gray-500 mb-6">You need to create a store before you can start selling products.</p>

            {error && <div className="mb-4 text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Store Name *</label>
                    <input type="text" required value={name} onChange={e => setName(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea rows={3} value={desc} onChange={e => setDesc(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition resize-none" />
                </div>
                <button type="submit" disabled={loading}
                    className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition mt-2">
                    {loading ? 'Creating Store...' : 'Create Store'}
                </button>
            </form>
        </div>
    );
}
