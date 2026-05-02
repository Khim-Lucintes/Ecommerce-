'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function InboxClient({ currentUserId, initialConversations }) {
    const [conversations, setConversations] = useState(initialConversations || []);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [sending, setSending] = useState(false);
    
    const bottomRef = useRef(null);
    const pollRef = useRef(null);

    // Refresh conversations list
    const fetchConversations = async () => {
        try {
            const res = await fetch('/api/chat/conversations');
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        } catch {}
    };

    // Refresh active chat messages
    const fetchMessages = async () => {
        if (!activeChatId) return;
        try {
            const res = await fetch(`/api/chat?with=${activeChatId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch {}
    };

    // Polling effect
    useEffect(() => {
        fetchConversations();
        fetchMessages();
        pollRef.current = setInterval(() => {
            fetchConversations();
            fetchMessages();
        }, 3000);
        return () => clearInterval(pollRef.current);
    }, [activeChatId]);

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = async (e) => {
        e.preventDefault();
        if (!input.trim() || !activeChatId) return;
        setSending(true);
        await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiver_id: activeChatId, content: input }),
        });
        setInput('');
        setSending(false);
        await fetchMessages();
        await fetchConversations();
    };

    const activeUser = conversations.find(c => c.other_id === activeChatId);

    return (
        <div className="flex w-full h-[600px] border border-gray-100 rounded-xl overflow-hidden shadow-sm bg-white">
            {/* Sidebar (Conversations) */}
            <div className="w-1/3 border-r border-gray-100 bg-gray-50 flex flex-col">
                <div className="p-4 border-b border-gray-200 bg-white">
                    <h2 className="font-bold text-gray-800">Inbox</h2>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {conversations.length === 0 ? (
                        <p className="p-4 text-sm text-gray-400 text-center">No messages yet.</p>
                    ) : (
                        conversations.map(c => (
                            <div 
                                key={c.other_id} 
                                onClick={() => setActiveChatId(c.other_id)}
                                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${activeChatId === c.other_id ? 'bg-indigo-50 border-indigo-100' : 'hover:bg-white'}`}
                            >
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`font-semibold text-sm ${c.unread > 0 ? 'text-gray-900' : 'text-gray-700'}`}>{c.other_name}</span>
                                    {c.unread > 0 && (
                                        <span className="bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{c.unread}</span>
                                    )}
                                </div>
                                <p className="text-xs text-gray-500 truncate">{c.last_msg}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="w-2/3 flex flex-col bg-white">
                {activeChatId ? (
                    <>
                        <div className="p-4 border-b border-gray-100 bg-white flex justify-between items-center shadow-sm z-10">
                            <span className="font-bold text-gray-800">{activeUser?.other_name}</span>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 space-y-4">
                            {messages.length === 0 && (
                                <p className="text-center text-xs text-muted-foreground mt-4">Start the conversation!</p>
                            )}
                            {messages.map(m => {
                                const isMine = m.sender_id === currentUserId;
                                return (
                                    <div key={m.message_id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm shadow-sm ${isMine ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'}`}>
                                            <p>{m.content}</p>
                                            <p className={`text-[10px] mt-1 text-right ${isMine ? 'text-indigo-200' : 'text-gray-400'}`}>
                                                {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                            <div ref={bottomRef} />
                        </div>
                        <form onSubmit={send} className="p-3 border-t border-gray-100 bg-white flex gap-2">
                            <Input
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 rounded-full bg-gray-50"
                            />
                            <Button type="submit" disabled={sending || !input.trim()} size="icon" className="rounded-full shrink-0 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-slate-50">
                        <p className="text-gray-400 text-sm">Select a conversation to start chatting.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
