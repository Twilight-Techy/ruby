import { db } from '@/lib/db';
import { quizzes, notes } from '@/lib/schema';
import { desc, eq, and } from 'drizzle-orm';
import { CaretLeft, Exam, Play, SignIn } from '@phosphor-icons/react/dist/ssr';
import Link from 'next/link';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function QuizzesPage() {
    const { data: session } = await auth.getSession();

    if (!session?.user) {
        redirect('/login?next=/quizzes');
    }

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
        .where(eq(quizzes.userId, session.user.id))
        .orderBy(desc(quizzes.createdAt));

    return (
        <main className="page-container">
            <Link href="/" className="nav-link-back">
                <CaretLeft weight="bold" /> Back
            </Link>

            <div className="quizzes-header">
                <Exam size={32} color="var(--color-primary-blue)" weight="duotone" />
                <h1 className="heading-xl quizzes-heading">Quizzes</h1>
            </div>

            <div className="quizzes-grid">
                {allQuizzes.length === 0 ? (
                    <div className="glass-card quiz-empty-state">
                        <Exam size={40} color="var(--color-text-muted)" />
                        <p className="text-muted text-sm mt-12">No quizzes yet. Create a note to auto-generate one!</p>
                    </div>
                ) : (
                    allQuizzes.map(quiz => (
                        <div key={quiz.id} className="glass-card quiz-card">
                            <h2 className="heading-md mb-4">{quiz.title}</h2>
                            <p className="text-sm text-muted mb-8">From: {quiz.noteTitle}</p>

                            <div className="quiz-card-footer">
                                <span className="text-xs text-muted">
                                    {quiz.score ? `Score: ${quiz.score}` : 'Not taken'}
                                </span>
                                <Link href={`/quizzes/${quiz.id}`} className="btn-primary btn-sm">
                                    {quiz.score ? 'Retake' : 'Start'} <Play size={14} weight="fill" />
                                </Link>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </main>
    );
}
