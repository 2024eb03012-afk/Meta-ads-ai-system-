import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        const project = await prisma.project.findUnique({
            where: { id: params.id },
            include: { angles: { include: { scripts: true } } }
        });
        if (!project) return NextResponse.json({ error: 'Not found' }, { status: 404 });
        return NextResponse.json(project);
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
