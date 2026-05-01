import { getReviewsByProduct, getProductRating } from '@/services/reviews';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

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
                    <Card className="mb-8">
                        <CardContent className="flex items-center gap-6 p-6">
                            <div className="text-center">
                                <p className="text-5xl font-extrabold text-foreground">{ratingData.average}</p>
                                <StarDisplay rating={ratingData.average} size="lg" />
                                <p className="text-xs text-muted-foreground mt-1">{ratingData.count} review{ratingData.count !== 1 ? 's' : ''}</p>
                            </div>
                            <div className="flex-1 space-y-2">
                                {[5, 4, 3, 2, 1].map(star => {
                                    const count = ratingData.breakdown[star];
                                    const pct   = ratingData.count > 0 ? Math.round((count / ratingData.count) * 100) : 0;
                                    return (
                                        <div key={star} className="flex items-center gap-3 text-xs text-muted-foreground">
                                            <span className="w-8 text-right">{star} ★</span>
                                            <Progress value={pct} className="h-2 flex-1" />
                                            <span className="w-8">{count}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Reviews list */}
                    <div className="space-y-4">
                        {reviews.map(r => (
                            <Card key={r.review_id}>
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <p className="text-sm font-semibold text-foreground">{r.reviewer_name}</p>
                                            <StarDisplay rating={r.rating} />
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(r.created_at).toLocaleDateString()}
                                        </p>
                                    </div>
                                    {r.comment && (
                                        <p className="text-sm text-foreground/80 leading-relaxed mt-1">{r.comment}</p>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </>
            )}
        </section>
    );
}
