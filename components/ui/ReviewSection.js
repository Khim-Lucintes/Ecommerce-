'use client';

import { useState } from 'react';
import ReviewForm from './ReviewForm';
import { useRouter } from 'next/navigation';

export default function ReviewSection({ productId, isCustomer, isLoggedIn }) {
    const router = useRouter();
    const [submitted, setSubmitted] = useState(false);

    const handleSubmitted = () => {
        setSubmitted(true);
        router.refresh();
    };

    if (!isLoggedIn) {
        return (
            <div className="mt-6 rounded-xl border border-dashed border-gray-200 px-5 py-4 text-center text-sm text-gray-400">
                <a href="/login" className="text-indigo-600 hover:underline font-medium">Sign in</a> to leave a review.
            </div>
        );
    }

    if (!isCustomer) {
        return null;
    }

    if (submitted) return null;

    return <ReviewForm productId={productId} onReviewSubmitted={handleSubmitted} />;
}
