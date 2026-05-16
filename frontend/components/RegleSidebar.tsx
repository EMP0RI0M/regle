"use client";

import React, { useState, useRef } from "react";
import { Database, Plus, LayoutGrid, LogOut, Search, Settings, User, Cpu, Loader2 } from "lucide-react";
import { Logo } from "./Logo";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface SidebarProps {
  onToggleSources: () => void;
  sourcesOpen?: boolean;
}

export function RegleSidebar({ onToggleSources, sourcesOpen }: SidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const projectId = searchParams.get("id");

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const url = new URL("http://localhost:8000/api/v1/ingest/file");
      if (projectId) url.searchParams.append("project_id", projectId);
      
      const response = await fetch(url.toString(), {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        if (!sourcesOpen) onToggleSources();
      }
    } catch (err) {
      console.error("Error uploading", err);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return (
    <aside className="fixed left-0 top-0 h-full w-24 bg-stone-100 border-r-8 border-black flex flex-col items-center py-10 gap-10 shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] z-50 overflow-y-auto custom-scrollbar">
      {/* Logo Container */}
      <div className="flex items-center justify-center p-2 bg-emerald-400 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer">
        <Link href="/">
           <Cpu size={32} className="text-black" />
        </Link>
      </div>

      <div className="flex flex-col gap-6 items-center w-full px-4 pt-10">
        {/* Dynamic Nodes Toggle */}
        <button
          onClick={onToggleSources}
          title="NODE_REPOSITORY"
          className={cn(
            "w-full aspect-square border-4 border-black flex items-center justify-center transition-all cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-cyan-300",
            sourcesOpen ? "bg-cyan-300 shadow-none translate-x-[4px] translate-y-[4px]" : "bg-white hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
          )}
        >
          <Database size={28} className="font-black" />
        </button>

        {/* Global Search / Ingest Quick-add */}
        <button
          title="INJECT_NODE"
          disabled={isUploading}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "w-full aspect-square border-4 border-black bg-white flex items-center justify-center transition-all cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-emerald-400 hover:translate-x-1 hover:translate-y-1 hover:shadow-none",
            isUploading && "opacity-50 pointer-events-none"
          )}
        >
          {isUploading ? <Loader2 className="animate-spin" /> : <Plus size={28} />}
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileUpload} />
        </button>

        {/* Projects Routing */}
        <Link
          href="/projects"
          title="SYSTEM_PROJECTS"
          className="w-full aspect-square border-4 border-black bg-white flex items-center justify-center transition-all cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-pink-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          <LayoutGrid size={28} />
        </Link>

        {/* Settings Placeholder */}
        <div className="w-full aspect-square border-4 border-black bg-white flex items-center justify-center transition-all cursor-pointer shadow-[4px_4px_0_rgba(0,0,0,1)] hover:bg-amber-300 hover:translate-x-1 hover:translate-y-1 hover:shadow-none opacity-50 hover:opacity-100">
           <Settings size={28} />
        </div>
      </div>

      {/* User Exit */}
      <div className="mt-auto relative flex justify-center w-full px-4">
        {showUserMenu && (
          <div className="absolute bottom-16 left-20 w-48 bg-white border-4 border-black shadow-[8px_8px_0_rgba(0,0,0,1)] p-4 z-50 font-black uppercase text-xs tracking-widest animate-in slide-in-from-left-2">
            <button
              onClick={handleLogout}
              className="flex items-center justify-between w-full p-3 bg-red-400 border-2 border-black hover:bg-red-500 transition-colors shadow-[4px_4px_0_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
            >
              <span>DISCONNECT</span>
              <LogOut size={16} />
            </button>
          </div>
        )}
        <div 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-12 h-12 bg-black text-white border-2 border-emerald-400 flex items-center justify-center text-xl font-black cursor-pointer shadow-[4px_4px_0_rgba(255,255,255,1)] hover:bg-zinc-800 transition-all select-none uppercase"
        >
          U
        </div>
      </div>
    </aside>
  );
}
