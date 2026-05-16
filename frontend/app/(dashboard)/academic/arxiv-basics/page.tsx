"use client";

import React from "react";
import Link from "next/link";
import { 
  BookOpen, 
  Code, 
  Terminal, 
  Users, 
  ExternalLink, 
  Mail, 
  CheckCircle2, 
  Rocket, 
  Layers,
  ChevronRight,
  Info,
  ShieldCheck,
  GitBranch as GithubIcon
} from "lucide-react";
import { RegleSidebar } from "@/components/RegleSidebar";
import { cn } from "@/lib/utils";

export default function ArxivBasicsPage() {
  const [isSourcesOpen, setIsSourcesOpen] = React.useState(false);

  const codeExamples = {
    perl: `use LWP;
use strict;

my $url = 'http://export.arxiv.org/api/query?search_query=all:electron&start=0&max_results=1';
my $browser = LWP::UserAgent->new();
my $response = $browser->get($url);
print $response->content();`,
    python: `import urllib, urllib.request

url = 'http://export.arxiv.org/api/query?search_query=all:electron&start=0&max_results=1'
data = urllib.request.urlopen(url)
print(data.read().decode('utf-8'))`,
    ruby: `require 'net/http'
require 'uri'

url = URI.parse('http://export.arxiv.org/api/query?search_query=all:electron&start=0&max_results=1')
res = Net::HTTP.get_response(url)
print res.body`,
    php: `<?php
$url = 'http://export.arxiv.org/api/query?search_query=all:electron&start=0&max_results=1';
$response = file_get_contents($url);
print_r($response);
?>`
  };

  const projects = [
    "OpenWetWare's Mediawiki Installation",
    "Sonny Software's Bookends Reference Manager for OSX",
    "arXiv Droid - arXiv app for Android",
    "Retrieve Bibliographic arXiv Information",
    "The snarXiv",
    "daily arXiv by categories",
    "PaperRater.org - peer review tool",
    "ArXiv Analytics - web portal",
    "Bibcure - bibtex manager",
    "biblio.el - Emacs integration",
    "Lib arXiv - iOS app",
    "arxivist.com"
  ];

  return (
    <div className="flex h-screen bg-[#f8fafc] text-[#1e293b] font-outfit overflow-hidden">
      <RegleSidebar
        onToggleSources={() => setIsSourcesOpen(!isSourcesOpen)}
        sourcesOpen={isSourcesOpen}
      />

      <main className="flex-1 overflow-y-auto">
        {/* Hero Section */}
        <div className="bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-8 py-12 md:py-16">
            <div className="flex items-center gap-3 text-blue-600 font-bold text-sm uppercase tracking-wider mb-6">
              <BookOpen size={18} />
              <span>Academic Reference</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              arXiv API Basics
            </h1>
            <p className="text-xl text-slate-500 max-w-3xl leading-relaxed">
              Access all of the arXiv data, search and linking facilities with an easy-to-use programmatic interface.
            </p>
            
            <div className="mt-10 flex flex-wrap gap-4">
              <a 
                href="https://arxiv.org/help/api/tou" 
                target="_blank"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95"
              >
                <ShieldCheck size={20} />
                Terms of Use
              </a>
              <a 
                href="https://groups.google.com/g/arxiv-api" 
                target="_blank"
                className="inline-flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-2xl font-bold hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
              >
                <Mail size={20} />
                Mailing List
              </a>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-8 py-12 space-y-20 pb-32">
          
          {/* About Section */}
          <section id="about" className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="md:col-span-1">
              <div className="sticky top-8">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
                  <Info size={24} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">About the API</h2>
                <p className="text-slate-500 leading-relaxed">
                  Understanding the mission and scope of the arXiv repository.
                </p>
              </div>
            </div>
            <div className="md:col-span-2 space-y-6">
              <p className="text-lg text-slate-700 leading-relaxed">
                The Cornell University e-print arXiv is a document submission and retrieval system shared heavily by the physics, mathematics and computer science communities. It has become the primary means of communicating cutting-edge manuscripts on current and ongoing research.
              </p>
              <p className="text-lg text-slate-700 leading-relaxed">
                The purpose of the arXiv API is to allow programmatic access to the arXiv's e-print content and metadata. The goal is to facilitate new and creative use of the vast body of material on the arXiv by providing a low barrier to entry for application developers.
              </p>
            </div>
          </section>

          {/* Quickstart Section */}
          <section id="quickstart" className="bg-slate-900 rounded-[32px] p-8 md:p-12 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[100px] -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 text-blue-400 font-bold text-sm uppercase tracking-widest mb-6">
                <Rocket size={18} />
                <span>Quickstart</span>
              </div>
              <h2 className="text-3xl font-black mb-6">Make your first request</h2>
              <p className="text-slate-300 text-lg max-w-2xl mb-10 leading-relaxed">
                API calls are made via an HTTP GET or POST requests to an appropriate url. No special software is required.
              </p>
              
              <div className="bg-slate-800/50 border border-slate-700 rounded-2xl p-6 mb-8 group">
                <div className="flex justify-between items-center mb-4">
                   <div className="text-xs font-mono text-slate-400 uppercase tracking-widest">Example Query URL</div>
                   <button 
                     onClick={() => window.open('http://export.arxiv.org/api/query?search_query=all:electron', '_blank')}
                     className="text-white hover:text-blue-400 transition-colors"
                   >
                     <ExternalLink size={18} />
                   </button>
                </div>
                <code className="text-blue-300 font-mono break-all text-sm md:text-base">
                  http://export.arxiv.org/api/query?search_query=all:electron
                </code>
              </div>
              
              <p className="text-slate-400">
                This URL retrieves results that match the search query <span className="text-slate-200">all:electron</span>.
              </p>
            </div>
          </section>

          {/* Using the API */}
          <section id="using-api" className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="h-[1px] flex-1 bg-slate-200"></div>
              <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-4">Implementation Details</h2>
              <div className="h-[1px] flex-1 bg-slate-200"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mb-6">
                  <Layers size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Atom 1.0 Format</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  The API returns results in Atom 1.0 format, a lightweight xml-based format commonly used in website syndication. It is human-readable and renders cleanly in modern browsers.
                </p>
                <a href="https://validator.w3.org/feed/docs/atom.html" target="_blank" className="text-blue-600 font-bold inline-flex items-center gap-1 hover:underline">
                  Atom Specification <ChevronRight size={16} />
                </a>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-6">
                  <Terminal size={24} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">Query Construction</h3>
                <p className="text-slate-600 leading-relaxed mb-6">
                  Encode desired search parameters directly in the URL. Use parameters like <code className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-600">start</code> and <code className="bg-slate-100 px-1.5 py-0.5 rounded text-amber-600">max_results</code> to paginate results.
                </p>
                <a href="https://arxiv.org/help/api/user-manual" target="_blank" className="text-blue-600 font-bold inline-flex items-center gap-1 hover:underline">
                  Full User Manual <ChevronRight size={16} />
                </a>
              </div>
            </div>
          </section>

          {/* Code Examples */}
          <section id="code" className="space-y-8">
            <h2 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Code className="text-blue-600" />
              Code Snippets
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(codeExamples).map(([lang, code]) => (
                <div key={lang} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
                  <div className="bg-white px-5 py-3 border-b border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-800 uppercase text-xs tracking-wider">{lang}</span>
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-200"></div>
                    </div>
                  </div>
                  <div className="p-5 overflow-x-auto flex-1 bg-slate-50">
                    <pre className="text-xs font-mono text-slate-700 leading-relaxed whitespace-pre">
                      {code}
                    </pre>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Community Section (Adjusted to move up) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <section id="projects" className="space-y-6">
              <h2 className="text-2xl font-bold text-slate-900">Projects using the API</h2>
              <div className="grid grid-cols-1 gap-3">
                {projects.map((project, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-slate-600 group">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-300 group-hover:bg-blue-600 transition-colors"></div>
                    <span className="text-sm font-medium">{project}</span>
                  </div>
                ))}
              </div>
            </section>

            <section id="community" className="bg-blue-50 rounded-[32px] p-8 md:p-10 border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-200">
                <Users size={24} />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Community Support</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                The best way to learn about the arXiv API and get help is to join the mailing list. Questions and feedback are the primary channel for improving the service.
              </p>
              <div className="space-y-4">
                 <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                    <CheckCircle2 className="text-blue-500 mt-1 shrink-0" size={20} />
                    <div>
                       <div className="font-bold text-slate-900 text-sm">Join the Conversation</div>
                       <div className="text-xs text-slate-500 mt-0.5">Participate in the arxiv-api Google Group.</div>
                    </div>
                 </div>
                 <div className="flex items-start gap-4 p-4 bg-white rounded-2xl border border-blue-100 shadow-sm">
                    <CheckCircle2 className="text-blue-500 mt-1 shrink-0" size={20} />
                    <div>
                       <div className="font-bold text-slate-900 text-sm">Share Your Project</div>
                       <div className="text-xs text-slate-500 mt-0.5">Email the mailing list to get your project featured.</div>
                    </div>
                 </div>
              </div>
            </section>
          </div>

          {/* Platform Integration Section - NEW */}
          <section id="platform-integration" className="pt-12 border-t border-slate-200 space-y-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Regle RAG Integration</h2>
              <p className="text-lg text-slate-500 max-w-3xl">
                Implementation details of how our research engine communicates with ArXiv to build your knowledge base.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Service Layer */}
              <div className="md:col-span-2 space-y-8">
                <div className="bg-slate-900 rounded-[32px] p-8 md:p-10 text-white shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Terminal size={120} />
                  </div>
                  <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                      <Terminal size={18} />
                    </div>
                    Service Layer: <span className="font-mono text-blue-400">arxiv_service.py</span>
                  </h3>
                  
                  <div className="space-y-6 text-slate-300">
                    <p className="leading-relaxed">
                      Our backend uses a specialized service implementation using <code className="text-blue-300 bg-blue-500/10 px-1.5 py-0.5 rounded">aiohttp</code> for non-blocking asynchronous searching.
                    </p>
                    
                    <ul className="space-y-4">
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center text-blue-400 shrink-0 mt-0.5">1</div>
                        <div>
                          <strong className="text-white block mb-1">Transparency & Compliance</strong>
                          Every request includes a descriptive <code className="text-blue-300 font-mono">User-Agent</code> identifying our platform and contact point, ensuring we remain good citizens of the arXiv ecosystem.
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center text-blue-400 shrink-0 mt-0.5">2</div>
                        <div>
                          <strong className="text-white block mb-1">Rate Limit Resilience</strong>
                          Implements an intelligent retry loop with jittered backoff. If we hit a <code className="text-amber-400">429</code>, the system waits and retries automatically.
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center text-blue-400 shrink-0 mt-0.5">3</div>
                        <div>
                          <strong className="text-white block mb-1">Namespace-Aware XML Parsing</strong>
                          Uses <code className="text-blue-300 font-mono">xml.etree.ElementTree</code> with explicit Atom namespaces to ensure robust metadata extraction.
                        </div>
                      </li>
                      <li className="flex items-start gap-4">
                        <div className="w-6 h-6 bg-blue-500/20 rounded flex items-center justify-center text-blue-400 shrink-0 mt-0.5">4</div>
                        <div>
                          <strong className="text-white block mb-1">Standardized Mapping</strong>
                          Converts raw ArXiv entries into our internal <code className="text-blue-300 font-mono">Document</code> schema for seamless RAG orchestration.
                        </div>
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Data Schema */}
                <div className="bg-white border-2 border-slate-900 rounded-[32px] p-8 md:p-10 shadow-[8px_8px_0px_0px_rgba(15,23,42,1)]">
                  <h3 className="text-2xl font-black text-slate-900 mb-6 uppercase tracking-tight">Internal Data Schema</h3>
                  <div className="bg-slate-50 rounded-2xl p-6 font-mono text-sm overflow-x-auto text-slate-700">
                    <pre>{`{
  "id": "http://arxiv.org/abs/2403.xxxxx",
  "title": "Quantum Gravity in 2D",
  "content": "Title: ...\\nAuthors: ...\\nPublished: ...\\n\\nAbstract: ...",
  "url": "http://arxiv.org/abs/2403.xxxxx",
  "metadata": {
    "source": "arxiv",
    "type": "academic_paper",
    "authors": "Einstein, A.",
    "published": "2024-03-21T..."
  },
  "source": "academic"
}`}</pre>
                  </div>
                </div>
              </div>

              {/* Orchestration Sidebar */}
              <div className="space-y-6">
                <div className="bg-emerald-50 border border-emerald-100 rounded-[32px] p-8">
                  <h3 className="text-xl font-bold text-emerald-900 mb-4">Orchestration</h3>
                  <p className="text-sm text-emerald-700 leading-relaxed mb-6">
                    ArXiv searches are triggered dynamically by the RAG planner based on the query intent.
                  </p>
                  
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-200">
                      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Hybrid Mode</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-2xl border border-emerald-200">
                      <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white">
                        <CheckCircle2 size={16} />
                      </div>
                      <span className="text-xs font-bold text-slate-700">Academic Mode</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-8 border-t border-emerald-200/50">
                    <div className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Planned Improvements</div>
                    <ul className="text-[11px] font-bold text-emerald-800 space-y-2">
                       <li className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                         Vectorized citation maps
                       </li>
                       <li className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                         PDF Full-text scanning
                       </li>
                       <li className="flex items-center gap-2">
                         <div className="w-1 h-1 rounded-full bg-emerald-400"></div>
                         Category-specific routing
                       </li>
                    </ul>
                  </div>
                </div>

                <div className="bg-blue-600 rounded-[32px] p-8 text-white">
                   <h3 className="text-lg font-bold mb-2">Technical Support</h3>
                   <p className="text-xs text-blue-100 mb-6 leading-relaxed">
                     Internal documentation for Regle RAG developers. Access the full source code in the repository.
                   </p>
                   <Link 
                     href="https://github.com/black-hand-corp/regle-rag" 
                     className="flex items-center justify-center gap-2 w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold transition-all"
                   >
                     <GithubIcon size={14} /> Repository
                   </Link>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="max-w-5xl mx-auto px-8 py-12 border-t border-slate-200 text-center">
           <p className="text-slate-400 text-sm">
             arXiv is a registered trademark of Cornell University. Documentation based on official arXiv API resources.
           </p>
        </footer>
      </main>
    </div>
  );
}
