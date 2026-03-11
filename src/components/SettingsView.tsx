'use client';

import { useState } from 'react';
import { RefreshCw, Database, Globe, Clock, Shield, ExternalLink, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';

interface Props {
    onRefresh: () => void;
    lastRefresh: Date;
}

export default function SettingsView({ onRefresh, lastRefresh }: Props) {
    const [refreshInterval, setRefreshInterval] = useState('5');
    const [sheetUrl] = useState('https://docs.google.com/spreadsheets/d/1aMyV8XguD0wUltkvGzm1rLq3kvpwT4Vt3Z0aLAhgNQE');
    const [copied, setCopied] = useState(false);
    const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

    const handleTestConnection = async () => {
        setTestStatus('testing');
        try {
            const res = await fetch('/api/ads');
            const data = await res.json();
            setTestStatus(data.success ? 'success' : 'error');
        } catch {
            setTestStatus('error');
        }
        setTimeout(() => setTestStatus('idle'), 3000);
    };

    const copySheetUrl = () => {
        navigator.clipboard.writeText(sheetUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 animate-fade-in max-w-3xl">
            <div>
                <h1 className="text-xl font-bold text-white">Settings</h1>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                    Configure your data source and dashboard preferences
                </p>
            </div>

            {/* Data Source */}
            <div
                className="p-5 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Database size={16} className="text-indigo-400" />
                    <h2 className="text-sm font-bold text-white">Data Source Configuration</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Google Sheet URL
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={sheetUrl}
                                readOnly
                                className="flex-1 px-3 py-2 rounded-lg text-sm"
                                style={{
                                    background: 'var(--bg-secondary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-secondary)',
                                    fontFamily: 'monospace',
                                }}
                            />
                            <button
                                onClick={copySheetUrl}
                                className="px-3 py-2 rounded-lg text-sm btn-ghost"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                {copied ? '✓' : 'Copy'}
                            </button>
                            <a
                                href={sheetUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm btn-ghost"
                                style={{ color: 'var(--text-secondary)' }}
                            >
                                <ExternalLink size={13} />
                                Open
                            </a>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTestConnection}
                            disabled={testStatus === 'testing'}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium btn-primary text-white disabled:opacity-60"
                        >
                            {testStatus === 'testing' ? (
                                <RefreshCw size={14} className="animate-spin" />
                            ) : testStatus === 'success' ? (
                                <CheckCircle size={14} />
                            ) : (
                                <Globe size={14} />
                            )}
                            {testStatus === 'testing' ? 'Testing...' : testStatus === 'success' ? 'Connected!' : 'Test Connection'}
                        </button>

                        {testStatus === 'success' && (
                            <div className="flex items-center gap-1.5 text-sm text-emerald-400">
                                <CheckCircle size={14} />
                                Successfully connected to Google Sheets
                            </div>
                        )}
                        {testStatus === 'error' && (
                            <div className="text-sm" style={{ color: '#f87171' }}>
                                Connection failed — using cached data
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Refresh Settings */}
            <div
                className="p-5 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={16} className="text-indigo-400" />
                    <h2 className="text-sm font-bold text-white">Auto-Refresh Settings</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>
                            Refresh Interval
                        </label>
                        <div className="flex gap-2">
                            {['1', '5', '10', '30'].map(mins => (
                                <button
                                    key={mins}
                                    onClick={() => setRefreshInterval(mins)}
                                    className="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                                    style={{
                                        background: refreshInterval === mins ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                                        border: `1px solid ${refreshInterval === mins ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                                        color: refreshInterval === mins ? 'white' : 'var(--text-secondary)',
                                    }}
                                >
                                    {mins}m
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-white font-medium">Last refreshed</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                {format(lastRefresh, 'MMMM dd, yyyy HH:mm:ss')}
                            </p>
                        </div>
                        <button
                            onClick={onRefresh}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium btn-primary text-white"
                        >
                            <RefreshCw size={14} />
                            Refresh Now
                        </button>
                    </div>
                </div>
            </div>

            {/* Top Performing Threshold */}
            <div
                className="p-5 rounded-xl"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
            >
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={16} className="text-amber-400" />
                    <h2 className="text-sm font-bold text-white">Intelligence Rules</h2>
                </div>
                <div className="space-y-3">
                    <div
                        className="flex items-center justify-between p-3 rounded-xl"
                        style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
                    >
                        <div>
                            <p className="text-sm text-white font-medium">Top Performing Threshold</p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                                Ads running longer than this are flagged as "Top Performing"
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                defaultValue={30}
                                min={1}
                                max={365}
                                className="w-16 px-3 py-1.5 rounded-lg text-sm text-center"
                                style={{
                                    background: 'var(--bg-card)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                            <span className="text-sm" style={{ color: 'var(--text-muted)' }}>days</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* About */}
            <div
                className="p-5 rounded-xl"
                style={{
                    background: 'linear-gradient(135deg, rgba(99,102,241,0.08), rgba(124,58,237,0.05))',
                    border: '1px solid rgba(99,102,241,0.2)',
                }}
            >
                <h2 className="text-sm font-bold text-white mb-3">About Meta Ads Intelligence</h2>
                <div className="space-y-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                    <p>• Real-time data fetched from your Google Sheet every {refreshInterval} minutes</p>
                    <p>• Ads running 30+ days are automatically flagged as "Top Performing"</p>
                    <p>• Ad duration calculated as End Date minus Start Date</p>
                    <p>• Active ads are those without an end date or with future end dates</p>
                    <p>• All data is processed client-side; no data is stored on external servers</p>
                </div>
                <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(99,102,241,0.2)' }}>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        Version 1.0 • Built with Next.js, Tailwind CSS, Recharts • Data from Google Sheets
                    </p>
                </div>
            </div>
        </div>
    );
}
