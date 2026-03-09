import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatMessages, notes } from '@/lib/schema';
import { eq, asc, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function GET(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const noteId = searchParams.get('noteId');

        if (!noteId) {
            return NextResponse.json({ error: 'noteId is required' }, { status: 400 });
        }

        // Verify note ownership
        const note = await db.select()
            .from(notes)
            .where(and(eq(notes.id, noteId), eq(notes.userId, session.user.id)))
            .limit(1);

        if (note.length === 0) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const history = await db.select()
            .from(chatMessages)
            .where(eq(chatMessages.noteId, noteId))
            .orderBy(asc(chatMessages.createdAt));

        return NextResponse.json({ history });
    } catch (error) {
        console.error('Error fetching chat history:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
