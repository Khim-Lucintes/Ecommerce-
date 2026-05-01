import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { applyVoucher } from '@/services/vouchers';

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const { code, cart_total } = await request.json();
        if (!code || cart_total == null) {
            return Response.json({ error: 'code and cart_total required' }, { status: 400 });
        }

        const result = await applyVoucher(code, Number(cart_total));
        return Response.json(result);
    } catch (err) {
        console.error('[POST /api/vouchers/apply]', err);
        return Response.json({ error: err.message || 'Failed to apply voucher' }, { status: 400 });
    }
}
