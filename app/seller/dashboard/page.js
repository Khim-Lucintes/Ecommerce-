import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getStoreByOwner, getProductsByStore, getOrdersByStore } from '@/services/stores';
import CreateStoreForm from '@/components/seller/CreateStoreForm';
import Link from 'next/link';

export const metadata = { title: 'Seller Dashboard — ShopEasy' };

const STATUS_COLORS = {
    pending:   'bg-yellow-100 text-yellow-700',
    paid:      'bg-green-100 text-green-700',
    shipped:   'bg-blue-100 text-blue-700',
    completed: 'bg-indigo-100 text-indigo-700',
    cancelled: 'bg-red-100 text-red-700',
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
        .reduce((s, o) => s + Number(o.total_amount), 0);

    return (
        <div className="space-y-8 max-w-5xl">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">🏪 {store.store_name}</h1>
                    {store.description && <p className="text-sm text-gray-500 mt-0.5">{store.description}</p>}
                </div>
                <Link href="/seller/dashboard/products/new"
                    className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition">
                    + Add Product
                </Link>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
                {[
                    { label: 'Products', value: products.length, icon: '📦' },
                    { label: 'Orders', value: orders.length, icon: '🛒' },
                    { label: 'Revenue', value: `₱${totalRevenue.toLocaleString()}`, icon: '💰' },
                ].map(stat => (
                    <div key={stat.label} className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
                        <p className="text-2xl">{stat.icon}</p>
                        <p className="mt-2 text-2xl font-bold text-gray-900">{stat.value}</p>
                        <p className="text-xs text-gray-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Products table */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">My Products</h2>
                </div>
                {products.length === 0 ? (
                    <div className="py-16 text-center text-gray-400">
                        <p>No products yet.</p>
                        <Link href="/seller/dashboard/products/new" className="mt-2 inline-block text-sm text-indigo-600 hover:underline">
                            Add your first product →
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                <tr>
                                    <th className="text-left px-6 py-3">Product</th>
                                    <th className="text-left px-6 py-3">Category</th>
                                    <th className="text-right px-6 py-3">Price</th>
                                    <th className="text-right px-6 py-3">Stock</th>
                                    <th className="text-right px-6 py-3">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {products.map(p => (
                                    <tr key={p.product_id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-3 font-medium text-gray-900 max-w-[200px] truncate">
                                            {p.product_name}
                                        </td>
                                        <td className="px-6 py-3 text-gray-500">{p.category_name}</td>
                                        <td className="px-6 py-3 text-right text-indigo-600 font-semibold">
                                            ₱{Number(p.price).toLocaleString()}
                                        </td>
                                        <td className={`px-6 py-3 text-right font-medium ${p.stock === 0 ? 'text-red-500' : 'text-gray-700'}`}>
                                            {p.stock}
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <Link href={`/seller/dashboard/products/${p.product_id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-800 font-medium">
                                                Edit
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent orders */}
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-semibold text-gray-900">Recent Orders</h2>
                </div>
                {orders.length === 0 ? (
                    <p className="py-10 text-center text-sm text-gray-400">No orders yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                                <tr>
                                    <th className="text-left px-6 py-3">Order #</th>
                                    <th className="text-left px-6 py-3">Buyer</th>
                                    <th className="text-right px-6 py-3">Total</th>
                                    <th className="text-center px-6 py-3">Status</th>
                                    <th className="text-right px-6 py-3">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {orders.map(o => (
                                    <tr key={o.order_id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-3 font-medium text-gray-900">#{o.order_id}</td>
                                        <td className="px-6 py-3 text-gray-600 truncate max-w-[150px]">{o.buyer_name}</td>
                                        <td className="px-6 py-3 text-right font-semibold text-gray-900">
                                            ₱{Number(o.total_amount).toLocaleString()}
                                        </td>
                                        <td className="px-6 py-3 text-center">
                                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[o.status] || ''}`}>
                                                {o.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3 text-right text-gray-400">
                                            {new Date(o.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
