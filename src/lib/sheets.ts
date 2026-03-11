import { AdData, DashboardStats, CompetitorInsight } from '@/types';
import { differenceInDays, parseISO, isValid, format } from 'date-fns';

const SHEET_ID = '1aMyV8XguD0wUltkvGzm1rLq3kvpwT4Vt3Z0aLAhgNQE';
// Using Google Sheets CSV export (no API key needed for public sheets)
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

function parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim() === '') return null;

    // Try multiple date formats
    const formats = [
        // DD/MM/YYYY
        /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
        // MM-DD-YYYY
        /^(\d{1,2})-(\d{1,2})-(\d{4})$/,
        // YYYY-MM-DD
        /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
    ];

    const cleaned = dateStr.trim();

    // Try ISO parse first
    try {
        const d = parseISO(cleaned);
        if (isValid(d)) return d;
    } catch { }

    // Try DD/MM/YYYY
    const ddmmyyyy = cleaned.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (ddmmyyyy) {
        const d = new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`);
        if (isValid(d)) return d;
    }

    // Try common text formats
    const d = new Date(cleaned);
    if (isValid(d)) return d;

    return null;
}

function computeAdDuration(startStr: string, endStr: string): number {
    const start = parseDate(startStr);
    const end = parseDate(endStr);
    const today = new Date();

    if (!start) return 0;
    const endDate = end && isValid(end) ? end : today;
    return Math.max(0, differenceInDays(endDate, start));
}

function formatDateDisplay(dateStr: string): string {
    const d = parseDate(dateStr);
    if (!d) return dateStr || 'N/A';
    return format(d, 'MMM dd, yyyy');
}

export async function fetchAdsData(): Promise<AdData[]> {
    try {
        const response = await fetch(SHEET_URL, {
            cache: 'no-store',   // always fetch fresh from Google Sheets
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.status}`);
        }

        const csvText = await response.text();
        return parseCSV(csvText);
    } catch (error) {
        console.error('Error fetching Google Sheets data:', error);
        // Return mock data as fallback
        return getMockData();
    }
}

// Column name aliases – exact sheet header strings (case-insensitive) first, then fallbacks
// Google Sheet columns: Ads link | Page Name | Body Text | CTA Text | URL Link | Media | Started Date | End Date | Improvement Scope
const COL_ALIASES: Record<string, string[]> = {
    adsLink: ['ads link', 'ad link', 'adslink', 'adlink'],
    pageName: ['page name', 'pagename'],
    bodyText: ['body text', 'bodytext', 'ad copy', 'ad text'],
    ctaText: ['cta text', 'ctatext', 'call to action', 'cta button'],
    urlLink: ['url link', 'urllink', 'landing page url', 'destination url', 'website url'],
    media: ['media', 'creative type', 'media type'],
    startedDate: ['started date', 'starteddate', 'start date', 'startdate', 'date started'],
    endDate: ['end date', 'enddate', 'stop date', 'stopdate', 'date ended'],
    improvementScope: ['improvement scope', 'improvementscope'],
    coverImage: ['cover image', 'cover image link', 'coverimage', 'image link', 'cover'],
};

function matchColumnName(header: string): string | null {
    // Strip carriage return (\r) from Windows-style line endings, then normalize
    const normalized = header.replace(/\r/g, '').toLowerCase().trim();
    for (const [fieldKey, aliases] of Object.entries(COL_ALIASES)) {
        if (aliases.some(alias => normalized === alias)) return fieldKey;  // exact match first
    }
    for (const [fieldKey, aliases] of Object.entries(COL_ALIASES)) {
        if (aliases.some(alias => normalized.startsWith(alias))) return fieldKey;  // prefix match second
    }
    return null;
}

function parseCSV(csvText: string): AdData[] {
    const rows = parseCSVToRows(csvText);
    if (rows.length < 2) return getMockData();

    // ── Step 1: Parse the header row and build a field→colIndex map ──
    const headerCols = rows[0];
    const colMap: Record<string, number> = {};

    headerCols.forEach((header, idx) => {
        const field = matchColumnName(header);
        if (field && !(field in colMap)) {   // first match wins
            colMap[field] = idx;
        }
    });

    // Log detected mapping in development
    if (process.env.NODE_ENV !== 'production') {
        console.log('[Sheets] Header row:', headerCols);
        console.log('[Sheets] Column map:', colMap);
    }

    const getCol = (row: string[], field: string): string =>
        (colMap[field] !== undefined ? row[colMap[field]] : undefined)?.trim() ?? '';

    const today = new Date();
    const dataRows = rows.slice(1);  // skip header

    return dataRows
        .filter(row => row.some(c => c.trim() !== ''))
        .map((cols, index) => {

            const adsLink = getCol(cols, 'adsLink');
            const pageName = getCol(cols, 'pageName') || `Competitor ${index + 1}`;
            const bodyText = getCol(cols, 'bodyText');
            const ctaText = getCol(cols, 'ctaText');
            const urlLink = getCol(cols, 'urlLink');
            const rawMedia = getCol(cols, 'media');
            const startedDate = getCol(cols, 'startedDate');
            const endDate = getCol(cols, 'endDate');
            const improvementScope = getCol(cols, 'improvementScope');
            const coverImage = getCol(cols, 'coverImage');

            // Parse "VIDEO:https://..." or "IMAGE:https://..." format
            const { mediaType, mediaUrl } = parseMediaField(rawMedia);

            const adDuration = computeAdDuration(startedDate, endDate);
            const isTopPerforming = adDuration >= 30;
            const endD = parseDate(endDate);
            const isActive = !endD || endD >= today;

            const status: AdData['status'] = isTopPerforming
                ? 'top_performing'
                : isActive ? 'active' : 'ended';

            return {
                id: `ad-${index + 1}`,
                adsLink,
                pageName,
                bodyText,
                ctaText,
                urlLink,
                media: mediaType,
                mediaUrl,
                startedDate,
                endDate,
                improvementScope,
                coverImage,
                adDuration,
                isTopPerforming,
                isActive,
                status,
            };
        })
        .filter(ad => ad.pageName && ad.pageName !== '' &&
            !ad.pageName.startsWith('Competitor '));  // drop blank rows
}

// ── Parse "VIDEO:https://url" or "IMAGE:https://url" format from the Media column ──
// Returns the clean media type label and the extracted URL separately
function parseMediaField(raw: string): { mediaType: string; mediaUrl: string } {
    if (!raw) return { mediaType: '', mediaUrl: '' };
    const colonIdx = raw.indexOf(':');
    if (colonIdx !== -1) {
        const prefix = raw.slice(0, colonIdx).trim().toUpperCase();
        const rest = raw.slice(colonIdx + 1).trim();
        if (rest.startsWith('http://') || rest.startsWith('https://')) {
            // e.g. "VIDEO" → "Video"
            const mediaType = prefix.charAt(0) + prefix.slice(1).toLowerCase();
            return { mediaType, mediaUrl: rest };
        }
    }
    // No URL embedded — raw value is just the type label ("Video", "DCO", etc.)
    return { mediaType: raw, mediaUrl: '' };
}

// ── RFC-4180 compliant CSV tokenizer ──────────────────────────────────────────
// Handles multi-line quoted fields (e.g. long Improvement Scope text with newlines)
function parseCSVToRows(csvText: string): string[][] {
    const rows: string[][] = [];
    let row: string[] = [];
    let cell = '';
    let inQuotes = false;
    let i = 0;
    const len = csvText.length;

    while (i < len) {
        const ch = csvText[i];

        if (inQuotes) {
            if (ch === '"') {
                // peek ahead for escaped double-quote
                if (i + 1 < len && csvText[i + 1] === '"') {
                    cell += '"';
                    i += 2;
                } else {
                    // closing quote
                    inQuotes = false;
                    i++;
                }
            } else {
                // any char inside quotes — including \n, \r, commas — is literal
                if (ch === '\r' && i + 1 < len && csvText[i + 1] === '\n') {
                    cell += '\n';
                    i += 2;
                } else {
                    cell += ch;
                    i++;
                }
            }
        } else {
            if (ch === '"') {
                inQuotes = true;
                i++;
            } else if (ch === ',') {
                row.push(cell.trim());
                cell = '';
                i++;
            } else if (ch === '\r' && i + 1 < len && csvText[i + 1] === '\n') {
                // Windows CRLF row separator
                row.push(cell.trim());
                if (row.some(c => c !== '')) rows.push(row);
                row = [];
                cell = '';
                i += 2;
            } else if (ch === '\n') {
                // Unix LF row separator
                row.push(cell.trim());
                if (row.some(c => c !== '')) rows.push(row);
                row = [];
                cell = '';
                i++;
            } else if (ch === '\r') {
                // bare CR
                row.push(cell.trim());
                if (row.some(c => c !== '')) rows.push(row);
                row = [];
                cell = '';
                i++;
            } else {
                cell += ch;
                i++;
            }
        }
    }

    // flush last cell/row
    row.push(cell.trim());
    if (row.some(c => c !== '')) rows.push(row);

    return rows;
}


export function computeStats(ads: AdData[]): DashboardStats {
    const uniqueCompetitors = new Set(ads.map(a => a.pageName)).size;
    const activeAds = ads.filter(a => a.isActive).length;
    const topPerforming = ads.filter(a => a.isTopPerforming).length;
    const avgDuration = ads.length > 0
        ? Math.round(ads.reduce((sum, a) => sum + a.adDuration, 0) / ads.length)
        : 0;

    return {
        totalAds: ads.length,
        activeAds,
        uniqueCompetitors,
        avgAdDuration: avgDuration,
        topPerformingAds: topPerforming,
    };
}

export function computeCompetitorInsights(ads: AdData[]): CompetitorInsight[] {
    const grouped: Record<string, AdData[]> = {};

    ads.forEach(ad => {
        if (!grouped[ad.pageName]) grouped[ad.pageName] = [];
        grouped[ad.pageName].push(ad);
    });

    return Object.entries(grouped).map(([pageName, competitorAds]) => {
        const totalAds = competitorAds.length;
        const averageDuration = Math.round(
            competitorAds.reduce((sum, a) => sum + a.adDuration, 0) / totalAds
        );

        const ctaCount: Record<string, number> = {};
        competitorAds.forEach(ad => {
            const cta = ad.ctaText || 'No CTA';
            ctaCount[cta] = (ctaCount[cta] || 0) + 1;
        });

        const mostCommonCTA = Object.entries(ctaCount)
            .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

        return {
            pageName,
            totalAds,
            averageDuration,
            mostCommonCTA,
            activeAds: competitorAds.filter(a => a.isActive).length,
            topPerformingAds: competitorAds.filter(a => a.isTopPerforming).length,
            ctaDistribution: ctaCount,
        };
    }).sort((a, b) => b.totalAds - a.totalAds);
}

export function getAdTimelineData(ads: AdData[]) {
    const monthCounts: Record<string, number> = {};

    ads.forEach(ad => {
        const d = parseDate(ad.startedDate);
        if (d) {
            const key = format(d, 'MMM yyyy');
            monthCounts[key] = (monthCounts[key] || 0) + 1;
        }
    });

    return Object.entries(monthCounts)
        .map(([month, count]) => ({ month, count }))
        .sort((a, b) => {
            const da = new Date(a.month);
            const db = new Date(b.month);
            return da.getTime() - db.getTime();
        });
}

export function getDurationBuckets(ads: AdData[]) {
    const buckets = [
        { label: '0-7 days', min: 0, max: 7 },
        { label: '8-14 days', min: 8, max: 14 },
        { label: '15-30 days', min: 15, max: 30 },
        { label: '31-60 days', min: 31, max: 60 },
        { label: '60+ days', min: 61, max: Infinity },
    ];

    return buckets.map(b => ({
        label: b.label,
        count: ads.filter(a => a.adDuration >= b.min && a.adDuration <= b.max).length,
        isTopPerforming: b.min >= 30,
    }));
}

// ─── Mock Data (Fallback) ────────────────────────────────────────────────────
export function getMockData(): AdData[] {
    const today = new Date();

    const rawData = [
        {
            pageName: 'Story TV',
            bodyText: 'Transform your storytelling with AI-powered video creation. Create professional ads in minutes, not hours. Join 50,000+ brands that trust Story TV for their social media content.',
            ctaText: 'Start Free Trial',
            urlLink: 'https://storytv.ai',
            media: 'video',
            startedDate: '2025-11-15',
            endDate: '2026-03-10',
            improvementScope: 'Hook needs stronger emotional trigger. Consider showcasing ROI metrics upfront. A/B test with testimonial-first approach. Add urgency element to CTA. Target audience: digital marketers and content creators aged 25-45.',
            adsLink: 'https://www.facebook.com/ads/library',
            coverImage: '',
        },
        {
            pageName: 'Per Annum',
            bodyText: 'Earn up to 12% annual returns with Per Annum\'s curated investment portfolio. No hidden fees. Start with just ₹5,000. Your money works harder while you sleep.',
            ctaText: 'Invest Now',
            urlLink: 'https://perannum.com',
            media: 'image',
            startedDate: '2025-12-01',
            endDate: '2026-03-10',
            improvementScope: 'Strong financial hook. Missing social proof elements. Add number of active investors. Risk disclaimer could be less prominent. CTA could be "Start Earning Today" for more active voice.',
            adsLink: 'https://www.facebook.com/ads/library',
            coverImage: '',
        },
        {
            pageName: 'The 1% Club',
            bodyText: 'Join India\'s most exclusive community of high-achievers. Get access to masterclasses from CEOs, founders, and billionaires. Limited spots available.',
            ctaText: 'Join The Club',
            urlLink: 'https://the1percentclub.com',
            media: 'video',
            startedDate: '2025-10-20',
            endDate: '2026-03-10',
            improvementScope: 'Exclusivity angle is strong. Add specific success stories and testimonials. "Limited spots" creates urgency—amplify this. Consider featuring a recognizable mentor face in the creative.',
            adsLink: 'https://www.facebook.com/ads/library',
            coverImage: '',
        },
        {
            pageName: 'Yash Brahmbhatt',
            bodyText: 'I went from 0 to ₹1 Crore in 18 months using these 3 wealth habits. No investing experience needed. Watch this free training before it\'s taken down.',
            ctaText: 'Watch Free Training',
            urlLink: 'https://yashbrahmbhatt.com',
            media: 'video',
            startedDate: '2026-01-10',
            endDate: '2026-03-10',
            improvementScope: 'Personal story hook is compelling. "Before it\'s taken down" creates false urgency—test genuine scarcity instead. Stronger before/after contrast needed. Thumbnail with income proof performs better.',
            adsLink: 'https://www.facebook.com/ads/library',
            coverImage: '',
        },
        {
            pageName: 'Migrate World',
            bodyText: 'Get your Golden Visa in 6 months. Citizenship by Investment programs in 15+ countries. Tax benefits, global mobility, and security for your family.',
            ctaText: 'Get Free Consultation',
            urlLink: 'https://migrateworld.com',
            media: 'image',
            startedDate: '2025-09-05',
            endDate: '2026-02-28',
            improvementScope: 'Premium positioning is correct. Add country-specific landing pages for better relevance. "6 months" timeline claim needs substantiation. Testimonials from actual clients would boost credibility significantly.',
            adsLink: 'https://www.facebook.com/ads/library',
            coverImage: '',
        },
        {
            pageName: 'Story TV',
            bodyText: 'Stop struggling with video editing. Story TV\'s AI does it for you. 10x your content output without the burnout. Used by top agencies worldwide.',
            ctaText: 'Try For Free',
            urlLink: 'https://storytv.ai/free',
            media: 'video',
            startedDate: '2025-12-20',
            endDate: '2026-03-10',
            improvementScope: 'Pain-point hook is effective. "Without the burnout" resonates with target audience. Add specific time-saving metrics. Show side-by-side comparison of before/after content quality.',
            adsLink: 'https://www.facebook.com/ads/library',
            coverImage: '',
        },
        {
            pageName: 'Per Annum',
            bodyText: 'Why is your money losing value in a savings account? Discover how smart Indians are beating inflation with Per Annum\'s guided investment platform.',
            ctaText: 'Calculate My Returns',
            urlLink: 'https://perannum.com/calculator',
            media: 'image',
            startedDate: '2026-01-15',
            endDate: '2026-03-10',
            improvementScope: 'Fear of loss angle is psychologically powerful. Interactive calculator CTA is excellent. Ensure landing page loads the calculator instantly. Add auto-populated national average comparison.',
            adsLink: 'https://www.facebook.com/ads/library',
            coverImage: '',
        },
        {
            pageName: 'The 1% Club',
            bodyText: 'Ankur Warikoo teaches exclusively in The 1% Club. Learn how to build wealth, lead teams, and think like a top 1% performer.',
            ctaText: 'See Curriculum',
            urlLink: 'https://the1percentclub.com/curriculum',
            media: 'image',
            startedDate: '2025-11-30',
            endDate: '2026-01-15',
            improvementScope: 'Celebrity/authority anchor is strong. Specific curriculum preview would increase conversions. Add student success metrics. Test video format for this concept.',
            adsLink: 'https://www.facebook.com/ads/library',
            coverImage: '',
        },
    ];

    return rawData.map((d, i) => {
        const adDuration = computeAdDuration(d.startedDate, d.endDate);
        const isTopPerforming = adDuration >= 30;
        const endD = parseDate(d.endDate);
        const isActive = !endD || endD >= today;

        return {
            id: `mock-${i + 1}`,
            ...d,
            mediaUrl: '',  // mock data has no embedded video URLs
            adDuration,
            isTopPerforming,
            isActive,
            status: (isTopPerforming ? 'top_performing' : isActive ? 'active' : 'ended') as AdData['status'],
        };
    });
}
