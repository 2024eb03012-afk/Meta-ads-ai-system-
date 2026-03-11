'use client';

import { Brain } from 'lucide-react';

export default function LoadingScreen() {
    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center gap-6"
            style={{ background: 'var(--bg-primary)' }}
        >
            {/* Animated Logo */}
            <div className="relative">
                <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{
                        background: 'linear-gradient(135deg, #1877F2, #7C3AED)',
                        boxShadow: '0 0 40px rgba(99,102,241,0.4)',
                        animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }}
                >
                    <Brain size={36} className="text-white" />
                </div>
                {/* Rotating ring */}
                <div
                    className="absolute inset-0 rounded-2xl border-2 border-indigo-500/30"
                    style={{
                        animation: 'spin 3s linear infinite',
                        borderTopColor: '#6366f1',
                    }}
                />
            </div>

            {/* Title */}
            <div className="text-center">
                <h1 className="text-2xl font-bold text-white mb-1">Meta Ads Intelligence</h1>
                <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    Loading competitor intelligence data...
                </p>
            </div>

            {/* Loading Bars */}
            <div className="flex items-end gap-1.5 h-8">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div
                        key={i}
                        className="w-2 rounded-full"
                        style={{
                            background: 'var(--accent-primary)',
                            animation: `bounce 1.2s ease-in-out ${i * 0.15}s infinite alternate`,
                            height: `${20 + Math.random() * 12}px`,
                        }}
                    />
                ))}
            </div>

            {/* Status text */}
            <div
                className="text-xs px-4 py-2 rounded-full"
                style={{
                    background: 'rgba(99,102,241,0.1)',
                    border: '1px solid rgba(99,102,241,0.2)',
                    color: 'var(--accent-secondary)',
                }}
            >
                Fetching real-time data from Google Sheets
            </div>

            <style jsx>{`
        @keyframes bounce {
          from { transform: scaleY(0.5); opacity: 0.5; }
          to { transform: scaleY(1); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
