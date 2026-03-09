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

    const noteData = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
    const note = noteData[0];

    if (!note) {
        notFound();
    }

    const conceptsData = await db.select().from(concepts).where(eq(concepts.noteId, noteId));
    const quizData = await db.select().from(quizzes).where(eq(quizzes.noteId, noteId)).limit(1);

    return (
        <main className="page-container workspace-grid">

            {/* Left Column: Workspace Content */}
            <div className="flex-col gap-24">
                <header>
                    <Link href="/" className="nav-link-back-sm">
                        <CaretLeft weight="bold" /> Back to Dashboard
                    </Link>
                    <h1 className="heading-xl workspace-heading">{note.title}</h1>
                    <p className="text-muted text-sm">
                        Generated on {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                </header>

                {/* Note Content Panel */}
                <section className="glass-card content-panel">
                    <div className="section-icon-header text-blue">
                        <TextT size={24} weight="bold" />
                        <h2 className="text-lg font-semibold text-white">Original Notes</h2>
                    </div>
                    <div className="note-content-display">
                        {note.content}
                    </div>
                </section>
            </div>

            {/* Right Column: AI Insights & Chat */}
            <div className="flex-col gap-24 sticky-top">

                {/* AI Summary Card */}
                <div className="glass-card">
                    <div className="section-icon-header-sm text-red">
                        <Lightbulb size={24} weight="fill" />
                        <h2 className="text-lg font-semibold text-white">AI Summary</h2>
                    </div>
                    <p className="leading-relaxed text-sm">
                        {note.summary}
                    </p>
                </div>

                {/* Key Concepts */}
                <div className="glass-card concepts-scroll">
                    <h2 className="text-md font-semibold text-white mb-16">Key Concepts</h2>
                    <div className="flex-col gap-12">
                        {conceptsData.map(c => (
                            <div key={c.id} className="concept-item">
                                <strong className="concept-name">{c.concept}</strong>
                                <span className="text-xs text-muted">{c.explanation}</span>
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
