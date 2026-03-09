import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { notes, concepts, quizzes } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import { CaretLeft, Lightbulb, TextT } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import ChatInterface from './ChatInterface';

interface PageProps {
    params: { id: string };
}

export default async function NoteWorkspacePage({ params }: PageProps) {
    const noteId = params.id;

    // Direct DB Queries (Server Component)
    const noteData = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
    const note = noteData[0];

    if (!note) {
        notFound();
    }

    const conceptsData = await db.select().from(concepts).where(eq(concepts.noteId, noteId));
    const quizData = await db.select().from(quizzes).where(eq(quizzes.noteId, noteId)).limit(1);

    return (
        <main className="page-container" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px', alignItems: 'start' }}>

            {/* Left Column: Workspace Content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                <header>
                    <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', marginBottom: '16px', fontWeight: 500 }}>
                        <CaretLeft weight="bold" /> Back to Dashboard
                    </Link>
                    <h1 className="heading-xl" style={{ fontSize: '2rem', marginBottom: '8px' }}>{note.title}</h1>
                    <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                        Generated on {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                </header>

                {/* Note Content Panel */}
                <section className="glass-card" style={{ padding: '32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', color: 'var(--color-primary-blue)' }}>
                        <TextT size={24} weight="bold" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>Original Notes</h2>
                    </div>
                    <div style={{ whiteSpace: 'pre-wrap', color: 'var(--color-text-main)', lineHeight: '1.8' }}>
                        {note.content}
                    </div>
                </section>
            </div>

            {/* Right Column: AI Insights & Chat */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', position: 'sticky', top: '24px' }}>

                {/* AI Summary Card */}
                <div className="glass-card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', color: 'var(--color-primary-red)' }}>
                        <Lightbulb size={24} weight="fill" />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white' }}>AI Summary</h2>
                    </div>
                    <p style={{ color: 'var(--color-text-main)', lineHeight: '1.6', fontSize: '0.95rem' }}>
                        {note.summary}
                    </p>
                </div>

                {/* Key Concepts */}
                <div className="glass-card" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'white', marginBottom: '16px' }}>Key Concepts</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {conceptsData.map(c => (
                            <div key={c.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '12px' }}>
                                <strong style={{ display: 'block', color: 'var(--color-primary-blue)', marginBottom: '4px' }}>{c.concept}</strong>
                                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>{c.explanation}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Interface Component */}
                <ChatInterface noteId={note.id} noteContext={note.content} />
            </div>

        </main>
    );
}
