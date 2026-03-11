'use client';

import { useState } from 'react';
import { Brain, RefreshCw, Download, Wand2, Upload, Loader2, Image as ImageIcon } from 'lucide-react';

export default function AICreativeGenerator() {
    const [creativeForm, setCreativeForm] = useState({ productName: '', productTagline: '', productCategory: '', highlightedBenefit: '', imageBase64: '' });
    const [creatives, setCreatives] = useState<any[]>([]);
    const [generatingCreatives, setGeneratingCreatives] = useState(false);

    const handleGenerateCreatives = async () => {
        setGeneratingCreatives(true);
        try {
            const res = await fetch('/api/generate-creatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(creativeForm)
            });
            const data = await res.json();
            if (data.success) {
                setCreatives(data.creatives);
            }
        } catch (e) {
        } finally {
            setGeneratingCreatives(false);
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setCreativeForm(prev => ({ ...prev, imageBase64: reader.result as string }));
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="w-full h-full p-8 overflow-y-auto" style={{ background: 'var(--bg-primary)' }}>
            <div className="max-w-6xl mx-auto space-y-8 pb-12">
                <div className="flex flex-col gap-2">
                    <h1 className="text-2xl font-bold text-[#111827]">AI Creative Generator</h1>
                    <p className="text-[#6B7280]">Generate Meta Ad Creatives strictly tailored to luxury, minimal brand aesthetics.</p>
                </div>

                {/* Creative Concepts & Generator Form Split */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* Product Input Panel */}
                    <div className="lg:col-span-1 space-y-4">
                        <div className="bg-white p-5 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
                            <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2"><ImageIcon size={16} /> 1. Input Panel</h2>

                            <div>
                                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Product Name</label>
                                <input value={creativeForm.productName} onChange={e => setCreativeForm({ ...creativeForm, productName: e.target.value })} placeholder="RadianceGlow Face Serum" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-sm text-[#111827]" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Tagline</label>
                                <input value={creativeForm.productTagline} onChange={e => setCreativeForm({ ...creativeForm, productTagline: e.target.value })} placeholder="Pure luxury in a drop." className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-sm text-[#111827]" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Category</label>
                                <input value={creativeForm.productCategory} onChange={e => setCreativeForm({ ...creativeForm, productCategory: e.target.value })} placeholder="Premium Skincare" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-sm text-[#111827]" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#6B7280] mb-1">Highlighted Benefit</label>
                                <input value={creativeForm.highlightedBenefit} onChange={e => setCreativeForm({ ...creativeForm, highlightedBenefit: e.target.value })} placeholder="Instant glass-skin hydration" className="w-full px-3 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-sm text-[#111827]" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-[#6B7280] mb-2">Upload Product Image</label>
                                <div className="border-2 border-dashed border-[#E5E7EB] rounded-xl p-4 text-center hover:bg-gray-50 transition-colors w-full cursor-pointer relative">
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    {creativeForm.imageBase64 ? (
                                        <div className="flex flex-col items-center gap-2">
                                            <img src={creativeForm.imageBase64} alt="Preview" className="h-16 w-16 object-cover rounded-lg border border-gray-200" />
                                            <span className="text-xs text-[#10b981] font-medium">Image active</span>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center gap-2 justify-center py-2">
                                            <Upload size={20} className="text-[#9CA3AF]" />
                                            <span className="text-xs text-[#6B7280]">Select Image</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button
                                    onClick={handleGenerateCreatives}
                                    disabled={generatingCreatives || !creativeForm.productName}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#2563EB] text-white rounded-lg text-sm font-bold hover:bg-[#1D4ED8] disabled:opacity-50 transition-all shadow-sm"
                                >
                                    {generatingCreatives ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
                                    {generatingCreatives ? 'Generating...' : 'Generate Creatives'}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Generated Creatives Gallery & Concepts Panel */}
                    <div className="lg:col-span-3 space-y-6">

                        {creatives.length > 0 ? (
                            <>
                                {/* Display concepts output */}
                                <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm mb-6">
                                    <h2 className="text-sm font-bold text-[#111827] flex items-center gap-2 mb-4">
                                        <Brain size={16} className="text-[#2563EB]" />
                                        Active Creative Concepts (Gemini Director Output)
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        {creatives.map((c, i) => (
                                            <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                                                <span className="font-bold text-[#111827] block mb-2">{c.purpose}</span>
                                                <ul className="space-y-1 text-[#6B7280]">
                                                    <li><span className="font-medium text-[#4B5563]">Style:</span> {c.lighting}</li>
                                                    <li><span className="font-medium text-[#4B5563]">Set:</span> {c.backgroundTone}</li>
                                                    <li><span className="font-medium text-[#4B5563]">Props:</span> {c.accentProp}</li>
                                                </ul>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Gallery */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    {creatives.map((creative, idx) => (
                                        <div key={idx} className="bg-white rounded-2xl border border-[#E5E7EB] overflow-hidden shadow-sm flex flex-col group">
                                            <div className="relative w-full bg-gray-100 flex items-center justify-center p-0 m-0 overflow-hidden" style={{ aspectRatio: creative.aspectRatio.replace(':', '/') }}>
                                                {creative.imageUrl ? (
                                                    <img
                                                        src={creative.imageUrl}
                                                        alt={creative.purpose}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                    />
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center text-gray-400">
                                                        <ImageIcon size={32} className="mb-2 opacity-50" />
                                                        <span className="text-xs">Image Error</span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3 bg-black/50 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                                                    {creative.purpose}
                                                </div>
                                            </div>

                                            <div className="p-4 flex flex-col justify-between flex-1 border-t border-[#E5E7EB]">
                                                <div className="mb-4">
                                                    <h3 className="text-sm font-bold text-[#111827] mb-1 line-clamp-1">{creative.overlayText}</h3>
                                                    <p className="text-xs text-[#6B7280] line-clamp-2">Camera: {creative.cameraAngle} on {creative.surfaceType}</p>
                                                </div>
                                                <div className="flex gap-2 w-full mt-auto">
                                                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] rounded-lg text-xs font-semibold transition-colors">
                                                        <RefreshCw size={14} /> Regenerate
                                                    </button>
                                                    <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#111827] hover:bg-black text-white rounded-lg text-xs font-semibold transition-colors">
                                                        <Download size={14} /> Download
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                                <Wand2 size={48} className="text-[#9CA3AF] mb-4" />
                                <h3 className="text-lg font-bold text-[#111827]">No Creatives Generated</h3>
                                <p className="text-[#6B7280] text-sm mt-1 max-w-sm">
                                    Fill out the product information on the left and click generate to invoke Gemini and Nano Banana API to render 3 distinct creatives.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
