import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const projects = await prisma.project.findMany({
            orderBy: { createdAt: 'desc' },
            include: { _count: { select: { angles: true } } }
        });
        return NextResponse.json(projects);
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const project = await prisma.project.create({
            data: {
                productName: body.productName,
                productDescription: body.productDescription,
                productNotes: body.productNotes,
                brandNarrative: body.brandNarrative
            }
        });
        return NextResponse.json(project);
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
