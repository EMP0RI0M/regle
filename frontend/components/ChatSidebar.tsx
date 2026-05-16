"use client";

import React, { useState } from "react";
import { MessageSquare, Plus, Trash2, Clock, Pin, FileText, Globe, GitBranch, Play, Eye } from "lucide-react";
import { cn } from "@/lib/utils";

interface Conversation {
  id: string;
  title: string;
  timestamp: string;
  isPinned?: boolean;
}

interface Source {
  id: string;
  metadata: {
    title: string;
    type: string;
    source?: string;
    url?: string;
  };
}

interface ChatSidebarProps {
  conversations: Conversation[];
  sources: Source[];
  activeId?: string;
  onSelect: (id: string) => void;
  onViewSource: (id: string) => void;
  onNew: () => void;
  title: string;
}

export function ChatSidebar({ conversations, sources, activeId, onSelect, onViewSource, onNew, title }: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<"history" | "sources">("history");

  const getSourceIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case "web": return <Globe size={16} className="text-cyan-400" />;
      case "youtube": return <Play size={16} className="text-red-400" />;
      case "github": return <GitBranch size={16} className="text-amber-400" />;
      default: return <FileText size={16} className="text-pink-400" />;
    }
  };

  return (
    <div className="w-80 h-full bg-stone-100 border-r-8 border-black flex flex-col font-mono shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] z-40">
      {/* Header Tabs */}
      <div className="flex border-b-4 border-black bg-white">
        <button 
          onClick={() => setActiveTab("history")}
          className={cn(
            "flex-1 py-4 font-black uppercase text-[10px] tracking-widest transition-all border-r-4 border-black",
            activeTab === "history" ? "bg-black text-white" : "hover:bg-stone-50"
          )}
        >
          HISTORY
        </button>
        <button 
          onClick={() => setActiveTab("sources")}
          className={cn(
            "flex-1 py-4 font-black uppercase text-[10px] tracking-widest transition-all",
            activeTab === "sources" ? "bg-black text-white" : "hover:bg-stone-50"
          )}
        >
          SOURCES ({sources.length})
        </button>
      </div>

      {activeTab === "history" ? (
        <>
          {/* New Chat Button */}
          <div className="p-4">
            <button 
              onClick={onNew}
              className="w-full bg-emerald-300 border-4 border-black p-4 font-black flex items-center justify-between hover:bg-black hover:text-emerald-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase text-sm"
            >
              <span>NEW SESSION</span>
              <Plus size={20} strokeWidth={3} />
            </button>
          </div>

          {/* History List */}
          <div className="flex-1 overflow-y-auto px-4 space-y-4 pb-10 custom-scrollbar">
            {conversations.length === 0 ? (
              <div className="text-center py-10 opacity-30 italic font-black uppercase text-xs tracking-widest">
                Awaiting Command...
              </div>
            ) : (
              conversations.map((conv) => (
                <div 
                  key={conv.id}
                  onClick={() => onSelect(conv.id)}
                  className={cn(
                    "group relative border-4 border-black p-4 cursor-pointer transition-all uppercase font-black text-xs tracking-tighter",
                    activeId === conv.id 
                      ? "bg-black text-white shadow-none translate-x-1 translate-y-1" 
                      : "bg-white hover:bg-cyan-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <MessageSquare size={16} className={activeId === conv.id ? "text-cyan-400" : "text-black"} />
                    <span className="truncate flex-1">{conv.title}</span>
                    {conv.isPinned && <Pin size={12} className="text-amber-400" />}
                  </div>
                  
                  {/* Optional: Hover Menu */}
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                    <button className="p-1 hover:bg-red-400 border-2 border-transparent hover:border-black transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        /* Sources List */
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 pb-10 custom-scrollbar bg-white">
          {sources.length === 0 ? (
            <div className="text-center py-10 opacity-30 italic font-black uppercase text-xs tracking-widest">
              EMPTY_UPLINK...
            </div>
          ) : (
            sources.map((src) => (
              <div 
                key={src.id}
                className="group border-4 border-black p-4 bg-white hover:bg-stone-50 transition-all uppercase font-black text-xs tracking-tighter shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
              >
                <div className="flex items-center gap-3">
                  {getSourceIcon(src.metadata.type)}
                  <span className="truncate flex-1">{src.metadata.title}</span>
                  <button 
                    onClick={() => onViewSource(src.id)}
                    className="p-2 border-2 border-black bg-[#00ffa3] hover:bg-black hover:text-[#00ffa3] transition-all"
                    title="View Scraped Text"
                  >
                    <Eye size={12} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Footer Info */}
      <div className="p-4 border-t-4 border-black bg-black text-emerald-400 text-[10px] font-black uppercase tracking-widest flex justify-between">
        <span>ENCRYPTED_UPLINK</span>
        <span className="animate-pulse">{activeTab === "history" ? "CTX: HIST" : "CTX: SRC"}</span>
      </div>
    </div>
  );
}
