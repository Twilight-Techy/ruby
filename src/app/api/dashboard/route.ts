import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notes, quizzes } from '@/lib/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
    try {
        const allNotes = await db.select().from(notes).orderBy(desc(notes.createdAt)).limit(8);
        const allQuizzes = await db.select().from(quizzes);
        return NextResponse.json({
            notes: allNotes,
            quizCount: allQuizzes.length,
        });
    } catch {
        return NextResponse.json({ notes: [], quizCount: 0 });
    }
}
