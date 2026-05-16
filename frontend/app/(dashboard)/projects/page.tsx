"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Folder, 
  MoreVertical, 
  ArrowRight, 
  Search, 
  Clock, 
  Box, 
  Sparkles,
  Command,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Logo } from "@/components/Logo";

interface Project {
  id: string;
  name: string;
  created_at: string;
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newProjectName, setNewProjectName] = useState("");
  const [showNewModal, setShowNewModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error("Error fetching projects:", err);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("projects")
        .insert({ name: newProjectName, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      setProjects([data, ...projects]);
      setNewProjectName("");
      setShowNewModal(false);
    } catch (err) {
      console.error("Error creating project:", err);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 font-mono text-black">
      {/* Brutalist Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-24 bg-white border-r-8 border-black flex flex-col items-center py-8 gap-10 shadow-[8px_0px_0px_0px_rgba(0,0,0,1)] z-20">
         <div className="border-4 border-black p-2 bg-emerald-400">
           <LayoutGrid size={32} />
         </div>
         <div className="flex flex-col gap-6 w-full px-4">
            <div className="w-full aspect-square border-4 border-black bg-cyan-300 flex items-center justify-center cursor-pointer hover:translate-x-1 hover:translate-y-1 hover:shadow-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all text-black">
               <Box size={28} />
            </div>
            <div className="w-full aspect-square border-4 border-black bg-white flex items-center justify-center cursor-pointer hover:border-black hover:bg-stone-200 transition-colors text-black opacity-50 hover:opacity-100">
               <Clock size={28} />
            </div>
         </div>
         <div 
           className="mt-auto p-4 border-4 border-black bg-red-400 hover:bg-red-500 text-black cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all" 
           onClick={() => supabase.auth.signOut().then(() => router.push("/login"))}
         >
            <Command size={24} />
         </div>
      </aside>

      <main className="pl-24">
        {/* Brutalist Header */}
        <header className="h-32 border-b-8 border-black bg-white sticky top-0 z-10 px-10 flex items-center justify-between shadow-[0px_8px_0px_0px_rgba(0,0,0,1)]">
           <div className="flex items-center gap-12">
              <Logo iconSize={32} />
              <div className="h-16 w-1 bg-black opacity-10" />
              <h1 className="text-4xl font-[1000] text-black uppercase tracking-tighter">PROJECT MATRIX</h1>
              <span className="px-6 py-2 bg-black text-white border-4 border-black text-2xl font-black shadow-[4px_4px_0_rgba(0,ffa3,163,0.5)]">{projects.length}</span>
           </div>
           <div className="flex items-center gap-6">
              <div className="relative group flex items-center border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus-within:shadow-none focus-within:translate-x-1 focus-within:translate-y-1 transition-all overflow-hidden h-14">
                 <div className="w-14 h-full border-r-4 border-black flex items-center justify-center bg-emerald-300">
                   <Search size={24} className="text-black font-black" />
                 </div>
                 <input 
                    type="text" 
                    placeholder="LOCATE DATABANK..." 
                    className="w-64 h-full px-4 font-black text-lg bg-transparent border-none focus:outline-none uppercase placeholder:text-stone-300"
                 />
              </div>
              <button 
                onClick={() => setShowNewModal(true)}
                className="h-14 bg-emerald-400 text-black border-4 border-black px-8 font-black text-lg flex items-center gap-3 uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
              >
                 <Plus size={24} className="font-black" />
                 INITIALIZE
              </button>
           </div>
        </header>

        <div className="p-10 max-w-7xl mx-auto pt-16">
           {loading ? (
             <div className="flex items-center justify-center py-40">
                <div className="animate-spin text-black border-4 border-black w-20 h-20 rounded-full border-t-emerald-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]"></div>
             </div>
           ) : projects.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-32 text-center">
                <div className="w-32 h-32 bg-white border-8 border-black flex items-center justify-center text-black mb-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] rotate-3 animate-pulse">
                   <Folder size={64} />
                </div>
                <h2 className="text-5xl font-black text-black uppercase tracking-tighter mb-4">NO CONTEXT FOUND</h2>
                <p className="text-stone-500 font-bold max-w-md uppercase tracking-widest leading-loose mb-10 border-b-4 border-black pb-4">
                  Deploy your first regle research vessel to establish an isolated knowledge base.
                </p>
                <button 
                   onClick={() => setShowNewModal(true)}
                   className="bg-black text-white border-4 border-black px-12 py-6 font-black text-2xl uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,255,200,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all"
                >
                   CREATE PROJECT
                </button>
             </div>
           ) : (
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                {projects.map((project, i) => {
                  const colors = ["bg-cyan-300", "bg-emerald-300", "bg-amber-300", "bg-pink-300", "bg-white", "bg-indigo-300"];
                  const color = colors[i % colors.length];
                  
                  return (
                  <div 
                    key={project.id} 
                    className={`border-8 border-black p-8 ${color} shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:translate-x-3 hover:translate-y-3 hover:shadow-none transition-all cursor-pointer relative group flex flex-col h-64`}
                    onClick={() => router.push(`/project?id=${project.id}`)}
                  >
                    <div className="flex justify-between items-start mb-auto">
                       <div className="w-16 h-16 border-4 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform text-black">
                          <Box size={32} />
                       </div>
                       <button className="w-12 h-12 border-4 border-black bg-black text-white hover:bg-white hover:text-black flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] transition-colors">
                          <ArrowRight size={24} />
                       </button>
                    </div>

                    <div>
                       <h3 className="text-4xl font-black text-black uppercase tracking-tighter line-clamp-1 group-hover:underline decoration-8 underline-offset-8">
                         {project.name}
                       </h3>
                       <div className="inline-flex items-center gap-2 mt-4 px-3 py-1 bg-black text-white border-2 border-black font-black text-xs uppercase tracking-widest shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">
                          <Clock size={14} />
                          {new Date(project.created_at).toLocaleDateString()}
                       </div>
                    </div>
                  </div>
                )})}
             </div>
           )}
        </div>
      </main>

      {/* Brutalist Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-100/90 backdrop-blur-sm">
           <div className="bg-white border-8 border-black w-full max-w-2xl relative shadow-[24px_24px_0px_0px_rgba(0,0,0,1)] flex flex-col">
             
             {/* Header */}
             <div className="border-b-8 border-black bg-amber-400 p-8 flex justify-between items-center">
                <h2 className="text-4xl font-black text-black uppercase tracking-tighter leading-none">
                  NEW PROJECT
                </h2>
                <button 
                  onClick={() => setShowNewModal(false)}
                  className="w-12 h-12 bg-white border-4 border-black flex items-center justify-center hover:bg-black hover:text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all mt-[-4px]"
                >
                  <Plus className="rotate-45" size={32} />
                </button>
             </div>

             {/* Content */}
             <form onSubmit={createProject} className="p-8 space-y-8 bg-stone-50">
                <div className="bg-black text-white p-4 border-4 border-black font-black uppercase text-sm tracking-widest inline-flex gap-4">
                  <Sparkles className="text-amber-400" /> ISOLATED VECTOR DB
                </div>
                
                <div className="space-y-4">
                   <label className="text-xl font-black text-black tracking-widest uppercase block">IDENTIFIER</label>
                   <input
                      type="text"
                      autoFocus
                      required
                      placeholder="E.G. NEURAL ANALYSIS..."
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="block w-full px-6 py-6 bg-white border-8 border-black text-black placeholder:text-stone-300 focus:outline-none shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none focus:shadow-none focus:translate-x-2 focus:translate-y-2 hover:translate-x-2 hover:translate-y-2 transition-all font-black text-3xl uppercase"
                   />
                </div>

                <div className="flex gap-6 pt-8 border-t-8 border-black mt-8">
                   <button
                      type="button"
                      onClick={() => setShowNewModal(false)}
                      className="w-1/3 py-6 bg-white text-black border-4 border-black font-black text-xl uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all"
                   >
                      ABORT
                   </button>
                   <button
                      type="submit"
                      className="flex-1 py-6 bg-emerald-400 text-black border-4 border-black font-black text-2xl uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-2 hover:translate-y-2 hover:shadow-none transition-all"
                   >
                      DEPLOY
                   </button>
                </div>
             </form>

           </div>
        </div>
      )}
    </div>
  );
}
