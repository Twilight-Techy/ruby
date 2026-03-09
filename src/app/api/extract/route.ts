import { NextResponse } from 'next/server';
import { parseOffice } from 'officeparser';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp'];
const PDF_TYPE = 'application/pdf';
const OFFICE_TYPES = [
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',       // docx
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',     // pptx
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',             // xlsx
    'application/msword',                                                             // doc
    'application/vnd.ms-excel',                                                       // xls
    'application/vnd.ms-powerpoint',                                                  // ppt
];

function getFileType(file: File): 'image' | 'pdf' | 'office' | 'unknown' {
    const mime = file.type;
    const ext = file.name.split('.').pop()?.toLowerCase() || '';

    if (IMAGE_TYPES.includes(mime) || ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp'].includes(ext)) return 'image';
    if (mime === PDF_TYPE || ext === 'pdf') return 'pdf';
    if (OFFICE_TYPES.includes(mime) || ['docx', 'pptx', 'xlsx', 'doc', 'xls', 'ppt'].includes(ext)) return 'office';
    return 'unknown';
}

export async function POST(req: Request) {
    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const fileType = getFileType(file);
        const buffer = Buffer.from(await file.arrayBuffer());

        if (fileType === 'image' || fileType === 'pdf') {
            // Use Gemini Vision for images and PDFs
            const base64Data = buffer.toString('base64');
            const mimeType = file.type || (fileType === 'pdf' ? 'application/pdf' : 'image/png');

            const prompt = fileType === 'pdf'
                ? `Extract ALL text content from this PDF document. Preserve the structure (headings, bullet points, paragraphs, tables) as much as possible. If there are images or diagrams, describe them briefly in brackets like [Diagram: description]. Return ONLY the extracted text.`
                : `Extract ALL text content from this image. If the image contains handwritten notes, typed text, diagrams with labels, slides, or any other readable content, transcribe everything you can see. Organize the extracted text logically, preserving the original structure (headings, bullet points, paragraphs) as much as possible. If there are diagrams or charts, describe them briefly in brackets like [Diagram: description]. Return ONLY the extracted text content, nothing else.`;

            const geminiRes = await fetch(
                `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [
                            {
                                role: 'user',
                                parts: [
                                    { inlineData: { mimeType, data: base64Data } },
                                    { text: prompt },
                                ],
                            },
                        ],
                    }),
                }
            );

            if (!geminiRes.ok) {
                const errorText = await geminiRes.text();
                console.error('Gemini Vision Error:', errorText);
                return NextResponse.json({ error: 'Failed to process file with AI' }, { status: 500 });
            }

            const geminiData = await geminiRes.json();
            const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';

            if (!text.trim()) {
                return NextResponse.json({ error: 'No text could be extracted' }, { status: 422 });
            }

            return NextResponse.json({ text: text.trim() });
        }

        if (fileType === 'office') {
            // Use officeparser for DOCX, PPTX, XLSX
            // parseOffice in v6 may return a result object or string, extract text safely
            const result = await parseOffice(buffer);
            console.log('[officeparser] result type:', typeof result, '| keys:', result && typeof result === 'object' ? Object.keys(result) : 'N/A');
            let text: string;
            if (typeof result === 'string') {
                text = result;
            } else if (result && typeof (result as any).text === 'string') {
                text = (result as any).text;
            } else if (result && typeof (result as any).value === 'string') {
                text = (result as any).value;
            } else {
                // Last resort: serialize as readable JSON
                text = JSON.stringify(result, null, 2);
            }

            if (!text || !text.trim()) {
                return NextResponse.json({ error: 'No text could be extracted from this document' }, { status: 422 });
            }

            return NextResponse.json({ text: text.trim() });
        }

        return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    } catch (error) {
        console.error('Extract error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
