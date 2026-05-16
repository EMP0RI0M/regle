import React from "react";
import { X, FileText, Globe, GitBranch, Play, ExternalLink, Download, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { MarkdownRenderer } from "./MarkdownRenderer";

interface ViewSourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  source: {
    id: string;
    content: string;
    metadata: {
      title: string;
      type: string;
      url?: string;
      source?: string;
    };
  } | null;
}

export function ViewSourceModal({ isOpen, onClose, source }: ViewSourceModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !source) return null;

  const handleCopy = () => {
    if (source.content) {
      navigator.clipboard.writeText(source.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "web": return <Globe size={24} className="text-cyan-400" />;
      case "youtube": return <Play size={24} className="text-red-400" />;
      case "github": return <GitBranch size={24} className="text-amber-400" />;
      case "vision": 
      case "pdf":
      case "image": return <FileText size={24} className="text-pink-400" />;
      default: return <FileText size={24} />;
    }
  };

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none font-mono">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto" onClick={onClose} />
      
      <div className="relative w-full max-w-5xl h-[85vh] bg-stone-100 border-8 border-black shadow-[32px_32px_0px_0px_rgba(0,0,0,1)] pointer-events-auto flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-8 border-b-8 border-black bg-white">
          <div className="flex items-center gap-6 overflow-hidden">
            <div className="p-4 bg-black text-white border-4 border-black rotate-3 shadow-[4px_4px_0_rgba(0,0,0,1)] shrink-0">
               {getIcon(source.metadata.type)}
            </div>
            <div className="min-w-0">
               <h2 className="text-3xl font-black uppercase tracking-tighter truncate leading-none mb-2">
                 {source.metadata.title}
               </h2>
               <div className="flex items-center gap-4">
                  <span className="bg-black text-[#00ffa3] px-3 py-1 text-[10px] font-black uppercase tracking-widest border-2 border-black">
                     NODE_ID: {source.id?.substring(0, 8) || "UNKNOWN"}...
                  </span>
                  <span className="text-stone-400 text-[10px] font-bold uppercase tracking-widest truncate">
                     {source.metadata.url || source.metadata.source || "LOCAL_ARRAY"}
                  </span>
               </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4 shrink-0">
             <button 
               onClick={handleCopy}
               className="p-4 border-4 border-black bg-stone-100 hover:bg-black hover:text-white transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none translate-y-0 active:translate-y-1"
               title="Copy to Clipboard"
             >
               {copied ? <Check size={24} /> : <Copy size={24} />}
             </button>
             {source.metadata.url && (
                <a 
                  href={source.metadata.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-4 border-4 border-black bg-cyan-300 hover:bg-black hover:text-cyan-300 transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none translate-y-0 active:translate-y-1"
                >
                  <ExternalLink size={24} />
                </a>
             )}
             <button onClick={onClose} className="p-4 border-4 border-black bg-red-400 hover:bg-black hover:text-red-400 transition-all shadow-[4px_4px_0_rgba(0,0,0,1)] active:shadow-none translate-y-0 active:translate-y-1">
               <X size={24} />
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-12 bg-white custom-scrollbar">
           <div className="max-w-4xl mx-auto">
              <div className="space-y-6">
                 <div className="flex items-center gap-4 mb-4">
                    <div className="h-1 flex-1 bg-black" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-stone-400">EXTRACTED_CONTENT_BEGIN</span>
                    <div className="h-1 flex-1 bg-black" />
                 </div>
                 
                 <div className="prose prose-stone max-w-none">
                    <MarkdownRenderer content={source.content} />
                 </div>

                 <div className="flex items-center gap-4 mt-20">
                    <div className="h-1 flex-1 bg-stone-200" />
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-stone-300">EOF</span>
                    <div className="h-1 flex-1 bg-stone-200" />
                 </div>
              </div>
           </div>
        </div>

        {/* Status Bar */}
        <div className="bg-black text-white px-8 py-4 border-t-8 border-black flex items-center justify-between font-black text-[10px] uppercase tracking-widest shrink-0">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                 <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                 <span>INTEGRITY_CHECK: PASSED</span>
              </div>
              <div className="flex items-center gap-3">
                 <FileText size={12} className="text-cyan-400" />
                 <span>SIZE: {((source.content?.length || 0) / 1024).toFixed(2)} KB</span>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <span className="text-stone-500">FORMAT: MARKDOWN_UPLINK</span>
           </div>
        </div>
      </div>
    </div>
  );
}
