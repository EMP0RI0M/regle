"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Zap, 
  Orbit,
  LayoutDashboard,
  Search
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { supabase } from "@/lib/supabase";

export default function LandingPage() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="min-h-screen bg-stone-100 text-black font-mono selection:bg-cyan-300 selection:text-black">
      {/* Brutalist Header */}
      <header className="h-24 flex items-center justify-between px-10 border-b-8 border-black bg-white sticky top-0 z-50 shadow-[0px_8px_0px_0px_rgba(0,0,0,1)]">
        <Logo className="scale-125 origin-left" variant="light" />
        <nav className="hidden md:flex items-center gap-10 font-black text-xl text-black uppercase tracking-tighter">
          <a href="#features" className="hover:bg-cyan-300 px-4 py-2 border-4 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">Features</a>
          <a href="#architecture" className="hover:bg-pink-300 px-4 py-2 border-4 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">Architecture</a>
          <a href="#security" className="hover:bg-amber-300 px-4 py-2 border-4 border-transparent hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-all">Security</a>
        </nav>
        
        <div className="flex items-center gap-6">
          {session ? (
            <Link 
              href="/projects"
              className="bg-emerald-400 text-black px-8 py-3 border-4 border-black font-black text-lg flex items-center gap-3 uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
            >
              <LayoutDashboard size={24} />
              CONSOLE
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-black font-black text-xl hover:bg-black hover:text-white px-4 py-2 border-4 border-transparent hover:border-black transition-all uppercase tracking-tighter">
                LOGIN
              </Link>
              <Link 
                href="/signup"
                className="bg-cyan-300 text-black px-8 py-3 border-4 border-black font-black text-xl uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                INITIALIZE
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Brutalist Hero Section */}
      <section className="pt-20 pb-32 px-10 overflow-hidden relative border-b-8 border-black bg-yellow-300">
        <div className="absolute inset-0 z-0 opacity-10" style={{ backgroundImage: "radial-gradient(#000 2px, transparent 2px)", backgroundSize: "32px 32px" }}></div>
        <div className="w-full max-w-7xl mx-auto flex flex-col items-center text-center space-y-10 relative z-10 pt-16">
           
           <div className="inline-flex items-center gap-4 bg-white border-4 border-black px-6 py-2 text-black text-xl font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-4">
              <Sparkles size={24} className="text-pink-500 animate-pulse" />
              Regle Local Host Matrix
           </div>
           
           <h1 className="text-7xl md:text-[120px] font-black text-black leading-[0.85] tracking-tighter uppercase drop-shadow-[8px_8px_0_rgba(255,255,255,1)]" style={{ WebkitTextStroke: "4px black" }}>
             RESEARCH WITH<br/><span className="bg-emerald-400 px-4 border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] inline-block mt-4 -rotate-2 hover:rotate-0 transition-transform cursor-pointer">ABSOLUTE</span> CONTEXT.
           </h1>
           
           <p className="text-3xl text-black max-w-4xl mx-auto leading-tight font-bold uppercase tracking-widest bg-white p-6 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
             The hyper-regle multi-modal RAG engine. <br/><span className="bg-black text-white px-2">Inject local data. Target live APIs. Total Isolation.</span>
           </p>

           <div className="w-full max-w-4xl pt-12 space-y-12">
              <div className="relative group">
                <div className="absolute -top-10 left-0 bg-black text-emerald-400 px-6 py-2 border-4 border-black border-b-0 font-black uppercase text-xl flex items-center gap-3 shadow-[8px_-8px_0px_0px_rgba(0,0,0,1)]">
                  <Search size={28} />
                  QUERY MATRIX
                </div>
                
                <div className="flex flex-col md:flex-row gap-0 border-8 border-black shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] bg-white p-0">
                  <input 
                    type="text"
                    placeholder="COMMAND REGLE... (E.G. SUMMARIZE RECENT AI AGENT PAPERS)"
                    className="flex-1 px-8 py-10 text-3xl font-black uppercase placeholder:text-stone-300 focus:outline-none focus:bg-cyan-50 transition-all border-b-8 md:border-b-0 md:border-r-8 border-black"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        const val = (e.target as HTMLInputElement).value;
                        if (val.trim()) window.location.href = `/search?q=${encodeURIComponent(val)}`;
                      }
                    }}
                  />
                  <button 
                    onClick={() => {
                      const input = document.querySelector('input') as HTMLInputElement;
                      if (input.value.trim()) window.location.href = `/search?q=${encodeURIComponent(input.value)}`;
                    }}
                    className="bg-emerald-400 hover:bg-black hover:text-emerald-400 transition-all font-black text-4xl px-12 py-10 uppercase tracking-tighter flex items-center justify-center gap-4"
                  >
                    EXECUTE
                    <ArrowRight size={44} strokeWidth={3} />
                  </button>
                </div>

                <div className="flex justify-between items-center py-4 px-2">
                   <div className="flex flex-wrap gap-4">
                      {[
                        "Summarize GTC 2024",
                        "Audit local Rust crate",
                        "Search ArXiv: LLM Safety",
                        "Extract YT: Nvidia H200"
                      ].map((term, i) => (
                        <button 
                          key={term}
                          onClick={() => window.location.href = `/search?q=${encodeURIComponent(term)}`}
                          className="text-[10px] font-black text-black opacity-60 uppercase tracking-widest bg-stone-200 hover:bg-black hover:text-white px-3 py-1 border-2 border-black transition-all"
                        >
                           {term}
                        </button>
                      ))}
                   </div>
                   <div className="hidden lg:flex gap-6">
                      <span className="text-xs font-black text-black opacity-40 uppercase tracking-widest bg-white border-2 border-black/10 px-2 flex items-center gap-2 animate-pulse">
                         <div className="w-2 h-2 bg-emerald-500 rounded-full" /> 
                         UPLINK: ACTIVE
                      </span>
                   </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-4 w-full">
                {session ? (
                  <Link 
                    href="/projects"
                    className="w-full bg-black text-white px-8 py-6 border-4 border-black font-black text-2xl flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(255,100,200,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-tighter"
                  >
                    ENTER DATABANK
                    <LayoutDashboard size={28} className="font-black" />
                  </Link>
                ) : (
                  <Link 
                    href="/signup"
                    className="w-full bg-black text-white px-8 py-6 border-4 border-black font-black text-2xl flex items-center justify-center gap-4 shadow-[8px_8px_0px_0px_rgba(255,100,200,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all uppercase tracking-tighter group"
                  >
                    DEPLOY NODE
                    <ArrowRight size={28} className="font-black group-hover:translate-x-2 transition-transform" />
                  </Link>
                )}
              </div>
           </div>
        </div>
      </section>

      {/* Constant Ticker */}
      <div className="w-full border-b-8 border-black bg-black text-emerald-400 py-4 overflow-hidden flex whitespace-nowrap">
         <div className="font-black text-3xl uppercase tracking-widest animate-[marquee_20s_linear_infinite] inline-block">
            NO TELEMETRY • 100% OFFLINE CAPABLE • ON-DEVICE VECTORIZATION • LANGGRAPH ORCHESTRATION • NVIDIA VLM VISION PIPELINE • LOCAL SUPERIORITY • 
            NO TELEMETRY • 100% OFFLINE CAPABLE • ON-DEVICE VECTORIZATION • LANGGRAPH ORCHESTRATION • NVIDIA VLM VISION PIPELINE • LOCAL SUPERIORITY • 
         </div>
         <style>{`
            @keyframes marquee {
              0% { transform: translateX(0%); }
              100% { transform: translateX(-50%); }
            }
         `}</style>
      </div>

      {/* Grid of Features */}
      <section id="features" className="py-32 bg-stone-100 border-b-8 border-black">
        <div className="max-w-[1400px] mx-auto px-10">
           <div className="text-left mb-20 max-w-4xl border-l-8 border-black pl-8">
              <h2 className="text-7xl font-black text-black uppercase tracking-tighter leading-none mb-6">WHY OVERRIDE?</h2>
              <p className="text-3xl text-stone-600 font-bold uppercase tracking-widest">Built for terminal operators requiring zero leakage.</p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {[
                {
                  title: "MULTI-MODAL CORE",
                  desc: "INJECT PDFS, IMAGES, DIRECTORY TREES AND ARX/YT FEEDS SIMULTANEOUSLY. LOCAL VISION MODELS PROCESS OCR FRAMES SECURELY.",
                  icon: Orbit,
                  color: "text-black",
                  bg: "bg-cyan-300"
                },
                {
                  title: "REGLE ISOLATION",
                  desc: "NO MIDDLEMEN API. NO TELEMETRY PACKETS. YOUR DATA NEVER LEAVES THE CLUSTER UNLESS EXPLICITLY DIRECTED TO LLM PORTS.",
                  icon: ShieldCheck,
                  color: "text-black",
                  bg: "bg-emerald-400"
                },
                {
                  title: "LATENCY ZERO",
                  desc: "PARALLEL LANGGRAPH ORCHESTRATORS ROUTE TO HYBRID STREAMS IN MILLISECONDS. LOCAL MEMORY INDEXING.",
                  icon: Zap,
                  color: "text-black",
                  bg: "bg-pink-400"
                }
              ].map((f, i) => (
                <div key={i} className={`p-10 border-8 border-black ${f.bg} hover:bg-white shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all flex flex-col group cursor-crosshair`}>
                   <div className="w-24 h-24 border-8 border-black bg-white flex items-center justify-center mb-10 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] group-hover:rotate-12 transition-transform">
                      <f.icon size={48} className={f.color} />
                   </div>
                   <h3 className="text-4xl font-black text-black mb-6 uppercase tracking-tighter leading-none">{f.title}</h3>
                   <p className="text-xl text-black font-black leading-relaxed tracking-widest uppercase">
                     {f.desc}
                   </p>
                </div>
              ))}
           </div>
        </div>
      </section>

      {/* Action Block */}
      <section className="py-32 px-10 bg-white border-b-8 border-black flex justify-center text-center">
         <div className="max-w-5xl w-full border-8 border-black bg-indigo-400 p-20 shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] relative group">
            <div className="absolute -top-10 -right-10 w-24 h-24 border-8 border-black bg-yellow-400 animate-spin [animation-duration:3s]" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 border-8 border-black bg-cyan-400 rounded-full animate-pulse" />
            
            <h2 className="text-6xl md:text-[90px] font-black text-black uppercase tracking-tighter leading-none mb-12" style={{ WebkitTextStroke: "2px white" }}>
               EVOLVE YOUR <br/>WORKFLOW NOW.
            </h2>
            
            <Link 
              href={session ? "/projects" : "/signup"}
              className="inline-flex items-center gap-6 bg-white text-black border-8 border-black px-16 py-8 text-4xl font-black uppercase tracking-tighter shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-3 hover:translate-y-3 hover:shadow-none transition-all"
            >
               {session ? "OPEN CONSOLE" : "INITIALIZE UPLINK"}
               <ArrowRight size={40} className="font-black" />
            </Link>
         </div>
      </section>

      <footer className="py-12 bg-black text-emerald-400 text-center font-black text-2xl uppercase tracking-widest">
         © 2026 REGLE RAG ENGINE • TERMINAL MATRIX
      </footer>
    </div>
  );
}
