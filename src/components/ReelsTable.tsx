'use client';

import { useState, useMemo } from 'react';
import { ExternalLink, Eye, ArrowUpDown, ChevronLeft, ChevronRight, Video, Download, Filter, MessageSquare, Heart } from 'lucide-react';

interface ReelData {
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
    sheetOrder: number;
}

interface ReelsTableProps {
    reels: ReelData[];
}

type SortKey = keyof ReelData;

function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function ExpandableText({ text, maxLen = 80 }: { text: string; maxLen?: number }) {
    const [expanded, setExpanded] = useState(false);
    if (!text) return <span style={{ color: 'var(--text-muted)' }}>—</span>;
    if (text.length <= maxLen) {
        return <span className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>{text}</span>;
    }
    return (
        <div className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
            {expanded ? text : text.slice(0, maxLen) + '…'}
            <button
                onClick={e => { e.stopPropagation(); setExpanded(!expanded); }}
                className="ml-1 inline-flex items-center gap-0.5 text-xs font-medium"
                style={{ color: 'var(--accent-secondary)' }}
            >
                {expanded ? 'less' : 'more'}
            </button>
        </div>
    );
}

export default function ReelsTable({ reels }: ReelsTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('sheetOrder');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [brandFilter, setBrandFilter] = useState('all');
    const pageSize = 15;

    const brands = useMemo(() => Array.from(new Set(reels.map(r => r.brandName).filter(Boolean))).sort(), [reels]);

    const filtered = useMemo(() => {
        let result = [...reels];
        if (brandFilter !== 'all') result = result.filter(r => r.brandName === brandFilter);
        result.sort((a, b) => {
            const va = a[sortKey] as any;
            const vb = b[sortKey] as any;
            const dir = sortDir === 'asc' ? 1 : -1;
            if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
            return String(va || '').localeCompare(String(vb || '')) * dir;
        });
        return result;
    }, [reels, brandFilter, sortKey, sortDir]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
        setPage(1);
    };

    const SortBtn = ({ col, label }: { col: SortKey; label: string }) => (
        <button
            onClick={() => handleSort(col)}
            className="flex items-center gap-1 hover:text-gray-900 transition-colors group whitespace-nowrap"
            style={{ color: sortKey === col ? 'var(--accent-primary)' : 'var(--text-secondary)' }}
        >
            <span className="text-xs font-semibold uppercase tracking-wide">{label}</span>
            <ArrowUpDown size={11} className="opacity-50 group-hover:opacity-100 flex-shrink-0" />
        </button>
    );

    const exportCSV = () => {
        const header = ['Brand Name', 'Insta ID', 'Video URL', 'View Count', 'Likes', 'Comments', 'Uploaded Date', 'Caption', 'Transcript'].join(',');
        const rows = filtered.map(r => [
            `"${r.brandName}"`,
            `"${r.instaId}"`,
            `"${r.videoUrl}"`,
            r.viewCount,
            r.likes,
            r.comment,
            `"${r.uploadedDate}"`,
            `"${r.caption?.replace(/"/g, '""') || ''}"`,
            `"${r.transcript?.replace(/"/g, '""') || ''}"`
        ].join(','));
        const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
        const el = document.createElement('a');
        el.href = URL.createObjectURL(blob);
        el.download = 'reels-intel.csv';
        el.click();
    };

    return (
        <div className="rounded-xl overflow-hidden shadow-card hover:shadow-md transition-shadow duration-300" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>
            <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Top Reels Intelligence</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(37, 99, 235, 0.08)', color: 'var(--accent-primary)' }}>
                        {filtered.length}
                    </span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setPage(1); }}
                            className="pl-7 pr-3 py-1.5 rounded-lg text-xs appearance-none cursor-pointer"
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            <option value="all">All Brands</option>
                            {brands.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <button onClick={exportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-ghost"
                        style={{ color: 'var(--text-secondary)' }}>
                        <Download size={13} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-left" style={{ minWidth: '1300px' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                            <th className="px-4 py-3"><SortBtn col="brandName" label="Brand Name" /></th>
                            <th className="px-4 py-3"><SortBtn col="instaId" label="Insta ID" /></th>
                            <th className="px-4 py-3"><SortBtn col="viewCount" label="Views" /></th>
                            <th className="px-4 py-3"><SortBtn col="likes" label="Engagements" /></th>
                            <th className="px-4 py-3"><SortBtn col="uploadedDate" label="Upload Date" /></th>
                            <th className="px-4 py-3" style={{ minWidth: 200 }}><SortBtn col="caption" label="Caption" /></th>
                            <th className="px-4 py-3" style={{ minWidth: 200 }}><SortBtn col="transcript" label="Transcript" /></th>
                            <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>Video</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={8} className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                                    <div className="flex flex-col items-center gap-2">
                                        <Eye size={32} style={{ opacity: 0.3 }} />
                                        <span className="text-sm">No reels found matching your criteria</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginated.map(reel => (
                                <tr key={reel.id} className="table-row-hover transition-colors" style={{ borderBottom: '1px solid var(--border-color)' }}>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                style={{ background: `hsl(${(reel.brandName?.charCodeAt(0) * 17) % 360}, 55%, 45%)` }}>
                                                {reel.brandName?.charAt(0).toUpperCase() || '?'}
                                            </div>
                                            <span className="text-sm font-semibold flex-1" style={{ color: 'var(--text-primary)' }}>
                                                {reel.brandName || 'Unknown'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3"><span className="text-sm" style={{ color: 'var(--text-secondary)' }}>@{reel.instaId || '—'}</span></td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm font-semibold" style={{ color: 'var(--accent-secondary)' }}>{formatNumber(reel.viewCount)}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}><Heart size={10} className="text-pink-400" /> {formatNumber(reel.likes)}</div>
                                            <div className="flex items-center gap-1 text-xs" style={{ color: 'var(--text-secondary)' }}><MessageSquare size={10} className="text-blue-400" /> {formatNumber(reel.comment)}</div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>{reel.uploadedDate || '—'}</span>
                                    </td>
                                    <td className="px-4 py-3"><ExpandableText text={reel.caption} maxLen={70} /></td>
                                    <td className="px-4 py-3"><ExpandableText text={reel.transcript} maxLen={80} /></td>
                                    <td className="px-4 py-3">
                                        {reel.videoUrl ? (
                                            <a href={reel.videoUrl} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-pink-500/20"
                                                style={{ border: '1px solid rgba(236,72,153,0.3)', color: '#ec4899' }}
                                                title="Watch Video">
                                                <Video size={13} />
                                                Watch
                                            </a>
                                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} reels
                    </span>
                    <div className="flex items-center gap-1">
                        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                            className="p-1.5 rounded-lg btn-ghost disabled:opacity-40">
                            <ChevronLeft size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            const pg = page <= 3 ? i + 1 : page - 2 + i;
                            if (pg < 1 || pg > totalPages) return null;
                            return (
                                <button key={pg} onClick={() => setPage(pg)}
                                    className="w-8 h-8 rounded-lg text-sm font-medium transition-all"
                                    style={{ background: pg === page ? 'var(--accent-primary)' : 'transparent', color: pg === page ? 'white' : 'var(--text-secondary)' }}>
                                    {pg}
                                </button>
                            );
                        })}
                        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                            className="p-1.5 rounded-lg btn-ghost disabled:opacity-40">
                            <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
