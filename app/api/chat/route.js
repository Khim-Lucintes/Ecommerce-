import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getMessages, sendMessage, markRead } from '@/services/chat';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const otherId = searchParams.get('with');
        if (!otherId) return Response.json({ error: 'with param required' }, { status: 400 });

        await markRead(payload.id, Number(otherId));
        const messages = await getMessages(payload.id, Number(otherId));
        return Response.json({ messages });
    } catch (err) {
        console.error('[GET /api/chat]', err);
        return Response.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        const cookieStore = await cookies();
        const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
        if (!payload) return Response.json({ error: 'Login required' }, { status: 401 });

        const { receiver_id, content, product_id } = await request.json();
        if (!receiver_id || !content?.trim()) {
            return Response.json({ error: 'receiver_id and content required' }, { status: 400 });
        }

        const message_id = await sendMessage({
            sender_id: payload.id,
            receiver_id: Number(receiver_id),
            content,
            product_id: product_id ? Number(product_id) : null,
        });

        return Response.json({ message_id }, { status: 201 });
    } catch (err) {
        console.error('[POST /api/chat]', err);
        return Response.json({ error: 'Failed to send message' }, { status: 500 });
    }
}
