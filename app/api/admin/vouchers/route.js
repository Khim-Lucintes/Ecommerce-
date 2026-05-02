import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getAllVouchers, createVoucher, toggleVoucher } from '@/services/vouchers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }
        const vouchers = await getAllVouchers();
        return Response.json({ vouchers });
    } catch (err) {
        return Response.json({ error: 'Failed to fetch vouchers' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }
        const body = await request.json();
        const id = await createVoucher(body);
        return Response.json({ voucher_id: id }, { status: 201 });
    } catch (err) {
        return Response.json({ error: err.message || 'Failed to create voucher' }, { status: 400 });
    }
}

export async function PATCH(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload || (payload.role !== 'admin' && payload.role !== 'superadmin')) {
            return Response.json({ error: 'Admin access required' }, { status: 403 });
        }
        const { voucher_id, is_active } = await request.json();
        await toggleVoucher(voucher_id, is_active);
        return Response.json({ message: 'Voucher updated' });
    } catch (err) {
        return Response.json({ error: 'Failed to update voucher' }, { status: 500 });
    }
}
