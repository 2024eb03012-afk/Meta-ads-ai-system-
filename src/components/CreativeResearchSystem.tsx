'use client';

import { useState, useEffect } from 'react';
import {
    LayoutDashboard, Folder, Brain, Lightbulb,
    PenTool, Settings, Plus, Loader2, Target,
    ChevronRight, Play, Edit3, ArrowRight, Save
} from 'lucide-react';

type CRTab = 'dashboard' | 'projects' | 'research' | 'angles' | 'scripts' | 'settings';

export default function CreativeResearchSystem() {
    const [activeTab, setActiveTab] = useState<CRTab>('dashboard');
    const [stats, setStats] = useState({ projects: 0, angles: 0, scripts: 0 });
    const [projects, setProjects] = useState<any[]>([]);
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const [newProject, setNewProject] = useState({ productName: '', productDescription: '', productNotes: '', brandNarrative: '' });
    const [showNewProject, setShowNewProject] = useState(false);

    const activeProject = projects.find(p => p.id === selectedProjectId);

    useEffect(() => {
        fetchStats();
        fetchProjects();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await fetch('/api/stats');
            if (!res.ok) return;
            const data = await res.json();
            if (data && typeof data === 'object') setStats(data);
        } catch (e) {
            console.error('Stats fetch failed', e);
        }
    };

    const fetchProjects = async () => {
        try {
            const res = await fetch('/api/projects');
            if (!res.ok) return;
            const data = await res.json();
            if (Array.isArray(data)) setProjects(data);
        } catch (e) {
            console.error('Projects fetch failed', e);
        }
    };

    const fetchProjectDetails = async (id: string) => {
        try {
            const res = await fetch(`/api/projects/${id}`);
            if (!res.ok) return;
            const data = await res.json();
            if (data && data.id) {
                setProjects(prev => prev.map(p => p.id === id ? data : p));
            }
        } catch (e) {
            console.error('Project details fetch failed', e);
        }
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

    // UI Renders
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'projects', label: 'Projects', icon: Folder },
        { id: 'research', label: 'Research', icon: Brain },
        { id: 'angles', label: 'Angles', icon: Lightbulb },
        { id: 'scripts', label: 'Scripts', icon: PenTool },
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
