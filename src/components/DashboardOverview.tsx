'use client';

import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DashboardStats, CompetitorInsight } from '@/types';
import {
    Target, TrendingUp, Users, Clock, Zap, Award, ArrowUpRight
} from 'lucide-react';

interface Props {
    stats: DashboardStats;
    competitorInsights: CompetitorInsight[];
    timelineData: { month: string; count: number }[];
    durationBuckets: { label: string; count: number; isTopPerforming: boolean }[];
}

const CHART_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div
                className="px-3 py-2 rounded-lg shadow-xl"
                style={{
                    background: '#1c1c26',
                    border: '1px solid #2a2a3a',
                    color: '#f0f0ff',
                }}
            >
                <p className="text-xs font-semibold mb-1" style={{ color: '#8888aa' }}>{label}</p>
                {payload.map((p: any, i: number) => (
                    <p key={i} className="text-sm font-bold" style={{ color: p.color || '#818cf8' }}>
                        {p.value} {p.name}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
    subtitle?: string;
    trend?: number;
}

function StatCard({ label, value, icon, color, subtitle, trend }: StatCardProps) {
    return (
        <div
            className="relative p-5 rounded-xl overflow-hidden group transition-all duration-300 stat-card"
            style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                cursor: 'default',
            }}
            onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-hover)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--border-color)';
                (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
        >
            {/* Background glow */}
            <div
                className="absolute top-0 right-0 w-24 h-24 rounded-full opacity-10 blur-2xl transition-opacity group-hover:opacity-20"
                style={{ background: color, transform: 'translate(30%, -30%)' }}
            />

            <div className="flex items-start justify-between mb-3">
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: `${color}20`, border: `1px solid ${color}30` }}
                >
                    {icon}
                </div>
                {trend !== undefined && (
                    <div className="flex items-center gap-1 text-xs font-medium text-green-400">
                        <ArrowUpRight size={12} />
                        <span>+{trend}%</span>
                    </div>
                )}
            </div>

            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            <div className="text-sm font-medium" style={{ color: 'var(--text-secondary)' }}>{label}</div>
            {subtitle && (
                <div className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>{subtitle}</div>
            )}
        </div>
    );
}

export default function DashboardOverview({ stats, competitorInsights, timelineData, durationBuckets }: Props) {
    // Pie chart data for competitors
    const pieData = competitorInsights.slice(0, 6).map((c, i) => ({
        name: c.pageName,
        value: c.totalAds,
        color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    // CTA distribution
    const ctaMap: Record<string, number> = {};
    competitorInsights.forEach(c => {
        Object.entries(c.ctaDistribution).forEach(([cta, count]) => {
            ctaMap[cta] = (ctaMap[cta] || 0) + count;
        });
    });
    const ctaData = Object.entries(ctaMap)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 6)
        .map(([name, value]) => ({ name, value }));

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Ads Tracked"
                    value={stats.totalAds}
                    icon={<Target size={18} style={{ color: '#6366f1' }} />}
                    color="#6366f1"
                    subtitle="from Google Sheets"
                    trend={12}
                />
                <StatCard
                    label="Active Ads"
                    value={stats.activeAds}
                    icon={<Zap size={18} style={{ color: '#10b981' }} />}
                    color="#10b981"
                    subtitle="currently running"
                    trend={8}
                />
                <StatCard
                    label="Unique Competitors"
                    value={stats.uniqueCompetitors}
                    icon={<Users size={18} style={{ color: '#f59e0b' }} />}
                    color="#f59e0b"
                    subtitle="brand pages tracked"
                />
                <StatCard
                    label="Avg. Ad Duration"
                    value={`${stats.avgAdDuration}d`}
                    icon={<Clock size={18} style={{ color: '#ec4899' }} />}
                    color="#ec4899"
                    subtitle="across all campaigns"
                />
            </div>

            {/* Top Performing Badge Row */}
            <div
                className="flex items-center gap-4 p-4 rounded-xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(16,185,129,0.1), rgba(16,185,129,0.05))',
                    border: '1px solid rgba(16,185,129,0.25)',
                }}
            >
                <div
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                    style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)' }}
                >
                    <Award size={16} className="text-emerald-400" />
                    <span className="text-sm font-bold text-emerald-400">{stats.topPerformingAds}</span>
                    <span className="text-sm text-emerald-300">Top Performing Ads</span>
                </div>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Ads running <span className="font-semibold text-emerald-400">30+ days</span> — likely profitable campaigns worth studying
                </p>
                <div className="ml-auto">
                    <TrendingUp size={18} className="text-emerald-400" />
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Ad Duration Distribution */}
                <div
                    className="p-5 rounded-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="mb-4">
                        <h3 className="text-base font-bold text-white">Ad Duration Distribution</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            How long competitors run their ads
                        </p>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={durationBuckets} barSize={32}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" vertical={false} />
                            <XAxis
                                dataKey="label"
                                tick={{ fill: '#8888aa', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis
                                tick={{ fill: '#8888aa', fontSize: 11 }}
                                axisLine={false}
                                tickLine={false}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="count"
                                name="ads"
                                radius={[6, 6, 0, 0]}
                                fill="url(#barGradient)"
                            />
                            <defs>
                                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#6366f1" />
                                    <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
                                </linearGradient>
                            </defs>
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Competitor Activity Pie */}
                <div
                    className="p-5 rounded-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="mb-4">
                        <h3 className="text-base font-bold text-white">Competitor Activity</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Ads distribution by competitor brand
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <ResponsiveContainer width="55%" height={200}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={85}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="transparent" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value, name) => [value, name]}
                                    contentStyle={{
                                        background: '#1c1c26',
                                        border: '1px solid #2a2a3a',
                                        borderRadius: '8px',
                                        color: '#f0f0ff',
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="flex-1 space-y-2">
                            {pieData.map((entry, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full flex-shrink-0"
                                        style={{ background: entry.color }}
                                    />
                                    <span
                                        className="text-xs truncate"
                                        style={{ color: 'var(--text-secondary)' }}
                                        title={entry.name}
                                    >
                                        {entry.name}
                                    </span>
                                    <span className="text-xs font-bold text-white ml-auto">{entry.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Ad Timeline */}
                <div
                    className="p-5 rounded-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="mb-4">
                        <h3 className="text-base font-bold text-white">Ad Launch Timeline</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            When competitors launched their campaigns
                        </p>
                    </div>
                    {timelineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={timelineData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#2a2a3a" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: '#8888aa', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <YAxis
                                    tick={{ fill: '#8888aa', fontSize: 11 }}
                                    axisLine={false}
                                    tickLine={false}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <defs>
                                    <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor="#6366f1" />
                                        <stop offset="100%" stopColor="#ec4899" />
                                    </linearGradient>
                                </defs>
                                <Line
                                    type="monotone"
                                    dataKey="count"
                                    name="ads"
                                    stroke="url(#lineGradient)"
                                    strokeWidth={2.5}
                                    dot={{ fill: '#6366f1', r: 4, strokeWidth: 2, stroke: '#1c1c26' }}
                                    activeDot={{ r: 6, fill: '#818cf8' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-48 flex items-center justify-center" style={{ color: 'var(--text-muted)' }}>
                            <p className="text-sm">No timeline data available</p>
                        </div>
                    )}
                </div>

                {/* CTA Distribution */}
                <div
                    className="p-5 rounded-xl"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                    <div className="mb-4">
                        <h3 className="text-base font-bold text-white">CTA Type Distribution</h3>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                            Most common calls-to-action by competitors
                        </p>
                    </div>
                    {ctaData.length > 0 ? (
                        <div className="space-y-3">
                            {ctaData.map((item, i) => {
                                const maxVal = ctaData[0].value;
                                const pct = Math.round((item.value / maxVal) * 100);
                                return (
                                    <div key={i} className="space-y-1">
                                        <div className="flex justify-between text-xs">
                                            <span style={{ color: 'var(--text-secondary)' }} className="truncate max-w-[200px]">
                                                {item.name}
                                            </span>
                                            <span className="font-bold text-white ml-2">{item.value}</span>
                                        </div>
                                        <div
                                            className="h-2 rounded-full overflow-hidden"
                                            style={{ background: 'var(--bg-primary)' }}
                                        >
                                            <div
                                                className="h-full rounded-full transition-all duration-1000"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: `linear-gradient(90deg, ${CHART_COLORS[i % CHART_COLORS.length]}, ${CHART_COLORS[(i + 1) % CHART_COLORS.length]})`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {['Learn More', 'Shop Now', 'Sign Up', 'Join Now', 'Get Started'].map((cta, i) => (
                                <div key={i} className="space-y-1">
                                    <div className="flex justify-between text-xs">
                                        <span style={{ color: 'var(--text-secondary)' }}>{cta}</span>
                                        <span className="font-bold text-white">{5 - i}</span>
                                    </div>
                                    <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--bg-primary)' }}>
                                        <div
                                            className="h-full rounded-full"
                                            style={{
                                                width: `${(5 - i) * 20}%`,
                                                background: CHART_COLORS[i % CHART_COLORS.length],
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
