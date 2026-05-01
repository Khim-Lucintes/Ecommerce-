import { getReviewsByProduct, getProductRating } from '@/services/reviews';

function StarDisplay({ rating, size = 'sm' }) {
    const full = Math.round(Number(rating));
    const cls  = size === 'lg' ? 'text-2xl' : 'text-base';
    return (
        <span className={cls}>
            {[1, 2, 3, 4, 5].map(s => (
                <span key={s} className={s <= full ? 'text-amber-400' : 'text-gray-200'}>★</span>
            ))}
        </span>
    );
}

export default async function ReviewList({ productId }) {
    const [reviews, ratingData] = await Promise.all([
        getReviewsByProduct(productId),
        getProductRating(productId),
    ]);

    return (
        <section className="mt-12 border-t border-gray-100 pt-10">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Customer Reviews</h2>

            {ratingData.count === 0 ? (
                <p className="text-sm text-gray-400">No reviews yet. Be the first!</p>
            ) : (
                <>
                    {/* Summary */}
                    <div className="flex items-center gap-6 mb-8 p-5 rounded-2xl bg-gray-50 border border-gray-100">
                        <div className="text-center">
                            <p className="text-5xl font-extrabold text-gray-900">{ratingData.average}</p>
                            <StarDisplay rating={ratingData.average} size="lg" />
                            <p className="text-xs text-gray-400 mt-1">{ratingData.count} review{ratingData.count !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex-1 space-y-1.5">
                            {[5, 4, 3, 2, 1].map(star => {
                                const count = ratingData.breakdown[star];
                                const pct   = ratingData.count > 0 ? Math.round((count / ratingData.count) * 100) : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="w-6 text-right">{star}★</span>
                                        <div className="flex-1 h-1.5 rounded-full bg-gray-200 overflow-hidden">
                                            <div
                                                className="h-full rounded-full bg-amber-400 transition-all"
                                                style={{ width: `${pct}%` }}
                                            />
                                        </div>
                                        <span className="w-6">{count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Reviews list */}
                    <div className="space-y-4">
                        {reviews.map(r => (
                            <div key={r.review_id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{r.reviewer_name}</p>
                                        <StarDisplay rating={r.rating} />
                                    </div>
                                    <p className="text-xs text-gray-400">
                                        {new Date(r.created_at).toLocaleDateString()}
                                    </p>
                                </div>
                                {r.comment && (
                                    <p className="text-sm text-gray-600 leading-relaxed mt-1">{r.comment}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
