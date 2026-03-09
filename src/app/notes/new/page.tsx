'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { CaretLeft, Sparkle, CloudArrowUp, File, X, Keyboard, CircleNotch, Image, FilePdf, FileDoc } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { motion } from 'framer-motion';

const TEXT_EXTENSIONS = ['.txt', '.md', '.csv', '.json', '.log'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp'];
const DOC_EXTENSIONS = ['.pdf', '.docx', '.pptx', '.xlsx', '.doc', '.xls', '.ppt'];
const ALL_ACCEPT = [...TEXT_EXTENSIONS, ...IMAGE_EXTENSIONS, ...DOC_EXTENSIONS, 'image/*'].join(',');

function isTextFile(file: globalThis.File): boolean {
    const ext = '.' + file.name.split('.').pop()?.toLowerCase();
    return TEXT_EXTENSIONS.includes(ext);
}

function getFileIcon(file: globalThis.File) {
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return <FilePdf size={16} weight="fill" />;
    if (['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'].includes(ext)) return <FileDoc size={16} weight="fill" />;
    if (file.type.startsWith('image/') || IMAGE_EXTENSIONS.includes('.' + ext)) return <Image size={16} weight="fill" />;
    return <File size={16} weight="fill" />;
}

export default function NewNotePage() {
    const router = useRouter();
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExtracting, setIsExtracting] = useState(false);
    const [inputMode, setInputMode] = useState<'type' | 'upload'>('type');
    const [uploadedFile, setUploadedFile] = useState<globalThis.File | null>(null);
    const [extractError, setExtractError] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    async function processFile(file: globalThis.File) {
        setUploadedFile(file);
        setExtractError('');

        if (!title) {
            setTitle(file.name.replace(/\.[^/.]+$/, ''));
        }

        if (!isTextFile(file)) {
            // Use API to extract text from images, PDFs, Office docs
            setIsExtracting(true);
            try {
                const formData = new FormData();
                formData.append('file', file);

                const res = await fetch('/api/extract', {
                    method: 'POST',
                    body: formData,
                });
                const data = await res.json();

                if (data.error) {
                    setExtractError(data.error);
                } else {
                    setContent(data.text);
                }
            } catch {
                setExtractError('Failed to extract text from image. Please try again.');
            } finally {
                setIsExtracting(false);
            }
        } else {
            // Read text content directly
            const text = await file.text();
            setContent(text);
        }
    }

    async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;
        await processFile(file);
    }

    async function handleDrop(e: React.DragEvent) {
        e.preventDefault();
        const file = e.dataTransfer.files?.[0];
        if (!file) return;
        await processFile(file);
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

    function clearFile() {
        setUploadedFile(null);
        setContent('');
        setExtractError('');
        if (fileInputRef.current) fileInputRef.current.value = '';
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
                <p className="create-note-desc">Type your notes, upload a text file, or snap a photo of handwritten notes — AI will extract, summarize, and quiz you.</p>

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
                            className={`upload-zone ${isExtracting ? 'upload-zone-processing' : ''}`}
                            onClick={() => !isExtracting && fileInputRef.current?.click()}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept={ALL_ACCEPT}
                                onChange={handleFileUpload}
                                hidden
                            />

                            {isExtracting ? (
                                <>
                                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }} className="upload-zone-icon">
                                        <CircleNotch size={40} weight="bold" />
                                    </motion.div>
                                    <p className="upload-zone-title">Extracting text with AI...</p>
                                    <p className="upload-zone-hint">Gemini Vision is reading your image</p>
                                </>
                            ) : (
                                <>
                                    <div className="upload-zone-icon">
                                        <CloudArrowUp size={40} weight="duotone" />
                                    </div>
                                    <p className="upload-zone-title">
                                        {uploadedFile ? 'File uploaded!' : 'Drop a file or tap to browse'}
                                    </p>
                                    <p className="upload-zone-hint">
                                        .txt, .md, .pdf, .docx, .pptx, .xlsx, images
                                    </p>
                                </>
                            )}

                            {uploadedFile && !isExtracting && (
                                <div className="upload-file-badge">
                                    {getFileIcon(uploadedFile)}
                                    {uploadedFile.name}
                                    <button type="button" title="Remove file" aria-label="Remove file" onClick={(e) => { e.stopPropagation(); clearFile(); }}>
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Extraction error */}
                    {extractError && (
                        <p className="text-sm text-error">{extractError}</p>
                    )}

                    {/* Show content preview if file was uploaded */}
                    {inputMode === 'upload' && content && !isExtracting && (
                        <div className="field-group">
                            <label className="field-label">
                                {uploadedFile && !isTextFile(uploadedFile) ? 'Extracted Text (editable)' : 'Preview'}
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                rows={8}
                                className="textarea-dark"
                                placeholder="Extracted content — edit if needed"
                                title="Content preview"
                            />
                        </div>
                    )}

                    <div className="submit-btn-wrap">
                        <button
                            type="submit"
                            className={`btn-primary ${isGenerating || isExtracting || !content ? 'submit-btn-disabled' : ''}`}
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
