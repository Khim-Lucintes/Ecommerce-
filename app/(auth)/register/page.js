'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({
        full_name: '', email: '', username: '', password: '', confirm: '', phone: '',
    });
    const [error, setError]   = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) =>
        setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (form.password !== form.confirm) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    full_name: form.full_name,
                    email:     form.email,
                    username:  form.username,
                    password:  form.password,
                    phone:     form.phone,
                }),
            });

            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Registration failed.');
            } else {
                router.push('/');
                router.refresh();
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-white">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-violet-700 to-indigo-600 flex-col justify-between p-12 text-white relative overflow-hidden">
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
                        Start your journey with us.
                    </h1>
                    <p className="text-lg text-indigo-100 max-w-md">
                        Create an account to start shopping or set up your own store to sell to millions of customers.
                    </p>
                </div>
                <div className="relative z-10 text-sm text-indigo-200">
                    © {new Date().getFullYear()} Lazapee. All rights reserved.
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12 bg-gray-50 overflow-y-auto">
                <Card className="w-full max-w-md shadow-lg">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold">Create an account</CardTitle>
                        <CardDescription>Enter your details to get started</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="mt-2">
                        {error && (
                            <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">
                                    Full Name <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="full_name" name="full_name" type="text"
                                    value={form.full_name} onChange={handleChange}
                                    placeholder="Juan dela Cruz"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">
                                    Email <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="email" name="email" type="email"
                                    value={form.email} onChange={handleChange}
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    Username <span className="text-muted-foreground font-normal">(optional)</span>
                                </Label>
                                <Input
                                    id="username" name="username" type="text"
                                    value={form.username} onChange={handleChange}
                                    placeholder="juandc"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phone">
                                    Phone <span className="text-muted-foreground font-normal">(optional)</span>
                                </Label>
                                <Input
                                    id="phone" name="phone" type="tel"
                                    value={form.phone} onChange={handleChange}
                                    placeholder="+63 9xx xxx xxxx"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    Password <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="password" name="password" type="password"
                                    value={form.password} onChange={handleChange}
                                    placeholder="Min. 6 characters"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm">
                                    Confirm Password <span className="text-destructive">*</span>
                                </Label>
                                <Input
                                    id="confirm" name="confirm" type="password"
                                    value={form.confirm} onChange={handleChange}
                                    placeholder="Repeat password"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                className="w-full mt-6"
                                disabled={loading}
                            >
                                {loading ? 'Creating account…' : 'Create Account'}
                            </Button>
                        </form>
                    </CardContent>

                    <CardFooter className="flex justify-center border-t pt-6 mt-2">
                        <p className="text-center text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="font-medium text-primary hover:text-primary/80 transition underline underline-offset-4">
                                Sign in
                            </Link>
                        </p>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}
