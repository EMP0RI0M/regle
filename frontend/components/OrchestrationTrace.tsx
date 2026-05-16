"use client";

import React from "react";
import { Terminal, Activity, Zap } from "lucide-react";

interface OrchestrationTraceProps {
  content: string;
}

export const OrchestrationTrace: React.FC<OrchestrationTraceProps> = ({ content }) => {
  const lines = content.split("\n").filter(line => line.trim() !== "");

  const renderLine = (line: string, index: number) => {
    const trimmed = line.trim();
    
    // Header/Execution blocks
    if (trimmed.startsWith("---") && trimmed.endsWith("---")) {
      if (trimmed.includes("PLANNING") || trimmed.includes("GENERATING") || trimmed.includes("GRADING")) {
        return (
          <div key={index} className="text-[#ffff00] font-black tracking-[0.1em] md:tracking-[0.2em] mt-4 md:mt-6 first:mt-0 uppercase flex items-center gap-2 md:gap-3 text-[10px] md:text-xs">
             <Zap size={12} className="fill-[#ffff00] md:w-[14px] md:h-[14px]" /> {trimmed}
          </div>
        );
      }
      if (trimmed.includes("NODE:")) {
        return (
          <div key={index} className="text-cyan-400 font-black tracking-[0.1em] mt-3 ml-4 bg-cyan-400/5 border-l-4 border-cyan-400 px-4 py-1">
            {trimmed}
          </div>
        );
      }
      if (trimmed.includes("LLM CALL")) {
        return (
          <div key={index} className="text-[#00ffa3]/80 font-bold mt-2 text-xs italic flex items-center gap-2">
             <Activity size={10} /> {trimmed}
          </div>
        );
      }
    }

    // Traces
    if (trimmed.startsWith("> TRACE:")) {
      return (
        <div key={index} className="text-pink-500 font-bold text-xs italic ml-8 border-l-2 border-pink-500/20 pl-4 py-0.5 my-1">
          {trimmed}
        </div>
      );
    }

    // Generic Info logs
    if (trimmed.startsWith("INFO:") || trimmed.includes("HTTP/1.1\" 200 OK")) {
        return (
            <p key={index} className="text-[#00ffa3]/30 text-[9px] uppercase tracking-widest border-b border-white/5 pb-1 mb-1">
              {trimmed}
            </p>
        );
    }

    return (
      <div key={index} className="text-[#00ffa3] font-medium text-xs ml-4 my-1 opacity-70">
        {trimmed}
      </div>
    );
  };

  return (
    <div className="my-6 md:my-8 border-4 md:border-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-[#f472b6] p-2 md:p-4 relative group">
      {/* Title Bar */}
      <div className="absolute -top-8 md:-top-10 left-0 bg-black text-white px-3 md:px-6 py-1 md:py-1.5 text-[8px] md:text-[10px] font-black uppercase tracking-[0.1em] md:tracking-[0.2em] flex items-center gap-2 md:gap-3 border-2 md:border-4 border-black border-b-0 shadow-[2px_0px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_0px_0px_0px_rgba(0,0,0,1)] whitespace-nowrap">
        <Terminal size={12} className="text-emerald-400 md:w-[14px] md:h-[14px]" />
        <span className="hidden xs:inline">ORCHESTRATION_THINKING_ENGINE</span>
        <span className="xs:inline hidden">ORCHEST_ENGINE</span>
      </div>

      <div className="bg-[#050505] p-3 md:p-8 min-h-[100px] font-mono relative overflow-hidden">
        {/* Scanline Effect Overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05] z-10 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%]" />
        
        {/* Glow Effect */}
        <div className="absolute top-0 left-0 w-full h-1 bg-[linear-gradient(90deg,transparent,rgba(0,255,163,0.3),transparent)]" />

        <div className="relative z-20 space-y-1">
          {lines.map((line, idx) => renderLine(line, idx))}
        </div>

        {/* Console Footer */}
        <div className="mt-8 pt-4 border-t border-white/5 flex justify-between items-center text-[8px] font-black uppercase tracking-widest text-[#00ffa3]/20">
            <span>UPLINK_STABLE</span>
            <span>DATA::SYNTHESIS_MAP</span>
            <span>ID_0x7F2A_ORCHESTRATOR</span>
        </div>
      </div>
    </div>
  );
};
