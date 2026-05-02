import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getConversations } from '@/services/chat';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const conversations = await getConversations(payload.id);
        return Response.json({ conversations });
    } catch (err) {
        console.error('[GET /api/chat/conversations]', err);
        return Response.json({ error: 'Failed to fetch conversations' }, { status: 500 });
    }
}
