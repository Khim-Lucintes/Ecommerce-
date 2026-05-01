import { getAdminStats, getAllUsers, getAllProducts, getAllOrders } from '@/services/admin';
import UserRoleSelect from '@/components/admin/UserRoleSelect';

export const metadata = { title: 'Admin Dashboard — Lazapee' };

const STATUS_COLORS = {
    pending:   'bg-yellow-100 text-yellow-700',
    paid:      'bg-green-100 text-green-700',
    shipped:   'bg-blue-100 text-blue-700',
    completed: 'bg-indigo-100 text-indigo-700',
    cancelled: 'bg-red-100 text-red-700',
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
            <div>
                <h1 className="text-2xl font-bold text-gray-900">⚙️ Admin Dashboard</h1>
                <p className="text-sm text-gray-500 mt-1">Full platform overview</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                {[
                    { label: 'Total Users',    value: stats.users,    icon: '👥', color: 'text-blue-600' },
                    { label: 'Total Products', value: stats.products, icon: '📦', color: 'text-violet-600' },
                    { label: 'Total Orders',   value: stats.orders,   icon: '🛒', color: 'text-indigo-600' },
                    { label: 'Total Revenue',  value: `₱${Number(stats.revenue).toLocaleString()}`, icon: '💰', color: 'text-green-600' },
                ].map(stat => (
                    <div key={stat.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                        <p className="text-2xl">{stat.icon}</p>
                        <p className={`mt-2 text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Users table */}
            <div id="users" className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Users ({users.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="text-left px-6 py-3">Name</th>
                                <th className="text-left px-6 py-3">Email</th>
                                <th className="text-center px-6 py-3">Role</th>
                                <th className="text-right px-6 py-3">Joined</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.map(u => (
                                <tr key={u.profile_id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3 font-medium text-gray-900">{u.full_name}</td>
                                    <td className="px-6 py-3 text-gray-500">{u.email}</td>
                                    <td className="px-6 py-3 text-center">
                                        <UserRoleSelect userId={u.profile_id} currentRole={u.role_name} />
                                    </td>
                                    <td className="px-6 py-3 text-right text-gray-400">
                                        {new Date(u.created_at).toLocaleDateString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Products table */}
            <div id="products" className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Products ({products.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="text-left px-6 py-3">Product</th>
                                <th className="text-left px-6 py-3">Store</th>
                                <th className="text-left px-6 py-3">Category</th>
                                <th className="text-right px-6 py-3">Price</th>
                                <th className="text-right px-6 py-3">Stock</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {products.map(p => (
                                <tr key={p.product_id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3 font-medium text-gray-900 max-w-[200px] truncate">{p.product_name}</td>
                                    <td className="px-6 py-3 text-gray-500">{p.store_name}</td>
                                    <td className="px-6 py-3 text-gray-500">{p.category_name}</td>
                                    <td className="px-6 py-3 text-right font-semibold text-indigo-600">₱{Number(p.price).toLocaleString()}</td>
                                    <td className={`px-6 py-3 text-right font-medium ${p.stock === 0 ? 'text-red-500' : 'text-gray-700'}`}>{p.stock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Orders table */}
            <div id="orders" className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Orders ({orders.length})</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                            <tr>
                                <th className="text-left px-6 py-3">Order #</th>
                                <th className="text-left px-6 py-3">Buyer</th>
                                <th className="text-right px-6 py-3">Total</th>
                                <th className="text-center px-6 py-3">Status</th>
                                <th className="text-center px-6 py-3">Payment</th>
                                <th className="text-right px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {orders.map(o => (
                                <tr key={o.order_id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-3 font-medium text-gray-900">#{o.order_id}</td>
                                    <td className="px-6 py-3 text-gray-600 max-w-[150px] truncate">{o.buyer_name}</td>
                                    <td className="px-6 py-3 text-right font-semibold">₱{Number(o.total_amount).toLocaleString()}</td>
                                    <td className="px-6 py-3 text-center">
                                        <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[o.status] || ''}`}>
                                            {o.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3 text-center text-gray-500 capitalize">{o.payment_status || '—'}</td>
                                    <td className="px-6 py-3 text-right text-gray-400">{new Date(o.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
