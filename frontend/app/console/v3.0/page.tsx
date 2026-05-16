"use client";

import React, { useState } from "react";
import { 
  Database, 
  Globe, 
  Sparkles, 
  Plus, 
  Search, 
  Settings, 
  X, 
  ArrowRight,
  Maximize2,
  Minimize2,
  Copy
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";

export default function ConsoleV3() {
  const [activeTab, setActiveTab] = useState("directives");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[#f1f1f1] text-black font-mono p-10 selection:bg-[#00ffa3] selection:text-black">
      <div className="max-w-none mx-auto flex gap-12">
        
        {/* LEFT PANEL: SOURCES */}
        <aside className="w-[440px] bg-white border-4 border-black p-8 flex flex-col gap-8 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.5),8px_8px_0px_0px_rgba(0,0,0,1)] relative h-fit">
          <div className="flex items-center justify-between">
            <h2 className="text-4xl font-[1000] uppercase tracking-tighter flex items-center gap-4">
              <Database size={32} strokeWidth={3} /> SOURCES
            </h2>
            <div className="bg-black text-white px-4 py-1 text-2xl font-black">0</div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <button className="flex flex-col items-center justify-center gap-4 p-8 border-4 border-black bg-white hover:bg-stone-50 transition-all group">
              <div className="w-16 h-16 flex items-center justify-center text-[#0fc]">
                <Database size={56} strokeWidth={2} />
              </div>
              <span className="font-black text-sm uppercase tracking-widest text-stone-600">LOCAL SQL</span>
            </button>
            <button className="flex flex-col items-center justify-center gap-4 p-8 border-4 border-black bg-white hover:bg-stone-50 transition-all group">
              <div className="w-12 h-12 flex items-center justify-center text-[#0fc] scale-150">
                <Globe size={40} strokeWidth={2} />
              </div>
              <span className="font-black text-sm uppercase tracking-widest text-stone-600">WEB API</span>
            </button>
            <button className="col-span-2 flex items-center gap-6 p-6 border-4 border-black bg-black text-[#00ffa3] transition-all relative overflow-hidden group/active">
              <div className="w-12 h-12 border-2 border-[#00ffa3] flex items-center justify-center z-10">
                <Sparkles size={28} />
              </div>
              <span className="flex-1 font-black text-2xl uppercase tracking-tighter z-10 italic">HYBRID GRID</span>
              <span className="text-xs font-black animate-pulse z-10 text-[#00ffa3] tracking-widest">ACTIVE</span>
              <div className="absolute inset-0 bg-[#00ffa3]/5 opacity-0 group-hover/active:opacity-100 transition-opacity" />
            </button>
          </div>

          <button className="w-full bg-[#f472b6] border-4 border-black text-black font-black text-2xl flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all py-8 mt-4 uppercase">
            <Plus size={32} className="border-4 border-black bg-white" />
            INITIALIZE INGEST
          </button>

          <div className="relative mt-2">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" size={32} />
            <input 
              type="text" 
              placeholder="SEARCH REPOSITORY"
              className="w-full bg-[#111] text-white border-4 border-black pl-16 pr-6 py-6 font-black text-base uppercase tracking-[0.2em] focus:outline-none placeholder:text-stone-700"
            />
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 flex flex-col gap-12">
          <header className="flex flex-col gap-6">
             <div className="flex items-center gap-0">
                <Logo iconSize={48} className="scale-125 origin-left" />
                <h1 className="text-[90px] font-[1000] ml-16 tracking-tighter uppercase leading-[0.8] text-black">PROJECT_CONSOLE</h1>
             </div>
             <div className="ml-[340px] -mt-2">
                <div className="bg-[#ffff00] border-4 border-black px-6 py-2 inline-block shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                   <p className="font-black text-2xl uppercase tracking-[0.1em] leading-none text-black">SECURE MULTI-MODAL INTELLIGENCE ORCHESTRATOR</p>
                </div>
             </div>
          </header>
          
          <div className="h-4" />

          {/* CENTRAL CONSOLE WINDOW */}
          <section className="relative px-2">
             <div className="bg-[#f472b6] p-4 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] border-4 border-black">
                <div className="bg-[#050505] border-4 border-black flex flex-col min-h-[550px] relative overflow-hidden rounded-sm">
                   
                   <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />

                   <div className="flex bg-black border-b-4 border-black">
                      <button 
                        onClick={() => setActiveTab("directives")}
                        className={cn(
                          "px-12 py-5 font-black text-lg uppercase tracking-widest transition-all border-r-4 border-black",
                          activeTab === "directives" ? "bg-[#00ffa3]/10 text-[#00ffa3] shadow-[inset_0_-8px_0_#00ffa3]" : "text-stone-600 hover:bg-stone-900"
                        )}
                      >
                         DIRECTIVES
                      </button>
                      <button 
                        onClick={() => setActiveTab("history")}
                        className={cn(
                          "px-12 py-5 font-black text-lg uppercase tracking-widest transition-all border-r-4 border-black",
                          activeTab === "history" ? "bg-[#00ffa3]/10 text-[#00ffa3] shadow-[inset_0_-8px_0_#00ffa3]" : "text-stone-600 hover:bg-stone-900"
                        )}
                      >
                         HISTORY
                      </button>
                      <div className="flex-1 bg-black" />
                      <div className="px-8 flex items-center gap-8 text-[#00ffa3]/30">
                         <Settings size={22} className="hover:text-[#00ffa3] cursor-pointer" />
                         <span className="font-black text-xl select-none italic text-stone-700">{"_>_"}</span>
                         <X size={26} className="hover:text-red-900 cursor-pointer" />
                      </div>
                   </div>

                   {/* Terminal Body */}
                   <div className="flex-1 pt-6 px-10 pb-10 flex flex-col relative overflow-hidden">
                      <div className="space-y-4 mb-8 font-mono text-sm opacity-100 overflow-y-auto custom-scrollbar">
                         <p className="text-[#00ffa3]/30 text-[9px] uppercase tracking-widest border-b border-white/5 pb-2 mb-2">
                           INFO: 127.0.0.1:60470 - "OPTIONS /api/v1/chat/orchestrate HTTP/1.1" 200 OK
                         </p>
                         
                         <div className="space-y-4">
                            <div className="space-y-1">
                                <p className="text-[#ffff00] font-black tracking-[0.2em]">{`---PLANNING EXECUTION---`}</p>
                                <p className="text-[#00ffa3]/80 font-bold">{`---LLM CALL [Model: regle-core-v1-industrial]---`}</p>
                                <div className="flex flex-col gap-0.5 mt-2 ml-4 underline decoration-pink-500/20 underline-offset-4">
                                   <p className="text-pink-500 font-bold text-xs italic">{`> TRACE: MAPPING_GENESIS_VECTORS`}</p>
                                   <p className="text-pink-500 font-bold text-xs italic">{`> TRACE: RETRIEVING_LOCAL_KNOWLEDGE_BASE`}</p>
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
                      </div>

                      <div className="flex-1 flex flex-col pt-4 border-t-2 border-white/5">
                        <div className="flex items-start gap-6 text-[#00ffa3]">
                          <span className="text-3xl font-black">{">"}</span>
                          <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="INJECT COMMAND DIRECTIVE..."
                            className="w-full flex-1 bg-transparent border-none text-[#00ffa3] text-xl font-bold focus:outline-none placeholder:text-[#00ffa3]/10 shadow-none uppercase tracking-tighter leading-tight resize-none h-full"
                          />
                        </div>
                      </div>

                      <div className="mt-auto flex items-center justify-end gap-10">
                         <span className="text-white/20 font-black text-xs uppercase tracking-widest select-none">SUBMIT COMMAND</span>
                         <button className="relative w-20 h-20 border-4 border-[#00ffa3] flex items-center justify-center transition-all bg-transparent hover:bg-[#00ffa3] hover:text-black group">
                            <ArrowRight size={40} className="text-[#00ffa3] group-hover:text-black transition-colors" strokeWidth={3} />
                         </button>
                      </div>
                   </div>
                </div>
             </div>
          </section>
        </main>
      </div>
    </div>
  );
}
