import { db } from '@/lib/db';
import { quizzes, notes } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { CaretLeft, Exam, Play } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default async function QuizzesPage() {
    // Fetch quizzes with the associated note title
    const allQuizzes = await db
        .select({
            id: quizzes.id,
            title: quizzes.title,
            score: quizzes.score,
            createdAt: quizzes.createdAt,
            noteTitle: notes.title,
        })
        .from(quizzes)
        .innerJoin(notes, eq(quizzes.noteId, notes.id))
        .orderBy(desc(quizzes.createdAt));

    return (
        <main className="page-container">
            <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)', marginBottom: '32px', fontWeight: 500 }}>
                <CaretLeft weight="bold" /> Back to Dashboard
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
                <Exam size={40} color="var(--color-primary-blue)" weight="duotone" />
                <h1 className="heading-xl" style={{ margin: 0, fontSize: '2.5rem' }}>Your Quizzes</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
                {allQuizzes.length === 0 ? (
                    <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px', opacity: 0.7 }}>
                        <p>No quizzes found. Creating a note will automatically generate a quiz!</p>
                    </div>
                ) : (
                    allQuizzes.map(quiz => (
                        <div key={quiz.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '8px' }}>{quiz.title}</h2>
                            <p style={{ color: 'var(--color-primary-red)', fontSize: '0.9rem', marginBottom: '16px' }}>Based on: {quiz.noteTitle}</p>

                            <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                                    {quiz.score ? `Score: ${quiz.score}` : 'Not taken yet'}
                                </span>
                                <Link href={`/quizzes/${quiz.id}`} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                    {quiz.score ? 'Retake' : 'Start'} <Play weight="fill" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
