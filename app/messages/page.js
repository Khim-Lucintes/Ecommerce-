import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getConversations } from '@/services/chat';
import InboxClient from '@/components/seller/InboxClient';
import { MessageCircle } from 'lucide-react';
import { redirect } from 'next/navigation';

export const metadata = { title: 'Messages — Lazapee' };

export default async function MessagesPage() {
    const cookieStore = await cookies();
    const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
    
    if (!payload) {
        redirect('/login?redirect=/messages');
    }

    const conversations = await getConversations(payload.id);

    return (
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <MessageCircle className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Your Messages</h1>
            </div>
            
            <p className="text-sm text-gray-500">Chat with sellers about your products and orders.</p>

            <InboxClient currentUserId={payload.id} initialConversations={conversations} />
        </div>
    );
}
