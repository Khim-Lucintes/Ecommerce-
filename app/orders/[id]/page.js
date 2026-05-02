import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getOrderWithShipment, getOrderItems } from '@/services/orders';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, MapPin, Package, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata = { title: 'Order Confirmation — Lazapee' };

const STATUS_COLORS = {
    pending:   'bg-yellow-100 text-yellow-800',
    paid:      'bg-green-100 text-green-800',
    shipped:   'bg-blue-100 text-blue-800',
    completed: 'bg-indigo-100 text-indigo-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default async function OrderConfirmationPage({ params }) {
    const { id } = await params;

    const cookieStore = await cookies();
    const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
    if (!payload) redirect('/login');

    const order = await getOrderWithShipment(id, payload.id);
    if (!order) redirect('/');

    const items = await getOrderItems(id);

    const statusColor = STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-700';

    return (
        <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">

            {/* Success banner */}
            <div className="text-center mb-10">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
                    <CheckCircle2 className="w-9 h-9 text-green-600" />
                </div>
                <h1 className="text-2xl font-extrabold text-gray-900">Order Placed!</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Order <span className="font-semibold text-indigo-600">#{order.order_id}</span> has been received.
                </p>
                <span className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${statusColor}`}>
                    {order.status}
                </span>
            </div>

            <div className="space-y-5">

                {/* Items */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Package className="w-4 h-4 text-indigo-500" /> Items Ordered
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="divide-y divide-gray-100">
                        {items.map(item => (
                            <div key={item.order_item_id ?? item.product_id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                                <div className="h-14 w-14 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                                    {item.image_url
                                        ? <img src={item.image_url} alt={item.product_name} className="w-full h-full object-cover" />
                                        : <div className="flex h-full items-center justify-center text-xl">📦</div>
                                    }
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{item.product_name}</p>
                                    <p className="text-xs text-gray-500">{item.store_name} · x{item.quantity}</p>
                                </div>
                                <p className="text-sm font-bold text-gray-900 shrink-0">
                                    ₱{(Number(item.price) * item.quantity).toLocaleString()}
                                </p>
                            </div>
                        ))}
                        <div className="flex justify-between pt-3 font-bold text-gray-900 text-sm">
                            <span>Total</span>
                            <span>₱{Number(order.total_amount).toLocaleString()}</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Payment */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-indigo-500" /> Payment
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm text-gray-700">
                        <div className="flex justify-between">
                            <span className="text-gray-500">Method</span>
                            <span className="font-medium capitalize">{order.payment_method || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-500">Status</span>
                            <span className={`font-bold capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                                {order.payment_status}
                            </span>
                        </div>
                        {order.paid_at && (
                            <div className="flex justify-between">
                                <span className="text-gray-500">Paid at</span>
                                <span>{new Date(order.paid_at).toLocaleString()}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Delivery address */}
                {order.full_address && (
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-sm flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-indigo-500" /> Delivery Address
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-sm text-gray-700 space-y-0.5">
                            <p className="font-medium">{order.full_address}</p>
                            {(order.city || order.postal_code) && (
                                <p className="text-gray-500">{[order.city, order.postal_code].filter(Boolean).join(', ')}</p>
                            )}
                            {order.shipment_status && (
                                <p className="mt-2 text-xs">
                                    Shipment:{' '}
                                    <span className="font-semibold capitalize text-indigo-600">{order.shipment_status}</span>
                                    {order.courier && ` · ${order.courier}`}
                                    {order.tracking_number && ` · ${order.tracking_number}`}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}

            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Link
                    href="/products"
                    className="flex-1 text-center rounded-xl border border-gray-200 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                    Continue Shopping
                </Link>
                <Link
                    href="/orders"
                    className="flex-1 text-center rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition"
                >
                    View All Orders
                </Link>
            </div>
        </div>
    );
}
