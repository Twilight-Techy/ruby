import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { quizzes, questions } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import ActiveQuiz from './ActiveQuiz';

interface PageProps {
    params: { id: string };
}

export default async function QuizPage({ params }: PageProps) {
    const quizId = params.id;

    const quizData = await db.select().from(quizzes).where(eq(quizzes.id, quizId)).limit(1);
    const quiz = quizData[0];

    if (!quiz) {
        notFound();
    }

    const qs = await db.select().from(questions).where(eq(questions.quizId, quizId));

    return (
        <ActiveQuiz quiz={quiz} questions={qs} />
    );
}
