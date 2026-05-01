'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function UpgradeToSellerButton() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleUpgrade = async () => {
        if (!confirm('Are you sure you want to activate your account as a Seller?')) return;
        
        setLoading(true);
        try {
            const res = await fetch('/api/users/me/upgrade', {
                method: 'POST',
            });
            
            if (res.ok) {
                setSuccess(true);
                // Delay redirect so user sees the success state
                setTimeout(() => {
                    router.refresh();
                    window.location.href = '/seller/dashboard';
                }, 1500);
            } else {
                const data = await res.json();
                alert(data.error || 'Activation failed.');
            }
        } catch (err) {
            alert('Network error.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="flex items-center gap-2 text-green-700 bg-green-50 px-4 py-2 rounded-lg border border-green-200">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium">Activation successful! Redirecting...</span>
            </div>
        );
    }

    return (
        <Button onClick={handleUpgrade} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {loading ? 'Activating...' : 'Activate to a Seller'}
        </Button>
    );
}
