import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { GoogleGenAI } from '@google/genai';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { projectId } = await req.json();
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project || !project.productResearch) return NextResponse.json({ error: 'Research required' }, { status: 400 });

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `Based on the following product details and research, generate an array of 5 distinct performance marketing ad angles for Meta platforms (Facebook/Instagram).

Product: ${project.productName}
Description: ${project.productDescription}
Research: ${project.productResearch}

Return ONLY VALID JSON matching this structure without any markdown ticks:
[
  {
    "angleHeadline": "Angle short name",
    "conceptSummary": "1-2 sentences summarizing the concept",
    "vslStructure": "e.g., Problem-Agitate-Solve",
    "videoSuggestion": "Visuals to use",
    "emotionalTriggers": "List of triggers",
    "cognitiveBiasesLeveraged": "Biases used",
    "directResponseTechniques": "Techniques used"
  }
]`;

        const response = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: prompt
        });

        const text = (response.text || '').replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsedAngles = JSON.parse(text);

        for (const angle of parsedAngles) {
            await prisma.angle.create({
                data: {
                    projectId,
                    ...angle
                }
            });
        }

        const angles = await prisma.angle.findMany({ where: { projectId } });
        return NextResponse.json(angles);
    } catch (error: any) {
        console.error('Angles Generation Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
