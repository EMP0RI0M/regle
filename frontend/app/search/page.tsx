"use client";

import React, { useState, useEffect, useRef, useCallback, Suspense } from "react";
import {
  Search, Send, Plus, Loader2, Sparkles, Database, ArrowRight,
  Terminal, Cpu, Globe, ArrowLeft, Zap, User, Copy, Share2,
  ChevronDown, Activity, Command, CornerDownLeft
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/Logo";
import { SourcesPanel } from "@/components/SourcesPanel";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

const MODE_CONFIG = {
  standard: { label: "Standard", desc: "General purpose", icon: Globe },
  research: { label: "Research", desc: "Multi-source deep", icon: Search },
  local: { label: "Local", desc: "On-device RAG", icon: Database },
  deep: { label: "Deep", desc: "Extended analysis", icon: Cpu },
} as const;

type Mode = keyof typeof MODE_CONFIG;

function SearchPageContent() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const [mode, setMode] = useState<Mode>("research");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [systemStatus, setSystemStatus] = useState<"ready" | "processing" | "error">("ready");

  const searchParams = useSearchParams();
  const projectId = searchParams.get("id") || searchParams.get("project_id");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSearching]);

  // Keyboard shortcut: Ctrl+K to focus input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || isSearching) return;

    const userMsg: Message = {
      id: Math.random().toString(36).substring(7),
      type: "user",
      content: searchQuery,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setIsSearching(true);
    setSystemStatus("processing");

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/v1/chat/orchestrate`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: searchQuery,
            mode: mode,
            project_id: projectId,
            limit: 10,
          }),
        }
      );

      if (!response.ok) throw new Error("Synthesis failed");
      const data = await response.json();

      let fullContent = "";
      if (data.steps && data.steps.length > 0) {
        fullContent +=
          "```terminal\n" +
          data.steps
            .map(
              (s: string) =>
                `[${new Date().toLocaleTimeString("en-GB")}] ${s.toUpperCase()}`
            )
            .join("\n") +
          "\n```\n\n";
      }

      fullContent += data.answer;

      const assistantMsg: Message = {
        id: Math.random().toString(36).substring(7),
        type: "assistant",
        content: fullContent,
        timestamp: new Date(),
        metadata: { sources: data.sources },
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setSystemStatus("ready");
    } catch (e) {
      console.error(e);
      setSystemStatus("error");
      setTimeout(() => setSystemStatus("ready"), 3000);
    } finally {
      setIsSearching(false);
    }
  }, [isSearching, mode, projectId]);

  const statusColor = {
    ready: "bg-[#00FFB2]",
    processing: "bg-[#FFD84D]",
    error: "bg-[#FF6B9D]",
  };

  const statusLabel = {
    ready: "READY",
    processing: "PROCESSING",
    error: "ERROR",
  };

  return (
    <div className="h-screen bg-[#0A0A0A] text-white font-mono flex flex-col selection:bg-[#00FFB2]/30 selection:text-white overflow-hidden relative noise-bg">
      {/* Subtle background grid */}
      <div className="absolute inset-0 dot-grid-subtle pointer-events-none z-0" />

      {/* ═══════════════════════════════════════════════════
          HEADER — Clean, minimal, dark glass
          ═══════════════════════════════════════════════════ */}
      <header className="h-16 flex items-center justify-between px-6 relative z-20 glass-dark border-b border-white/[0.06]">
        <div className="flex items-center gap-5">
          <Link
            href="/"
            className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-white/40 hover:text-white hover:border-white/20 hover:bg-white/5 transition-all duration-200"
          >
            <ArrowLeft size={18} />
          </Link>

          <div className="h-5 w-px bg-white/10" />

          <Logo />

          <div className="hidden md:flex items-center gap-3 ml-2">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
              <div className={cn("w-1.5 h-1.5 rounded-full", statusColor[systemStatus], systemStatus === "processing" && "animate-pulse")} />
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-[0.08em]">
                {statusLabel[systemStatus]}
              </span>
            </div>
            {projectId && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06]">
                <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.08em]">
                  {projectId.substring(0, 8)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowSources(true)}
            className="h-9 px-3 rounded-lg border border-white/10 flex items-center gap-2 text-white/40 hover:text-white hover:border-[#00FFB2]/30 hover:bg-[#00FFB2]/5 transition-all duration-200 group"
          >
            <Database size={15} className="group-hover:text-[#00FFB2] transition-colors" />
            <span className="text-[10px] font-medium uppercase tracking-[0.08em] hidden sm:inline">Sources</span>
          </button>

          <div className="w-9 h-9 rounded-lg border border-white/10 overflow-hidden bg-white/[0.04] flex items-center justify-center">
            <User size={16} className="text-white/30" />
          </div>
        </div>
      </header>

      {/* ═══════════════════════════════════════════════════
          MAIN CONTENT AREA
          ═══════════════════════════════════════════════════ */}
      <div className="flex-1 flex overflow-hidden relative z-10">
        <main className="flex-1 overflow-y-auto pb-56 pt-8 px-6 md:px-12 custom-scrollbar">
          <div className="max-w-3xl mx-auto w-full">
            <AnimatePresence mode="wait">
              {messages.length === 0 ? (
                /* ─── EMPTY STATE ─── */
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="py-32 text-center space-y-10"
                >
                  {/* Icon */}
                  <motion.div
                    className="w-20 h-20 mx-auto rounded-2xl bg-[#00FFB2]/10 border border-[#00FFB2]/20 flex items-center justify-center glow-green-pulse"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <Terminal size={32} className="text-[#00FFB2]" />
                  </motion.div>

                  {/* Heading */}
                  <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                      What would you like to
                      <br />
                      <span className="text-[#00FFB2]">research</span> today?
                    </h1>
                    <p className="text-sm text-white/25 font-medium tracking-[0.08em] uppercase">
                      Multi-modal synthesis engine • v1.0.4
                    </p>
                  </div>

                  {/* Suggested queries */}
                  <div className="flex flex-wrap justify-center gap-2 pt-4 max-w-lg mx-auto">
                    {[
                      "Summarize recent AI safety papers",
                      "Analyze local knowledge base",
                      "Compare transformer architectures",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => handleSearch(suggestion)}
                        className="px-4 py-2 rounded-lg bg-white/[0.04] border border-white/[0.06] text-xs text-white/40 hover:text-white/70 hover:border-[#00FFB2]/20 hover:bg-[#00FFB2]/5 transition-all duration-200"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  {/* Keyboard hint */}
                  <div className="flex items-center justify-center gap-2 text-white/15 text-[11px]">
                    <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03] text-[10px]">
                      Ctrl
                    </kbd>
                    <span>+</span>
                    <kbd className="px-1.5 py-0.5 rounded border border-white/10 bg-white/[0.03] text-[10px]">
                      K
                    </kbd>
                    <span className="ml-1">to focus</span>
                  </div>
                </motion.div>
              ) : (
                /* ─── MESSAGES ─── */
                <div className="space-y-8 pb-16">
                  {messages.map((msg, index) => (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.4,
                        ease: "easeOut",
                        delay: index === messages.length - 1 ? 0.1 : 0,
                      }}
                      className={cn(
                        "flex w-full group",
                        msg.type === "user" ? "justify-end" : "justify-start"
                      )}
                    >
                      <div className={cn(
                        "max-w-[85%] relative",
                        msg.type === "user" ? "pl-12" : "pr-12"
                      )}>
                        {msg.type === "user" ? (
                          /* ─── USER MESSAGE ─── */
                          <div className="relative">
                            <div className="bg-white/[0.06] backdrop-blur-sm border border-white/[0.08] rounded-2xl rounded-tr-sm px-6 py-5">
                              <p className="text-[15px] text-white/90 leading-relaxed font-medium">
                                {msg.content}
                              </p>
                            </div>
                            <div className="mt-2 flex justify-end">
                              <span className="text-[10px] text-white/15 font-medium tracking-[0.08em]">
                                {msg.timestamp.toLocaleTimeString()}
                              </span>
                            </div>
                          </div>
                        ) : (
                          /* ─── ASSISTANT MESSAGE ─── */
                          <div className="relative">
                            <div className="bg-[#141414] border border-white/[0.06] rounded-2xl rounded-tl-sm px-6 py-6 overflow-hidden">
                              {/* Top accent line */}
                              <div className="absolute top-0 left-6 right-6 h-px bg-gradient-to-r from-transparent via-[#00FFB2]/30 to-transparent" />

                              <MarkdownRenderer content={msg.content} />

                              {/* Sources */}
                              {msg.metadata?.sources && msg.metadata.sources.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-white/[0.06]">
                                  <div className="text-[10px] font-medium uppercase tracking-[0.12em] mb-3 text-white/20 flex items-center gap-2">
                                    <Database size={12} />
                                    Sources
                                  </div>
                                  <div className="flex flex-wrap gap-2">
                                    {msg.metadata.sources.map((s: any, idx: number) => (
                                      <div
                                        key={idx}
                                        className="px-3 py-1.5 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center gap-2 group/source cursor-pointer hover:border-[#00FFB2]/20 hover:bg-[#00FFB2]/5 transition-all duration-200"
                                      >
                                        <div className="w-1.5 h-1.5 rounded-full bg-[#00FFB2]/60" />
                                        <span className="text-[10px] font-medium text-white/40 group-hover/source:text-white/60 transition-colors tracking-[0.04em]">
                                          {s.metadata?.title || s.name || `Source ${idx + 1}`}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Action bar */}
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-[10px] text-white/15 font-medium tracking-[0.08em]">
                                {msg.timestamp.toLocaleTimeString()}
                              </span>
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                {[
                                  { icon: Copy, label: "Copy" },
                                  { icon: Share2, label: "Share" },
                                ].map(({ icon: Icon, label }) => (
                                  <button
                                    key={label}
                                    className="w-7 h-7 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
                                    title={label}
                                  >
                                    <Icon size={13} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))}

                  {/* Loading indicator */}
                  <AnimatePresence>
                    {isSearching && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        className="flex justify-start"
                      >
                        <div className="bg-[#141414] border border-white/[0.06] rounded-2xl rounded-tl-sm px-6 py-5 flex items-center gap-4">
                          <div className="flex gap-1">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full bg-[#00FFB2]"
                                animate={{ opacity: [0.2, 1, 0.2] }}
                                transition={{
                                  duration: 1.2,
                                  repeat: Infinity,
                                  delay: i * 0.2,
                                }}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-white/30 font-medium tracking-[0.06em]">
                            Orchestrating synthesis...
                          </span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div ref={messagesEndRef} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </main>

        <SourcesPanel
          isOpen={showSources}
          onClose={() => setShowSources(false)}
        />
      </div>

      {/* ═══════════════════════════════════════════════════
          COMMAND INPUT — Fixed bottom, premium glass
          ═══════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        {/* Gradient fade */}
        <div className="h-24 bg-gradient-to-t from-[#0A0A0A] via-[#0A0A0A]/80 to-transparent pointer-events-none" />

        <div className="bg-[#0A0A0A] pb-6 px-6 md:px-12">
          <div className="max-w-3xl mx-auto">
            {/* Input container */}
            <div
              className={cn(
                "relative rounded-xl border transition-all duration-300",
                isFocused
                  ? "border-[#00FFB2]/30 glow-green"
                  : "border-white/[0.08] hover:border-white/[0.12]",
                "bg-[#141414]"
              )}
            >
              <div className="flex items-center">
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent px-5 py-4 text-[15px] font-medium text-white placeholder:text-white/20 focus:outline-none tracking-[0.01em]"
                  style={{ fontFamily: "'Inter', sans-serif" }}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                />

                {/* Mode selector */}
                <div className="flex items-center gap-1 px-2 mr-1">
                  {(Object.entries(MODE_CONFIG) as [Mode, typeof MODE_CONFIG[Mode]][]).map(
                    ([key, config]) => (
                      <button
                        key={key}
                        onClick={() => setMode(key)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-[10px] font-semibold uppercase tracking-[0.08em] transition-all duration-200",
                          mode === key
                            ? "bg-[#00FFB2]/10 text-[#00FFB2] border border-[#00FFB2]/20"
                            : "text-white/20 hover:text-white/40 hover:bg-white/[0.04]"
                        )}
                        title={config.desc}
                      >
                        {config.label}
                      </button>
                    )
                  )}
                </div>

                {/* Execute button */}
                <button
                  onClick={() => handleSearch(query)}
                  disabled={isSearching || !query.trim()}
                  className={cn(
                    "h-10 px-5 mr-2 rounded-lg font-bold text-sm uppercase tracking-[0.06em] flex items-center gap-2 transition-all duration-200",
                    query.trim() && !isSearching
                      ? "bg-[#00FFB2] text-[#0A0A0A] hover:bg-[#00FFB2]/90 hover:shadow-[0_0_20px_rgba(0,255,178,0.3)] active:scale-[0.97]"
                      : "bg-white/[0.04] text-white/15 cursor-not-allowed"
                  )}
                  style={{ fontFamily: "'Space Grotesk', monospace" }}
                >
                  {isSearching ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <>
                      Execute
                      <CornerDownLeft size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Bottom bar — subtle */}
            <div className="mt-3 flex items-center justify-between px-1">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[10px] text-white/15 font-medium tracking-[0.08em]">
                  <div className={cn("w-1.5 h-1.5 rounded-full", statusColor[systemStatus])} />
                  <span>{messages.length} messages</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-white/15 font-medium tracking-[0.08em]">
                  <Activity size={10} className="animate-status-pulse" />
                  <span>{MODE_CONFIG[mode].label} mode</span>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-[10px] text-white/10">
                <kbd className="px-1 py-0.5 rounded border border-white/[0.06] bg-white/[0.02] text-[9px]">
                  ↵
                </kbd>
                <span>to send</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-[#0A0A0A] flex items-center justify-center">
        <div className="flex gap-1">
          {[0,1,2].map(i => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#00FFB2] animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
          ))}
        </div>
      </div>
    }>
      <SearchPageContent />
    </Suspense>
  );
}
