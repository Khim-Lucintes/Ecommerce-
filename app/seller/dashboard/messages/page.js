import { cookies } from 'next/headers';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { getConversations } from '@/services/chat';
import InboxClient from '@/components/seller/InboxClient';
import { MessageSquare } from 'lucide-react';

export const metadata = { title: 'Messages — Seller Dashboard' };

export default async function SellerMessagesPage() {
    const cookieStore = await cookies();
    const payload = verifyToken(cookieStore.get(COOKIE_NAME)?.value);
    
    const conversations = await getConversations(payload.id);

    return (
        <div className="max-w-5xl space-y-6">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-indigo-600" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            </div>
            
            <p className="text-sm text-gray-500">Respond to customer inquiries and track conversations.</p>

            <InboxClient currentUserId={payload.id} initialConversations={conversations} />
        </div>
    );
}
