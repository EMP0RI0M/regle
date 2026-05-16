"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2, GitBranch as GithubIcon, Cpu, Sparkles, X, Check } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      router.push("/projects");
    } catch (err: any) {
      setError(err.message || "An error occurred during login.");
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || `An error occurred while signing in with ${provider}.`);
    }
  };

  return (
    <div className="min-h-screen bg-stone-200 flex items-center justify-center p-6 font-mono text-black selection:bg-emerald-400 selection:text-black relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none" style={{ backgroundImage: "repeating-linear-gradient(45deg, #000 0, #000 1px, transparent 1px, transparent 20px)" }} />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-300 border-8 border-black -rotate-12 opacity-20" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-pink-400 border-8 border-black rotate-12 opacity-20" />

      <div className="max-w-md w-full space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-500 relative z-10">
        
        {/* Brutalist Logo Branding */}
        <div className="flex flex-col items-center">
            <Link href="/" className="group flex flex-col items-center gap-6">
                <div className="p-4 bg-emerald-400 border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-none group-hover:translate-x-3 group-hover:translate-y-3 transition-all relative">
                    <div className="absolute -top-10 -right-10 bg-yellow-300 border-4 border-black px-3 py-1 font-black text-xs rotate-12 shadow-[4px_4px_0_rgba(0,0,0,1)] group-hover:rotate-0 transition-transform">SECURE</div>
                    <Cpu size={48} className="text-black" />
                </div>
                <div className="bg-black text-white px-8 py-2 border-4 border-black font-black text-4xl tracking-tighter uppercase -rotate-1 group-hover:rotate-0 transition-transform shadow-[8px_8px_0_rgba(0,255,200,0.5)]">
                    REGLE
                </div>
            </Link>
        </div>

        {/* Authentication Card */}
        <div className="bg-white border-8 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 font-black text-stone-100 text-6xl opacity-20 pointer-events-none select-none uppercase tracking-tighter transform rotate-12">LOGIN</div>
            
            <div className="relative z-10">
                <div className="mb-10 text-center md:text-left">
                    <h1 className="text-4xl font-black text-black uppercase tracking-tighter leading-none mb-4">ACCESS_GRANTED?</h1>
                    <p className="text-[12px] font-bold text-stone-500 uppercase tracking-widest leading-relaxed border-l-4 border-emerald-400 pl-4">
                        Inject credentials into the secure layer to continue the orchestration sequence.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-8">
                    {error && (
                        <div className="p-6 bg-red-400 border-4 border-black text-black text-sm font-black uppercase tracking-widest shadow-[8px_8px_0_rgba(0,0,0,1)]">
                            <div className="flex items-center gap-3 mb-2">
                                <X size={20} strokeWidth={3} />
                                <span>TERMINAL_ERROR</span>
                            </div>
                            <p className="pl-8">{error}</p>
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                                <Mail size={12} /> EMAIL_LINK
                            </label>
                            <input
                                id="email"
                                type="email"
                                placeholder="USER@REGLE.ROOT"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-stone-50 border-4 border-black p-5 text-lg font-black uppercase placeholder:text-stone-300 focus:outline-none focus:bg-white focus:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] transition-all shadow-[4px_4px_0_rgba(0,0,0,1)]"
                            />
                        </div>

                        <div className="space-y-2">
                           <div className="flex items-center justify-between">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500 flex items-center gap-2">
                                    <Lock size={12} /> PASS_KEY
                                </label>
                                <a href="#" className="text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-black transition-colors">FORGOT?</a>
                           </div>
                           <input
                                id="password"
                                type="password"
                                placeholder="••••••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="w-full bg-stone-50 border-4 border-black p-5 text-lg font-black uppercase placeholder:text-stone-300 focus:outline-none focus:bg-white focus:shadow-[inset_4px_4px_0px_rgba(0,0,0,0.1)] transition-all shadow-[4px_4px_0_rgba(0,0,0,1)]"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 bg-stone-100 p-4 border-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
                        <input 
                            type="checkbox" 
                            id="remember" 
                            className="w-6 h-6 border-4 border-black bg-white appearance-none checked:bg-black checked:before:content-['✓'] checked:before:flex checked:before:items-center checked:before:justify-center checked:before:text-white checked:before:text-sm checked:before:font-black transition-all cursor-pointer" 
                        />
                        <label htmlFor="remember" className="text-[10px] font-black uppercase tracking-widest cursor-pointer text-stone-600 hover:text-black transition-colors">PERSIST_SESSION</label>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-20 bg-black text-white border-4 border-black font-black text-2xl uppercase tracking-widest flex items-center justify-center gap-4 hover:bg-emerald-400 hover:text-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" size={32} />
                        ) : (
                            <>
                                <span>INITIALIZE_LINK</span>
                                <ArrowRight size={28} className="transition-transform group-hover:translate-x-2" />
                            </>
                        )}
                    </Button>
                </form>

                {/* Social Login Matrix */}
                <div className="mt-12 space-y-8">
                    <div className="relative flex items-center justify-center">
                        <div className="absolute inset-x-0 h-1 bg-black"></div>
                        <span className="relative bg-white border-4 border-black px-6 py-1 text-[10px] font-black tracking-[0.3em] text-black uppercase">OAUTH_MATRIX</span>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <button 
                            onClick={() => handleSocialLogin('google')}
                            className="flex flex-col items-center gap-3 p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-cyan-300 hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
                        >
                            <img src="https://www.google.com/favicon.ico" className="w-8 h-8 group-hover:scale-110 transition-transform" alt="Google" />
                            <span className="text-[10px] font-black tracking-widest uppercase">GOOGLE_API</span>
                        </button>
                        <button 
                            onClick={() => handleSocialLogin('github')}
                            className="flex flex-col items-center gap-3 p-6 border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all group"
                        >
                            <GithubIcon size={32} className="group-hover:rotate-12 transition-transform" />
                            <span className="text-[10px] font-black tracking-widest uppercase">GITHUB_VCS</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <p className="text-center text-stone-500 font-extrabold uppercase tracking-widest pt-4">
            AWAITING_ROOT_LINK?{" "}
            <Link href="/signup" className="text-black font-black border-b-4 border-emerald-400 hover:bg-emerald-400 px-1 transition-all">
                CREATE_ACCOUNT
            </Link>
        </p>

        {/* Modal Status Footer */}
        <div className="bg-black text-white px-8 py-4 border-4 border-black flex items-center justify-between font-black text-[10px] uppercase tracking-widest shadow-[8px_8px_0_rgba(0,0,0,1)]">
           <div className="flex items-center gap-4 text-emerald-400">
              <div className="w-3 h-3 bg-emerald-400 border border-white animate-pulse" />
              <span>TERMINAL_ACTIVE: YES</span>
           </div>
           <span>SECURE_AUTH_v1.0.4</span>
        </div>
      </div>
    </div>
  );
}
