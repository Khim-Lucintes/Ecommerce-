'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Plus, Trash2, CheckCircle2 } from 'lucide-react';

export default function AddressSelector({ selectedId, onSelect }) {
    const [addresses, setAddresses]   = useState([]);
    const [showForm, setShowForm]     = useState(false);
    const [loading, setLoading]       = useState(true);
    const [saving, setSaving]         = useState(false);
    const [error, setError]           = useState('');
    const [form, setForm]             = useState({ full_address: '', city: '', postal_code: '' });

    const fetchAddresses = async () => {
        try {
            const res  = await fetch('/api/addresses');
            const data = await res.json();
            const list = data.addresses || [];
            setAddresses(list);
            // Auto-select the first address if none selected yet
            if (!selectedId && list.length > 0) onSelect(list[0].address_id);
        } catch {
            setError('Failed to load addresses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAddresses(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.full_address.trim()) return setError('Full address is required.');
        setSaving(true);
        setError('');
        try {
            const res  = await fetch('/api/addresses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });
            const data = await res.json();
            if (!res.ok) { setError(data.error || 'Failed to save.'); return; }
            // Auto-select newly added address
            onSelect(data.address_id);
            setForm({ full_address: '', city: '', postal_code: '' });
            setShowForm(false);
            await fetchAddresses();
        } catch {
            setError('Network error.');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (address_id, e) => {
        e.stopPropagation();
        await fetch(`/api/addresses/${address_id}`, { method: 'DELETE' });
        if (selectedId === address_id) onSelect(null);
        await fetchAddresses();
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin className="w-4 h-4 text-indigo-500" />
                    Delivery Address
                </div>
                <button
                    type="button"
                    onClick={() => { setShowForm(v => !v); setError(''); }}
                    className="flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-800 transition"
                >
                    <Plus className="w-3.5 h-3.5" />
                    {showForm ? 'Cancel' : 'Add new'}
                </button>
            </div>

            {error && (
                <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
            )}

            {/* Add address form */}
            {showForm && (
                <Card className="border-indigo-100 bg-indigo-50/40">
                    <CardContent className="p-4">
                        <form onSubmit={handleAdd} className="space-y-3">
                            <div>
                                <Label htmlFor="full_address" className="text-xs font-medium">Street / Barangay / Building *</Label>
                                <Input
                                    id="full_address"
                                    value={form.full_address}
                                    onChange={e => setForm(f => ({ ...f, full_address: e.target.value }))}
                                    placeholder="123 Rizal St., Brgy. Poblacion"
                                    className="mt-1 text-sm"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <Label htmlFor="city" className="text-xs font-medium">City / Municipality</Label>
                                    <Input
                                        id="city"
                                        value={form.city}
                                        onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                                        placeholder="Makati"
                                        className="mt-1 text-sm"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="postal_code" className="text-xs font-medium">Postal Code</Label>
                                    <Input
                                        id="postal_code"
                                        value={form.postal_code}
                                        onChange={e => setForm(f => ({ ...f, postal_code: e.target.value }))}
                                        placeholder="1200"
                                        className="mt-1 text-sm"
                                    />
                                </div>
                            </div>
                            <Button type="submit" disabled={saving} size="sm" className="w-full">
                                {saving ? 'Saving…' : 'Save Address'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Address list */}
            {loading ? (
                <div className="flex justify-center py-4">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent" />
                </div>
            ) : addresses.length === 0 && !showForm ? (
                <button
                    type="button"
                    onClick={() => setShowForm(true)}
                    className="w-full rounded-xl border-2 border-dashed border-indigo-200 py-5 text-center text-sm text-indigo-400 hover:border-indigo-400 hover:text-indigo-600 transition"
                >
                    + Add a delivery address to continue
                </button>
            ) : (
                <div className="space-y-2">
                    {addresses.map(addr => {
                        const isSelected = selectedId === addr.address_id;
                        return (
                            <button
                                key={addr.address_id}
                                type="button"
                                onClick={() => onSelect(addr.address_id)}
                                className={`w-full text-left rounded-xl border-2 px-4 py-3 transition flex items-start justify-between gap-3
                                    ${isSelected
                                        ? 'border-indigo-500 bg-indigo-50'
                                        : 'border-gray-200 bg-white hover:border-indigo-300'
                                    }`}
                            >
                                <div className="flex items-start gap-3 flex-1 min-w-0">
                                    {isSelected
                                        ? <CheckCircle2 className="w-4 h-4 mt-0.5 text-indigo-600 shrink-0" />
                                        : <div className="w-4 h-4 mt-0.5 rounded-full border-2 border-gray-300 shrink-0" />
                                    }
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{addr.full_address}</p>
                                        {(addr.city || addr.postal_code) && (
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                {[addr.city, addr.postal_code].filter(Boolean).join(', ')}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={e => handleDelete(addr.address_id, e)}
                                    className="shrink-0 mt-0.5 text-gray-300 hover:text-red-500 transition"
                                    aria-label="Delete address"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
