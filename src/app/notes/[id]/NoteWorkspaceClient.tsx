'use client';

import { useState } from 'react';
import { CaretLeft, Lightbulb, TextAlignLeft, Exam, PencilSimple, Check, X, CaretRight, CaretDown } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ChatInterface from './ChatInterface';

interface Props {
    note: any;
    concepts: any[];
    quiz: any | null;
}

export default function NoteWorkspaceClient({ note: initialNote, concepts, quiz }: Props) {
    const [note, setNote] = useState(initialNote);
    const [isEditing, setIsEditing] = useState(false);
    const [isNoteOpen, setIsNoteOpen] = useState(true);
    const [editTitle, setEditTitle] = useState(initialNote.title);
    const [editContent, setEditContent] = useState(initialNote.content);
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const res = await fetch(`/api/notes/${note.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ title: editTitle, content: editContent }),
            });
            if (res.ok) {
                setNote({ ...note, title: editTitle, content: editContent });
                setIsEditing(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <main className="page-container workspace-page-container">
            <div className="workspace-header">
                <Link href="/" className="nav-link-back no-margin">
                    <CaretLeft weight="bold" /> Back
                </Link>
                <div className="workspace-actions">
                    {quiz && (
                        <Link href={`/quizzes/${quiz.id}`} className="btn-secondary btn-sm">
                            <Exam size={18} weight="bold" /> Take Quiz
                        </Link>
                    )}
                </div>
            </div>

            <div className="workspace-layout-v2" data-sidebar-open={isNoteOpen}>
                {/* Main Content: AI Analysis */}
                <div className="ai-analysis-column">
                    <header className="workspace-title-section">
                        <h1 className="heading-xl no-margin">{note.title}</h1>
                        <p className="text-muted text-sm mt-4">
                            Last updated: {new Date(note.updatedAt || note.createdAt).toLocaleDateString()}
                        </p>
                    </header>

                    <div className="ai-content-grid">
                        {/* Summary */}
                        <section className="glass-card ai-summary-card">
                            <div className="section-icon-header">
                                <Lightbulb size={20} weight="fill" color="var(--color-primary-red)" />
                                <h2 className="heading-md">AI Insights</h2>
                            </div>
                            <p className="text-secondary text-sm leading-tall">{note.summary}</p>
                        </section>

                        {/* Concepts */}
                        <section className="glass-card concepts-card">
                            <h2 className="heading-md mb-16">Key Concepts</h2>
                            <div className="concepts-list">
                                {concepts.map((c) => (
                                    <div key={c.id} className="concept-item">
                                        <strong className="concept-name">{c.concept}</strong>
                                        <p className="text-xs text-muted no-margin">{c.explanation}</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Chat Interface */}
                    <section className="workspace-chat-section">
                        <ChatInterface noteId={note.id} noteContext={note.content} />
                    </section>
                </div>

                {/* Sidebar: Original Note (priority 2 on desktop, collapsible) */}
                <aside className={`original-note-sidebar ${!isNoteOpen ? 'note-closed' : ''}`}>
                    <div className="glass-card note-sidebar-card">
                        <div className="note-sidebar-header" onClick={() => setIsNoteOpen(!isNoteOpen)}>
                            <div className="flex-row items-center gap-10">
                                <TextAlignLeft size={20} weight="bold" color="var(--color-primary-blue)" />
                                <h2 className="heading-md no-margin">Original Note</h2>
                            </div>
                            <div className="flex-row items-center gap-12">
                                {!isEditing && isNoteOpen && (
                                    <button
                                        title="Edit Note"
                                        aria-label="Edit Note"
                                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                                        className="icon-btn-sm"
                                    >
                                        <PencilSimple size={18} />
                                    </button>
                                )}
                                {isNoteOpen ? <CaretDown size={18} /> : <CaretRight size={18} />}
                            </div>
                        </div>

                        <AnimatePresence>
                            {isNoteOpen && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="note-sidebar-content"
                                >
                                    {isEditing ? (
                                        <div className="edit-note-form">
                                            <input
                                                className="input-dark mb-12"
                                                value={editTitle}
                                                onChange={(e) => setEditTitle(e.target.value)}
                                                placeholder="Note Title"
                                            />
                                            <textarea
                                                className="textarea-dark note-edit-area"
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                placeholder="Note content..."
                                            />
                                            <div className="edit-actions mt-12">
                                                <button onClick={() => setIsEditing(false)} className="btn-ghost btn-sm text-xs">
                                                    <X size={14} /> Cancel
                                                </button>
                                                <button onClick={handleSave} disabled={isSaving} className="btn-primary btn-sm text-xs">
                                                    {isSaving ? <Check size={14} className="animate-pulse" /> : <Check size={14} />}
                                                    Save Changes
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="note-text-display">
                                            {note.content}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </aside>
            </div>
        </main>
    );
}
