import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const projects = await prisma.project.count();
        const angles = await prisma.angle.count();
        const scripts = await prisma.script.count();
        return NextResponse.json({ projects, angles, scripts });
    } catch {
        return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }
}
