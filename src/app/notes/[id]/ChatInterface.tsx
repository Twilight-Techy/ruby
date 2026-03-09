'use client';

import { useState, useRef, useEffect } from 'react';
import { ChatTeardropText, PaperPlaneRight, CircleNotch } from '@phosphor-icons/react/dist/ssr';
import { motion } from 'framer-motion';

interface Props {
    noteId: string;
    noteContext: string;
}

export default function ChatInterface({ noteId, noteContext }: Props) {
    const [messages, setMessages] = useState<{ role: 'user' | 'ai'; text: string }[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

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
                body: JSON.stringify({ noteId, noteContext, message: userMsg, history: messages }),
            });
            const data = await res.json();
            setMessages(prev => [...prev, { role: 'ai', text: data.reply }]);
        } catch {
            setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong.' }]);
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className="glass-card chat-container">
            <div className="chat-header">
                <ChatTeardropText size={18} color="var(--color-accent-purple)" weight="fill" />
                <span className="heading-md">Ask your Notes</span>
            </div>

            <div className="chat-messages" ref={scrollRef}>
                {messages.length === 0 && (
                    <p className="chat-empty-state">Ask anything about your lecture notes!</p>
                )}

                {messages.map((m, idx) => (
                    <motion.div
                        key={idx}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`chat-bubble ${m.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
                    >
                        {m.text}
                    </motion.div>
                ))}

                {isLoading && (
                    <div className="chat-loading">
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }} className="chat-loading-spinner">
                            <CircleNotch size={16} />
                        </motion.div>
                    </div>
                )}
            </div>

            <form onSubmit={handleSend} className="chat-input-form">
                <input
                    type="text"
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask a question..."
                    className="chat-input"
                />
                <button type="submit" title="Send message" aria-label="Send message" className={`chat-send-btn ${input.trim() ? 'chat-send-active' : 'chat-send-inactive'}`}>
                    <PaperPlaneRight size={18} weight="fill" />
                </button>
            </form>
        </div>
    );
}
