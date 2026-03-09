'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft, Sparkle, CloudArrowUp, File, X, Keyboard } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function NewNotePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [inputMode, setInputMode] = useState<'type' | 'upload'>('type');
    const [uploadedFile, setUploadedFile] = useState<globalThis.File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploadedFile(file);

        const text = await file.text();
        setContent(text);
        if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        setUploadedFile(file);
        file.text().then(text => {
            setContent(text);
            if (!title) setTitle(file.name.replace(/\.[^/.]+$/, ''));
        });
    }

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
                <CaretLeft weight="bold" /> Back
            </Link>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card create-note-container"
            >
                <h1 className="heading-xl create-note-heading">Create Note</h1>
                <p className="create-note-desc">Paste your notes or upload a text file. AI will summarize, extract concepts, and generate a quiz.</p>

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

                    {/* Input Mode Tabs */}
                    <div className="tab-switcher">
                        <button type="button" className={`tab-btn ${inputMode === 'type' ? 'tab-btn-active' : ''}`} onClick={() => setInputMode('type')}>
                            <Keyboard size={16} weight="bold" /> Type
                        </button>
                        <button type="button" className={`tab-btn ${inputMode === 'upload' ? 'tab-btn-active' : ''}`} onClick={() => setInputMode('upload')}>
                            <CloudArrowUp size={16} weight="bold" /> Upload
                        </button>
                    </div>

                    {inputMode === 'type' ? (
                        <div className="field-group">
                            <textarea
                                id="content"
                                placeholder="Paste your lecture notes here..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={10}
                                className="textarea-dark"
                                required
                            />
                        </div>
                    ) : (
                        <div
                            className="upload-zone"
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".txt,.md,.csv,.json,.log"
                                onChange={handleFileUpload}
                                hidden
                            />
                            <div className="upload-zone-icon">
                                <CloudArrowUp size={40} weight="duotone" />
                            </div>
                            <p className="upload-zone-title">
                                {uploadedFile ? 'File uploaded!' : 'Drop a file or tap to browse'}
                            </p>
                            <p className="upload-zone-hint">
                                Supports .txt, .md, .csv, .json, .log
                            </p>
                            {uploadedFile && (
                                <div className="upload-file-badge">
                                    <File size={16} weight="fill" />
                                    {uploadedFile.name}
                                    <button type="button" title="Remove file" aria-label="Remove file" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); setContent(''); }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Show content preview if file was uploaded */}
                    {inputMode === 'upload' && content && (
                        <div className="field-group">
                            <label className="field-label">Preview</label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={6}
                                className="textarea-dark"
                                placeholder="Uploaded content preview — edit if needed"
                                title="Content preview"
                            />
                        </div>
                    )}

                    <div className="submit-btn-wrap">
                        <button
                            type="submit"
                            className={`btn-primary ${isGenerating ? 'submit-btn-disabled' : ''}`}
                        >
                            {isGenerating ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                                    <Sparkle weight="fill" />
                                </motion.div>
                            ) : (
                                <Sparkle weight="bold" />
                            )}
                            {isGenerating ? 'Analyzing...' : 'Save & Analyze'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </main>
    );
}
