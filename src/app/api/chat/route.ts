import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { chatMessages, notes } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';
import { eq, and } from 'drizzle-orm';

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { noteId, message } = await req.json();

        if (!noteId || !message) {
            return NextResponse.json({ error: 'noteId and message are required' }, { status: 400 });
        }

        // Verify note ownership
        const note = await db.select()
            .from(notes)
            .where(and(eq(notes.id, noteId), eq(notes.userId, session.user.id)))
            .limit(1);

        if (note.length === 0) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // 1. Save user message
        await db.insert(chatMessages).values({
            noteId,
            role: 'user',
            content: message,
        });

        // 2. Call Gemini
        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: `Regarding this note: ${note[0].content}\n\nUser says: ${message}` }] }]
            })
        });

        if (!geminiRes.ok) {
            throw new Error("Gemini API call failed");
        }

        const geminiData = await geminiRes.json();
        const aiResponse = geminiData.candidates[0].content.parts[0].text;

        // 3. Save AI response
        await db.insert(chatMessages).values({
            noteId,
            role: 'ai',
            content: aiResponse,
        });

        return NextResponse.json({ response: aiResponse });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
