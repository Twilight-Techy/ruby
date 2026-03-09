import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { noteContext, message, history } = await req.json();

        if (!message || !noteContext) {
            return NextResponse.json({ error: 'Message and note context are required' }, { status: 400 });
        }

        const prompt = `You are a helpful study tutor. You are assisting a student with their lecture notes.
    Answer the student's question based strictly on the provided lecture notes summary or context.
    If the answer is not in the notes, say that you don't have that information in the notes, but you can try to answer based on general knowledge. Keep answers friendly, concise, and helpful.

    Lecture Notes Context:
    """
    ${noteContext}
    """

    Recent Chat History:
    ${history.map((h: any) => `${h.role === 'ai' ? 'Tutor' : 'Student'}: ${h.text}`).join('\n')}

    Student's New Question: ${message}
    Tutor:`;

        const geminiRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ role: "user", parts: [{ text: prompt }] }],
            })
        });

        if (!geminiRes.ok) {
            console.error("Gemini Response Error:", await geminiRes.text());
            throw new Error("Failed to call Gemini API");
        }

        const geminiData = await geminiRes.json();
        const reply = geminiData.candidates[0].content.parts[0].text;

        return NextResponse.json({ reply });
    } catch (error) {
        console.error('Error in chat API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
