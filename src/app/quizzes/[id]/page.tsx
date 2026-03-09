import { notFound, redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { quizzes, questions } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import ActiveQuiz from './ActiveQuiz';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function QuizPage({ params }: PageProps) {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        const { id } = await params;
        redirect(`/login?next=/quizzes/${id}`);
    }

    const { id: quizId } = await params;

    const quizData = await db.select()
        .from(quizzes)
        .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, session.user.id)))
        .limit(1);

    const quiz = quizData[0];

    if (!quiz) {
        notFound();
    }

    const qs = await db.select().from(questions).where(eq(questions.quizId, quizId));

    return (
        <ActiveQuiz quiz={quiz} questions={qs} />
    );
}
