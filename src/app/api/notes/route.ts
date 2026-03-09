import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notes, concepts, quizzes, questions } from '@/lib/schema';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function POST(req: Request) {
    try {
        const session = await auth.api.getSession({
            headers: await headers()
        });

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const userId = session.user.id;
        const { title, content } = await req.json();

        if (!title || !content) {
            return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
        }

        // Call Gemini API to summarize and extract concepts
        const prompt = `You are an expert study assistant. Analyze the following lecture notes.
Provide a JSON response with the following structure EXACTLY:
{
  "summary": "A concise paragraph summarizing the core theme of the notes.",
  "concepts": [
    { "concept": "Name of concept", "explanation": "Brief explanation" }
  ],
  "quiz": {
    "title": "A short title for this quiz based on the notes",
    "questions": [
      {
        "questionText": "Test question here?",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctOptionIndex": 0
      }
    ]
  }
}

You must respond with ONLY the JSON object.

Notes:
"""
${content}
"""
`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
                generationConfig: { responseMimeType: "application/json" }
            })
        });

        if (!geminiRes.ok) {
            console.error("Gemini Response Error:", await geminiRes.text());
            throw new Error("Failed to call Gemini API");
        }

        const geminiData = await geminiRes.json();
        const aiResponseText = geminiData.candidates[0].content.parts[0].text;
        const extracted = JSON.parse(aiResponseText);

        // Insert Note
        const [newNote] = await db.insert(notes).values({
            userId,
            title,
            content,
            summary: extracted.summary,
        }).returning();

        // Insert Concepts
        if (extracted.concepts?.length > 0) {
            await db.insert(concepts).values(
                extracted.concepts.map((c: any) => ({
                    noteId: newNote.id,
                    concept: c.concept || "Concept",
                    explanation: c.explanation || "No explanation provided."
                }))
            );
        }

        // Insert Quiz
        if (extracted.quiz && extracted.quiz.questions?.length > 0) {
            const [newQuiz] = await db.insert(quizzes).values({
                userId,
                noteId: newNote.id,
                title: extracted.quiz.title || "Review Quiz",
                score: null
            }).returning();

            await db.insert(questions).values(
                extracted.quiz.questions.map((q: any) => ({
                    quizId: newQuiz.id,
                    questionText: q.questionText,
                    options: q.options || [],
                    correctOptionIndex: String(q.correctOptionIndex !== undefined ? q.correctOptionIndex : 0)
                }))
            );
        }

        return NextResponse.json({ id: newNote.id });
    } catch (error) {
        console.error('Error creating note:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
