import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notes } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const { title, content } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        await db.update(notes)
            .set({ title, content, updatedAt: new Date() })
            .where(eq(notes.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating note:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
