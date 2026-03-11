'use client';

import { Search, RefreshCw, Menu, AlertCircle, Clock, Bell } from 'lucide-react';
import { format } from 'date-fns';
import { ActivePage } from '@/types';

interface TopNavProps {
    searchQuery: string;
    onSearchChange: (q: string) => void;
    onRefresh: () => void;
    lastRefresh: Date;
    totalAds: number;
    activePage: ActivePage;
    onToggleSidebar: () => void;
    error: string | null;
}

const pageLabels: Record<ActivePage, string> = {
    'dashboard': 'Dashboard',
    'competitor-ads': 'Competitor Ads Intelligence',
    'creative-analysis': 'Creative Analysis',
    'reports': 'Reports & Export',
    'settings': 'Settings',
};

export default function TopNav({
    searchQuery, onSearchChange, onRefresh, lastRefresh,
    totalAds, activePage, onToggleSidebar, error
}: TopNavProps) {
    return (
        <header
            className="flex items-center gap-4 px-6 py-3 flex-shrink-0"
            style={{
                background: 'var(--bg-secondary)',
                borderBottom: '1px solid var(--border-color)',
                height: '64px',
            }}
        >
            {/* Sidebar Toggle */}
            <button
                onClick={onToggleSidebar}
                className="p-2 rounded-lg transition-colors hover:bg-white/5"
                style={{ color: 'var(--text-muted)' }}
            >
                <Menu size={18} />
            </button>

            {/* Page Title */}
            <div className="hidden md:flex items-center gap-2 min-w-0">
                <h1 className="text-base font-semibold text-white truncate">{pageLabels[activePage]}</h1>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--border-hover)' }} />
                <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{totalAds} ads</span>
            </div>

            {/* Spacer */}
            <div className="flex-1" />

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
                <Search
                    size={15}
                    className="absolute left-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--text-muted)' }}
                />
                <input
                    type="text"
                    placeholder="Search ads, competitors, CTAs..."
                    value={searchQuery}
                    onChange={e => onSearchChange(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-lg text-sm transition-all search-input"
                    style={{
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-color)',
                        color: 'var(--text-primary)',
                    }}
                />
                {searchQuery && (
                    <button
                        onClick={() => onSearchChange('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-xs px-1.5 py-0.5 rounded"
                        style={{ background: 'var(--border-color)', color: 'var(--text-muted)' }}
                    >
                        Clear
                    </button>
                )}
            </div>

            {/* Error Badge */}
            {error && (
                <div
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs"
                    style={{
                        background: 'rgba(239,68,68,0.1)',
                        border: '1px solid rgba(239,68,68,0.3)',
                        color: '#f87171',
                    }}
                >
                    <AlertCircle size={12} />
                    <span>{error}</span>
                </div>
            )}

            {/* Last Updated */}
            <div className="hidden lg:flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                <Clock size={13} />
                <span className="text-xs">Updated {format(lastRefresh, 'HH:mm')}</span>
            </div>

            {/* Refresh Button */}
            <button
                onClick={onRefresh}
                className="p-2 rounded-lg transition-all btn-ghost group"
                title="Refresh Data"
            >
                <RefreshCw
                    size={16}
                    style={{ color: 'var(--text-secondary)' }}
                    className="group-hover:rotate-180 transition-transform duration-500"
                />
            </button>

            {/* Notifications */}
            <button
                className="relative p-2 rounded-lg transition-all btn-ghost"
                title="Notifications"
            >
                <Bell size={16} style={{ color: 'var(--text-secondary)' }} />
                <div
                    className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500"
                    style={{ boxShadow: '0 0 6px rgba(99,102,241,0.8)' }}
                />
            </button>

            {/* Avatar */}
            <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #6366f1, #7c3aed)' }}
            >
                M
            </div>
        </header>
    );
}
