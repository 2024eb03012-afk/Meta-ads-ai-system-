import { NextResponse } from 'next/server';
import { fetchAdsData } from '@/lib/sheets';

export const dynamic = 'force-dynamic';
export const revalidate = 300;

export async function GET() {
    try {
        const data = await fetchAdsData();
        return NextResponse.json({ success: true, data, count: data.length });
    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch ads data' },
            { status: 500 }
        );
    }
}
