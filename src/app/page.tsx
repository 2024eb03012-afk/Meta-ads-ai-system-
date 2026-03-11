'use client';

import { useState, useEffect, useCallback } from 'react';
import { AdData } from '@/types';
import AdsTable from '@/components/AdsTable';
import ReelsTable from '@/components/ReelsTable';
import AdDetailPanel from '@/components/AdDetailPanel';
import LoadingScreen from '@/components/LoadingScreen';
import CompetitorTopVideoAdsForm from '@/components/CompetitorTopVideoAdsForm';
import CompetitorAdsLibraryForm from '@/components/CompetitorAdsLibraryForm';
import { Brain, RefreshCw, Search, Zap, AlertCircle, Plus } from 'lucide-react';

export default function Home() {
    const [activeTab, setActiveTab] = useState<'ads' | 'reels'>('ads');
    const [ads, setAds] = useState<AdData[]>([]);
    const [reels, setReels] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAd, setSelectedAd] = useState<AdData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
    const [refreshing, setRefreshing] = useState(false);
    const [showExtractor, setShowExtractor] = useState(false);
    const [showLibraryForm, setShowLibraryForm] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            setError(null);
            setRefreshing(true);
            const res = await fetch('/api/ads', { cache: 'no-cache' });
            const json = await res.json();
            if (json.success) {
                setAds(json.data);
                setLastRefresh(new Date());
            } else {
                setError('Failed to load data from Google Sheets');
            }

            const reelsRes = await fetch('/api/reels', { cache: 'no-cache' });
            const reelsJson = await reelsRes.json();
            if (reelsJson.success) {
                setReels(reelsJson.data);
            }
        } catch {
            setError('Network error. Showing cached data.');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
        const interval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const filteredAds = ads.filter(ad => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase();
        return (
            ad.pageName.toLowerCase().includes(q) ||
            ad.bodyText.toLowerCase().includes(q) ||
            ad.ctaText.toLowerCase().includes(q) ||
            ad.improvementScope.toLowerCase().includes(q)
        );
    });

    if (loading) return <LoadingScreen />;

    const formatTime = (d: Date) =>
        d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

    return (
        <div className="flex flex-col h-screen overflow-hidden" style={{ background: 'var(--bg-primary)' }}>

            {/* ── Top Header Bar ── */}
            <header
                className="flex items-center justify-between px-6 py-3 flex-shrink-0"
                style={{
                    background: 'var(--bg-secondary)',
                    borderBottom: '1px solid var(--border-color)',
                    height: '60px',
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-3">
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--accent-primary)' }}
                    >
                        <Brain size={18} className="text-white" />
                    </div>
                    <div>
                        <div className="text-sm font-bold leading-tight" style={{ color: 'var(--text-primary)' }}>Meta Ads</div>
                        <div className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                            Competitor Intelligence
                        </div>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative flex-1 max-w-lg mx-8">
                    <Search
                        size={15}
                        className="absolute left-3 top-1/2 -translate-y-1/2"
                        style={{ color: 'var(--text-muted)' }}
                    />
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all"
                        style={{
                            background: 'var(--bg-primary)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-primary)',
                        }}
                    />
                </div>

                {/* Tabs navigation */}
                <div className="flex items-center gap-1 mr-6 p-1 rounded-xl" style={{ background: 'rgba(243, 244, 246, 0.8)', border: '1px solid var(--border-color)' }}>
                    <button
                        onClick={() => setActiveTab('ads')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'ads' ? 'bg-white shadow-sm border border-gray-200 text-gray-900 text-blue-600' : 'text-gray-500 hover:text-gray-900 border border-transparent'}`}
                    >
                        Ads Intelligence
                    </button>
                    <button
                        onClick={() => setActiveTab('reels')}
                        className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'reels' ? 'bg-white shadow-sm border border-gray-200 text-gray-900 text-blue-600' : 'text-gray-500 hover:text-gray-900 border border-transparent'}`}
                    >
                        Top Reels
                    </button>
                </div>

                {/* Right actions */}
                <div className="flex items-center gap-4">
                    {error && (
                        <div className="flex items-center gap-1.5 text-xs text-amber-400">
                            <AlertCircle size={13} />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Live tracking badge */}
                    <div
                        className="flex items-center gap-2 px-3 py-1.5 rounded-full"
                        style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.15)' }}
                    >
                        <Zap size={12} style={{ color: 'var(--accent-primary)' }} />
                        <span className="text-xs font-semibold" style={{ color: 'var(--text-primary)' }}>{activeTab === 'ads' ? ads.length : reels.length}</span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{activeTab === 'ads' ? 'ads' : 'reels'} tracked</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse ml-1" />
                    </div>

                    {/* Last refresh */}
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Updated {formatTime(lastRefresh)}
                    </span>

                    {activeTab === 'ads' ? (
                        <button
                            onClick={() => setShowLibraryForm(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                            style={{
                                background: 'white',
                                border: '1px solid var(--border-color)',
                                color: 'var(--text-primary)'
                            }}
                        >
                            <Plus size={14} />
                            <span>Ads Library</span>
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowExtractor(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-white font-medium transition-all btn-primary"
                        >
                            <Plus size={14} />
                            <span>Find Top Reels</span>
                        </button>
                    )}

                    {/* Refresh Button */}
                    <button
                        onClick={fetchData}
                        disabled={refreshing}
                        className="p-2 rounded-lg transition-all btn-ghost"
                        title="Refresh data"
                    >
                        <RefreshCw
                            size={16}
                            className={refreshing ? 'animate-spin' : ''}
                            style={{ color: 'var(--text-secondary)' }}
                        />
                    </button>
                </div>
            </header>

            {/* ── Main Content ── */}
            <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--bg-primary)' }}>
                {activeTab === 'ads' ? (
                    <AdsTable
                        ads={filteredAds}
                        onSelectAd={setSelectedAd}
                        title="Competitor Ads Intelligence"
                    />
                ) : (
                    <ReelsTable reels={reels} />
                )}
            </main>

            {/* ── Ad Detail Side Panel ── */}
            {selectedAd && (
                <AdDetailPanel
                    ad={selectedAd}
                    onClose={() => setSelectedAd(null)}
                />
            )}

            {/* ── Extractor Form Modal ── */}
            {showExtractor && (
                <CompetitorTopVideoAdsForm
                    onClose={() => setShowExtractor(false)}
                />
            )}

            {/* ── Ads Library Form Modal ── */}
            {showLibraryForm && (
                <CompetitorAdsLibraryForm
                    onClose={() => setShowLibraryForm(false)}
                />
            )}
        </div>
    );
}
