"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Loader2, Orbit } from "lucide-react";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      // Supabase client automatically picks up the session from the URL hash (#access_token=...)
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Auth error:", error.message);
        router.push("/login?error=auth_failed");
        return;
      }

      if (session) {
        router.push("/projects");
      } else {
        // Fallback if session hasn't loaded yet
        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
          if (event === "SIGNED_IN" && session) {
            router.push("/projects");
          }
        });

        // Cleanup
        return () => {
          authListener?.subscription.unsubscribe();
        };
      }
    };

    handleAuth();
  }, [router]);

  return (
    <div className="min-h-screen bg-stone-200 flex flex-col items-center justify-center p-8 font-mono text-black selection:bg-emerald-400">
      <div className="max-w-md w-full bg-white border-[10px] border-black p-12 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative overflow-hidden group">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 2px, transparent 2px)', backgroundSize: '24px 24px' }} />
        
        <div className="relative z-10 flex flex-col items-center text-center space-y-12">
          {/* Brutalist Logo */}
          <div className="flex items-center gap-4 bg-black text-emerald-400 p-4 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,255,100,0.3)] rotate-2 group-hover:rotate-0 transition-transform">
            <Orbit size={48} strokeWidth={3} className="animate-[spin_4s_linear_infinite]" />
            <h1 className="text-4xl font-black tracking-tighter uppercase leading-none">REGLE</h1>
          </div>

          <div className="space-y-8 w-full">
            <div className="flex flex-col items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 border-8 border-black bg-yellow-300 flex items-center justify-center animate-bounce shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                   <Loader2 size={40} strokeWidth={4} className="animate-spin" />
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl font-black uppercase tracking-tighter bg-black text-white px-4 py-2 inline-block shadow-[8px_8px_0px_0px_rgba(255,100,200,1)]">
                  REGLE
                </h2>
                <p className="text-lg font-bold text-black uppercase tracking-widest leading-tight border-b-4 border-black pb-2">
                  FINALIZING SECURE SESSION
                </p>
              </div>
            </div>

            <div className="bg-stone-100 border-4 border-black p-4 font-black text-xs uppercase tracking-[0.2em] flex justify-between items-center bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,rgba(0,0,0,0.05)_10px,rgba(0,0,0,0.05)_20px)]">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                ENCRYPTED_UPLINK
              </span>
              <span className="opacity-50">V1.0.4</span>
            </div>
          </div>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-8 h-8 border-b-4 border-r-4 border-black" />
        <div className="absolute bottom-0 right-0 w-8 h-8 border-t-4 border-l-4 border-black" />
      </div>
      
      {/* Bottom info */}
      <div className="mt-8 flex gap-8 items-center opacity-30 font-black text-[10px] uppercase tracking-[0.5em]">
        <span>CORE_INITIALIZED</span>
        <span>|</span>
        <span>AUTH_VECTOR_SYNC</span>
        <span>|</span>
        <span>NODE_HANDSHAKE</span>
      </div>
    </div>
  );
}
