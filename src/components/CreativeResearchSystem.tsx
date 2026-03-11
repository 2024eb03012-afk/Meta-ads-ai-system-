'use client';

import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Folder, Brain, Lightbulb,
    PenTool, Settings, Plus, Loader2, Target,
    ChevronRight, Play, Edit3, ArrowRight, Save,
    Wand2, Download, RefreshCw, Upload, Image as ImageIcon
} from 'lucide-react';

type CRTab = 'dashboard' | 'projects' | 'research' | 'angles' | 'scripts' | 'creative' | 'settings';

export default function CreativeResearchSystem() {
    const [activeTab, setActiveTab] = useState<CRTab>('dashboard');
    const [stats, setStats] = useState({ projects: 0, angles: 0, scripts: 0 });
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [newProject, setNewProject] = useState({ productName: '', productDescription: '', productNotes: '', brandNarrative: '' });
    const [showNewProject, setShowNewProject] = useState(false);

    // AI Creative Generator state
    const [creativeForm, setCreativeForm] = useState({ productName: '', productTagline: '', productCategory: '', highlightedBenefit: '', imageBase64: '' });
    const [creatives, setCreatives] = useState<any[]>([]);
    const [generatingCreatives, setGeneratingCreatives] = useState(false);

    const activeProject = projects.find(p => p.id === selectedProjectId);

    useEffect(() => {
        fetchStats();
        fetchProjects();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats');
            const data = await res.json();
            setStats(data);
        } catch (e) { }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            const data = await res.json();
            setProjects(data);
        } catch (e) { }
    };

    const fetchProjectDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            const data = await res.json();
            setProjects(prev => prev.map(p => p.id === id ? data : p)); // Update active project with full details
        } catch (e) { }
    };

    const createProject = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProject)
            });
            const data = await res.json();
            setProjects([data, ...projects]);
            setShowNewProject(false);
            setNewProject({ productName: '', productDescription: '', productNotes: '', brandNarrative: '' });
            setSelectedProjectId(data.id);
            setActiveTab('research');
            fetchStats();
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const generateResearch = async () => {
        if (!selectedProjectId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/research', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: selectedProjectId })
            });
            await fetchProjectDetails(selectedProjectId);
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const generateAngles = async () => {
        if (!selectedProjectId) return;
        setLoading(true);
        try {
            const res = await fetch('/api/generate-angles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ projectId: selectedProjectId })
            });
            await fetchProjectDetails(selectedProjectId);
            fetchStats();
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const generateScript = async (angleId: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/generate-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ angleId })
            });
            if (selectedProjectId) await fetchProjectDetails(selectedProjectId);
            fetchStats();
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

    const improveScript = async (scriptId: string, feedback: string) => {
        setLoading(true);
        try {
            const res = await fetch('/api/improve-script', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scriptId, feedback })
            });
            if (selectedProjectId) await fetchProjectDetails(selectedProjectId);
        } catch (e) {
        } finally {
            setLoading(false);
        }
    };

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

    // UI Renders
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: Folder },
        { id: 'research', label: 'Research', icon: Brain },
        { id: 'angles', label: 'Angles', icon: Lightbulb },
        { id: 'scripts', label: 'Scripts', icon: PenTool },
        { id: 'creative', label: 'AI Creative Generator', icon: Wand2 },
        { id: 'settings', label: 'Settings', icon: Settings },
    ] as const;

    return (
        <div className="flex h-full w-full bg-[#F8FAFC]">
            {/* Inner Dashboard Sidebar */}
            <aside className="w-64 bg-white border-r border-[#E5E7EB] flex flex-col">
                <div className="p-4 border-b border-[#E5E7EB]">
                    <h2 className="text-sm font-bold text-[#111827]">Creative AI Studio</h2>
                    <p className="text-xs text-[#6B7280]">Meta Ads Research Pipeline</p>
                </div>
                <nav className="p-3 space-y-1">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === item.id ? 'bg-[#2563EB]/10 text-[#2563EB]' : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'}`}
                        >
                            <item.icon size={16} className={activeTab === item.id ? 'text-[#2563EB]' : 'text-[#9CA3AF]'} />
                            {item.label}
                        </button>
                    ))}
                </nav>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 overflow-y-auto p-8 relative">
                {activeTab === 'dashboard' && (
                    <div className="max-w-4xl mx-auto space-y-6">
                        <h1 className="text-2xl font-bold text-[#111827]">Dashboard Overview</h1>
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { title: 'Total Projects', value: stats.projects, icon: Folder, color: '#2563EB' },
                                { title: 'Angles Generated', value: stats.angles, icon: Lightbulb, color: '#f59e0b' },
                                { title: 'Scripts Generated', value: stats.scripts, icon: PenTool, color: '#10b981' },
                            ].map((stat, i) => (
                                <div key={i} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col">
                                    <div className="flex items-center gap-3 mb-4 text-[#6B7280]">
                                        <stat.icon size={18} style={{ color: stat.color }} />
                                        <span className="text-sm font-medium">{stat.title}</span>
                                    </div>
                                    <span className="text-3xl font-bold text-[#111827]">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'projects' && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-[#111827]">Projects</h1>
                            <button onClick={() => setShowNewProject(true)} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] transition-all">
                                <Plus size={16} /> New Project
                            </button>
                        </div>

                        {showNewProject && (
                            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
                                <h2 className="text-lg font-bold text-[#111827]">Create New Project</h2>
                                <div>
                                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Product Name</label>
                                    <input value={newProject.productName} onChange={e => setNewProject({ ...newProject, productName: e.target.value })} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-[#111827]" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-[#6B7280] mb-1">Product Description</label>
                                    <textarea value={newProject.productDescription} onChange={e => setNewProject({ ...newProject, productDescription: e.target.value })} rows={3} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-[#111827]" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-[#6B7280] mb-1">Product Notes (Optional)</label>
                                        <textarea value={newProject.productNotes} onChange={e => setNewProject({ ...newProject, productNotes: e.target.value })} rows={3} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-[#111827]" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-[#6B7280] mb-1">Brand Narrative (Optional)</label>
                                        <textarea value={newProject.brandNarrative} onChange={e => setNewProject({ ...newProject, brandNarrative: e.target.value })} rows={3} className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-[#111827]" />
                                    </div>
                                </div>
                                <div className="flex gap-2 justify-end pt-2">
                                    <button onClick={() => setShowNewProject(false)} className="px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm font-medium text-[#6B7280] hover:bg-gray-50">Cancel</button>
                                    <button onClick={createProject} disabled={loading || !newProject.productName || !newProject.productDescription} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-50">
                                        {loading ? <Loader2 size={16} className="animate-spin" /> : 'Create & Proceed'}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4 mt-6">
                            {projects.map(p => (
                                <div key={p.id} onClick={() => { setSelectedProjectId(p.id); setActiveTab('research'); fetchProjectDetails(p.id); }} className="bg-white p-5 rounded-xl border border-[#E5E7EB] shadow-sm hover:shadow-md transition-all cursor-pointer group">
                                    <h3 className="font-bold text-[#111827] group-hover:text-[#2563EB]">{p.productName}</h3>
                                    <p className="text-sm text-[#6B7280] mt-1 line-clamp-2">{p.productDescription}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'research' && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        <h1 className="text-2xl font-bold text-[#111827]">Deep Product Research</h1>
                        {!selectedProjectId ? (
                            <p className="text-[#6B7280]">Please select or create a project first.</p>
                        ) : activeProject?.productResearch ? (
                            <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
                                <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-4">
                                    <h2 className="text-lg font-bold text-[#111827]">Perplexity AI Research Profile</h2>
                                    <button onClick={() => setActiveTab('angles')} className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-all">
                                        Generate Angles <ArrowRight size={16} />
                                    </button>
                                </div>
                                <div className="prose prose-sm max-w-none text-[#4B5563] whitespace-pre-wrap">
                                    {activeProject.productResearch}
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                                <Brain size={48} className="text-[#9CA3AF]" />
                                <div>
                                    <h3 className="text-lg font-bold text-[#111827]">Ready to conduct research</h3>
                                    <p className="text-sm text-[#6B7280] max-w-md mx-auto mt-1">We will use Perplexity AI to deeply analyze {activeProject?.productName}, its target audience, pain points, and market positioning.</p>
                                </div>
                                <button onClick={generateResearch} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-50 mt-4">
                                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Run Research Analysis'}
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'angles' && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-[#111827]">Ad Angles & Concepts</h1>
                            {activeProject && activeProject.productResearch && activeProject.angles?.length === 0 && (
                                <button onClick={generateAngles} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-50">
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : 'Generate Marketing Angles'}
                                </button>
                            )}
                        </div>

                        {!selectedProjectId ? (
                            <p className="text-[#6B7280]">Please select a project first.</p>
                        ) : activeProject?.angles?.length > 0 ? (
                            <div className="grid gap-4">
                                {activeProject.angles.map((angle: any) => (
                                    <div key={angle.id} className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col gap-4 relative">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#111827]">{angle.angleHeadline}</h3>
                                            <p className="text-sm text-[#6B7280] mt-1">{angle.conceptSummary}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm mt-2">
                                            <div><span className="font-semibold text-[#111827]">Structure:</span> <span className="text-[#6B7280]">{angle.vslStructure}</span></div>
                                            <div><span className="font-semibold text-[#111827]">Triggers:</span> <span className="text-[#6B7280]">{angle.emotionalTriggers}</span></div>
                                            <div><span className="font-semibold text-[#111827]">Visuals:</span> <span className="text-[#6B7280]">{angle.videoSuggestion}</span></div>
                                            <div><span className="font-semibold text-[#111827]">Techniques:</span> <span className="text-[#6B7280]">{angle.directResponseTechniques}</span></div>
                                        </div>
                                        <div className="pt-4 border-t border-[#E5E7EB] flex justify-end">
                                            <button onClick={() => { generateScript(angle.id); setActiveTab('scripts'); }} disabled={loading} className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white rounded-lg text-sm font-medium hover:bg-[#059669] transition-all disabled:opacity-50">
                                                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Generate VSL Script'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white p-12 rounded-2xl border border-[#E5E7EB] shadow-sm flex flex-col items-center justify-center text-center">
                                <Target size={48} className="text-[#9CA3AF] mb-4" />
                                <p className="text-[#6B7280]">No angles generated yet. Click generate above to use Gemini to draft marketing angles.</p>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'scripts' && (
                    <div className="max-w-5xl mx-auto space-y-6">
                        <h1 className="text-2xl font-bold text-[#111827]">Script Generation & Refinement</h1>
                        {!selectedProjectId ? (
                            <p className="text-[#6B7280]">Please select a project first.</p>
                        ) : activeProject?.angles?.map((angle: any) => angle.scripts?.map((script: any) => (
                            <div key={script.id} className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden mb-6">
                                <div className="bg-[#F8FAFC] px-6 py-4 border-b border-[#E5E7EB]">
                                    <h3 className="text-sm font-bold text-[#2563EB] uppercase tracking-wider">Based on Angle: {angle.angleHeadline}</h3>
                                </div>
                                <div className="p-6">
                                    <div className="prose prose-sm max-w-none text-[#4B5563] whitespace-pre-wrap font-medium leading-relaxed bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                                        {script.scriptText}
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-[#E5E7EB]">
                                        <h4 className="text-sm font-bold text-[#111827] mb-2 flex items-center gap-2"><Edit3 size={16} /> AI Script Assistant (Iteration)</h4>
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                id={`feedback-${script.id}`}
                                                placeholder="e.g. Make the hook more aggressive, shorten the body to 15 seconds..."
                                                className="flex-1 px-4 py-2 border border-[#E5E7EB] rounded-lg outline-none focus:border-[#2563EB] text-sm text-[#111827]"
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        improveScript(script.id, e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                            <button
                                                onClick={(e) => {
                                                    const input = document.getElementById(`feedback-${script.id}`) as HTMLInputElement;
                                                    if (input.value) {
                                                        improveScript(script.id, input.value);
                                                        input.value = '';
                                                    }
                                                }}
                                                disabled={loading}
                                                className="px-4 py-2 bg-[#2563EB] text-white rounded-lg text-sm font-medium hover:bg-[#1D4ED8] disabled:opacity-50 flex items-center gap-2"
                                            >
                                                {loading ? <Loader2 size={16} className="animate-spin" /> : 'Improve'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )))}
                    </div>
                )}

                {activeTab === 'creative' && (
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
                )}

                {activeTab === 'settings' && (
                    <div className="max-w-3xl mx-auto space-y-6">
                        <h1 className="text-2xl font-bold text-[#111827]">Settings</h1>
                        <div className="bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-sm space-y-4">
                            <p className="text-sm text-[#6B7280] mb-4">API keys are securely loaded from backend environment variables for this deployment.</p>
                            <div>
                                <label className="block text-sm font-medium text-[#111827] mb-1">Perplexity API Key</label>
                                <input disabled value="****************************************" className="w-full px-4 py-2 border border-[#E5E7EB] bg-gray-50 rounded-lg outline-none text-[#6B7280]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#111827] mb-1">Gemini API Key</label>
                                <input disabled value="****************************************" className="w-full px-4 py-2 border border-[#E5E7EB] bg-gray-50 rounded-lg outline-none text-[#6B7280]" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-[#111827] mb-1">Nano Banana Image API Key</label>
                                <input disabled value="****************************************" className="w-full px-4 py-2 border border-[#E5E7EB] bg-gray-50 rounded-lg outline-none text-[#6B7280]" />
                            </div>
                            <button disabled className="mt-2 px-4 py-2 bg-gray-200 text-gray-500 rounded-lg text-sm font-medium">Locked (Env Controlled)</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
