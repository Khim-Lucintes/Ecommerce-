'use client';

import { useState, useEffect } from 'react';

export default function VoucherManagement() {
    const [vouchers, setVouchers] = useState([]);
    const [form, setForm] = useState({
        code: '', discount_type: 'percentage', discount_value: '',
        min_purchase: '', usage_limit: '', expires_at: '',
    });
    const [error, setError]     = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    const fetchVouchers = async () => {
        const res = await fetch('/api/admin/vouchers');
        if (res.ok) {
            const data = await res.json();
            setVouchers(data.vouchers || []);
        }
    };

    useEffect(() => { fetchVouchers(); }, []);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleCreate = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        setLoading(true);
        const res = await fetch('/api/admin/vouchers', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                discount_value: parseFloat(form.discount_value),
                min_purchase:   parseFloat(form.min_purchase || 0),
                usage_limit:    form.usage_limit ? parseInt(form.usage_limit) : null,
                expires_at:     form.expires_at || null,
            }),
        });
        const data = await res.json();
        if (res.ok) {
            setSuccess(`Voucher "${form.code}" created!`);
            setForm({ code: '', discount_type: 'percentage', discount_value: '', min_purchase: '', usage_limit: '', expires_at: '' });
            fetchVouchers();
        } else {
            setError(data.error || 'Failed to create voucher.');
        }
        setLoading(false);
    };

    const toggleActive = async (voucher_id, is_active) => {
        await fetch('/api/admin/vouchers', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ voucher_id, is_active: !is_active }),
        });
        fetchVouchers();
    };

    return (
        <div className="space-y-8">
            {/* Create form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Create Voucher</h2>
                {error && <div className="mb-3 text-sm text-red-600 bg-red-50 p-3 rounded-lg">{error}</div>}
                {success && <div className="mb-3 text-sm text-green-700 bg-green-50 p-3 rounded-lg">{success}</div>}
                <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                    <div className="col-span-2 sm:col-span-1">
                        <label className="block text-xs font-medium text-gray-600 mb-1">Code *</label>
                        <input name="code" required value={form.code} onChange={handleChange}
                            placeholder="SAVE20" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm uppercase outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Type *</label>
                        <select name="discount_type" value={form.discount_type} onChange={handleChange}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm bg-white outline-none focus:border-indigo-400 transition">
                            <option value="percentage">Percentage (%)</option>
                            <option value="fixed">Fixed (₱)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Value *</label>
                        <input name="discount_value" type="number" required min="0" step="0.01" value={form.discount_value} onChange={handleChange}
                            placeholder="20" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Min Purchase (₱)</label>
                        <input name="min_purchase" type="number" min="0" value={form.min_purchase} onChange={handleChange}
                            placeholder="0" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Usage Limit</label>
                        <input name="usage_limit" type="number" min="1" value={form.usage_limit} onChange={handleChange}
                            placeholder="Unlimited" className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 transition" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Expires At</label>
                        <input name="expires_at" type="datetime-local" value={form.expires_at} onChange={handleChange}
                            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 transition" />
                    </div>
                    <div className="col-span-2">
                        <button type="submit" disabled={loading}
                            className="rounded-lg bg-indigo-600 px-6 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
                            {loading ? 'Creating...' : 'Create Voucher'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Vouchers table */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-50">
                    <h2 className="text-base font-semibold text-gray-900">All Vouchers</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="px-6 py-3 text-left">Code</th>
                                <th className="px-6 py-3 text-left">Discount</th>
                                <th className="px-6 py-3 text-left">Min Purchase</th>
                                <th className="px-6 py-3 text-center">Used</th>
                                <th className="px-6 py-3 text-center">Expires</th>
                                <th className="px-6 py-3 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {vouchers.length === 0 && (
                                <tr><td colSpan={6} className="px-6 py-8 text-center text-gray-400">No vouchers yet.</td></tr>
                            )}
                            {vouchers.map(v => (
                                <tr key={v.voucher_id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3 font-mono font-bold text-gray-800">{v.code}</td>
                                    <td className="px-6 py-3 text-indigo-600 font-semibold">
                                        {v.discount_type === 'percentage' ? `${v.discount_value}%` : `₱${v.discount_value}`}
                                    </td>
                                    <td className="px-6 py-3 text-gray-500">₱{Number(v.min_purchase).toLocaleString()}</td>
                                    <td className="px-6 py-3 text-center text-gray-500">
                                        {v.used_count}{v.usage_limit ? `/${v.usage_limit}` : ''}
                                    </td>
                                    <td className="px-6 py-3 text-center text-gray-400 text-xs">
                                        {v.expires_at ? new Date(v.expires_at).toLocaleDateString() : '—'}
                                    </td>
                                    <td className="px-6 py-3 text-center">
                                        <button onClick={() => toggleActive(v.voucher_id, v.is_active)}
                                            className={`rounded-full px-3 py-1 text-xs font-medium transition ${v.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                                            {v.is_active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
