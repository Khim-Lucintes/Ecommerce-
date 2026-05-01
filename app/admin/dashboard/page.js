import { getAdminStats, getAllUsers, getAllProducts, getAllOrders } from '@/services/admin';
import UserRoleSelect from '@/components/admin/UserRoleSelect';
import VoucherManagement from '@/components/admin/VoucherManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Users, Package, ShoppingCart, Banknote, ShieldCheck, Ticket } from 'lucide-react';

export const metadata = { title: 'Admin Dashboard — Lazapee' };

const STATUS_COLORS = {
    pending:   'bg-yellow-100 text-yellow-700 hover:bg-yellow-100',
    paid:      'bg-green-100 text-green-700 hover:bg-green-100',
    shipped:   'bg-blue-100 text-blue-700 hover:bg-blue-100',
    completed: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-100',
    cancelled: 'bg-red-100 text-red-700 hover:bg-red-100',
};

const ROLE_COLORS = {
    admin:    'bg-red-100 text-red-700',
    seller:   'bg-violet-100 text-violet-700',
    customer: 'bg-blue-100 text-blue-700',
};

export default async function AdminDashboardPage() {
    const [stats, users, products, orders] = await Promise.all([
        getAdminStats(),
        getAllUsers(50),
        getAllProducts(50),
        getAllOrders(50),
    ]);

    return (
        <div className="space-y-10 max-w-6xl">

            {/* Header */}
            <div className="flex items-center gap-4 pb-6 border-b border-gray-100">
                <div className="p-3 bg-indigo-100 rounded-2xl shadow-sm">
                    <ShieldCheck className="w-8 h-8 text-indigo-700" />
                </div>
                <div>
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin Dashboard</h1>
                    <p className="text-sm text-gray-500 mt-1 font-medium">Full platform overview and management</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: 'Total Users',    value: stats.users,    icon: <Users className="h-6 w-6 text-blue-600" />, bgColor: 'bg-blue-50', color: 'text-blue-900' },
                    { label: 'Total Products', value: stats.products, icon: <Package className="h-6 w-6 text-violet-600" />, bgColor: 'bg-violet-50', color: 'text-violet-900' },
                    { label: 'Total Orders',   value: stats.orders,   icon: <ShoppingCart className="h-6 w-6 text-indigo-600" />, bgColor: 'bg-indigo-50', color: 'text-indigo-900' },
                    { label: 'Total Revenue',  value: `₱${Number(stats.revenue).toLocaleString()}`, icon: <Banknote className="h-6 w-6 text-green-600" />, bgColor: 'bg-green-50', color: 'text-green-900' },
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

            {/* Users table */}
            <Card id="users" className="shadow-sm border-gray-100 overflow-hidden">
                <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <Users className="w-5 h-5 text-gray-400" /> Users ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 py-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead className="text-center">Role</TableHead>
                                <TableHead className="text-right pr-6">Joined</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(u => (
                                <TableRow key={u.profile_id}>
                                    <TableCell className="pl-6 font-medium">{u.full_name}</TableCell>
                                    <TableCell className="text-muted-foreground">{u.email}</TableCell>
                                    <TableCell className="text-center">
                                        <UserRoleSelect userId={u.profile_id} currentRole={u.role_name} />
                                    </TableCell>
                                    <TableCell className="text-right pr-6 text-muted-foreground">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Products table */}
            <Card id="products" className="shadow-sm border-gray-100 overflow-hidden">
                <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <Package className="w-5 h-5 text-gray-400" /> Products ({products.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 py-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Product</TableHead>
                                <TableHead>Store</TableHead>
                                <TableHead>Category</TableHead>
                                <TableHead className="text-right">Price</TableHead>
                                <TableHead className="text-right pr-6">Stock</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map(p => (
                                <TableRow key={p.product_id}>
                                    <TableCell className="pl-6 font-medium max-w-[200px] truncate">{p.product_name}</TableCell>
                                    <TableCell className="text-muted-foreground">{p.store_name}</TableCell>
                                    <TableCell className="text-muted-foreground">{p.category_name}</TableCell>
                                    <TableCell className="text-right font-semibold text-primary">₱{Number(p.price).toLocaleString()}</TableCell>
                                    <TableCell className={`text-right pr-6 font-medium ${p.stock === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>{p.stock}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Orders table */}
            <Card id="orders" className="shadow-sm border-gray-100 overflow-hidden">
                <CardHeader className="bg-gray-50/80 border-b border-gray-100 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2 text-gray-800">
                        <ShoppingCart className="w-5 h-5 text-gray-400" /> Orders ({orders.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="px-0 py-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="pl-6">Order #</TableHead>
                                <TableHead>Buyer</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-center">Payment</TableHead>
                                <TableHead className="text-right pr-6">Date</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {orders.map(o => (
                                <TableRow key={o.order_id}>
                                    <TableCell className="pl-6 font-medium">#{o.order_id}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-[150px] truncate">{o.buyer_name}</TableCell>
                                    <TableCell className="text-right font-semibold">₱{Number(o.total_amount).toLocaleString()}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge variant="secondary" className={`capitalize ${STATUS_COLORS[o.status] || ''}`}>
                                            {o.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-center text-muted-foreground capitalize">{o.payment_status || '—'}</TableCell>
                                    <TableCell className="text-right pr-6 text-muted-foreground">{new Date(o.created_at).toLocaleDateString()}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            {/* Voucher Management */}
            <div id="vouchers" className="pt-6">
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                        <Ticket className="w-5 h-5 text-orange-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Voucher Management</h2>
                </div>
                <VoucherManagement />
            </div>
        </div>
    );
}
