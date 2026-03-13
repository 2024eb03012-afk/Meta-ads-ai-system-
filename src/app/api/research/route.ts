import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { projectId } = await req.json();
        const project = await prisma.project.findUnique({ where: { id: projectId } });
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });

        const query = `Provide a deeply comprehensive research report about the product and target customer profile. 
Product: ${project.productName}
Description: ${project.productDescription}
Notes: ${project.productNotes || ''}
Brand Narrative: ${project.brandNarrative || ''}

The research must deeply analyze:
- Detailed product features and benefits
- Ideal target audience (demographics and psychographics)
- Core pain points the audience faces
- Core desires related to this product category
- Market positioning vs competitors
- Recommended angle ideas`;

        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'sonar-pro',
                messages: [
                    { role: 'system', content: 'You are a professional Meta Ads marketing researcher.' },
                    { role: 'user', content: query }
                ]
            })
        });

        if (!response.ok) {
            const err = await response.text();
            throw new Error(`Perplexity API Error: ${err}`);
        }

        const data = await response.json();
        const researchText = data.choices[0].message.content;

        const updated = await prisma.project.update({
            where: { id: projectId },
            data: { productResearch: researchText }
        });

        return NextResponse.json(updated);
    } catch (error: any) {
        console.error('Research API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
