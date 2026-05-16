"use client";

import React from "react";
import { Search, FolderSearch, Globe, Orbit, UserCircle, Settings, History, ChevronDown, Cpu, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

type SearchMode = "rag" | "web" | "hybrid";

interface DashboardHeaderProps {
  query: string;
  setQuery: (q: string) => void;
  onSearch: () => void;
  mode: SearchMode;
  setMode: (mode: SearchMode) => void;
}

export function DashboardHeader({ query, setQuery, onSearch, mode, setMode }: DashboardHeaderProps) {
  const modes: { id: SearchMode; icon: any; label: string; color: string }[] = [
    { id: "rag", icon: FolderSearch, label: "LOCAL", color: "bg-cyan-300" },
    { id: "web", icon: Globe, label: "Web", color: "bg-pink-300" },
    { id: "hybrid", icon: Orbit, label: "Hybrid", color: "bg-emerald-300" },
  ];

  return (
    <div className="flex flex-col md:flex-row items-center gap-8 px-10 pt-10 pb-6 bg-transparent sticky top-0 z-30 shrink-0 font-mono">
      {/* Search Console Container */}
      <div className="flex-1 w-full max-w-5xl">
        <div className="bg-white border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] p-0 overflow-hidden transform hover:-translate-x-1 hover:-translate-y-1 transition-all">
          <div className="flex flex-col md:flex-row items-stretch">
            
            {/* Mode Selectors */}
            <div className="flex border-b-8 md:border-b-0 md:border-r-8 border-black bg-stone-100 p-3 gap-2">
              {modes.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMode(m.id)}
                  title={m.label}
                  className={cn(
                    "flex-1 md:flex-none flex items-center justify-center p-4 border-4 border-black transition-all cursor-pointer font-black text-xs uppercase tracking-tighter shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
                    mode === m.id ? m.color + " shadow-none translate-x-[4px] translate-y-[4px]" : "bg-white hover:bg-stone-50"
                  )}
                >
                  <m.icon size={24} className="font-black" />
                </button>
              ))}
            </div>

            {/* Input Module */}
            <div className="flex-1 flex items-center px-6 py-4 gap-6 bg-white">
              <Sparkles className="text-stone-300 shrink-0" size={32} />
              <input
                type="text"
                placeholder="INPUT DIRECTIVE SEARCH_QUERY..."
                className="flex-1 bg-transparent py-4 focus:outline-none text-black placeholder:text-stone-300 font-black text-3xl uppercase tracking-tighter"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearch()}
              />
              
              <button
                onClick={onSearch}
                className="p-5 bg-black text-white border-4 border-black shadow-[6px_6px_0_rgba(0,255,200,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 active:scale-95 transition-all shrink-0"
              >
                <Search size={32} strokeWidth={4} />
              </button>
            </div>
          </div>

          {/* Console Subheader */}
          <div className="border-t-8 border-black px-6 py-3 flex items-center justify-between bg-stone-100 font-black text-[10px] uppercase tracking-widest">
             <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-emerald-600">
                   <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse border border-black" />
                   LINK_STATUS: STABLE
                </div>
                <div className="h-3 w-px bg-black opacity-20" />
                <span className="text-stone-500">MODE_{mode.toUpperCase()}_v0.8</span>
             </div>
             <div className="flex items-center gap-4 text-stone-500">
                <History size={14} />
                <span>ARCHIVE: NONE</span>
                <ChevronDown size={14} />
             </div>
          </div>
        </div>
      </div>

      {/* Global Config Icons */}
      <div className="flex gap-4 self-center md:self-start mt-2">
         <button className="w-16 h-16 bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] flex items-center justify-center hover:bg-yellow-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
            <Settings size={28} />
         </button>
         <button className="w-16 h-16 bg-black text-emerald-400 border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] flex items-center justify-center hover:bg-stone-900 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
            <UserCircle size={32} strokeWidth={2} />
         </button>
      </div>
    </div>
  );
}
