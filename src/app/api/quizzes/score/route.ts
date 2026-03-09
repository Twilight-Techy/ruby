import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quizzes } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { data: session } = await auth.getSession();

        if (!session?.user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { quizId, score } = await req.json();

        if (!quizId || !score) {
            return NextResponse.json({ error: 'Quiz ID and Score are required' }, { status: 400 });
        }

        await db.update(quizzes)
            .set({ score })
            .where(and(eq(quizzes.id, quizId), eq(quizzes.userId, session.user.id)));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error recording score:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
