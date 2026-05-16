"use client";

import React, { useState, useEffect } from "react";
import {
  X, Globe, Plus, FileText, Trash2, Database, ExternalLink,
  GitBranch as Github, GraduationCap, Search, Loader2,
  ArrowUpRight, Activity
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AddSourceModal } from "./AddSourceModal";
import { supabase } from "@/lib/supabase";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

interface Source {
  id: string;
  name: string;
  type: "file" | "url" | "github" | "academic";
  status: "processed" | "processing" | "error";
  url?: string;
  metadata?: any;
  isSelected?: boolean;
}

interface SourcesPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SourcesPanel({ isOpen, onClose }: SourcesPanelProps) {
  const [sources, setSources] = useState<Source[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const searchParams = useSearchParams();
  const projectId = searchParams.get("id") || searchParams.get("project_id");

  const fetchSources = async () => {
    setIsLoading(true);
    let q = supabase
      .from("knowledge_base")
      .select("*")
      .order("created_at", { ascending: false });

    if (projectId) {
      q = q.eq("project_id", projectId);
    }

    const { data, error } = await q;

    if (!error && data) {
      setSources(
        data.map((d) => ({
          id: d.id,
          name:
            d.metadata?.title || d.metadata?.source || d.name || "Untitled",
          type: d.type as any,
          status: "processed",
          url: d.metadata?.url,
          isSelected: false,
        }))
      );
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if (isOpen) fetchSources();
  }, [isOpen, projectId]);

  const removeSource = async (id: string) => {
    const { error } = await supabase
      .from("knowledge_base")
      .delete()
      .eq("id", id);
    if (!error) fetchSources();
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "url": return <Globe size={16} />;
      case "github": return <Github size={16} />;
      case "academic": return <GraduationCap size={16} />;
      default: return <FileText size={16} />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "url": return "text-blue-400";
      case "github": return "text-purple-400";
      case "academic": return "text-amber-400";
      default: return "text-[#00FFB2]";
    }
  };

  const filteredSources = sources.filter((s) =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99]"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full sm:w-[420px] z-[100] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="h-full bg-[#0F0F0F] border-l border-white/[0.06] flex flex-col">
          {/* Header */}
          <div className="px-6 py-5 border-b border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-[#00FFB2]/10 border border-[#00FFB2]/20 flex items-center justify-center">
                <Database size={16} className="text-[#00FFB2]" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white tracking-[0.02em]" style={{ fontFamily: "'Space Grotesk', monospace" }}>
                  Knowledge Base
                </h2>
                <p className="text-[10px] text-white/25 font-medium tracking-[0.08em] uppercase mt-0.5">
                  {sources.length} sources indexed
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-lg border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white hover:bg-white/5 transition-all"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search & Add */}
          <div className="px-6 py-4 border-b border-white/[0.06] space-y-3">
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-white/[0.04] border border-white/[0.06] focus-within:border-[#00FFB2]/20 transition-colors">
              <Search size={14} className="text-white/25 flex-shrink-0" />
              <input
                type="text"
                placeholder="Search sources..."
                className="bg-transparent border-none text-xs font-medium text-white placeholder:text-white/20 focus:outline-none flex-1 tracking-[0.02em]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="w-full h-10 rounded-lg bg-white/[0.04] border border-white/[0.06] border-dashed flex items-center justify-center gap-2 text-white/30 hover:text-[#00FFB2] hover:border-[#00FFB2]/20 hover:bg-[#00FFB2]/5 transition-all duration-200 group"
            >
              <Plus
                size={14}
                className="group-hover:rotate-90 transition-transform duration-200"
              />
              <span className="text-[10px] font-semibold uppercase tracking-[0.08em]">
                Add Source
              </span>
            </button>
          </div>

          {/* Sources List */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 custom-scrollbar">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 size={24} className="animate-spin text-white/20" />
                <span className="text-[10px] font-medium text-white/20 uppercase tracking-[0.12em]">
                  Loading sources...
                </span>
              </div>
            ) : filteredSources.length === 0 ? (
              <div className="text-center py-24 space-y-4">
                <div className="w-14 h-14 mx-auto rounded-xl bg-white/[0.03] border border-white/[0.06] border-dashed flex items-center justify-center">
                  <Database size={20} className="text-white/15" />
                </div>
                <p className="text-xs font-medium text-white/20">
                  {searchTerm ? "No matching sources" : "No sources added yet"}
                </p>
              </div>
            ) : (
              filteredSources.map((source, i) => (
                <motion.div
                  key={source.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="group"
                >
                  <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/[0.03] transition-all duration-150 border border-transparent hover:border-white/[0.06]">
                    {/* Type icon */}
                    <div className={cn(
                      "w-8 h-8 rounded-md bg-white/[0.04] border border-white/[0.06] flex items-center justify-center flex-shrink-0",
                      getTypeColor(source.type)
                    )}>
                      {getTypeIcon(source.type)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-white/70 truncate tracking-[0.01em]">
                        {source.name}
                      </h4>
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="w-1 h-1 rounded-full bg-[#00FFB2]/50" />
                        <span className="text-[9px] font-medium text-white/20 uppercase tracking-[0.08em]">
                          {source.type}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {source.url && (
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noreferrer"
                          className="w-7 h-7 rounded-md flex items-center justify-center text-white/20 hover:text-white/50 hover:bg-white/5 transition-all"
                        >
                          <ArrowUpRight size={13} />
                        </a>
                      )}
                      <button
                        onClick={() => removeSource(source.id)}
                        className="w-7 h-7 rounded-md flex items-center justify-center text-white/20 hover:text-[#FF6B9D] hover:bg-[#FF6B9D]/10 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-white/[0.06] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[10px] text-white/15 font-medium tracking-[0.08em]">
              <Activity size={10} className="animate-status-pulse" />
              <span>
                {Math.round((sources.length / 50) * 100)}% capacity
              </span>
            </div>
            <span className="text-[10px] text-white/10 font-medium tracking-[0.08em]">
              Index ready
            </span>
          </div>
        </div>
      </div>

      <AddSourceModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUpload={async (file) => {
          fetchSources();
        }}
        onGithubIngest={async (repoUrl) => {
          fetchSources();
        }}
        onUrlIngest={async (url) => {
          fetchSources();
        }}
        onTextIngest={async (text) => {
          fetchSources();
        }}
        onAcademicIngest={async (query) => {
          fetchSources();
        }}
        onWebSearch={async (q) => {
          const res = await fetch(
            `http://127.0.0.1:8000/api/v1/ingest/search?query=${encodeURIComponent(q)}`
          );
          const data = await res.json();
          return data.results || [];
        }}
        onAutoUplink={async (q) => {
          await fetch(
            `http://127.0.0.1:8000/api/v1/ingest/auto?query=${encodeURIComponent(q)}&project_id=${projectId}`,
            { method: "POST" }
          );
          fetchSources();
        }}
      />
    </>
  );
}
