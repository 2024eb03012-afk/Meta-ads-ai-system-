import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';

interface Props {
    onClose: () => void;
}

export default function CompetitorAdsLibraryForm({ onClose }: Props) {
    const [adsLibraryLink, setAdsLibraryLink] = useState('');
    const [keywords, setKeywords] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const formData = new FormData();
            formData.append('adsLibraryLink', adsLibraryLink);
            formData.append('keywords', keywords);
            formData.append('timestamp', new Date().toISOString());

            const response = await fetch('https://n8n.smallgrp.com/webhook/725993f0-96a0-44d7-9cf0-f5e7ed9649d4', {
                method: 'POST',
                body: formData,
                mode: 'no-cors' // Webhook might not support CORS for this origin
            });

            setSuccess(true);
            setTimeout(() => {
                onClose();
            }, 2000);
        } catch (err) {
            setError('Failed to submit. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="w-full max-w-md p-6 rounded-2xl shadow-xl" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>Competitor Ads Library</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 transition">
                        <X size={20} style={{ color: 'var(--text-muted)' }} />
                    </button>
                </div>

                {success ? (
                    <div className="p-4 mb-4 text-green-700 bg-green-50 rounded-xl border border-green-200 text-center text-sm font-medium">
                        Link submitted successfully!
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Competitor Ads Library Link</label>
                            <input
                                type="url"
                                required
                                value={adsLibraryLink}
                                onChange={(e) => setAdsLibraryLink(e.target.value)}
                                placeholder="https://www.facebook.com/ads/library/..."
                                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>Keywords <span className="text-[10px] opacity-70">(Coming Soon)</span></label>
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                placeholder="any keywords (coming soon)"
                                className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
                                style={{
                                    background: 'var(--bg-primary)',
                                    border: '1px solid var(--border-color)',
                                    color: 'var(--text-primary)',
                                }}
                            />
                        </div>

                        {error && (
                            <div className="text-sm font-medium text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-2.5 px-4 rounded-xl text-sm font-medium text-white transition-all flex justify-center items-center gap-2 mt-4 btn-primary"
                            style={{ opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : 'Submit Link'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
