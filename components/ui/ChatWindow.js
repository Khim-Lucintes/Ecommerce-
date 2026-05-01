'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function ChatWindow({ currentUserId, otherId, otherName, productId = null }) {
    const [messages, setMessages]   = useState([]);
    const [input, setInput]         = useState('');
    const [sending, setSending]     = useState(false);
    const [minimized, setMinimized] = useState(false);
    const bottomRef = useRef(null);
    const pollRef   = useRef(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/chat?with=${otherId}`);
            if (res.ok) {
                const data = await res.json();
                setMessages(data.messages || []);
            }
        } catch {}
    };

    useEffect(() => {
        fetchMessages();
        pollRef.current = setInterval(fetchMessages, 3000); // poll every 3s
        return () => clearInterval(pollRef.current);
    }, [otherId]);

    useEffect(() => {
        if (!minimized) bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, minimized]);

    const send = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;
        setSending(true);
        await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ receiver_id: otherId, content: input, product_id: productId }),
        });
        setInput('');
        setSending(false);
        await fetchMessages();
    };

    return (
        <Card className={`fixed bottom-6 right-6 z-50 flex flex-col shadow-2xl overflow-hidden transition-all duration-300 ${minimized ? 'h-14 w-64' : 'h-[28rem] w-80'}`}>
            {/* Header */}
            <div
                onClick={() => setMinimized(m => !m)}
                className="flex items-center justify-between bg-primary px-4 py-3 cursor-pointer select-none"
            >
                <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-sm font-semibold text-primary-foreground truncate">{otherName}</span>
                </div>
                <span className="text-primary-foreground text-lg leading-none">{minimized ? '▲' : '▼'}</span>
            </div>

            {!minimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-muted/30">
                        {messages.length === 0 && (
                            <p className="text-center text-xs text-muted-foreground">Start the conversation!</p>
                        )}
                        {messages.map(m => {
                            const isMine = m.sender_id === currentUserId;
                            return (
                                <div key={m.message_id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm shadow-sm ${isMine ? 'bg-primary text-primary-foreground rounded-br-none' : 'bg-background text-foreground rounded-bl-none border'}`}>
                                        <p>{m.content}</p>
                                        <p className={`text-[10px] mt-1 ${isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                                            {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={bottomRef} />
                    </div>

                    {/* Input */}
                    <form onSubmit={send} className="flex items-center gap-2 border-t p-3 bg-background">
                        <Input
                            value={input}
                            onChange={e => setInput(e.target.value)}
                            placeholder="Type a message…"
                            className="flex-1 rounded-full"
                        />
                        <Button type="submit" disabled={sending || !input.trim()} size="icon" className="rounded-full shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                            </svg>
                        </Button>
                    </form>
                </>
            )}
        </Card>
    );
}
