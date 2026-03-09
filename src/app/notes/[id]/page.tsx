import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { notes, concepts, quizzes } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { CaretLeft, Lightbulb, TextAlignLeft, Exam } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import ChatInterface from './ChatInterface';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function NoteWorkspacePage({ params }: PageProps) {
    const { id: noteId } = await params;

    const noteData = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
    const note = noteData[0];

    if (!note) notFound();

    const conceptsData = await db.select().from(concepts).where(eq(concepts.noteId, noteId));
    const quizData = await db.select().from(quizzes).where(eq(quizzes.noteId, noteId)).limit(1);

    return (
        <main className="page-container">
            <Link href="/" className="nav-link-back">
                <CaretLeft weight="bold" /> Back
            </Link>

            <div className="workspace-layout">
                {/* Left / Main */}
                <div className="flex-col gap-20">
                    <div>
                        <h1 className="heading-xl workspace-heading">{note.title}</h1>
                        <p className="text-muted text-sm">
                            {new Date(note.createdAt).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>

                    {/* Note Content */}
                    <section className="glass-card content-panel">
                        <div className="section-icon-header">
                            <TextAlignLeft size={20} weight="bold" color="var(--color-primary-blue)" />
                            <h2 className="heading-md">Original Notes</h2>
                        </div>
                        <div className="note-content-display">{note.content}</div>
                    </section>
                </div>

                {/* Right / Sidebar */}
                <div className="sidebar-stack">
                    {/* Summary */}
                    <div className="glass-card">
                        <div className="section-icon-header">
                            <Lightbulb size={20} weight="fill" color="var(--color-primary-red)" />
                            <h2 className="heading-md">AI Summary</h2>
                        </div>
                        <p className="text-secondary text-sm leading-tall">{note.summary}</p>
                    </div>

                    {/* Concepts */}
                    <div className="glass-card concepts-scroll">
                        <h2 className="heading-md mb-16">Key Concepts</h2>
                        <div className="flex-col gap-10">
                            {conceptsData.map(c => (
                                <div key={c.id} className="concept-item">
                                    <strong className="concept-name">{c.concept}</strong>
                                    <span className="text-xs text-muted">{c.explanation}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quiz Link */}
                    {quizData.length > 0 && (
                        <Link href={`/quizzes/${quizData[0].id}`} className="btn-secondary btn-sm" style={{ textAlign: 'center' }}>
                            <Exam size={18} weight="bold" /> Take Quiz
                        </Link>
                    )}

                    {/* Chat */}
                    <ChatInterface noteId={note.id} noteContext={note.content} />
                </div>
            </div>
        </main>
    );
}
