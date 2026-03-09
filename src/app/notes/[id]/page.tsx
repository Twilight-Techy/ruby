import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { notes, concepts, quizzes } from '@/lib/schema';
import { eq } from 'drizzle-orm';
import NoteWorkspaceClient from './NoteWorkspaceClient';

interface PageProps {
    params: Promise<{ id: string }>;
}

export default async function NoteWorkspacePage({ params }: PageProps) {
    const { id: noteId } = await params;

    const noteData = await db.select().from(notes).where(eq(notes.id, noteId)).limit(1);
    const note = noteData[0];

    if (!note) notFound();

    const conceptsData = await db.select().from(concepts).where(eq(concepts.noteId, noteId));
    const quizData = await db.select().from(quizzes).where(eq(quizzes.noteId, noteId)).limit(1);

    return (
        <NoteWorkspaceClient
            note={note}
            concepts={conceptsData}
            quiz={quizData[0] || null}
        />
    );
}
