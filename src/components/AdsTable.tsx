'use client';

import { useState, useMemo, useRef } from 'react';
import { AdData } from '@/types';
import {
    ExternalLink, Eye, Brain, ArrowUpDown, ChevronLeft, ChevronRight,
    Award, Clock, Video, Image as ImageIcon, Filter, Download, ChevronDown, ChevronUp
} from 'lucide-react';

interface AdsTableProps {
    ads: AdData[];
    onSelectAd: (ad: AdData) => void;
    title?: string;
    limit?: number;
}

type SortKey = keyof AdData;

function formatDate(dateStr: string): string {
    if (!dateStr || dateStr.trim() === '') return '—';
    try {
        // Try DD/MM/YYYY
        const m = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (m) {
            const d = new Date(`${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`);
            return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        }
        const d = new Date(dateStr);
        if (isNaN(d.getTime())) return dateStr;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch { return dateStr; }
}

function StatusBadge({ ad }: { ad: AdData }) {
    if (ad.isTopPerforming) {
        return (
            <span className="badge-top inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium whitespace-nowrap">
                <Award size={10} /> Top Performing
            </span>
        );
    }
    if (ad.isActive) {
        return (
            <span className="badge-active inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" /> Active
            </span>
        );
    }
    return (
        <span className="badge-ended inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium">
            <div className="w-1.5 h-1.5 rounded-full bg-gray-400" /> Ended
        </span>
    );
}

// ── Inline Video Player Modal ────────────────────────────────────────────────
function VideoPlayerModal({ url, onClose }: { url: string; onClose: () => void }) {
    const videoRef = useRef<HTMLVideoElement>(null);
    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={onClose}
        >
            <div
                className="relative rounded-2xl overflow-hidden shadow-2xl"
                style={{ maxWidth: '860px', width: '90vw', background: '#000' }}
                onClick={e => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-full text-white"
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
                    title="Close"
                >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                        <path d="M1 1L13 13M13 1L1 13" stroke="white" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                </button>

                {/* Native HTML5 Video Player */}
                <video
                    ref={videoRef}
                    src={url}
                    autoPlay
                    controls
                    style={{ width: '100%', maxHeight: '80vh', display: 'block', background: '#000' }}
                    onError={() => {
                        // Facebook CDN videos may block cross-origin — show fallback
                        if (videoRef.current) {
                            videoRef.current.style.display = 'none';
                        }
                    }}
                >
                    Your browser does not support the video tag.
                </video>

                {/* Fallback message if video fails (cross-origin CDN restriction) */}
                <div
                    id="video-fallback"
                    className="hidden p-6 text-center"
                    style={{ color: '#9ca3af' }}
                >
                    <svg className="mx-auto mb-3" width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <circle cx="20" cy="20" r="19" stroke="#ec4899" strokeWidth="2" />
                        <polygon points="15,12 30,20 15,28" fill="#ec4899" />
                    </svg>
                    <p className="text-sm mb-3" style={{ color: '#f3f4f6' }}>Video cannot be embedded directly.</p>
                    <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white"
                        style={{ background: 'linear-gradient(135deg, #ec4899, #f59e0b)' }}
                    >
                        Open Video ↗
                    </a>
                </div>
            </div>
        </div>
    );
}

function MediaCell({ media, mediaUrl, onPlay }: { media: string; mediaUrl: string; onPlay: () => void }) {
    const isVideo = media?.toLowerCase().includes('video');
    const hasUrl = !!mediaUrl;

    return (
        <div className="flex items-center gap-1.5">
            {/* Media type badge */}
            <span
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap"
                style={{
                    background: isVideo ? 'rgba(236,72,153,0.12)' : 'rgba(99,102,241,0.12)',
                    border: `1px solid ${isVideo ? 'rgba(236,72,153,0.3)' : 'rgba(99,102,241,0.3)'}`,
                    color: isVideo ? '#ec4899' : '#6366f1',
                }}
            >
                {isVideo ? <Video size={11} /> : <ImageIcon size={11} />}
                {isVideo ? 'Video' : (media || 'Image')}
            </span>

            {/* Play button — opens inline video modal */}
            {hasUrl && (
                <button
                    onClick={e => { e.stopPropagation(); onPlay(); }}
                    title="Play video inline"
                    className="inline-flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110 active:scale-95"
                    style={{
                        background: 'linear-gradient(135deg, #ec4899, #f59e0b)',
                        boxShadow: '0 2px 8px rgba(236,72,153,0.4)',
                        border: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <svg width="9" height="10" viewBox="0 0 9 10" fill="none">
                        <path d="M1.5 1.5L7.5 5L1.5 8.5V1.5Z" fill="white" />
                    </svg>
                </button>
            )}
        </div>
    );
}


// ── Full Text Modal ──────────────────────────────────────────────────────────
// Opens a centered overlay showing the complete text without any cell constraints
function TextModal({ label, text }: { label: string; text: string }) {
    const [open, setOpen] = useState(false);
    if (!text) return <span style={{ color: 'var(--text-muted)' }}>—</span>;

    const preview = text.length > 90 ? text.slice(0, 90) + '…' : text;

    return (
        <>
            <div className="text-sm leading-snug" style={{ color: 'var(--text-secondary)' }}>
                {preview}
                {text.length > 90 && (
                    <button
                        onClick={e => { e.stopPropagation(); setOpen(true); }}
                        className="ml-1.5 inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md transition-all"
                        style={{
                            background: 'rgba(99,102,241,0.15)',
                            border: '1px solid rgba(99,102,241,0.3)',
                            color: '#818cf8',
                        }}
                    >
                        View full
                    </button>
                )}
            </div>

            {/* ── Modal Overlay ── */}
            {open && (
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-6"
                    style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}
                    onClick={e => { e.stopPropagation(); setOpen(false); }}
                >
                    <div
                        className="relative rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col"
                        style={{
                            background: 'var(--bg-card)',
                            border: '1px solid rgba(99,102,241,0.3)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div
                            className="flex items-center justify-between px-6 py-4"
                            style={{ borderBottom: '1px solid var(--border-color)' }}
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-indigo-400" />
                                <h3 className="font-bold text-white text-sm">{label}</h3>
                            </div>
                            <button
                                onClick={e => { e.stopPropagation(); setOpen(false); }}
                                className="text-xl leading-none px-2 py-1 rounded-lg hover:bg-white/10 transition-colors"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                ×
                            </button>
                        </div>

                        {/* Modal body — full text */}
                        <div className="px-6 py-5 overflow-y-auto">
                            <p
                                className="text-sm leading-relaxed whitespace-pre-wrap"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {text}
                            </p>
                        </div>

                        {/* Modal footer */}
                        <div
                            className="px-6 py-3 flex justify-end"
                            style={{ borderTop: '1px solid var(--border-color)' }}
                        >
                            <button
                                onClick={e => { e.stopPropagation(); setOpen(false); }}
                                className="px-4 py-2 rounded-lg text-sm font-medium btn-primary text-white"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
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
                {expanded ? <><ChevronUp size={11} />less</> : <><ChevronDown size={11} />more</>}
            </button>
        </div>
    );
}

export default function AdsTable({ ads, onSelectAd, title, limit }: AdsTableProps) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [sortKey, setSortKey] = useState<SortKey>('adDuration');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
    const [page, setPage] = useState(1);
    const [competitorFilter, setCompetitorFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);
    const pageSize = limit || 15;

    const competitors = useMemo(() => Array.from(new Set(ads.map(a => a.pageName))).sort(), [ads]);

    const filtered = useMemo(() => {
        let result = [...ads];
        if (competitorFilter !== 'all') result = result.filter(a => a.pageName === competitorFilter);
        if (statusFilter !== 'all') result = result.filter(a => a.status === statusFilter);
        result.sort((a, b) => {
            const va = a[sortKey] as any;
            const vb = b[sortKey] as any;
            const dir = sortDir === 'asc' ? 1 : -1;
            if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
            return String(va || '').localeCompare(String(vb || '')) * dir;
        });
        return result;
    }, [ads, competitorFilter, statusFilter, sortKey, sortDir]);

    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    const handleSort = (key: SortKey) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('desc'); }
        setPage(1);
    };

    const toggleSelect = (id: string) => {
        setSelected(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
    };

    const toggleAll = () =>
        selected.size === paginated.length
            ? setSelected(new Set())
            : setSelected(new Set(paginated.map(a => a.id)));

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
        const header = ['Ads Link', 'Page Name', 'Body Text', 'CTA Text', 'URL Link', 'Media', 'Cover Image', 'Started Date', 'End Date', 'Ad Duration (days)', 'Improvement Scope', 'Status'].join(',');
        const rows = filtered.map(a => [
            `"${a.adsLink}"`,
            `"${a.pageName}"`,
            `"${a.bodyText.replace(/"/g, '""')}"`,
            `"${a.ctaText}"`,
            `"${a.urlLink}"`,
            `"${a.media}"`,
            `"${a.coverImage}"`,
            `"${a.startedDate}"`,
            `"${a.endDate}"`,
            a.adDuration,
            `"${a.improvementScope.replace(/"/g, '""')}"`,
            a.status,
        ].join(','));
        const blob = new Blob([[header, ...rows].join('\n')], { type: 'text/csv' });
        const el = document.createElement('a');
        el.href = URL.createObjectURL(blob);
        el.download = 'meta-ads-intel.csv';
        el.click();
    };

    // Column header label
    const Th = ({ children }: { children: React.ReactNode }) => (
        <th className="px-4 py-3">
            <span className="text-xs font-semibold uppercase tracking-wide whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                {children}
            </span>
        </th>
    );

    return (
        <div className="rounded-xl overflow-hidden shadow-card hover:shadow-md transition-shadow duration-300" style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}>

            {/* ── Top Controls ── */}
            <div className="flex items-center justify-between px-5 py-4 flex-wrap gap-3" style={{ borderBottom: '1px solid var(--border-color)' }}>
                <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{title || 'Competitor Ads'}</h2>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(37, 99, 235, 0.08)', color: 'var(--accent-primary)' }}>
                        {filtered.length}
                    </span>
                    {selected.size > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#047857' }}>
                            {selected.size} selected
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative">
                        <Filter size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }} />
                        <select value={competitorFilter} onChange={e => { setCompetitorFilter(e.target.value); setPage(1); }}
                            className="pl-7 pr-3 py-1.5 rounded-lg text-xs appearance-none cursor-pointer"
                            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                            <option value="all">All Competitors</option>
                            {competitors.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                    <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 rounded-lg text-xs appearance-none cursor-pointer"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' }}>
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="ended">Ended</option>
                        <option value="top_performing">Top Performing</option>
                    </select>
                    <button onClick={exportCSV}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all btn-ghost"
                        style={{ color: 'var(--text-secondary)' }}>
                        <Download size={13} /> Export CSV
                    </button>
                </div>
            </div>

            {/* ── Table ── */}
            <div className="overflow-x-auto">
                <table className="w-full text-left" style={{ minWidth: '1300px' }}>
                    <thead>
                        <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                            {/* Checkbox */}
                            <th className="w-10 px-4 py-3">
                                <input type="checkbox"
                                    checked={selected.size === paginated.length && paginated.length > 0}
                                    onChange={toggleAll} />
                            </th>

                            {/* ── Exact Google Sheet column headers ── */}
                            <th className="px-4 py-3 w-36"><SortBtn col="pageName" label="Page Name" /></th>
                            <th className="px-4 py-3" style={{ minWidth: 230 }}><SortBtn col="bodyText" label="Body Text" /></th>
                            <th className="px-4 py-3 w-32"><SortBtn col="ctaText" label="CTA Text" /></th>
                            <Th>URL Link</Th>
                            <Th>Media</Th>
                            <Th>Cover Image</Th>
                            <th className="px-4 py-3 w-32"><SortBtn col="startedDate" label="Started Date" /></th>
                            <th className="px-4 py-3 w-32"><SortBtn col="endDate" label="End Date" /></th>
                            <th className="px-4 py-3 w-28"><SortBtn col="adDuration" label="Duration" /></th>
                            <th className="px-4 py-3" style={{ minWidth: 220 }}><SortBtn col="improvementScope" label="Improvement Scope" /></th>
                            <Th>Status</Th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginated.length === 0 ? (
                            <tr>
                                <td colSpan={12} className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
                                    <div className="flex flex-col items-center gap-2">
                                        <Eye size={32} style={{ opacity: 0.3 }} />
                                        <span className="text-sm">No ads found matching your filters</span>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            paginated.map(ad => (
                                <tr
                                    key={ad.id}
                                    className="table-row-hover transition-colors"
                                    style={{
                                        borderBottom: '1px solid var(--border-color)',
                                        background: selected.has(ad.id) ? 'rgba(37, 99, 235, 0.04)' : 'transparent',
                                    }}
                                    onClick={() => onSelectAd(ad)}
                                >
                                    {/* Checkbox */}
                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        <input type="checkbox" checked={selected.has(ad.id)} onChange={() => toggleSelect(ad.id)} />
                                    </td>

                                    {/* Page Name */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                style={{ background: `hsl(${(ad.pageName.charCodeAt(0) * 17) % 360}, 55%, 45%)` }}
                                            >
                                                {ad.pageName.charAt(0).toUpperCase()}
                                            </div>
                                            <span className="text-sm font-semibold" title={ad.pageName}
                                                style={{ maxWidth: 180, wordWrap: 'break-word', whiteSpace: 'normal', display: 'block', color: 'var(--text-primary)' }}>
                                                {ad.pageName}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Body Text */}
                                    <td className="px-4 py-3" style={{ maxWidth: 260 }} onClick={e => e.stopPropagation()}>
                                        <ExpandableText text={ad.bodyText} maxLen={80} />
                                    </td>

                                    {/* CTA Text */}
                                    <td className="px-4 py-3">
                                        {ad.ctaText ? (
                                            <span className="inline-block px-2 py-1 rounded-lg text-xs font-medium"
                                                style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.25)', color: '#a5b4fc', whiteSpace: 'nowrap' }}>
                                                {ad.ctaText}
                                            </span>
                                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                    </td>

                                    {/* URL Link */}
                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        {ad.urlLink ? (
                                            <a href={ad.urlLink} target="_blank" rel="noopener noreferrer"
                                                className="flex items-center gap-1 text-xs hover:text-indigo-400 transition-colors"
                                                style={{ color: 'var(--text-secondary)', maxWidth: 160 }}>
                                                <ExternalLink size={11} className="flex-shrink-0" />
                                                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 140 }}>
                                                    {ad.urlLink.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                                                </span>
                                            </a>
                                        ) : <span style={{ color: 'var(--text-muted)', fontSize: 13 }}>—</span>}
                                    </td>

                                    {/* Media — shows badge + play button if video URL exists */}
                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        <MediaCell media={ad.media} mediaUrl={ad.mediaUrl} onPlay={() => setPlayingVideoUrl(ad.mediaUrl)} />
                                    </td>

                                    {/* Cover Image */}
                                    <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                                        {ad.coverImage && ad.coverImage.trim() !== '' ? (
                                            <a href={ad.coverImage} target="_blank" rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs font-medium transition-all hover:bg-pink-500/20"
                                                style={{ border: '1px solid rgba(236,72,153,0.3)', color: '#ec4899' }}
                                                title="View Cover Image">
                                                <ImageIcon size={13} />
                                                View
                                            </a>
                                        ) : <span style={{ color: 'var(--text-muted)' }}>—</span>}
                                    </td>

                                    {/* Started Date */}
                                    <td className="px-4 py-3">
                                        <span className="text-sm whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
                                            {formatDate(ad.startedDate)}
                                        </span>
                                    </td>

                                    {/* End Date */}
                                    <td className="px-4 py-3">
                                        <span className="text-sm whitespace-nowrap"
                                            style={{ color: ad.isActive && !ad.endDate ? '#34d399' : 'var(--text-secondary)' }}>
                                            {ad.isActive && !ad.endDate ? 'Running' : formatDate(ad.endDate)}
                                        </span>
                                    </td>

                                    {/* Ad Duration (computed: End − Start) */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-1.5">
                                            <Clock size={12} style={{ color: ad.isTopPerforming ? '#10b981' : 'var(--text-muted)' }} />
                                            <span className="text-sm font-semibold"
                                                style={{ color: ad.isTopPerforming ? '#10b981' : 'var(--text-secondary)' }}>
                                                {ad.adDuration > 0 ? `${ad.adDuration}d` : '—'}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Improvement Scope — opens full text modal */}
                                    <td className="px-4 py-3" style={{ width: 260 }} onClick={e => e.stopPropagation()}>
                                        <TextModal label="Improvement Scope" text={ad.improvementScope} />
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3">
                                        <StatusBadge ad={ad} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Pagination ── */}
            {totalPages > 1 && (
                <div className="flex items-center justify-between px-5 py-3" style={{ borderTop: '1px solid var(--border-color)' }}>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} ads
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
                                    style={{ background: pg === page ? 'var(--accent-primary)' : 'transparent', color: pg === page ? 'white' : 'var(--text-secondary)' }}
                                >
                                    {pg}
                                </button>
                            );
                        })}
                        <button
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                            className="p-1.5 rounded-lg btn-ghost disabled:opacity-40"
                        >
                            <ChevronRight size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                    </div>
                </div>
            )}

            {/* Render Inline Video Player if a video is playing */}
            {playingVideoUrl && (
                <VideoPlayerModal
                    url={playingVideoUrl}
                    onClose={() => setPlayingVideoUrl(null)}
                />
            )}
        </div>
    );
}
