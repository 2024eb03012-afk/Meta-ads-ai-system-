import { differenceInDays, parseISO, isValid, format } from 'date-fns';

const SHEET_ID = '1gQLSNqHptTOxCns3IrqfqfbauJVLEco5Jczwkk0nkII';
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=0`;

export interface ReelData {
    id: string;
    brandName: string;
    instaId: string;
    videoUrl: string;
    viewCount: number;
    likes: number;
    comment: number;
    caption: string;
    uploadedDate: string;
    transcript: string;
}

function parseDate(dateStr: string): Date | null {
    if (!dateStr || dateStr.trim() === '') return null;
    try {
        const d = parseISO(dateStr.trim());
        if (isValid(d)) return d;
    } catch { }
    const d = new Date(dateStr.trim());
    if (isValid(d)) return d;
    return null;
}

function parseIntSafe(val: string): number {
    if (!val) return 0;
    const s = val.replace(/,/g, '').trim();
    const n = parseInt(s, 10);
    return isNaN(n) ? 0 : n;
}

export async function fetchReelsData(): Promise<ReelData[]> {
    try {
        const response = await fetch(SHEET_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);
        const csvText = await response.text();
        return parseReelsCSV(csvText);
    } catch (error) {
        console.error('Error fetching Reels Sheets data:', error);
        return [];
    }
}

function matchColumnName(header: string, aliases: string[]): boolean {
    const normalized = header.replace(/\r/g, '').toLowerCase().trim();
    return aliases.some(alias => normalized === alias || normalized.startsWith(alias));
}

function parseReelsCSV(csvText: string): ReelData[] {
    const rows = parseCSVToRows(csvText);
    if (rows.length < 2) return [];

    const headerCols = rows[0];
    const colMap: Record<string, number> = {};

    const COL_ALIASES: Record<string, string[]> = {
        brandName: ['brand name', 'brand'],
        instaId: ['insta id', 'instagram id', 'username'],
        videoUrl: ['video url', 'link', 'url'],
        viewCount: ['view count', 'views'],
        likes: ['likes', 'like count'],
        comment: ['comment', 'comments'],
        caption: ['caption', 'description'],
        uploadedDate: ['uploaded date', 'date', 'upload date'],
        transcript: ['transcript', 'text'],
    };

    headerCols.forEach((header, idx) => {
        for (const [fieldKey, aliases] of Object.entries(COL_ALIASES)) {
            if (matchColumnName(header, aliases) && !(fieldKey in colMap)) {
                colMap[fieldKey] = idx;
                break;
            }
        }
    });

    const getCol = (row: string[], field: string): string =>
        (colMap[field] !== undefined ? row[colMap[field]] : undefined)?.trim() ?? '';

    const dataRows = rows.slice(1);

    return dataRows
        .filter(row => row.some(c => c.trim() !== ''))
        .map((cols, index) => {
            return {
                id: `reel-${index + 1}`,
                brandName: getCol(cols, 'brandName'),
                instaId: getCol(cols, 'instaId'),
                videoUrl: getCol(cols, 'videoUrl'),
                viewCount: parseIntSafe(getCol(cols, 'viewCount')),
                likes: parseIntSafe(getCol(cols, 'likes')),
                comment: parseIntSafe(getCol(cols, 'comment')),
                caption: getCol(cols, 'caption'),
                uploadedDate: getCol(cols, 'uploadedDate'),
                transcript: getCol(cols, 'transcript'),
            };
        })
        .filter(reel => reel.brandName || reel.videoUrl); // drop completely empty rows
}

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
                if (i + 1 < len && csvText[i + 1] === '"') { cell += '"'; i += 2; }
                else { inQuotes = false; i++; }
            } else {
                if (ch === '\r' && i + 1 < len && csvText[i + 1] === '\n') { cell += '\n'; i += 2; }
                else { cell += ch; i++; }
            }
        } else {
            if (ch === '"') { inQuotes = true; i++; }
            else if (ch === ',') { row.push(cell.trim()); cell = ''; i++; }
            else if (ch === '\r' && i + 1 < len && csvText[i + 1] === '\n') {
                row.push(cell.trim());
                if (row.some(c => c !== '')) rows.push(row);
                row = []; cell = ''; i += 2;
            } else if (ch === '\n') {
                row.push(cell.trim());
                if (row.some(c => c !== '')) rows.push(row);
                row = []; cell = ''; i++;
            } else if (ch === '\r') {
                row.push(cell.trim());
                if (row.some(c => c !== '')) rows.push(row);
                row = []; cell = ''; i++;
            } else { cell += ch; i++; }
        }
    }
    row.push(cell.trim());
    if (row.some(c => c !== '')) rows.push(row);
    return rows;
}
