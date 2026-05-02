import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getOrdersByBuyer } from '@/services/orders';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Package, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button, buttonVariants } from '@/components/ui/button';

export const metadata = { title: 'Purchase History — Lazapee' };

const STATUS_COLORS = {
    pending:   'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    paid:      'bg-green-100 text-green-700 hover:bg-green-100',
    shipped:   'bg-blue-100 text-blue-700 hover:bg-blue-100',
    completed: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
    cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
};

export default async function PurchaseHistoryPage() {
    const cookieStore = await cookies();
    const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);

    if (!payload) redirect('/login');

    const orders = await getOrdersByBuyer(payload.id);

    return (
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-indigo-100 rounded-xl">
                    <Package className="w-6 h-6 text-indigo-700" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Purchase History</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">Track and manage your recent orders.</p>
                </div>
            </div>

            <Card className="shadow-sm border-gray-100 overflow-hidden">
                <CardContent className="p-0">
                    {orders.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <p>You haven't placed any orders yet.</p>
                            <Link href="/products" className={buttonVariants({ variant: 'link', className: 'mt-2' })}>
                                Start Shopping →
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader className="bg-gray-50/50">
                                <TableRow>
                                    <TableHead className="pl-6">Order ID</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right pr-6">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(order => (
                                    <TableRow key={order.order_id} className="hover:bg-gray-50/50">
                                        <TableCell className="pl-6 font-semibold text-gray-900">
                                            #{order.order_id}
                                        </TableCell>
                                        <TableCell className="text-gray-500">
                                            {new Date(order.created_at).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="font-semibold text-indigo-600">
                                            ₱{Number(order.total_amount).toLocaleString()}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className={`capitalize ${STATUS_COLORS[order.status] || ''}`}>
                                                {order.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Link 
                                                href={`/orders/${order.order_id}`}
                                                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'rounded-lg' })}
                                            >
                                                View Details <ArrowRight className="w-3 h-3 ml-2" />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
