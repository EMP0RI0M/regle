"use client";

import React, { useState, useRef } from "react";
import { X, Globe, GitBranch as Github, Search, ArrowLeft, ArrowRight, Plus, FileText, Loader2, Check, Zap, Database, BookOpen, Cpu, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface AddSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  onGithubIngest: (repoUrl: string) => Promise<void>;
  onUrlIngest: (url: string) => Promise<void>;
  onTextIngest: (text: string) => Promise<void>;
  onAcademicIngest: (query: string) => Promise<void>;
  onWebSearch: (query: string) => Promise<any[]>;
  onAutoUplink: (query: string) => Promise<void>;
}

export function AddSourceModal({
  isOpen,
  onClose,
  onUpload,
  onGithubIngest,
  onUrlIngest,
  onTextIngest,
  onAcademicIngest,
  onWebSearch,
  onAutoUplink,
}: AddSourceModalProps) {
  const [view, setView] = useState<"main" | "text" | "urls" | "github" | "academic" | "search">("main");
  const [githubUrl, setGithubUrl] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [urlList, setUrlList] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedResults, setSelectedResults] = useState<Set<string>>(new Set());
  const [autoScan, setAutoScan] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const closeModal = () => {
    onClose();
    setTimeout(() => {
       setView("main");
       setGithubUrl("");
       setPastedText("");
       setUrlList("");
       setSearch("");
       setSearchResults([]);
       setSelectedResults(new Set());
    }, 300);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSubmitting(true);
      try {
        await onUpload(file);
        closeModal();
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSearchSubmit = async (overrideQuery?: string) => {
    const queryToSearch = overrideQuery || search;
    if (!queryToSearch.trim()) return;
    setIsSubmitting(true);
    try {
      if (view === "academic") {
        await onAcademicIngest(queryToSearch);
        closeModal();
      } else if (queryToSearch.includes('.') && !queryToSearch.includes(' ')) {
        await onUrlIngest(queryToSearch);
        closeModal();
      } else if (autoScan) {
        await onAutoUplink(queryToSearch);
        closeModal();
      } else {
        const results = await onWebSearch(queryToSearch);
        setSearchResults(results);
        setView("search");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddSelected = async () => {
    setIsSubmitting(true);
    try {
      const toAdd = searchResults.filter(r => selectedResults.has(r.metadata.url));
      await Promise.all(toAdd.map(r => onUrlIngest(r.metadata.url)));
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleResult = (url: string) => {
    const next = new Set(selectedResults);
    if (next.has(url)) next.delete(url);
    else next.add(url);
    setSelectedResults(next);
  };

  const handleUrlSubmit = async () => {
    if (!urlList.trim()) return;
    setIsSubmitting(true);
    try {
      const urls = urlList.split(/\s+/).filter((u) => u.trim());
      await Promise.all(urls.map((u) => onUrlIngest(u)));
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGithubSubmit = async () => {
    if (!githubUrl.trim()) return;
    setIsSubmitting(true);
    try {
      await onGithubIngest(githubUrl);
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!pastedText.trim()) return;
    setIsSubmitting(true);
    try {
      await onTextIngest(pastedText);
      closeModal();
    } finally {
      setIsSubmitting(false);
    }
  };

  const OptionCard = ({ icon, label, onClick, active }: any) => (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-5 p-8 rounded-[2rem] border-4 transition-all duration-300 group",
        active 
          ? "bg-[#FAFF19] border-black neo-shadow-mint" 
          : "bg-white border-black hover:bg-black hover:text-white neo-shadow"
      )}
    >
      <div className={cn(
        "w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110 border-2 border-black",
        active ? "bg-black text-[#FAFF19]" : "bg-[#FAFF19] text-black"
      )}>
        {icon}
      </div>
      <span className="text-[10px] font-black uppercase tracking-[0.3em]">{label}</span>
    </button>
  );

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 font-mono overflow-hidden">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-md animate-in fade-in duration-500" onClick={closeModal} />
      
      <div className="relative w-full max-w-[800px] bg-white border-4 border-black rounded-[3rem] shadow-2xl animate-in zoom-in-95 duration-500 overflow-hidden flex flex-col neo-shadow">
        
        {/* Header */}
        <div className="p-10 border-b-4 border-black flex items-center justify-between bg-[#FAFF19]">
          <div className="flex items-center gap-6">
            {view !== "main" && (
               <button 
                 onClick={() => setView("main")}
                 className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all"
               >
                 <ArrowLeft size={20} />
               </button>
            )}
            <div>
               <h2 className="text-3xl font-black uppercase tracking-widest text-black leading-none mb-2">
                 {view === "main" ? "DATA_UPLINK" : view === "academic" ? "ARXIV_SYNC" : `${view.toUpperCase()}_SCAN`}
               </h2>
               <p className="text-[10px] font-black tracking-[0.3em] text-black/60 italic">INITIATE_KNOWLEDGE_RECLAMATION_v1.2</p>
            </div>
          </div>
          <button onClick={closeModal} className="w-12 h-12 rounded-full border-2 border-black flex items-center justify-center text-black hover:bg-black hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        <div className="p-12 space-y-12 max-h-[70vh] overflow-y-auto custom-scrollbar relative bg-[#FAFF19]/10">
          
          {view === "main" && (
            <div className="space-y-12 animate-in fade-in duration-500">
              {/* Pill Search */}
              <div className="space-y-6">
                 <div className="flex p-2 bg-white border-4 border-black rounded-full focus-within:ring-4 focus-within:ring-[#00FF9F] transition-all shadow-xl">
                    <div className="p-5 text-black/20">
                       <Search size={28} />
                    </div>
                    <input 
                       type="text"
                       placeholder="TARGET_NODE // URL_COMMAND..."
                       className="flex-1 bg-transparent px-2 text-xl font-black focus:outline-none uppercase text-black placeholder:text-black/10"
                       value={search}
                       onChange={(e) => setSearch(e.target.value)}
                       onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    />
                    <button 
                       onClick={() => handleSearchSubmit()}
                       disabled={isSubmitting}
                       className="px-10 rounded-full bg-black text-white font-black tracking-widest text-sm uppercase hover:bg-[#00FF9F] hover:text-black transition-all flex items-center gap-3 active:scale-95"
                    >
                       {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : <>EXECUTE <ArrowRight size={18} /></>}
                    </button>
                 </div>
                 
                 <div className="flex items-center justify-between px-6">
                    <div className="flex items-center gap-6">
                       <button 
                          onClick={() => setAutoScan(!autoScan)}
                          className={cn(
                            "flex items-center gap-3 px-6 py-2 rounded-full border-2 text-[10px] font-black tracking-widest transition-all",
                            autoScan ? "bg-black text-[#00FF9F] border-black" : "bg-white/50 border-black/10 text-black/20"
                          )}
                       >
                          <div className={cn("w-2 h-2 rounded-full", autoScan ? "bg-[#00FF9F] animate-pulse" : "bg-black/20")} />
                          {autoScan ? "AUTO_PILOT: ENGAGED" : "AUTO_PILOT: MANUAL"}
                       </button>
                    </div>
                 </div>
              </div>

              {/* Grid Options */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                <OptionCard icon={<Plus size={28} />} label="UPLOAD" onClick={() => fileInputRef.current?.click()} />
                <OptionCard icon={<Globe size={28} />} label="WEB_NODES" onClick={() => setView("urls")} />
                <OptionCard icon={<BookOpen size={28} />} label="ARXIV" onClick={() => setView("academic")} />
                <OptionCard icon={<Github size={28} />} label="REPOSITORIES" onClick={() => setView("github")} />
              </div>

              <div className="bg-white border-4 border-dashed border-black/20 rounded-[3rem] p-12 text-center group cursor-pointer hover:bg-black hover:text-white transition-all neo-shadow" onClick={() => setView("text")}>
                 <div className="w-16 h-16 mx-auto rounded-2xl bg-black flex items-center justify-center text-white transition-all mb-6 group-hover:bg-[#FAFF19] group-hover:text-black">
                    <FileText size={28} />
                 </div>
                 <h3 className="text-xl font-black uppercase tracking-[0.2em]">RAW_DATA_INJECTION</h3>
                 <p className="mt-2 text-[10px] font-black uppercase tracking-widest opacity-40">DIRECT_STREAM_HANDLING // OCR_READY</p>
              </div>

              <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
            </div>
          )}

          {view === "urls" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
               <div className="bg-white border-4 border-black rounded-[2.5rem] p-10 neo-shadow">
                  <textarea 
                    autoFocus
                    className="w-full h-80 bg-transparent text-xl font-black uppercase tracking-widest focus:outline-none text-black placeholder:text-black/10 leading-relaxed custom-scrollbar"
                    placeholder="ENTER_DATA_UPLINK_URLS_ONE_PER_LOG..."
                    value={urlList}
                    onChange={(e) => setUrlList(e.target.value)}
                  />
               </div>
               <div className="flex justify-end pr-4">
                  <button 
                    disabled={isSubmitting || !urlList.trim()}
                    onClick={handleUrlSubmit}
                    className="h-20 px-12 rounded-full bg-black text-[#00FF9F] font-black tracking-widest text-lg uppercase hover:scale-105 active:scale-95 transition-all neo-shadow-mint disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : "SYCHRONIZE_ARRAY"}
                  </button>
               </div>
            </div>
          )}

          {view === "text" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
               <div className="bg-white border-4 border-black rounded-[2.5rem] p-10 neo-shadow">
                  <textarea 
                    autoFocus
                    className="w-full h-96 bg-transparent text-sm font-black focus:outline-none text-black placeholder:text-black/10 leading-relaxed custom-scrollbar"
                    placeholder="INJECT_RAW_KNOWLEDGE_STREAM..."
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                  />
               </div>
               <div className="flex justify-end pr-4">
                  <button 
                    disabled={isSubmitting || !pastedText.trim()}
                    onClick={handleTextSubmit}
                    className="h-20 px-12 rounded-full bg-black text-white font-black tracking-widest text-lg uppercase hover:scale-105 active:scale-95 transition-all neo-shadow"
                  >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : "INJECT_NODES"}
                  </button>
               </div>
            </div>
          )}

          {view === "github" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
               <div className="space-y-6">
                  <div className="bg-white border-4 border-black rounded-full px-10 flex items-center gap-6 focus-within:ring-4 focus-within:ring-amber-400 transition-all shadow-xl">
                     <Github size={24} className="text-black" />
                     <input 
                       autoFocus
                       type="text"
                       className="flex-1 bg-transparent py-8 text-xl font-black uppercase text-black placeholder:text-black/10 focus:outline-none tracking-widest"
                       placeholder="HTTPS://GITHUB.COM/OWNER/REPO..."
                       value={githubUrl}
                       onChange={(e) => setGithubUrl(e.target.value)}
                     />
                  </div>
               </div>
               <div className="flex justify-end pr-4 pt-10">
                  <button 
                    disabled={isSubmitting || !githubUrl.trim()}
                    onClick={handleGithubSubmit}
                    className="h-20 px-12 rounded-full bg-amber-400 text-black border-4 border-black font-black tracking-widest text-lg uppercase hover:scale-105 transition-all neo-shadow"
                  >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : "CLONE_DATA_ARRAY"}
                  </button>
               </div>
            </div>
          )}

          {view === "academic" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
               <div className="bg-white border-4 border-black rounded-[2.5rem] p-12 text-center neo-shadow">
                  <BookOpen size={48} className="mx-auto text-pink-500 mb-8" />
                  <input 
                    autoFocus
                    type="text"
                    className="w-full bg-transparent text-3xl font-black text-center uppercase tracking-widest focus:outline-none text-black placeholder:text-black/10"
                    placeholder="ARXIV_ID // SUBJECT..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                  />
               </div>
               <div className="flex justify-center">
                  <button 
                    disabled={isSubmitting || !search.trim()}
                    onClick={() => handleSearchSubmit()}
                    className="h-20 px-20 rounded-full bg-pink-500 text-white border-4 border-black font-black tracking-widest text-lg uppercase hover:scale-105 active:scale-95 transition-all neo-shadow"
                  >
                    {isSubmitting ? <Loader2 size={24} className="animate-spin" /> : "PULL_ACADEMIC_NODES"}
                  </button>
               </div>
            </div>
          )}

          {view === "search" && (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-500">
               <div className="flex items-center justify-between px-4">
                  <h3 className="text-xl font-black uppercase tracking-widest flex items-center gap-4 text-black">
                     <Search className="text-[#00FF9F]" /> KNOWLEDGE_ARRAY_DISCOVERED
                  </h3>
                  <Badge className="bg-black text-[#00FF9F] px-4 py-1.5 rounded-full font-black text-[10px] tracking-widest">
                     {searchResults.length}_NODES_FOUND
                  </Badge>
               </div>

               <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-6 custom-scrollbar">
                  {searchResults.map((result, idx) => (
                    <div 
                      key={idx}
                      onClick={() => toggleResult(result.metadata.url)}
                      className={cn(
                        "p-8 rounded-[2rem] border-4 transition-all duration-300 group cursor-pointer relative overflow-hidden",
                        selectedResults.has(result.metadata.url) 
                          ? "bg-[#00FF9F]/10 border-black neo-shadow-mint" 
                          : "bg-white border-black hover:bg-black hover:text-white"
                      )}
                    >
                       <div className="flex items-start gap-6">
                          <div className={cn(
                            "w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 border-black",
                            selectedResults.has(result.metadata.url) ? "bg-black text-[#00FF9F]" : "bg-[#FAFF19] text-black"
                          )}>
                             {selectedResults.has(result.metadata.url) ? <Check size={28} strokeWidth={3} /> : <Plus size={28} />}
                          </div>
                          <div className="flex-1 min-w-0">
                             <h4 className="font-black text-lg uppercase tracking-tight truncate mb-1">{result.metadata.title}</h4>
                             <p className="text-[9px] opacity-40 font-black truncate uppercase tracking-widest mb-4">{result.metadata.url}</p>
                             <p className="text-sm font-bold leading-relaxed line-clamp-2">{result.content}</p>
                          </div>
                       </div>
                    </div>
                  ))}
               </div>

               <div className="p-8 bg-black rounded-[3rem] border-4 border-black flex items-center justify-between neo-shadow-mint">
                  <div className="text-[10px] font-black uppercase tracking-widest text-[#00FF9F] pl-4">
                    {selectedResults.size}_NODES_STAGED_FOR_UPLINK
                  </div>
                  <button 
                    disabled={isSubmitting || selectedResults.size === 0}
                    onClick={handleAddSelected}
                    className="h-16 px-12 rounded-full bg-[#00FF9F] text-black font-black tracking-widest text-sm uppercase hover:scale-105 active:scale-95 transition-all shadow-xl disabled:opacity-30"
                  >
                    {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : "SYNCHRONIZE_NOW"}
                  </button>
               </div>
            </div>
          )}

        </div>

        {/* Footer Status */}
        <div className="px-12 py-6 bg-black text-white flex items-center justify-between text-[10px] font-black uppercase tracking-[0.4em]">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#00FF9F] shadow-[0_0_8px_#00FF9F]" />
                 <span>CORE_LINK_STABLE</span>
              </div>
           </div>
           <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#00FF9F]" />
              <span>SECURE_DATA_SYNC</span>
           </div>
        </div>
      </div>
    </div>
  );
}
