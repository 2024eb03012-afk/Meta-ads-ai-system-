import { NextResponse } from 'next/server';
import { fetchReelsData } from '@/lib/reelsSheets';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
    try {
        const data = await fetchReelsData();
        return NextResponse.json({ success: true, data, count: data.length });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch reels data' },
            { status: 500 }
        );
    }
}
