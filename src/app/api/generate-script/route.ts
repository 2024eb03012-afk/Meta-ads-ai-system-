import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { angleId } = await req.json();
        const angle = await prisma.angle.findUnique({ where: { id: angleId }, include: { project: true } });
        if (!angle) return NextResponse.json({ error: 'Angle not found' }, { status: 404 });

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an elite direct response video sales letter copywriter specialized in Meta ads.
Write highly persuasive video ad scripts designed for Facebook and Instagram ads.

Product: ${angle.project.productName}
Angle Headline: ${angle.angleHeadline}
Concept: ${angle.conceptSummary}
Structure: ${angle.vslStructure}
Emotional Triggers: ${angle.emotionalTriggers}
Direct Response Techniques: ${angle.directResponseTechniques}

Each script must follow this structure EXACTLY with clear headers:
HOOK
(Write hook here, must stop scroll immediately)

LEAD
(Amplify the viewer's core problem)

BODY
(Introduce the product as the natural solution)

CALL TO ACTION
(Create urgency and push immediate action)

Use emotional persuasion techniques including loss aversion, social proof, authority bias, curiosity, or fear of missing out as appropriate.

Write in conversational spoken language suitable for video ads. Do not include explanations. Only output the final script.`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
        }) as any;

        // Robust text extraction
        let scriptText = '';
        if (typeof response.text === 'function') scriptText = response.text();
        else if (typeof response.text === 'string') scriptText = response.text;
        else if (response.response && typeof response.response.text === 'function') scriptText = response.response.text();
        else if (response.candidates?.[0]?.content?.parts?.[0]?.text) scriptText = response.candidates[0].content.parts[0].text;

        if (!scriptText) throw new Error('Gemini returned an empty script');
        scriptText = scriptText.trim();

        const script = await prisma.script.create({
            data: {
                angleId,
                scriptText
            }
        });

        return NextResponse.json(script);
    } catch (error: any) {
        console.error('Script Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
