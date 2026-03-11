import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
    try {
        const { scriptId, feedback } = await req.json();
        const script = await prisma.script.findUnique({ where: { id: scriptId }, include: { angle: { include: { project: true } } } });
        if (!script) return NextResponse.json({ error: 'Script not found' }, { status: 404 });

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an elite direct response video sales letter copywriter.
Revise the following Meta ad script based EXACTLY on the user's feedback.

Original Script:
${script.scriptText}

User Feedback:
${feedback}

The revised script must maintain the structure exactly with headers:
HOOK
LEAD
BODY
CALL TO ACTION

Output ONLY the revised script, no additional text or explanations.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt
        });

        const updatedText = (response.text || '').trim();

        const historyObj = script.feedbackHistory ? JSON.parse(script.feedbackHistory) : [];
        historyObj.push({ feedback, previousScript: script.scriptText, date: new Date().toISOString() });

        const updatedScript = await prisma.script.update({
            where: { id: scriptId },
            data: {
                scriptText: updatedText,
                feedbackHistory: JSON.stringify(historyObj)
            }
        });

        return NextResponse.json(updatedScript);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
