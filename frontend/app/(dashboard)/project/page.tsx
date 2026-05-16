"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Plus, 
  Search, 
  Database, 
  FileText, 
  Globe, 
  Link as LinkIcon, 
  Play, 
  ArrowRight,
  MoreVertical,
  X,
  Check,
  Sparkles,
  GitBranch,
  Trash2,
  Loader2,
  Settings,
  ChevronDown,
  ChevronUp,
  Minimize2,
  Maximize2,
  Copy,
  History,
  Box
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { AddSourceModal } from "@/components/AddSourceModal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ViewSourceModal } from "@/components/ViewSourceModal";

import { MarkdownRenderer } from "@/components/MarkdownRenderer";

// Data Visualization
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Brutalist Bento Item Component from bundle
function BentoItem({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <div className={cn(
      "relative border-4 border-black bg-stone-100 p-6 transition-all duration-200 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]",
      "hover:shadow-[inset_8px_8px_0px_rgba(0,0,0,0.2)] hover:scale-[0.98]",
      "cursor-pointer",
      className
    )}>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}

// Source Item Component from bundle (adapted for logic)
function SourceItem({ icon, title, subtitle, status, isSelected, onSelect, onRemove, onView, progress }: any) {
  return (
    <div 
      className={cn(
        "border-b-2 border-black last:border-b-0 py-4 px-2 group transition-all cursor-pointer",
        isSelected ? "bg-black/5" : "bg-transparent"
      )}
      onClick={onSelect}
    >
      <div className="flex items-start gap-4">
        <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center border-2 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] group-hover:bg-cyan-300 transition-colors">
          {icon}
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <h4 className="font-black text-sm uppercase truncate font-mono tracking-tighter">{title}</h4>
          <p className="text-[10px] text-stone-500 font-bold uppercase truncate font-mono tracking-widest">{subtitle}</p>
          <div className="mt-3 flex items-center gap-2">
            <Badge className={cn(
              "border-2 border-black px-2 py-0 text-[10px] font-black uppercase tracking-tighter hover:shadow-none transition-all",
              status === "ready" ? "bg-emerald-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "bg-amber-300 text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            )}>
              {status}
            </Badge>
            {progress !== undefined && (
              <span className="text-[10px] font-black font-mono bg-black text-white px-1 tracking-tighter">{progress}%</span>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button 
             onClick={(e) => { e.stopPropagation(); onView(); }}
             className="p-2 bg-cyan-300 hover:bg-black hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
             title="VIEW TEXT"
          >
            <Search size={16} />
          </button>
          <button 
             onClick={(e) => { e.stopPropagation(); onRemove(); }}
             className="p-2 bg-red-400 hover:bg-black hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-all"
             title="REMOVE"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ChartRenderer({ data, type = 'bar' }: { data: any[], type?: string }) {
  const COLORS = ['#22d3ee', '#fbbf24', '#f472b6', '#a7f3d0', '#000000'];
  
  return (
    <div className="h-[400px] w-full my-8 border-4 border-black bg-stone-50 p-6 shadow-[12px_12px_0_rgba(0,0,0,1)] relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-3 bg-black text-white text-[10px] font-black uppercase tracking-widest z-10 transition-transform group-hover:-translate-y-full">DATA_VISUAL_STREAM</div>
      <ResponsiveContainer width="100%" height="100%">
        {type === 'bar' ? (
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" axisLine={{ stroke: '#000', strokeWidth: 4 }} tick={{ fontWeight: 'black', fontSize: 10 }} />
            <YAxis axisLine={{ stroke: '#000', strokeWidth: 4 }} tick={{ fontWeight: 'black', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#000', border: '4px solid #000', color: '#fff', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px' }} />
            <Legend wrapperStyle={{ fontWeight: 'black', fontSize: '10px', textTransform: 'uppercase', paddingTop: '20px' }} />
            <Bar dataKey="value" fill="#000" radius={[0, 0, 0, 0]} stroke="#000" strokeWidth={2} />
          </BarChart>
        ) : type === 'pie' ? (
          <PieChart>
            <Pie
              data={data}
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="#000" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ background: '#000', border: '4px solid #000', color: '#fff', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px' }} />
            <Legend />
          </PieChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
            <XAxis dataKey="name" axisLine={{ stroke: '#000', strokeWidth: 4 }} tick={{ fontWeight: 'black', fontSize: 10 }} />
            <YAxis axisLine={{ stroke: '#000', strokeWidth: 4 }} tick={{ fontWeight: 'black', fontSize: 10 }} />
            <Tooltip contentStyle={{ background: '#000', border: '4px solid #000', color: '#fff', fontWeight: '900', textTransform: 'uppercase', fontSize: '12px' }} />
            <Legend />
            <Line type="monotone" dataKey="value" stroke="#000" strokeWidth={6} dot={{ r: 8, fill: '#000', stroke: '#fff', strokeWidth: 4 }} activeDot={{ r: 12, fill: '#fbbf24', stroke: '#000' }} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

export default function ProjectDashboard() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id");
  const [projectName, setProjectName] = useState<string | null>(null);
  
  const [sources, setSources] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState("hybrid");
  const [showAddSource, setShowAddSource] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedSource, setSelectedSource] = useState<any>(null);
  const [ingesting, setIngesting] = useState(false);
  const [showPlan, setShowPlan] = useState(false);
  const [showSteps, setShowSteps] = useState(false);
  const [isPromptMinimized, setIsPromptMinimized] = useState(false);
  const [activeTab, setActiveTab] = useState("directives");
  const [sourceSearch, setSourceSearch] = useState("");
  const [userStatus, setUserStatus] = useState<any>(null);

  useEffect(() => {
    fetchSources();
    fetchUserStatus();
  }, [projectId]);

  const fetchUserStatus = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/chat/orchestrate`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: "PING_STATUS",
            user_id: "d34f2b93-0398-46f3-a195-73b82f531b19" // Mock user_id for now
          }),
      });
      const data = await response.json();
      if (data.user_status) setUserStatus(data.user_status);
    } catch (e) {
      console.error("Failed to fetch user status", e);
    }
  };

  const fetchProjectDetails = async () => {
     try {
        const { data, error } = await supabase.from("projects").select("name").eq("id", projectId).single();
        if (data) setProjectName(data.name);
     } catch (e) { console.error(e); }
  };

  const fetchSources = async () => {
    try {
      console.log(`[Dashboard] Fetching sources for project: ${projectId}`);
      const query = supabase.from("knowledge_base").select("*");
      
      if (projectId && projectId !== "null") {
        query.eq("project_id", projectId);
      } else {
        query.is("project_id", null);
      }
      
      const { data, error } = await query.order("created_at", { ascending: false });
      
      if (error) {
        console.error("[Dashboard] Supabase Fetch Error:", error);
        return;
      }
      
      if (data) {
        console.log(`[Dashboard] Received ${data.length} sources from DB.`);
        setSources(data.map((s: any) => {
          // Robust title fallback logic
          const metaTitle = s.metadata?.title || s.metadata?.source;
          const contentSnippet = (s.content || s.raw_content || "").substring(0, 30);
          
          return {
            id: s.id,
            title: s.title || metaTitle || contentSnippet || "Untitled Knowledge",
            type: s.metadata?.type || s.source || "file",
            status: "ready",
            url: s.metadata?.url || s.metadata?.file_path,
            isSelected: true
          };
        }));
      }
    } catch (e) { 
      console.error("[Dashboard] fetchSources unexpected error:", e);
    }
  };

  const handleViewSource = async (sourceId: string) => {
    try {
      const resp = await fetch(`http://127.0.0.1:8000/api/v1/ingest/source/${sourceId}`);
      if (resp.ok) {
        const data = await resp.json();
        setSelectedSource(data);
        setShowViewModal(true);
      }
    } catch (e) {
      alert(`SOURCE_FETCH_ERROR: ${e}`);
    }
  };

  const toggleSourceSelection = (id: string) => {
    setSources(prev => prev.map(s => s.id === id ? { ...s, isSelected: !s.isSelected } : s));
  };

  const removeSource = async (id: string) => {
     try {
        await supabase.from("knowledge_base").delete().eq("id", id);
        fetchSources();
     } catch (e) { console.error(e); }
  };

  const handleMainSearch = async (overrideQuery?: any) => {
    if (loading || ingesting) return;
    
    // If overrideQuery is a MouseEvent or other object, ignore it and use the state query
    const finalQuery = (typeof overrideQuery === "string" ? overrideQuery : query) || "";
    if (!finalQuery.trim()) return;
    setLoading(true);
    setResult(null);
    setError(null);
    setShowPlan(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/chat/orchestrate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: finalQuery,
          mode: mode,
          project_id: projectId,
          limit: 10
        }),
      });
      if (!response.ok) throw new Error("Synthesis failed");
      const data = await response.json();
      setResult(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickIngest = async () => {
    if (!sourceSearch.trim() || ingesting || loading) return;
    setIngesting(true);
    setError(null);
    
    try {
      // Auto-detect type: If search is query, its probably web or arxiv.
      // We will default to a 'Hybrid Ingest' which searches first.
      const type = sourceSearch.includes('.') ? 'url' : 'arxiv';
      const payload = type === 'url' ? { url: sourceSearch } : { url: sourceSearch };

      const url = new URL(`http://127.0.0.1:8000/api/v1/ingest/${type}`);
      if (projectId) url.searchParams.append("project_id", projectId);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, project_id: projectId }),
      });

      if (!response.ok) throw new Error("INGESTION_FAILURE");
      
      setSourceSearch("");
      // Immediate refresh + 1s delayed refresh for extra safety (Supabase consistency)
      await fetchSources();
      setTimeout(fetchSources, 1500);
    } catch (e: any) {
      setError(`AUTO_INGEST_ERROR: ${e.message}`);
    } finally {
      setIngesting(false);
      fetchUserStatus();
    }
  };

  const handleAutoUplink = async (query: string) => {
    setIngesting(true);
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/ingest/auto`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query, 
          project_id: projectId,
          user_id: "d34f2b93-0398-46f3-a195-73b82f531b19" 
        }),
      });
      if (response.ok) await fetchSources();
    } catch (e) {
      console.error("Auto-uplink failed", e);
    } finally {
      setIngesting(false);
      fetchUserStatus();
    }
  };

  const handleFileUpload = async (file: File) => {
    setIngesting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      
      const url = new URL(`http://127.0.0.1:8000/api/v1/ingest/file`);
      if (projectId) url.searchParams.append("project_id", projectId);

      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData,
      });
      if (response.ok) fetchSources();
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setIngesting(false);
      fetchUserStatus();
    }
  };

  const handleWebSearch = async (query: string) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/ingest/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!response.ok) throw new Error("Search failed");
      const data = await response.json();
      return data.results || [];
    } catch (e) {
      console.error("Web search failed", e);
      return [];
    }
  };

  const handleIngest = async (type: string, payload: any) => {
    setIngesting(true);
    setError(null);
    try {
      const url = new URL(`http://127.0.0.1:8000/api/v1/ingest/${type}`);
      if (projectId) url.searchParams.append("project_id", projectId);

      const response = await fetch(url.toString(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...payload,
          project_id: projectId
        }),
      });
      
      if (!response.ok) {
        const errData = await response.json().catch(() => ({ detail: "Unknown ingestion failure" }));
        throw new Error(errData.detail || `Ingestion failed (${response.status})`);
      }
      
      await fetchSources();
    } catch (e: any) {
      console.error(`Ingest Error (${type}):`, e);
      setError(e.message);
    } finally {
      setIngesting(false);
      fetchUserStatus();
    }
  };

  const getSourceIcon = (type: string) => {
    switch (type) {
      case "youtube": return <Play size={20} />;
      case "github": return <GitBranch size={20} />;
      case "web": return <Globe size={20} />;
      default: return <FileText size={20} />;
    }
  };

  return (
    <div className="h-screen bg-[#f1f1f1] font-mono text-black selection:bg-[#00ffa3] selection:text-black flex overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 md:p-12 custom-scrollbar relative">
        <div className="mx-auto max-w-[1600px]">
          {/* Header Section with V3 Aesthetic */}
          <div className="mb-14">
            <div className="flex items-center gap-10">
               <Logo className="scale-125 origin-left" iconSize={32} />
                <div className="ml-10 flex-1 flex justify-between items-end">
                   <div>
                      <h1 className="text-[70px] font-[1000] tracking-tighter uppercase leading-[0.8] mb-4">{projectName || "PROJECT_CONSOLE"}</h1>
                      <div className="bg-[#ffff00] border-4 border-black px-6 py-2 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                         <p className="font-black text-xl uppercase tracking-[0.1em] leading-none text-black">SECURE MULTI-MODAL INTELLIGENCE ORCHESTRATOR</p>
                      </div>
                   </div>

                   {/* User Status Widget */}
                   <div className="flex gap-4 mb-4">
                      <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_rgba(0,0,0,1)] flex flex-col min-w-[200px]">
                         <span className="text-[10px] font-black uppercase text-stone-500 tracking-widest mb-1">CREDIT_BALANCE</span>
                         <div className="flex items-center justify-between">
                            <span className="text-3xl font-[1000] tracking-tighter">{userStatus?.credits ?? "--"}</span>
                            <Badge className="bg-emerald-400 text-black border-2 border-black font-black text-[10px]">{userStatus?.plan ?? "BETA"}_PHASE</Badge>
                         </div>
                         <div className="mt-2 h-2 bg-stone-100 border-2 border-black relative overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-emerald-400 transition-all duration-1000"
                              style={{ width: `${((userStatus?.credits ?? 0) / (userStatus?.limits?.daily_credits ?? 100)) * 100}%` }}
                            />
                         </div>
                      </div>
                      <div className="bg-white border-4 border-black p-4 shadow-[6px_6px_0_rgba(0,0,0,1)] flex flex-col min-w-[200px]">
                         <span className="text-[10px] font-black uppercase text-stone-500 tracking-widest mb-1">RESOURCE_UPLINK</span>
                         <div className="flex items-center justify-between">
                            <span className="text-3xl font-[1000] tracking-tighter">{sources.length}/{userStatus?.limits?.max_sources_per_project ?? 12}</span>
                            <span className="text-[10px] font-black">NODES</span>
                         </div>
                         <div className="mt-2 h-2 bg-stone-100 border-2 border-black relative overflow-hidden">
                            <div 
                              className="absolute inset-y-0 left-0 bg-cyan-400 transition-all duration-1000"
                              style={{ width: `${(sources.length / (userStatus?.limits?.max_sources_per_project ?? 12)) * 100}%` }}
                            />
                         </div>
                      </div>
                   </div>
                </div>
            </div>
          </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-8">
          
          {/* LEFT: SOURCES PANEL */}
          <BentoItem className="md:col-span-4 md:row-span-2">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b-4 border-black">
                <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                   <Database size={24} /> SOURCES
                </h2>
                <Badge className="bg-black text-white border-2 border-black font-black px-2 text-xl">{sources.length}</Badge>
              </div>
              
              <div className="flex flex-col gap-4 mb-6">
                <Button 
                  onClick={() => setShowAddSource(true)}
                  disabled={ingesting}
                  className="w-full bg-[#f472b6] border-4 border-black text-black font-black text-2xl hover:bg-pink-300 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all py-8 flex items-center justify-center gap-4"
                >
                  <Plus size={32} className="border-4 border-black p-1 bg-white" />
                  <span>INITIALIZE_UPLINK</span>
                </Button>
                <div className="h-2 bg-black/10 rounded-full" />
              </div>
              
              <div className="space-y-4">
                <h3 className="text-[10px] font-black text-stone-400 uppercase tracking-[0.3em] mb-2">ORCHESTRATION_MODES</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setMode("rag")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 border-4 border-black p-4 transition-all uppercase tracking-tighter font-black text-center min-h-[100px]",
                      mode === "rag" ? "bg-black text-[#00ffa3] shadow-[4px_4px_0_rgba(0,255,163,0.3)]" : "bg-white text-black hover:bg-stone-50"
                    )}
                  >
                    <Database size={24} className={mode === "rag" ? "text-[#00ffa3]" : "text-black"} />
                    <span className="text-[10px]">LOCAL_SQL</span>
                  </button>

                  <button 
                    onClick={() => setMode("web")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 border-4 border-black p-4 transition-all uppercase tracking-tighter font-black text-center min-h-[100px]",
                      mode === "web" ? "bg-black text-cyan-300 shadow-[4px_4px_0_rgba(34,211,238,0.3)]" : "bg-white text-black hover:bg-stone-50"
                    )}
                  >
                    <Globe size={24} className={mode === "web" ? "text-cyan-300" : "text-black"} />
                    <span className="text-[10px]">WEB_API</span>
                  </button>

                  <button 
                    onClick={() => setMode("academic")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 border-4 border-black p-4 transition-all uppercase tracking-tighter font-black text-center min-h-[100px]",
                      mode === "academic" ? "bg-black text-pink-500 shadow-[4px_4px_0_rgba(244,114,182,0.3)]" : "bg-white text-black hover:bg-stone-50"
                    )}
                  >
                    <Sparkles size={24} className={mode === "academic" ? "text-pink-500" : "text-black"} />
                    <span className="text-[10px]">ARXIV_ACAD</span>
                  </button>

                  <button 
                    onClick={() => setMode("hybrid")}
                    className={cn(
                      "flex flex-col items-center justify-center gap-2 border-4 border-black p-4 transition-all uppercase tracking-tighter font-black text-center min-h-[100px]",
                      mode === "hybrid" ? "bg-black text-emerald-400 shadow-[4px_4px_0_rgba(52,211,153,0.3)]" : "bg-white text-black hover:bg-stone-50"
                    )}
                  >
                    <Box size={24} className={mode === "hybrid" ? "text-emerald-400" : "text-black"} />
                    <span className="text-[10px]">HYBRID_GRID</span>
                  </button>
                </div>


                <div className="relative mt-8">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-stone-600 z-10" />
                  <input
                    type="text"
                    placeholder="SEARCH REPOSITORY..."
                    className="w-full border-4 border-black bg-black text-white px-12 py-4 text-sm font-black uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-[#22d3ee]/20"
                    value={sourceSearch}
                    onChange={(e) => setSourceSearch(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !ingesting && !loading) {
                        sourceSearch.trim() ? handleQuickIngest() : handleMainSearch();
                      }
                    }}
                  />
                </div>
              </div>

              <div className="border-4 border-black bg-white h-[400px] overflow-y-auto custom-scrollbar shadow-[inset_4px_4px_10px_rgba(0,0,0,0.1)]">
                {sources.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full opacity-40 italic font-black text-xl uppercase tracking-widest text-center px-10">
                    <Database size={64} className="mb-4" />
                    AWAITING UPLINK COMMAND
                    <Button 
                      variant="outline" 
                      className="mt-6 border-4 border-black font-black text-xs hover:bg-black hover:text-white transition-all uppercase px-4 py-2"
                      onClick={() => setShowAddSource(true)}
                    >
                      INITIALIZE_UPLINK_NOW
                    </Button>
                  </div>
                ) : sources.filter(s => s.title.toLowerCase().includes(sourceSearch.toLowerCase())).length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center px-8">
                       <h3 className="text-lg font-black uppercase mb-4 tracking-tighter">NO_LOCAL_NODES_FOUND</h3>
                       <p className="text-[10px] font-bold text-stone-500 uppercase tracking-widest mb-6 leading-tight">THE COMMAND "{sourceSearch}" DOES NOT MATCH ANY LOCAL REPOSITORY CONTENT.</p>
                       <Button 
                         onClick={() => handleMainSearch()}
                         className="bg-[#00ffa3] border-4 border-black text-black font-black text-sm hover:bg-emerald-400 shadow-[4px_4px_0_rgba(0,0,0,1)] uppercase py-6 w-full"
                       >
                         EXECUTE_DEEP_SEARCH
                       </Button>
                    </div>
                ) : (
                  sources
                    .filter(s => s.title.toLowerCase().includes(sourceSearch.toLowerCase()))
                    .map((source) => (
                    <SourceItem 
                      key={source.id} 
                      icon={getSourceIcon(source.type)}
                      title={source.title}
                      subtitle={source.url || "INTERNAL NODE"}
                      status={source.status}
                      isSelected={source.isSelected}
                      progress={source.status === "analyzing" ? 35 : undefined}
                      onSelect={() => toggleSourceSelection(source.id)}
                      onRemove={() => removeSource(source.id)}
                      onView={() => handleViewSource(source.id)}
                    />
                  ))
                )}
              </div>

              <div className="pt-2 text-center text-xs font-black bg-stone-900 text-white py-2 uppercase tracking-widest border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                {sources.filter(s => s.isSelected).length} ACTIVE / {sources.length} TOTAL NODES
              </div>

              <Button 
                onClick={() => sourceSearch.trim() ? handleQuickIngest() : handleMainSearch()}
                disabled={ingesting || loading}
                className={`flex items-center gap-2 px-6 py-2 border-4 border-black font-bold uppercase transition-all shadow-[6px_6px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-[3px_3px_0px_#000000] ${
                  ingesting || loading ? "bg-gray-400 cursor-not-allowed opacity-70" : 
                  sourceSearch.trim() ? "bg-[#33FF33] hover:bg-[#00FF00]" : "bg-[#FF00FF] text-white hover:bg-[#CC00CC]"
                }`}
              >
                {ingesting ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    INJECTING_VECTOR_NODE...
                  </div>
                ) : loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ORCHESTRATING_ANALYSIS...
                  </div>
                ) : sourceSearch.trim() ? (
                  <>
                    <Database className="w-5 h-5" />
                    INJECT & SYNC NODE
                  </>
                ) : (
                  <>
                    <Search className="w-5 h-5" />
                    ORCHESTRATE ANALYSIS
                  </>
                )}
              </Button>
            </div>
          </BentoItem>

          {/* SEARCH BAR - PREMIUM TERMINAL WINDOW */}
          <BentoItem className="md:col-span-5 bg-[#f472b6] border-8 shadow-[12px_12px_0_rgba(0,0,0,1)] p-4 flex flex-col">
            <div className="bg-[#050505] border-4 border-black flex flex-col h-full rounded-sm overflow-hidden min-h-[500px]">
               {/* Terminal Tabs */}
               <div className="flex bg-black border-b-4 border-black">
                  <div className="px-8 py-3 bg-[#00ffa3]/10 text-[#00ffa3] font-black text-xs uppercase tracking-widest border-r-4 border-black shadow-[inset_0_-4px_0_#00ffa3]">
                     DIRECTIVES
                  </div>
                  <div className="flex-1" />
                  <div className="px-4 flex items-center gap-4">
                     <Settings size={14} className="text-[#00ffa3]/20" />
                     <X size={14} className="text-red-900/50" />
                  </div>
               </div>

               {/* Terminal Body */}
               <div className="flex-1 pt-6 px-10 pb-10 flex flex-col relative min-h-[300px] overflow-hidden">
                  <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
                  
                  <div className={cn(
                    "space-y-1 mb-4 font-mono text-sm overflow-y-auto custom-scrollbar",
                    loading ? "opacity-100" : "opacity-40"
                  )}>
                     <p className="text-[#00ffa3]/30 font-mono text-[9px] uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
                        INFO: 127.0.0.1:60470 - "OPTIONS /api/v1/chat/orchestrate HTTP/1.1" 200 OK
                     </p>
                     
                     <div className="space-y-4">
                        <div className="space-y-1">
                           <p className="text-[#ffff00] font-black tracking-[0.2em]">{`---PLANNING EXECUTION---`}</p>
                           <p className="text-[#00ffa3]/80 font-bold">{`---LLM CALL [Model: nvidia/nemotron-3-super-120b-a12b:free]---`}</p>
                           <div className="flex flex-col gap-0.5 mt-2 ml-4">
                              <p className="text-pink-500 font-bold text-xs">{`---NODE: ARXIV---`}</p>
                              <p className="text-pink-500 font-bold text-xs">{`---NODE: GITHUB---`}</p>
                              <p className="text-pink-500 font-bold text-xs">{`---NODE: SEARXNG---`}</p>
                           </div>
                        </div>

                        <div className="space-y-1">
                           <p className="text-cyan-400 font-black tracking-[0.2em]">{`---GRADING & FILTERING---`}</p>
                           <p className="text-[#00ffa3]/80 font-bold">{`---LLM CALL [Model: stepfun/step-3.5-flash:free]---`}</p>
                        </div>

                        <div className="space-y-1">
                           <p className="text-emerald-400 font-black tracking-[0.2em]">{`---GENERATING FINAL ANSWER---`}</p>
                           <p className="text-[#00ffa3]/80 font-bold">{`---LLM CALL [Model: qwen/qwen3.6-plus-preview:free]---`}</p>
                        </div>
                     </div>

                     {loading && (
                       <div className="mt-8 border-t border-white/5 pt-4">
                         <div className="flex items-center gap-4 text-[#00ffa3] animate-pulse">
                            <span className="w-2 h-2 bg-[#00ffa3] rounded-full" />
                            <p className="text-xs font-black uppercase tracking-widest">{`SYSTEM: SYNTHESIZING_RESPONSE_MATRIX...`}</p>
                         </div>
                       </div>
                     )}
                     
                     {result?.steps?.map((step: string, i: number) => (
                       <p key={i} className="text-[#00ffa3]/40 italic font-mono text-[10px] mt-2">{`> TRACE: ${step}`}</p>
                     ))}
                  </div>

                  <div className="flex-1 flex flex-col pt-4 border-t-2 border-white/5">
                    <div className="flex items-start gap-4 text-[#00ffa3]">
                      <span className="text-2xl font-black">{">"}</span>
                      <textarea
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleMainSearch()}
                        placeholder="INJECT COMMAND DIRECTIVE..."
                        className="w-full flex-1 bg-transparent border-none text-[#00ffa3] text-xl font-bold focus:outline-none placeholder:text-[#00ffa3]/10 uppercase tracking-tighter leading-tight relative z-10 custom-scrollbar mb-6 h-full resize-none"
                      />
                    </div>
                  </div>
                  
                  <div className="flex justify-end items-center gap-8 mt-auto">
                    <span className="text-white/40 font-black text-base uppercase tracking-widest">SUBMIT COMMAND</span>
                    <button 
                      onClick={() => handleMainSearch()}
                      disabled={loading}
                      className="bg-transparent border-4 border-[#00ffa3] text-[#00ffa3] p-6 shadow-[8px_8px_0px_0px_rgba(0,ffa3,163,0.2)] hover:bg-[#00ffa3] hover:text-black transition-all disabled:opacity-50 group"
                    >
                      {loading ? <Loader2 className="animate-spin w-10 h-10" /> : (
                        <ArrowRight className="w-10 h-10 transition-transform group-hover:translate-x-1" strokeWidth={3} />
                      )}
                    </button>
                  </div>
               </div>
            </div>
          </BentoItem>

          {/* HISTORY PANEL - BESIDE TERMINAL */}
          <BentoItem className="md:col-span-3 bg-[#ffff00] border-8 shadow-[12px_12px_0_rgba(0,0,0,1)] flex flex-col p-4">
             <div className="bg-black border-4 border-black h-full flex flex-col overflow-hidden min-h-[500px]">
                <div className="p-4 bg-[#ffff00] border-b-4 border-black flex items-center justify-between">
                   <h3 className="font-black text-black uppercase tracking-tighter text-sm flex items-center gap-2">
                      <History size={16} /> HISTORY_LOGS
                   </h3>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar space-y-6">
                   <div 
                     onClick={() => {
                        setQuery("Analyze neural network architecture in project...");
                        setResult({
                           generation: "### NEURAL_SYNTHESIS_REPORT\n\n#### Findings Overview\nThe architecture analysis for **Project Genesis** reveals a high degree of modularity in the lateral transmission layers. Parallel orchestration nodes are operating at 98% efficiency with minimal jitter in the vector alignment.\n\n#### Key Vectors\n- **Transmission**: 0.45ms latency detected in the upper quadrant.\n- **Security**: All encrypted tunnels are verified under the brutalist protocol.\n- **Redundancy**: Triple-parity check successful across all active nodes.",
                           steps: ["MAPPING_GENESIS_VECTORS", "ALIGNING_MODULAR_LAYERS", "OPTIMIZING_PARITY_CHECK"],
                           documents: [
                              { source: "internal", metadata: { title: "Architecture Spec v2.1", url: "/docs/arch" } },
                              { source: "web", metadata: { title: "Neural Layer Efficiency Study", url: "https://arxiv.org/abs/2403.001" } }
                           ]
                        });
                     }}
                     className="border-b-2 border-white/5 pb-6 group cursor-pointer hover:bg-white/10 transition-all px-2 -mx-2"
                   >
                      <div className="flex items-center justify-between mb-2">
                         <div className="text-[#00ffa3] font-mono text-[9px] opacity-40 uppercase tracking-widest group-hover:opacity-100 italic">ID_0x7F2A_LOG</div>
                         <div className="text-stone-500 font-mono text-[8px] uppercase">2M_AGO</div>
                      </div>
                      <p className="text-[#ffff00] font-black text-[11px] uppercase tracking-widest leading-none mb-2 group-hover:underline decoration-white underline-offset-4 transition-all">DATA_CONTENT: SYNTHESIS_MAP</p>
                      <p className="text-stone-400 font-bold text-[10px] uppercase tracking-tighter leading-tight line-clamp-3 italic opacity-60 group-hover:opacity-100 group-hover:text-white transition-all">
                         Project Genesis architecture analysis reveals high modularity in transmission layers... efficiency peaking at 98%...
                      </p>
                   </div>

                   <div 
                     onClick={() => {
                        setQuery("Vector alignment for multi-modal ingestion...");
                        setResult({
                           generation: "### VECTOR_ALIGNMENT_MATRIX\n\n#### Status: STABLE\nVector space alignment has been completed for all multi-modal ingestion points. The embedding matrix is now globally synchronized across the project environment.\n\n#### Metrics\n- **Inference Rate**: 450 tokens/sec\n- **Alignment Error**: <0.001%\n- **Memory Consumption**: 4.2GB VRAM",
                           steps: ["PROBING_VECTOR_SPACE", "SYNCING_EMBEDDING_MATRICES"],
                           documents: [
                              { source: "internal", metadata: { title: "Vector Log 01", url: "/logs/vector-01" } }
                           ]
                        });
                     }}
                     className="border-b-2 border-white/5 pb-6 group cursor-pointer hover:bg-white/10 transition-all px-2 -mx-2"
                   >
                      <div className="flex items-center justify-between mb-2">
                         <div className="text-[#00ffa3] font-mono text-[9px] opacity-40 uppercase tracking-widest group-hover:opacity-100 italic">ID_0x3B19_LOG</div>
                         <div className="text-stone-500 font-mono text-[8px] uppercase">10M_AGO</div>
                      </div>
                      <p className="text-[#ffff00] font-black text-[11px] uppercase tracking-widest leading-none mb-2 group-hover:underline decoration-white underline-offset-4 transition-all">DATA_CONTENT: ALIGNMENT_MATRIX</p>
                      <p className="text-stone-400 font-bold text-[10px] uppercase tracking-tighter leading-tight line-clamp-3 italic opacity-60 group-hover:opacity-100 group-hover:text-white transition-all">
                         Vector space alignment completed for multi-modal ingestion points... environment synchronization established...
                      </p>
                   </div>
                </div>
                <div className="p-4 bg-stone-900 border-t-4 border-black mt-auto">
                   <div className="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase tracking-widest">
                      <span className="w-1.5 h-1.5 bg-[#ffff00] rounded-full animate-pulse" />
                      STREAM_STABLE
                   </div>
                </div>
             </div>
          </BentoItem>

          {/* MAIN RESULTS DISPLAY */}
          <BentoItem className="md:col-span-8 md:row-span-2 overflow-y-auto min-h-[480px] bg-white border-8 p-10">
             <AnimatePresence mode="wait">
                {loading && (
                   <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                     className="flex flex-col items-center justify-center h-full space-y-10 min-h-[400px]"
                   >
                      <div className="relative w-32 h-32 flex items-center justify-center">
                         <div className="absolute inset-0 border-8 border-black border-t-emerald-400 rotate-45 animate-[spin_2s_linear_infinite]" />
                         <div className="absolute inset-4 border-8 border-black bg-cyan-300 border-b-yellow-400 animate-[spin_3s_linear_infinite_reverse]" />
                         <Sparkles className="text-black z-10 animate-pulse" size={40} />
                      </div>
                      <div className="bg-black text-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,255,200,1)] rotate-1">
                        <h3 className="text-3xl font-black uppercase text-white tracking-widest leading-none">ANALYZING MATRIX</h3>
                        <p className="font-bold text-emerald-400 uppercase tracking-widest border-t-2 border-stone-800 pt-2 w-full text-center">PARALLEL ORCHESTRATION ACTIVE</p>
                      </div>
                   </motion.div>
                )}

                {!loading && !result && !error && (
                   <motion.div 
                     initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                     className="flex flex-col items-center justify-center h-full py-16 text-center"
                   >
                      <div className="flex gap-6 mb-10">
                        <div className="w-20 h-20 border-4 border-black bg-cyan-300 flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                          <LinkIcon className="h-10 w-10" />
                        </div>
                        <div className="w-20 h-20 border-4 border-black bg-white flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-12">
                          <FileText className="h-10 w-10" />
                        </div>
                        <div className="w-20 h-20 border-4 border-black bg-emerald-400 flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] -rotate-6">
                          <Database className="h-10 w-10" />
                        </div>
                      </div>
                      <h3 className="text-5xl font-black text-black mb-6 uppercase tracking-tighter leading-none" style={{WebkitTextStroke: "1px black"}}>AWAITING LINK...</h3>
                      <p className="max-w-xl text-black font-bold uppercase tracking-widest text-lg bg-yellow-300 p-6 border-8 border-black shadow-[12px_12px_0_rgba(0,0,0,1)]">
                        Select target nodes from the left array and deploy an interrogation sequence above to map the knowledge terrain.
                      </p>
                   </motion.div>
                )}

                {error && (
                   <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-400 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] h-full flex flex-col items-center justify-center gap-8 p-12 text-center">
                      <X className="text-black p-4 border-8 border-black bg-white shadow-[8px_8px_0_rgba(0,0,0,1)]" size={96} />
                      <p className="font-black text-4xl text-black uppercase tracking-tighter">{error}</p>
                      <button onClick={() => setError(null)} className="px-10 py-6 bg-black text-white font-black text-2xl uppercase tracking-widest hover:bg-stone-800 transition-colors border-4 border-black shadow-[8px_8px_0px_0px_rgba(255,255,255,1)]">REBOOT SEQUENCE</button>
                   </motion.div>
                )}

                {result && (
                   <motion.div 
                     initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                     className="space-y-12 h-full pb-10"
                   >
                      <div className="flex items-center justify-between pb-6 border-b-8 border-black bg-cyan-300 p-8 border-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 2px, transparent 20px)" }} />
                         <div className="flex items-center gap-6 relative z-10">
                            <Sparkles size={48} className="text-black animate-pulse" />
                            <h2 className="text-5xl font-black text-black uppercase tracking-tighter">DATA SYNTHESIS</h2>
                         </div>
                         <div className="flex items-center gap-6">
                            <Button 
                              onClick={() => {
                                navigator.clipboard.writeText(result.generation);
                                // Optional: simple toast or state change if needed
                              }}
                              className="h-16 bg-black border-4 border-black text-white px-8 font-black text-xl flex items-center gap-3 uppercase shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:bg-white hover:text-black transition-all relative z-10"
                              title="COPY TO CLIPBOARD"
                            >
                              <Copy size={24} />
                            </Button>
                            <Button 
                              onClick={() => {
                                const timestamp = new Date().toLocaleDateString();
                                const htmlDoc = `
                                  <!DOCTYPE html>
                                  <html>
                                  <head>
                                    <title>REGLE RESEARCH REPORT - ${timestamp}</title>
                                    <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@700;800;900&family=Space+Mono:wght@700&display=swap" rel="stylesheet">
                                    <script src="https://cdn.tailwindcss.com"></script>
                                    <style>
                                      body { background: #fff; padding: 40px; font-family: 'Space Mono', monospace; color: #000; }
                                      .brutalist-card { border: 8px solid #000; padding: 40px; box-shadow: 20px 20px 0 #000; background: #fff; margin-bottom: 60px; }
                                      .brutalist-header { background: #22d3ee; border: 8px solid #000; padding: 30px; box-shadow: 12px 12px 0 #000; margin-bottom: 40px; display: flex; align-items: center; justify-content: space-between; }
                                      h1, h2, h3 { text-transform: uppercase; font-family: 'Space Grotesk', sans-serif; font-weight: 900; letter-spacing: -0.05em; line-height: 0.9; margin-bottom: 1.5rem; }
                                      .prose p { font-size: 1.25rem; font-weight: 900; line-height: 1.4; margin-bottom: 1.5rem; letter-spacing: -0.02em; }
                                      .source-card { border: 4px solid #000; padding: 20px; box-shadow: 8px 8px 0 #000; background: #fff; margin-bottom: 20px; display: flex; align-items: center; gap: 20px; }
                                      .badge { background: #000; color: #fff; padding: 5px 10px; font-size: 10px; font-weight: 900; text-transform: uppercase; display: inline-block; }
                                    </style>
                                  </head>
                                  <body>
                                    <div class="brutalist-header">
                                      <h1 class="text-5xl m-0">RESEARCH_SYNTHESIS</h1>
                                      <div class="text-right text-sm">GENERATED: ${timestamp}</div>
                                    </div>
                                    <div class="brutalist-card prose">
                                      ${result.generation.split('\n\n').map((p:string) => `<p>${p}</p>`).join('')}
                                    </div>
                                    <h2 class="text-4xl underline decoration-8 decoration-black underline-offset-8 mb-12">GROUNDED_ASSETS</h2>
                                    <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                                      ${result.documents.map((doc:any) => `
                                        <div class="source-card">
                                          <div style="background:#000; color:#fff; width:60px; height:60px; display:flex; align-items:center; justify-content:center; font-size:24px;">#</div>
                                          <div>
                                            <div style="font-weight:900; text-transform:uppercase; font-size:20px;">${doc.metadata?.title || doc.source}</div>
                                            <div style="font-size:10px; opacity:0.5; word-break:break-all;">${doc.metadata?.url || 'SECURE_NODE'}</div>
                                          </div>
                                        </div>
                                      `).join('')}
                                    </div>
                                    <div style="margin-top:100px; font-size:10px; opacity:0.3; text-align:center; font-weight:900;">REGLE_GRADE_EXPORT_V1.0 // P-DFS SECURE TERMINAL</div>
                                  </body>
                                  </html>
                                `;
                                const blob = new Blob([htmlDoc], { type: 'text/html' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `REGLE_REPORT_${projectId || 'PROJ'}_${Date.now()}.html`;
                                a.click();
                                URL.revokeObjectURL(url);
                              }}
                              className="h-16 bg-white border-4 border-black text-black px-8 font-black text-xl flex items-center gap-3 uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all relative z-10 hover:bg-cyan-50"
                            >
                              <FileText size={24} /> DOWNLOAD_REPORT.HTML
                            </Button>
                         </div>
                      </div>

                      {/* --- RESEARCH STRATEGY PROTOCOL --- */}
                      {result?.plan && result.plan.length > 0 && (
                        <div className="mb-6 bg-yellow-300 border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
                           <div className="absolute top-0 right-0 p-2 font-black text-black/5 text-2xl pointer-events-none select-none uppercase tracking-tighter">STRATEGY</div>
                           <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => setShowPlan(!showPlan)}
                           >
                              <div className="flex items-center gap-3">
                                 <Sparkles size={18} className="text-black" />
                                 <h3 className="text-sm font-black text-black uppercase tracking-widest">RESEARCH_PLAN</h3>
                              </div>
                              <div className="flex items-center gap-2">
                                 <Badge className="bg-black text-yellow-300 border-2 border-black text-[10px] px-1 font-black">{result.plan.length} STEPS</Badge>
                                 {showPlan ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                              </div>
                           </div>
                           
                           {showPlan && (
                              <div className="mt-4 space-y-2 animate-in slide-in-from-top-2 duration-200">
                                 {result.plan.map((step: string, i: number) => (
                                    <div key={i} className="flex items-center gap-3 bg-white border-2 border-black p-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-none transition-all">
                                       <div className="w-6 h-6 bg-black text-yellow-300 border border-black flex items-center justify-center font-black text-[10px] shrink-0">
                                          {i + 1}
                                       </div>
                                       <span className="text-[11px] font-black text-black uppercase tracking-tighter leading-tight">{step}</span>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                      )}

                      {/* --- THINKING / ORCHESTRATION LOGS --- */}
                      {result?.steps && result.steps.length > 0 && (
                        <div className="mb-6 bg-black border-4 border-black p-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] relative group">
                           <div className="absolute top-0 right-0 p-2 font-black text-emerald-400/5 text-2xl pointer-events-none select-none uppercase tracking-tighter">TRACING</div>
                           <div 
                              className="flex items-center justify-between cursor-pointer"
                              onClick={() => setShowSteps(!showSteps)}
                           >
                              <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 bg-emerald-400 border border-white animate-pulse" />
                                 <h3 className="text-sm font-black text-emerald-400 uppercase tracking-widest">ORCHESTRATION_THINKING</h3>
                              </div>
                              <div className="flex items-center gap-2 text-emerald-400">
                                 <Badge className="bg-emerald-400 text-black border-2 border-black text-[10px] px-1 font-black">{result.steps.length} TRACE</Badge>
                                 {showSteps ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                              </div>
                           </div>

                           {showSteps && (
                              <div className="mt-4 font-mono text-[11px] text-stone-400 space-y-1 selection:bg-emerald-400 selection:text-black animate-in slide-in-from-top-2 duration-200">
                                 {result.steps.map((step: string, i: number) => (
                                    <div key={i} className="flex gap-4 items-start group/line">
                                       <span className="opacity-20 font-black text-[9px] pt-0.5">{String(i).padStart(2, '0')}</span>
                                       <span className="text-emerald-400/80 font-bold border-l border-emerald-400/20 pl-3 group-hover/line:border-emerald-400 transition-colors uppercase tracking-wider">{step}</span>
                                    </div>
                                 ))}
                              </div>
                           )}
                        </div>
                      )}

                      <div className="bg-white border-8 border-black p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 font-black text-stone-200 text-6xl opacity-20 pointer-events-none select-none uppercase tracking-tighter">CONFIDENTIAL</div>                          <div className="prose-font-mono w-full relative z-10 text-black max-w-none">
                             <MarkdownRenderer content={result.generation} />
                          </div>
                       </div>

                       <div className="pt-10 border-t-8 border-black w-full">
                          <h3 className="text-3xl font-black tracking-widest uppercase text-black bg-emerald-400 w-max px-8 py-4 border-8 border-black flex items-center gap-6 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] mb-12">
                             <Check size={40} className="text-black font-black" /> GROUNDED ASSETS
                          </h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full pb-10">
                             {result.documents.map((doc: any, i: number) => (
                                <div 
                                  key={i} 
                                  className="border-8 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 hover:translate-x-3 hover:translate-y-3 hover:shadow-none transition-all flex items-center gap-8 cursor-crosshair group relative overflow-hidden"
                                  onClick={() => doc.metadata?.url && window.open(doc.metadata.url, "_blank")}
                                >
                                   <div className="w-20 h-20 bg-black text-white border-4 border-black flex items-center justify-center shrink-0 group-hover:bg-amber-400 group-hover:text-black transition-colors relative z-10 shadow-[4px_4px_0_rgba(255,255,255,0.2)]">
                                      {doc.source === "internal" ? <Database size={40} /> : <Globe size={40} />}
                                   </div>
                                   <div className="min-w-0 relative z-10">
                                      <div className="font-black text-2xl text-black truncate uppercase tracking-tighter leading-none mb-2">{doc.metadata?.title || doc.source}</div>
                                      <div className="text-[10px] text-stone-500 font-bold truncate font-mono uppercase tracking-[0.2em]">{doc.metadata?.url || "SECURE_LOCAL_NODE"}</div>
                                   </div>
                                </div>
                             ))}
                          </div>
                       </div>
                    </motion.div>
                 )}
              </AnimatePresence>
           </BentoItem>

           </div>
         </div>
       </div>

       <AddSourceModal 
         isOpen={showAddSource}
         onClose={() => setShowAddSource(false)}
         onUpload={handleFileUpload}
         onGithubIngest={(github_url) => handleIngest('github', { github_url })}
         onUrlIngest={(url) => handleIngest('url', { url })}
         onTextIngest={(content) => handleIngest('text', { content })}
         onAcademicIngest={(query) => handleIngest('arxiv', { url: query })}
         onWebSearch={handleWebSearch}
         onAutoUplink={handleAutoUplink}
       />
       
       {ingesting && (
         <div className="fixed inset-0 bg-white/50 backdrop-blur-sm z-[100] flex items-center justify-center cursor-wait">
            <div className="bg-black text-white p-12 border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] animate-pulse">
               <h2 className="text-4xl font-black uppercase tracking-[0.2em]">INGESTING_DATA...</h2>
               <div className="mt-4 h-2 bg-white/20 overflow-hidden">
                  <div className="h-full bg-cyan-400 animate-[shimmer_2s_infinite_linear]" style={{ width: '50%' }} />
               </div>
            </div>
         </div>
       )}

       <ViewSourceModal 
         isOpen={showViewModal}
         onClose={() => setShowViewModal(false)}
         source={selectedSource}
       />
    </div>
  );
}
