'use client';

import { AdData } from '@/types';
import { computeCompetitorInsights } from '@/lib/sheets';
import {
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell
} from 'recharts';
import { Award, Clock, Target, TrendingUp, Users } from 'lucide-react';

interface Props {
    ads: AdData[];
    onSelectAd: (ad: AdData) => void;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

export default function CompetitorInsightsView({ ads, onSelectAd }: Props) {
    const insights = computeCompetitorInsights(ads);

    const barData = insights.map((ins, i) => ({
        name: ins.pageName.length > 12 ? ins.pageName.slice(0, 12) + '...' : ins.pageName,
        full: ins.pageName,
        total: ins.totalAds,
        active: ins.activeAds,
        top: ins.topPerformingAds,
        color: COLORS[i % COLORS.length],
    }));

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-xl font-bold text-white">Competitor Insights</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Deep dive into each competitor's advertising strategy
                </p>
            </div>

            {/* Competitor Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.map((ins, i) => {
                    const competitorAds = ads.filter(a => a.pageName === ins.pageName);
                    return (
                        <div
                            key={i}
                            className="p-5 rounded-xl transition-all duration-200"
                            style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                            onMouseEnter={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = COLORS[i % COLORS.length] + '60';
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                            }}
                            onMouseLeave={e => {
                                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                            }}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                                        style={{ background: COLORS[i % COLORS.length] }}
                                    >
                                        {ins.pageName.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-sm">{ins.pageName}</h3>
                                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                            {ins.totalAds} total ads
                                        </p>
                                    </div>
                                </div>
                                {ins.topPerformingAds > 0 && (
                                    <span className="badge-top flex items-center gap-1 px-2 py-1 rounded-full text-xs">
                                        <Award size={10} />
                                        {ins.topPerformingAds}
                                    </span>
                                )}
                            </div>

                            {/* Mini Stats */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                {[
                                    { label: 'Avg Duration', value: `${ins.averageDuration}d`, color: COLORS[i % COLORS.length] },
                                    { label: 'Active', value: ins.activeAds, color: '#10b981' },
                                ].map((s, j) => (
                                    <div
                                        key={j}
                                        className="p-2.5 rounded-lg text-center"
                                        style={{ background: 'var(--bg-secondary)' }}
                                    >
                                        <div className="text-lg font-bold" style={{ color: s.color }}>{s.value}</div>
                                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Primary CTA */}
                            <div className="mb-4">
                                <p className="text-xs mb-1.5" style={{ color: 'var(--text-muted)' }}>Primary CTA Strategy</p>
                                <span
                                    className="inline-block px-2.5 py-1.5 rounded-lg text-xs font-medium"
                                    style={{
                                        background: `${COLORS[i % COLORS.length]}15`,
                                        border: `1px solid ${COLORS[i % COLORS.length]}30`,
                                        color: COLORS[i % COLORS.length],
                                    }}
                                >
                                    {ins.mostCommonCTA}
                                </span>
                            </div>

                            {/* Recent Ads */}
                            <div>
                                <p className="text-xs font-medium mb-2" style={{ color: 'var(--text-muted)' }}>Recent Ads</p>
                                <div className="space-y-1.5">
                                    {competitorAds.slice(0, 2).map(ad => (
                                        <div
                                            key={ad.id}
                                            className="p-2 rounded-lg cursor-pointer transition-colors"
                                            style={{ background: 'var(--bg-secondary)' }}
                                            onClick={() => onSelectAd(ad)}
                                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-card-hover)'}
                                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'var(--bg-secondary)'}
                                        >
                                            <div className="flex items-center justify-between gap-2">
                                                <p
                                                    className="text-xs truncate flex-1"
                                                    style={{ color: 'var(--text-secondary)' }}
                                                >
                                                    {ad.bodyText.slice(0, 55) || 'No copy'}{ad.bodyText.length > 55 ? '...' : ''}
                                                </p>
                                                <span
                                                    className="text-xs font-semibold flex-shrink-0"
                                                    style={{ color: ad.isTopPerforming ? '#10b981' : 'var(--text-muted)' }}
                                                >
                                                    {ad.adDuration}d
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                    {competitorAds.length > 2 && (
                                        <p className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                                            +{competitorAds.length - 2} more ads
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Comparison Chart */}
            <div
                className="p-5 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                <h3 className="text-sm font-bold text-white mb-1">Competitor Ad Volume Comparison</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                    Total ads tracked per competitor brand
                </p>
                <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={barData} barSize={36}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                        <XAxis
                            dataKey="name"
                            tick={{ fill: '#8888aa', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <YAxis
                            tick={{ fill: '#8888aa', fontSize: 11 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{ background: '#1c1c26', border: '1px solid #2a2a3a', borderRadius: '8px', color: '#f0f0ff' }}
                            labelStyle={{ color: '#f0f0ff' }}
                            itemStyle={{ color: '#818cf8' }}
                            formatter={(val: any, name: any, props: any) => [val, props.payload?.full || 'Total Ads']}
                        />
                        <Bar dataKey="total" name="Total Ads" radius={[6, 6, 0, 0]}>
                            {barData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
