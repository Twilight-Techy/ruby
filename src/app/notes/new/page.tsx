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
            <Link href="/" className="nav-link-back">
                <CaretLeft weight="bold" /> Back to Dashboard
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card create-note-container"
            >
                <h1 className="heading-xl create-note-heading">Create Note</h1>
                <p className="create-note-desc">Write or paste your lecture content below. Our AI will automatically extract key concepts and generate a summary.</p>

                <form onSubmit={handleSave} className="form-vertical">
                    <div className="field-group">
                        <label htmlFor="title" className="field-label">Title</label>
                        <input
                            id="title"
                            type="text"
                            placeholder="e.g. Introduction to Quantum Mechanics"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="input-dark"
                            required
                        />
                    </div>

                    <div className="field-group">
                        <label htmlFor="content" className="field-label-split">
                            <span>Content</span>
                            <button type="button" className="upload-hint">
                                <UploadSimple /> Upload Instead (Coming Soon)
                            </button>
                        </label>
                        <textarea
                            id="content"
                            placeholder="Paste your notes here..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={12}
                            className="textarea-dark"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className={`btn-primary submit-btn-end ${isGenerating ? 'submit-btn-disabled' : ''}`}
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
