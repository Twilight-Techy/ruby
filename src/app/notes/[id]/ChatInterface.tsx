'use client';

import { useState } from 'react';
import { ChatTeardropText, PaperPlaneRight, CircleNotch } from '@phosphor-icons/react/dist/ssr';
import { motion } from 'framer-motion';

interface Props {
    noteId: string;
    noteContext: string;
}

export default function ChatInterface({ noteId, noteContext }: Props) {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMsg = input.trim();
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteId, noteContext, message: userMsg, history: messages })
            });
            const data = await res.json();

            setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch (err) {
            console.error(err);
            setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error connecting to the AI.' }]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '400px', padding: 0, overflow: 'hidden' }}>
            {/* Header */}
            <div style={{ padding: '16px', borderBottom: '1px solid var(--color-card-border)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ChatTeardropText size={20} color="var(--color-accent-purple)" weight="fill" />
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>Chat with Notes</h3>
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {messages.length === 0 && (
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', textAlign: 'center', margin: 'auto' }}>
                        Ask anything about these lecture notes!
                    </p>
                )}

                {messages.map((m, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                            background: m.role === 'user' ? 'var(--color-primary-blue)' : 'rgba(255,255,255,0.1)',
                            padding: '10px 14px',
                            borderRadius: '16px',
                            borderBottomRightRadius: m.role === 'user' ? '4px' : '16px',
                            borderBottomLeftRadius: m.role === 'ai' ? '4px' : '16px',
                            maxWidth: '85%',
                            fontSize: '0.9rem',
                            lineHeight: '1.4'
                        }}
                    >
                        {m.text}
                    </motion.div>
                ))}

                {isLoading && (
                    <div style={{ alignSelf: 'flex-start', color: 'var(--color-text-muted)' }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} style={{ display: 'inline-block' }}>
                            <CircleNotch size={16} />
                        </motion.div>
                    </div>
                )}
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} style={{ display: 'flex', padding: '12px', borderTop: '1px solid var(--color-card-border)', background: 'rgba(0,0,0,0.2)' }}>
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: 'white',
                        outline: 'none',
                        fontSize: '0.9rem',
                        padding: '0 8px'
                    }}
                />
                <button type="submit" style={{ color: input.trim() ? 'var(--color-primary-blue)' : 'var(--color-text-muted)', padding: '8px', transition: 'color 0.2s' }}>
                    <PaperPlaneRight size={20} weight="fill" />
                </button>
            </form>
        </div>
    );
}
