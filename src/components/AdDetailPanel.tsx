'use client';

import { AdData } from '@/types';
import {
    X, ExternalLink, Eye, Clock, Award, Target, Brain, Lightbulb,
    Users, Zap, MessageSquare, TrendingUp, Copy, Share2, Bookmark, Video, Image as ImageIcon
} from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';

interface Props {
    ad: AdData;
    onClose: () => void;
}

function parseDate(dateStr: string): Date | null {
    if (!dateStr) return null;
    try {
        const ddmmyyyy = dateStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (ddmmyyyy) return new Date(`${ddmmyyyy[3]}-${ddmmyyyy[2].padStart(2, '0')}-${ddmmyyyy[1].padStart(2, '0')}`);
        return new Date(dateStr);
    } catch { return null; }
}

function formatDate(dateStr: string): string {
    const d = parseDate(dateStr);
    if (!d || isNaN(d.getTime())) return dateStr || '—';
    return format(d, 'MMM dd, yyyy');
}

function parseImprovementScope(text: string) {
    if (!text) return null;

    // Extract sections from improvement scope
    const sections: { title: string; content: string; icon: React.ReactNode; color: string }[] = [];

    // Try to identify key sections
    const lines = text.split(/[.\n]/).map(l => l.trim()).filter(Boolean);

    // Group into meaningful sections
    const hookKeywords = ['hook', 'opening', 'headline', 'first'];
    const ctaKeywords = ['cta', 'call to action', 'button', 'action'];
    const audienceKeywords = ['audience', 'target', 'demographic', 'age'];
    const emotionKeywords = ['emotion', 'trigger', 'fear', 'desire', 'pain'];
    const suggestionKeywords = ['suggest', 'recommend', 'test', 'try', 'add', 'consider', 'improve'];

    const hookSentences = lines.filter(l => hookKeywords.some(k => l.toLowerCase().includes(k)));
    const ctaSentences = lines.filter(l => ctaKeywords.some(k => l.toLowerCase().includes(k)));
    const audienceSentences = lines.filter(l => audienceKeywords.some(k => l.toLowerCase().includes(k)));
    const emotionSentences = lines.filter(l => emotionKeywords.some(k => l.toLowerCase().includes(k)));
    const suggestionSentences = lines.filter(l => suggestionKeywords.some(k => l.toLowerCase().includes(k)));

    if (hookSentences.length > 0) {
        sections.push({
            title: 'Hook & Opening Analysis',
            content: hookSentences.join('. '),
            icon: <Zap size={14} />,
            color: '#f59e0b',
        });
    }

    if (ctaSentences.length > 0) {
        sections.push({
            title: 'CTA Strategy',
            content: ctaSentences.join('. '),
            icon: <Target size={14} />,
            color: '#2563EB',
        });
    }

    if (audienceSentences.length > 0) {
        sections.push({
            title: 'Target Audience Insight',
            content: audienceSentences.join('. '),
            icon: <Users size={14} />,
            color: '#10b981',
        });
    }

    if (emotionSentences.length > 0) {
        sections.push({
            title: 'Emotional Trigger Analysis',
            content: emotionSentences.join('. '),
            icon: <Brain size={14} />,
            color: '#ec4899',
        });
    }

    if (suggestionSentences.length > 0) {
        sections.push({
            title: 'Improvement Suggestions',
            content: suggestionSentences.join('. '),
            icon: <Lightbulb size={14} />,
            color: '#06b6d4',
        });
    }

    // If no sections matched, use raw text
    if (sections.length === 0 && text.length > 0) {
        sections.push({
            title: 'Analysis & Recommendations',
            content: text,
            icon: <Brain size={14} />,
            color: '#2563EB',
        });
    }

    return sections;
}

export default function AdDetailPanel({ ad, onClose }: Props) {
    const [copied, setCopied] = useState(false);
    const [bookmarked, setBookmarked] = useState(false);
    const [note, setNote] = useState('');
    const [showNoteEditor, setShowNoteEditor] = useState(false);

    const sections = parseImprovementScope(ad.improvementScope);
    const isVideo = ad.media?.toLowerCase().includes('video');

    const copyBodyText = () => {
        navigator.clipboard.writeText(ad.bodyText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const shareAnalysis = () => {
        const text = `Meta Ads Intelligence: ${ad.pageName}\n\nAd Copy: ${ad.bodyText}\n\nCTA: ${ad.ctaText}\n\nAnalysis: ${ad.improvementScope}`;
        navigator.clipboard.writeText(text);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 overlay z-40"
                onClick={onClose}
            />

            {/* Side Panel */}
            <div
                className="fixed right-0 top-0 h-full z-50 overflow-y-auto side-panel"
                style={{
                    width: '480px',
                    background: 'var(--bg-secondary)',
                    borderLeft: '1px solid var(--border-color)',
                    boxShadow: '-8px 0 40px rgba(0,0,0,0.12)',
                }}
            >
                {/* Panel Header */}
                <div
                    className="sticky top-0 z-10 px-5 py-4 flex items-center justify-between"
                    style={{
                        background: 'var(--bg-secondary)',
                        borderBottom: '1px solid var(--border-color)',
                    }}
                >
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{
                                background: `hsl(${ad.pageName.charCodeAt(0) * 15 % 360}, 60%, 45%)`,
                            }}
                        >
                            {ad.pageName.charAt(0)}
                        </div>
                        <div>
                            <h2 className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{ad.pageName}</h2>
                            <div className="flex items-center gap-2 mt-0.5">
                                {ad.isTopPerforming && (
                                    <span className="badge-top inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs">
                                        <Award size={9} />
                                        Top Performing
                                    </span>
                                )}
                                <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                    {ad.adDuration}d campaign
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={shareAnalysis}
                            className="p-2 rounded-lg transition-all btn-ghost"
                            title="Copy analysis"
                        >
                            <Share2 size={15} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                        <button
                            onClick={() => setBookmarked(!bookmarked)}
                            className="p-2 rounded-lg transition-all btn-ghost"
                        >
                            <Bookmark
                                size={15}
                                style={{ color: bookmarked ? '#f59e0b' : 'var(--text-secondary)' }}
                                fill={bookmarked ? '#f59e0b' : 'none'}
                            />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg transition-all btn-ghost"
                        >
                            <X size={16} style={{ color: 'var(--text-secondary)' }} />
                        </button>
                    </div>
                </div>

                <div className="p-5 space-y-5">
                    {/* Ad Creative Preview */}
                    <section>
                        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                            {isVideo ? <Video size={12} /> : <ImageIcon size={12} />}
                            Ad Creative Preview
                        </h3>
                        <div
                            className="w-full h-44 rounded-xl flex flex-col items-center justify-center gap-3"
                            style={{
                                background: 'var(--bg-primary)',
                                border: '1px dashed var(--border-color)',
                            }}
                        >
                            {isVideo ? (
                                <Video size={40} style={{ color: 'var(--accent-secondary)', opacity: 0.6 }} />
                            ) : (
                                <ImageIcon size={40} style={{ color: 'var(--accent-secondary)', opacity: 0.6 }} />
                            )}
                            <span className="text-sm font-medium" style={{ color: 'var(--text-muted)' }}>
                                {isVideo ? 'Video Ad' : 'Image Ad'}
                            </span>
                            {ad.adsLink && (
                                <a
                                    href={ad.adsLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium btn-primary text-white"
                                >
                                    <Eye size={14} />
                                    View Ad on Meta
                                </a>
                            )}
                        </div>
                    </section>

                    {/* Meta Info Cards */}
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Duration', value: `${ad.adDuration} days`, icon: <Clock size={13} />, color: '#2563EB' },
                            { label: 'Started', value: formatDate(ad.startedDate), icon: <TrendingUp size={13} />, color: '#10b981' },
                            { label: 'CTA', value: ad.ctaText || '—', icon: <Target size={13} />, color: '#f59e0b' },
                        ].map((item, i) => (
                            <div
                                key={i}
                                className="p-3 rounded-xl"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                }}
                            >
                                <div className="flex items-center gap-1.5 mb-1.5" style={{ color: item.color }}>
                                    {item.icon}
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.label}</span>
                                </div>
                                <div className="text-sm font-bold truncate" style={{ color: 'var(--text-primary)' }} title={item.value}>{item.value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Full Ad Script */}
                    <section>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                <MessageSquare size={12} />
                                Full Ad Script
                            </h3>
                            <button
                                onClick={copyBodyText}
                                className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-all btn-ghost"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                <Copy size={11} />
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <div
                            className="p-4 rounded-xl text-sm leading-relaxed"
                            style={{
                                background: 'var(--bg-card)',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-secondary)',
                                fontFamily: 'inherit',
                                whiteSpace: 'pre-wrap',
                            }}
                        >
                            {ad.bodyText || 'No ad copy available.'}
                        </div>
                    </section>

                    {/* Landing Page */}
                    {ad.urlLink && (
                        <section>
                            <h3 className="text-xs font-semibold uppercase tracking-wider mb-2 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                <ExternalLink size={12} />
                                Landing Page
                            </h3>
                            <a
                                href={ad.urlLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-3 rounded-xl transition-all group"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--accent-secondary)',
                                }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.borderColor = 'rgba(37, 99, 235, 0.5)'}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)'}
                            >
                                <span className="text-sm truncate">{ad.urlLink}</span>
                                <ExternalLink size={14} className="flex-shrink-0 ml-2" />
                            </a>
                        </section>
                    )}

                    {/* AI Analysis Sections */}
                    {sections && sections.length > 0 && (
                        <section>
                            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                <Brain size={12} />
                                AI Analysis & Insights
                            </h3>
                            <div className="space-y-3">
                                {sections.map((section, i) => (
                                    <div
                                        key={i}
                                        className="p-4 rounded-xl"
                                        style={{
                                            background: `${section.color}08`,
                                            border: `1px solid ${section.color}20`,
                                        }}
                                    >
                                        <div className="flex items-center gap-2 mb-2" style={{ color: section.color }}>
                                            {section.icon}
                                            <span className="text-xs font-semibold">{section.title}</span>
                                        </div>
                                        <p className="text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                                            {section.content}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}

                    {/* Full Improvement Scope */}
                    {ad.improvementScope && sections && sections.length === 0 && (
                        <section>
                            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                <Lightbulb size={12} />
                                Improvement Scope
                            </h3>
                            <div
                                className="p-4 rounded-xl text-sm leading-relaxed"
                                style={{
                                    background: 'rgba(37, 99, 235, 0.05)',
                                    border: '1px solid rgba(37, 99, 235, 0.15)',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                {ad.improvementScope}
                            </div>
                        </section>
                    )}

                    {/* Notes */}
                    <section>
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="text-xs font-semibold uppercase tracking-wider flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                                <MessageSquare size={12} />
                                Notes
                            </h3>
                            <button
                                onClick={() => setShowNoteEditor(!showNoteEditor)}
                                className="text-xs px-2 py-1 rounded-lg btn-ghost"
                                style={{ color: 'var(--text-muted)' }}
                            >
                                {showNoteEditor ? 'Cancel' : '+ Add Note'}
                            </button>
                        </div>
                        {showNoteEditor && (
                            <div className="space-y-2">
                                <textarea
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    placeholder="Add your analysis notes here..."
                                    rows={3}
                                    className="w-full p-3 rounded-xl text-sm resize-none search-input"
                                    style={{
                                        background: 'var(--bg-card)',
                                        border: '1px solid var(--border-color)',
                                        color: 'var(--text-primary)',
                                    }}
                                />
                                <button
                                    onClick={() => setShowNoteEditor(false)}
                                    className="w-full py-2 rounded-lg text-sm font-medium btn-primary text-white"
                                >
                                    Save Note
                                </button>
                            </div>
                        )}
                        {note && !showNoteEditor && (
                            <div
                                className="p-3 rounded-xl text-sm"
                                style={{
                                    background: 'rgba(245,158,11,0.08)',
                                    border: '1px solid rgba(245,158,11,0.2)',
                                    color: 'var(--text-secondary)',
                                }}
                            >
                                {note}
                            </div>
                        )}
                    </section>

                    {/* Bottom padding */}
                    <div className="h-4" />
                </div>
            </div>
        </>
    );
}
