'use client';

import { ActivePage } from '@/types';
import {
    LayoutDashboard, Target, Palette, BarChart3,
    Settings, Zap, ChevronRight, TrendingUp, Brain
} from 'lucide-react';

interface SidebarProps {
    activePage: ActivePage;
    onPageChange: (page: ActivePage) => void;
    isOpen: boolean;
    totalAds: number;
}

const navItems = [
    {
        id: 'dashboard' as ActivePage,
        label: 'Dashboard',
        icon: LayoutDashboard,
        description: 'Overview & Analytics',
    },
    {
        id: 'competitor-ads' as ActivePage,
        label: 'Competitor Ads',
        icon: Target,
        description: 'Ad Intelligence Table',
    },
    {
        id: 'creative-analysis' as ActivePage,
        label: 'Creative Analysis',
        icon: Palette,
        description: 'Ad Creatives & Copy',
    },
    {
        id: 'reports' as ActivePage,
        label: 'Reports',
        icon: BarChart3,
        description: 'Competitive Reports',
    },
    {
        id: 'settings' as ActivePage,
        label: 'Settings',
        icon: Settings,
        description: 'Data & Preferences',
    },
];

export default function Sidebar({ activePage, onPageChange, isOpen, totalAds }: SidebarProps) {
    return (
        <aside
            className="flex flex-col transition-all duration-300 overflow-hidden"
            style={{
                width: isOpen ? '240px' : '0px',
                minWidth: isOpen ? '240px' : '0px',
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-color)',
            }}
        >
            {/* Logo */}
            <div className="p-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--accent-primary)' }}
                    >
                        <Brain size={18} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>Meta Ads</div>
                        <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Intelligence
                        </div>
                    </div>
                </div>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                <div className="text-xs font-semibold uppercase tracking-wider px-3 py-2 mb-1" style={{ color: 'var(--text-muted)' }}>
                    Navigation
                </div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activePage === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => onPageChange(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-200 group nav-item ${isActive ? 'nav-active' : ''}`}
                            style={{
                                color: isActive ? 'var(--accent-secondary)' : 'var(--text-secondary)',
                            }}
                        >
                            <Icon
                                size={18}
                                style={{ color: isActive ? 'var(--accent-primary)' : 'var(--text-muted)' }}
                                className="transition-colors flex-shrink-0"
                            />
                            <div className="min-w-0 flex-1">
                                <div className="text-sm font-medium truncate">{item.label}</div>
                            </div>
                            {isActive && <ChevronRight size={14} style={{ color: 'var(--accent-secondary)' }} />}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom Stats Card */}
            <div className="p-3 border-t" style={{ borderColor: 'var(--border-color)' }}>
                <div
                    className="p-3 rounded-xl"
                    style={{
                        background: 'rgba(37, 99, 235, 0.05)',
                        border: '1px solid rgba(37, 99, 235, 0.15)',
                    }}
                >
                    <div className="flex items-center gap-2 mb-2">
                        <Zap size={14} style={{ color: 'var(--accent-primary)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>Live Tracking</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>{totalAds}</span>
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>ads tracked</span>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Auto-refreshing</span>
                    </div>
                </div>

                {/* Competitor Insights shortcut */}
                <button
                    onClick={() => onPageChange('competitor-ads')}
                    className="w-full mt-2 flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 btn-ghost"
                >
                    <TrendingUp size={14} style={{ color: 'var(--accent-primary)' }} />
                    <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                        Competitor Insights
                    </span>
                </button>
            </div>
        </aside>
    );
}
