import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { quizzes } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const { quizId, score } = await req.json();

        if (!quizId || !score) {
            return NextResponse.json({ error: 'Quiz ID and Score are required' }, { status: 400 });
        }

        await db.update(quizzes).set({ score }).where(eq(quizzes.id, quizId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error recording score:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
