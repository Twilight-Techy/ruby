import { db } from '@/lib/db';
import { quizzes, notes } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { CaretLeft, Exam, Play } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';

export default async function QuizzesPage() {
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
            <Link href="/" className="nav-link-back">
                <CaretLeft weight="bold" /> Back to Dashboard
            </Link>

            <div className="quizzes-header">
                <Exam size={40} color="var(--color-primary-blue)" weight="duotone" />
                <h1 className="heading-xl quizzes-heading">Your Quizzes</h1>
            </div>

            <div className="quizzes-grid">
                {allQuizzes.length === 0 ? (
                    <div className="glass-card quiz-empty-state">
                        <p>No quizzes found. Creating a note will automatically generate a quiz!</p>
                    </div>
                ) : (
                    allQuizzes.map(quiz => (
                        <div key={quiz.id} className="glass-card quiz-card">
                            <h2 className="text-lg font-semibold text-white mb-8">{quiz.title}</h2>
                            <p className="text-red text-sm mb-16">Based on: {quiz.noteTitle}</p>

                            <div className="quiz-card-footer">
                                <span className="text-muted text-sm">
                                    {quiz.score ? `Score: ${quiz.score}` : 'Not taken yet'}
                                </span>
                                <Link href={`/quizzes/${quiz.id}`} className="btn-primary btn-sm">
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
