import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getStoreByOwner, getProductsByStore, getOrdersByStore } from '@/services/stores';
import CreateStoreForm from '@/components/seller/CreateStoreForm';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Store, Package, ShoppingCart, Banknote, Plus } from 'lucide-react';

export const metadata = { title: 'Seller Dashboard — Lazapee' };

const STATUS_COLORS = {
    pending:   'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    paid:      'bg-green-100 text-green-700 hover:bg-green-100',
    shipped:   'bg-blue-100 text-blue-700 hover:bg-blue-100',
    completed: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
    cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
};

export default async function SellerDashboardPage() {
    const cookieStore = await cookies();
    const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);

    const store = await getStoreByOwner(payload.id);

    // No store yet — show setup form
    if (!store) return <CreateStoreForm />;

    const [products, orders] = await Promise.all([
        getProductsByStore(store.store_id),
        getOrdersByStore(store.store_id, 10),
    ]);

    const totalRevenue = orders
        .filter(o => o.status !== 'cancelled')
        .reduce((s, o) => s + (Number(o.price) * Number(o.quantity)), 0);

    return (
        <div className="space-y-8 max-w-5xl">

            {/* Header */}
            <div className="flex items-center justify-between pb-6 border-b border-gray-100">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-violet-100 rounded-2xl shadow-sm">
                        <Store className="w-8 h-8 text-violet-700" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">{store.store_name}</h1>
                        {store.description && <p className="text-sm text-gray-500 mt-1 font-medium">{store.description}</p>}
                    </div>
                </div>
                <Link href="/seller/dashboard/products/new" className={cn(buttonVariants({ variant: 'default' }), "shadow-sm rounded-xl px-5")}>
                    <Plus className="w-4 h-4 mr-2" /> Add Product
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                    { label: 'Products', value: products.length, icon: <Package className="h-6 w-6 text-violet-600" />, bgColor: 'bg-violet-50', color: 'text-violet-900' },
                    { label: 'Orders', value: orders.length, icon: <ShoppingCart className="h-6 w-6 text-indigo-600" />, bgColor: 'bg-indigo-50', color: 'text-indigo-900' },
                    { label: 'Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: <Banknote className="h-6 w-6 text-green-600" />, bgColor: 'bg-green-50', color: 'text-green-900' },
                ].map(stat => (
                    <Card key={stat.label} className="overflow-hidden border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                                    {stat.icon}
                                </div>
                            </div>
                            <div className="mt-4">
                                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                                <p className={`text-3xl font-black mt-1 tracking-tight ${stat.color}`}>{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Products table */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
                <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <Package className="w-5 h-5 text-gray-400" /> My Products
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 py-0">
                    {products.length === 0 ? (
                        <div className="py-16 text-center text-muted-foreground">
                            <p>No products yet.</p>
                            <Link href="/seller/dashboard/products/new" className={cn(buttonVariants({ variant: 'link' }), "mt-2")}>
                                Add your first product →
                            </Link>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Product</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead className="text-right">Price</TableHead>
                                    <TableHead className="text-right">Stock</TableHead>
                                    <TableHead className="text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map(p => (
                                    <TableRow key={p.product_id}>
                                        <TableCell className="pl-6 font-medium max-w-[200px] truncate">
                                            {p.product_name}
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">{p.category_name}</TableCell>
                                        <TableCell className="text-right text-primary font-semibold">
                                            ₱{Number(p.price).toLocaleString()}
                                        </TableCell>
                                        <TableCell className={`text-right font-medium ${p.stock === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                            {p.stock}
                                        </TableCell>
                                        <TableCell className="text-right pr-6">
                                            <Link href={`/seller/dashboard/products/${p.product_id}/edit`} className={buttonVariants({ variant: 'ghost', size: 'sm' })}>
                                                Edit
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Recent orders */}
            <Card className="shadow-sm border-gray-100 overflow-hidden">
                <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <ShoppingCart className="w-5 h-5 text-gray-400" /> Recent Orders
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 py-0">
                    {orders.length === 0 ? (
                        <p className="py-10 text-center text-sm text-muted-foreground">No orders yet.</p>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="pl-6">Order #</TableHead>
                                    <TableHead>Buyer</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right pr-6">Date</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {orders.map(o => (
                                    <TableRow key={o.order_id}>
                                        <TableCell className="pl-6 font-medium">#{o.order_id}</TableCell>
                                        <TableCell className="text-muted-foreground truncate max-w-[150px]">{o.buyer_name}</TableCell>
                                        <TableCell className="text-right font-semibold">
                                            ₱{(Number(o.price) * Number(o.quantity)).toLocaleString()}
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="secondary" className={`capitalize ${STATUS_COLORS[o.status] || ''}`}>
                                                {o.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right pr-6 text-muted-foreground">
                                            {new Date(o.created_at).toLocaleDateString()}
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
