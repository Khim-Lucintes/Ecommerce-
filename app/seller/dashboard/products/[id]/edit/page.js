'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function EditProductPage({ params }) {
    const router = useRouter();
    const [productId, setProductId] = useState(null);
    const [categories, setCategories] = useState([]);
    const [form, setForm] = useState(null);
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading]   = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError]       = useState('');

    useEffect(() => {
        params.then(p => setProductId(p.id));
    }, [params]);

    useEffect(() => {
        if (!productId) return;
        Promise.all([
            fetch(`/api/products/${productId}`).then(r => r.json()),
            fetch('/api/categories').then(r => r.json()),
        ]).then(([pData, cData]) => {
            if (pData.product) {
                const p = pData.product;
                setForm({
                    product_name: p.product_name,
                    description:  p.description || '',
                    price:        p.price,
                    stock:        p.stock,
                    image_url:    p.image_url || '',
                    category_id:  p.category_id,
                });
            }
            setCategories(cData.categories || []);
        });
    }, [productId]);

    const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        let finalImageUrl = form.image_url;

        // Upload image first if selected
        if (imageFile) {
            const formData = new FormData();
            formData.append('file', imageFile);

            try {
                const uploadRes = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });
                const uploadData = await uploadRes.json();
                if (!uploadRes.ok) throw new Error(uploadData.error || 'Image upload failed');
                finalImageUrl = uploadData.url;
            } catch (err) {
                setError(err.message);
                setLoading(false);
                return;
            }
        }

        const res = await fetch(`/api/products/${productId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...form,
                price:       parseFloat(form.price),
                stock:       parseInt(form.stock) || 0,
                category_id: parseInt(form.category_id),
                image_url:   finalImageUrl,
            }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'Failed to update.'); setLoading(false); return; }
        router.push('/seller/dashboard');
        router.refresh();
    };

    const handleDelete = async () => {
        if (!confirm('Delete this product? This cannot be undone.')) return;
        setDeleting(true);
        const res = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        if (res.ok) { router.push('/seller/dashboard'); router.refresh(); }
        else { setError('Failed to delete product.'); setDeleting(false); }
    };

    if (!form) {
        return <div className="flex h-40 items-center justify-center"><div className="h-7 w-7 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" /></div>;
    }

    return (
        <div className="max-w-xl">
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
                    <p className="text-sm text-gray-500 mt-0.5">Update your product details.</p>
                </div>
                <button onClick={handleDelete} disabled={deleting}
                    className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-100 disabled:opacity-60 transition">
                    {deleting ? 'Deleting…' : 'Delete'}
                </button>
            </div>

            {error && (
                <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
            )}

            <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
                    <input name="product_name" type="text" required value={form.product_name} onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select name="category_id" required value={form.category_id} onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white">
                        {categories.map(c => (
                            <option key={c.category_id} value={c.category_id}>{c.category_name}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Price (₱) *</label>
                        <input name="price" type="number" required min="0" step="0.01" value={form.price} onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Stock</label>
                        <input name="stock" type="number" min="0" value={form.stock} onChange={handleChange}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                    <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition bg-white" />
                    <p className="text-xs text-gray-400 mt-1">Or provide an image URL below:</p>
                    <input name="image_url" type="url" value={form.image_url} onChange={handleChange}
                        placeholder="https://example.com/image.jpg"
                        className="mt-1 w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition" />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea name="description" rows={4} value={form.description} onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 transition resize-none" />
                </div>

                <div className="flex gap-3 pt-2">
                    <button type="submit" disabled={loading}
                        className="flex-1 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition">
                        {loading ? 'Saving…' : 'Save Changes'}
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
