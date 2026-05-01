'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

// Separated into its own component so it can be wrapped in Suspense
// (useSearchParams requires a Suspense boundary in Next.js App Router)
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirect = searchParams.get('redirect') || '/';

    const [form, setForm]       = useState({ email: '', password: '' });
    const [error, setError]     = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Login failed.');
            } else {
                router.push(redirect);
                router.refresh();
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {error && (
                <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email" name="email" type="email"
                        value={form.email} onChange={handleChange}
                        placeholder="you@example.com"
                        required autoFocus
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                        id="password" name="password" type="password"
                        value={form.password} onChange={handleChange}
                        placeholder="Your password"
                        required
                    />
                </div>

                <Button
                    type="submit"
                    className="w-full"
                    disabled={loading}
                >
                    {loading ? 'Signing in…' : 'Sign In'}
                </Button>
            </form>
        </>
    );
}

export default function LoginPage() {
    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 to-violet-700 flex-col justify-between p-12 text-white relative overflow-hidden">
                <div className="relative z-10 font-bold text-3xl tracking-tight flex items-center gap-2">
                    <span className="bg-white text-indigo-600 rounded-lg p-1.5 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path d="M2.25 2.25a.75.75 0 0 0 0 1.5h1.386c.17 0 .318.114.362.278l2.558 9.592a3.752 3.752 0 0 0-2.806 3.63c0 .414.336.75.75.75h15.75a.75.75 0 0 0 0-1.5H5.378A2.25 2.25 0 0 1 7.5 15h11.218a.75.75 0 0 0 .674-.421 60.358 60.358 0 0 0 2.96-7.228.75.75 0 0 0-.525-.965A60.864 60.864 0 0 0 5.68 4.509l-.232-.867A1.875 1.875 0 0 0 3.636 2.25H2.25ZM3.75 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0ZM16.5 20.25a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0Z" />
                        </svg>
                    </span>
                    Lazapee
                </div>
                <div className="relative z-10">
                    <h1 className="text-5xl font-extrabold tracking-tight mb-6 leading-tight">
                        Your gateway to endless shopping.
                    </h1>
                    <p className="text-lg text-indigo-100 max-w-md">
                        Join millions of buyers and sellers in the most trusted multi-vendor marketplace. Fast, secure, and easy to use.
                    </p>
                </div>
                <div className="relative z-10 text-sm text-indigo-200">
                    © {new Date().getFullYear()} Lazapee. All rights reserved.
                </div>
            </div>

            {/* Right Panel */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-gray-50">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Welcome back</CardTitle>
                        <CardDescription>Enter your credentials to access your account</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-2">
                        <Suspense fallback={<div className="h-40 animate-pulse bg-gray-100 rounded-lg" />}>
                            <LoginForm />
                        </Suspense>
                    </CardContent>
                    <CardFooter className="flex justify-center border-t pt-6 mt-2">
                        <p className="text-center text-sm text-gray-500">
                            Don&apos;t have an account?{' '}
                            <Link href="/register" className="font-medium text-primary hover:text-primary/80 transition underline underline-offset-4">
                                Create one
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
