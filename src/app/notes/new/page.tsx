'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft, Sparkle, UploadSimple } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NewNotePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);

    async function handleSave(e: React.FormEvent) {
        e.preventDefault();
        if (!title || !content) return;
        setIsGenerating(true);

        try {
            const res = await fetch('/api/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title, content }),
            });
            const data = await res.json();
            if (data.id) {
                router.push(`/notes/${data.id}`);
            }
        } catch (err) {
            console.error(err);
            setIsGenerating(false);
        }
    }

    return (
        <main className="page-container">
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', marginBottom: '32px', fontWeight: 500 }}>
                <CaretLeft weight="bold" /> Back to Dashboard
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card"
                style={{ maxWidth: '800px', margin: '0 auto' }}
            >
                <h1 className="heading-xl" style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Create Note</h1>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '32px' }}>Write or paste your lecture content below. Our AI will automatically extract key concepts and generate a summary.</p>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="title" style={{ fontWeight: 600, fontSize: '0.9rem' }}>Title</label>
                        <input
                            id="title"
                            type="text"
                            placeholder="e.g. Introduction to Quantum Mechanics"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--color-card-border)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                transition: 'var(--transition-smooth)'
                            }}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label htmlFor="content" style={{ fontWeight: 600, fontSize: '0.9rem', display: 'flex', justifyContent: 'space-between' }}>
                            <span>Content</span>
                            <button type="button" style={{ color: 'var(--color-primary-blue)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem' }}>
                                <UploadSimple /> Upload Instead (Coming Soon)
                            </button>
                        </label>
                        <textarea
                            id="content"
                            placeholder="Paste your notes here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={12}
                            style={{
                                width: '100%',
                                padding: '16px',
                                borderRadius: '12px',
                                background: 'rgba(0,0,0,0.2)',
                                border: '1px solid var(--color-card-border)',
                                color: 'white',
                                fontSize: '1rem',
                                outline: 'none',
                                resize: 'vertical',
                                fontFamily: 'inherit',
                                transition: 'var(--transition-smooth)'
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        style={{ marginTop: '16px', alignSelf: 'flex-end', opacity: isGenerating ? 0.7 : 1, pointerEvents: isGenerating ? 'none' : 'auto' }}
                    >
                        {isGenerating ? (
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                <Sparkle weight="fill" />
                            </motion.div>
                        ) : (
                            <Sparkle weight="bold" />
                        )}
                        {isGenerating ? 'AI Magic in Progress...' : 'Save & Analyze Note'}
                    </button>
                </form>
            </motion.div>
        </main>
    );
}
