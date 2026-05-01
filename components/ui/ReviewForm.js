'use client';

import { useState } from 'react';

function StarPicker({ value, onChange }) {
    const [hovered, setHovered] = useState(0);
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(star => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    className="text-2xl transition-transform hover:scale-110 focus:outline-none"
                >
                    <span className={(hovered || value) >= star ? 'text-amber-400' : 'text-gray-200'}>
                        ★
                    </span>
                </button>
            ))}
        </div>
    );
}

export default function ReviewForm({ productId, onReviewSubmitted }) {
    const [rating, setRating]   = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError]     = useState('');
    const [done, setDone]       = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!rating) { setError('Please select a star rating.'); return; }
        setError('');
        setLoading(true);

        const res = await fetch('/api/reviews', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ product_id: productId, rating, comment }),
        });
        const data = await res.json();

        if (!res.ok) {
            setError(data.error || 'Failed to submit review.');
            setLoading(false);
            return;
        }

        setDone(true);
        onReviewSubmitted?.();
    };

    if (done) {
        return (
            <div className="rounded-xl bg-green-50 border border-green-200 px-5 py-4 text-sm text-green-700 font-medium">
                ✓ Thanks for your review!
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-semibold text-gray-800">Write a Review</h3>

            <div>
                <p className="text-xs text-gray-500 mb-2">Your rating *</p>
                <StarPicker value={rating} onChange={setRating} />
            </div>

            <div>
                <label className="text-xs text-gray-500 mb-1 block">Comment (optional)</label>
                <textarea
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    rows={3}
                    placeholder="Share your experience…"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none transition"
                />
            </div>

            {error && <p className="text-xs text-red-500">{error}</p>}

            <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-60 transition"
            >
                {loading ? 'Submitting…' : 'Submit Review'}
            </button>
        </form>
    );
}
