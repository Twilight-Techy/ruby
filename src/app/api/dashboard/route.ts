import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notes, quizzes } from '@/lib/schema';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET() {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ notes: [], quizCount: 0, unauthorized: true });
        }

        const userId = session.user.id;

        const allNotes = await db.select()
            .from(notes)
            .where(eq(notes.userId, userId))
            .orderBy(desc(notes.createdAt))
            .limit(8);

        const allQuizzes = await db.select()
            .from(quizzes)
            .where(eq(quizzes.userId, userId));

        return NextResponse.json({
            notes: allNotes,
            quizCount: allQuizzes.length,
        });
    } catch (error) {
        console.error('Dashboard API Error:', error);
        return NextResponse.json({ notes: [], quizCount: 0 });
    }
}
