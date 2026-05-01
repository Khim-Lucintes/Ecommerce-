'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function NewProductPage() {
    const router = useRouter();
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState({
        product_name: '', description: '', price: '', stock: '', image_url: '', category_id: '',
    });
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');

    useEffect(() => {
        fetch('/api/categories').then(r => r.json()).then(d => setCategories(d.categories || []));
    }, []);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const res = await fetch('/api/products', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                price: parseFloat(form.price),
                stock: parseInt(form.stock) || 0,
                category_id: parseInt(form.category_id),
            }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Failed to create product.'); setLoading(false); return; }
        router.push('/seller/dashboard');
        router.refresh();
    };

    return (
        <div className="max-w-xl">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                <p className="text-sm text-gray-500 mt-1">Fill in the details to list your product.</p>
            </div>

            {error && (
                <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input name="product_name" type="text" required value={form.product_name} onChange={handleChange}
                        placeholder="e.g. Wireless Earbuds"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select name="category_id" required value={form.category_id} onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white">
                        <option value="">Select a category</option>
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱) *</label>
                        <input name="price" type="number" required min="0" step="0.01" value={form.price} onChange={handleChange}
                            placeholder="0.00"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                            placeholder="0"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                    <input name="image_url" type="url" value={form.image_url} onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows={4} value={form.description} onChange={handleChange}
                        placeholder="Describe your product…"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading}
                        className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
                        {loading ? 'Saving…' : 'Add Product'}
                    </button>
                    <a href="/seller/dashboard"
                        className="rounded-lg border border-gray-200 px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
                        Cancel
                    </a>
                </div>
            </form>
        </div>
    );
}
