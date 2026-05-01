import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import pool from '@/lib/db';
import { redirect } from 'next/navigation';
import UpgradeToSellerButton from '@/components/settings/UpgradeToSellerButton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Settings as SettingsIcon } from 'lucide-react';

export const metadata = { title: 'Settings — Lazapee' };

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) redirect('/login');
    
    const payload = verifyToken(token);
    if (!payload) redirect('/login');

    const [rows] = await pool.query(`
        SELECT p.full_name, p.email, r.role_name 
        FROM profile_table p 
        JOIN role_table r ON p.role_id = r.role_id 
        WHERE p.profile_id = ?
    `, [payload.id]);

    if (rows.length === 0) redirect('/login');
    const user = rows[0];

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8 mt-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 rounded-xl">
                    <SettingsIcon className="w-8 h-8 text-indigo-700" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Settings</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Manage your account preferences</p>
                </div>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="shadow-sm border-gray-100">
                    <CardHeader>
                        <CardTitle>Profile Information</CardTitle>
                        <CardDescription>Your personal details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Full Name</p>
                            <p className="text-gray-900 font-semibold mt-1">{user.full_name}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Email Address</p>
                            <p className="text-gray-900 font-semibold mt-1">{user.email}</p>
                        </div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Current Role</p>
                            <p className="text-indigo-600 uppercase font-black text-sm mt-1">{user.role_name}</p>
                        </div>
                    </CardContent>
                </Card>

                <Card className="shadow-sm border-gray-100">
                    <CardHeader>
                        <CardTitle>Account Activation</CardTitle>
                        <CardDescription>Activate as a seller to open your own store</CardDescription>
                    </CardHeader>
                    <CardContent>
                        {user.role_name === 'customer' ? (
                            <div className="bg-indigo-50/50 p-5 rounded-xl border border-indigo-100">
                                <h3 className="text-lg font-bold text-indigo-900 mb-2">Want to sell on Lazapee?</h3>
                                <p className="text-indigo-700 text-sm mb-5">
                                    Activate your account as a Seller for free and start setting up your own store immediately!
                                </p>
                                <UpgradeToSellerButton />
                            </div>
                        ) : (
                            <div className="bg-green-50 p-5 rounded-xl border border-green-100">
                                <h3 className="text-lg font-bold text-green-900 mb-2">You are already a Seller!</h3>
                                <p className="text-green-700 text-sm">
                                    You have full access to the seller dashboard to manage your products and orders.
                                </p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
