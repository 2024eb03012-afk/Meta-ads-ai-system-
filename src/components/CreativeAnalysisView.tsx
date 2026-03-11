'use client';

import { AdData, CompetitorInsight } from '@/types';
import { computeCompetitorInsights } from '@/lib/sheets';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, Clock, Target, Award, Users, Zap } from 'lucide-react';

interface Props {
    ads: AdData[];
    onSelectAd: (ad: AdData) => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#f97316'];

export default function CreativeAnalysisView({ ads, onSelectAd }: Props) {
    const insights = computeCompetitorInsights(ads);

    // Group ads by creative type (video vs image)
    const videoAds = ads.filter(a =>
        a.media?.toLowerCase().includes('video') || a.adsLink?.includes('video')
    );
    const imageAds = ads.filter(a => !videoAds.includes(a));

    // Top performing ads
    const topAds = ads.filter(a => a.isTopPerforming)
        .sort((a, b) => b.adDuration - a.adDuration);

    // CTA frequency analysis
    const ctaMap: Record<string, number> = {};
    ads.forEach(ad => {
        const cta = ad.ctaText || 'No CTA';
        ctaMap[cta] = (ctaMap[cta] || 0) + 1;
    });
    const ctaData = Object.entries(ctaMap)
        .sort(([, a], [, b]) => b - a)
        .map(([name, value]) => ({ name, value }));

    // Competitor duration comparison
    const durationData = insights.map(i => ({
        name: i.pageName.length > 12 ? i.pageName.slice(0, 12) + '...' : i.pageName,
        full: i.pageName,
        avg: i.averageDuration,
        top: i.topPerformingAds,
        total: i.totalAds,
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Page Title */}
            <div>
                <h1 className="text-xl font-bold text-white">Creative Analysis</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Analyze competitor ad creatives, formats, and messaging strategies
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Creatives', value: ads.length, icon: <Zap size={16} />, color: '#6366f1' },
                    { label: 'Video Ads', value: videoAds.length, icon: <TrendingUp size={16} />, color: '#ec4899' },
                    { label: 'Image Ads', value: imageAds.length, icon: <Target size={16} />, color: '#10b981' },
                    { label: 'Top Performers', value: topAds.length, icon: <Award size={16} />, color: '#f59e0b' },
                ].map((stat, i) => (
                    <div
                        key={i}
                        className="p-4 rounded-xl"
                        style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                    >
                        <div className="flex items-center gap-2 mb-2" style={{ color: stat.color }}>
                            {stat.icon}
                            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{stat.label}</span>
                        </div>
                        <div className="text-2xl font-bold text-white">{stat.value}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Avg Duration by Competitor */}
                <div
                    className="p-5 rounded-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <h3 className="text-sm font-bold text-white mb-1">Avg Duration by Competitor</h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Which brands run ads the longest</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={durationData} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                            <XAxis dataKey="name" tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#8888aa', fontSize: 10 }} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{ background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: '8px' }}
                                labelStyle={{ color: '#f0f0ff' }}
                                itemStyle={{ color: '#818cf8' }}
                                formatter={(val: any, name: any, props: any) => [`${val} days`, props.payload?.full || name]}
                            />
                            <Bar dataKey="avg" name="Avg Duration" radius={[6, 6, 0, 0]}>
                                {durationData.map((_, i) => (
                                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* CTA Analysis */}
                <div
                    className="p-5 rounded-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <h3 className="text-sm font-bold text-white mb-1">CTA Strategy Analysis</h3>
                    <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>Most commonly used calls-to-action</p>
                    <div className="space-y-3">
                        {ctaData.map((item, i) => {
                            const maxVal = ctaData[0]?.value || 1;
                            const pct = Math.round((item.value / maxVal) * 100);
                            return (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between items-center">
                                        <span
                                            className="text-sm font-medium truncate max-w-[220px]"
                                            style={{ color: 'var(--text-secondary)' }}
                                        >
                                            {item.name}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold" style={{ color: COLORS[i % COLORS.length] }}>
                                                {item.value}x
                                            </span>
                                        </div>
                                    </div>
                                    <div
                                        className="h-2 rounded-full overflow-hidden"
                                        style={{ background: 'var(--bg-primary)' }}
                                    >
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{
                                                width: `${pct}%`,
                                                background: COLORS[i % COLORS.length],
                                                opacity: 0.8,
                                            }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Top Performing Ads Gallery */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <div className="flex items-center gap-2">
                        <Award size={16} className="text-amber-400" />
                        <h3 className="text-sm font-bold text-white">Top Performing Ad Creatives</h3>
                        <span
                            className="px-2 py-0.5 rounded-full text-xs"
                            style={{ background: 'rgba(245,158,11,0.15)', color: '#fbbf24' }}
                        >
                            30+ days running
                        </span>
                    </div>
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {topAds.length === 0 ? (
                        <div className="col-span-2 text-center py-8" style={{ color: 'var(--text-muted)' }}>
                            No top performing ads identified yet
                        </div>
                    ) : (
                        topAds.slice(0, 6).map(ad => (
                            <div
                                key={ad.id}
                                className="p-4 rounded-xl transition-all duration-200 cursor-pointer group"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                }}
                                onClick={() => onSelectAd(ad)}
                                onMouseEnter={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(245,158,11,0.4)';
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
                                }}
                                onMouseLeave={e => {
                                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                                }}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-center gap-2.5">
                                        <div
                                            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                                            style={{ background: `hsl(${ad.pageName.charCodeAt(0) * 15 % 360}, 60%, 45%)` }}
                                        >
                                            {ad.pageName.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-white">{ad.pageName}</p>
                                            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{ad.ctaText}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1 flex-shrink-0">
                                        <Clock size={12} className="text-amber-400" />
                                        <span className="text-sm font-bold text-amber-400">{ad.adDuration}d</span>
                                    </div>
                                </div>
                                <p
                                    className="text-xs mt-3 line-clamp-2 leading-relaxed"
                                    style={{ color: 'var(--text-secondary)' }}
                                >
                                    {ad.bodyText}
                                </p>
                                <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)' }}>
                                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                                        Click to view full analysis →
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Competitor Strategy Table */}
            <div
                className="rounded-xl overflow-hidden"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                <div className="px-5 py-4" style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <h3 className="text-sm font-bold text-white">Competitor Creative Strategy Overview</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left" style={{ minWidth: '600px' }}>
                        <thead>
                            <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)' }}>
                                {['Competitor', 'Total Ads', 'Active', 'Top Performing', 'Avg Duration', 'Most Used CTA'].map(col => (
                                    <th key={col} className="px-4 py-3 text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {insights.map((ins, i) => (
                                <tr
                                    key={i}
                                    className="transition-colors"
                                    style={{ borderBottom: '1px solid var(--border-color)' }}
                                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)'}
                                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                                >
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                                                style={{ background: COLORS[i % COLORS.length] }}
                                            >
                                                {ins.pageName.charAt(0)}
                                            </div>
                                            <span className="text-sm font-medium text-white">{ins.pageName}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white font-semibold">{ins.totalAds}</td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm text-emerald-400 font-medium">{ins.activeAds}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        {ins.topPerformingAds > 0 ? (
                                            <span className="flex items-center gap-1 text-amber-400 text-sm font-medium">
                                                <Award size={12} />
                                                {ins.topPerformingAds}
                                            </span>
                                        ) : <span className="text-sm" style={{ color: 'var(--text-muted)' }}>0</span>}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                            {ins.averageDuration}d
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className="inline-block px-2 py-0.5 rounded-lg text-xs font-medium"
                                            style={{
                                                background: 'rgba(99,102,241,0.12)',
                                                border: '1px solid rgba(99,102,241,0.25)',
                                                color: '#a5b4fc',
                                            }}
                                        >
                                            {ins.mostCommonCTA}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
