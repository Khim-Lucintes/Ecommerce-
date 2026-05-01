'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

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
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="text-sm">Write a Review</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label className="mb-2 block">Your rating <span className="text-destructive">*</span></Label>
                        <StarPicker value={rating} onChange={setRating} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="comment">Comment <span className="text-muted-foreground font-normal">(optional)</span></Label>
                        <Textarea
                            id="comment"
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                            rows={3}
                            placeholder="Share your experience…"
                            className="resize-none"
                        />
                    </div>

                    {error && <p className="text-xs text-destructive">{error}</p>}

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? 'Submitting…' : 'Submit Review'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
