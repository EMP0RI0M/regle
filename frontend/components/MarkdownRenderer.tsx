"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { RegleChart } from "./RegleChart";
import { OrchestrationTrace } from "./OrchestrationTrace";
import {
  ExternalLink, Database, BookOpen, GitBranch, Terminal,
  Globe, Link as LinkIcon, Cpu, Copy, Check
} from "lucide-react";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
}

const preprocessLaTeX = (content: string) => {
  if (!content) return "";
  let processed = content
    .replace(/\\\( /g, "$ ")
    .replace(/ \\\)/g, " $")
    .replace(/\\\(/g, "$")
    .replace(/\\\)/g, "$")
    .replace(/\\\[ /g, "$$ ")
    .replace(/ \\\]/g, " $$")
    .replace(/\\\[/g, "$$")
    .replace(/\\\]/g, "$$")
    .replace(/### GROUNDED_ASSETS/g, "```grounded-assets\nGROUNDED_ASSETS")
    .replace(/### RESEARCH_PLAN/g, "```research-plan\nRESEARCH_PLAN");

  return processed;
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  const processedContent = preprocessLaTeX(content);

  return (
    <div className="prose prose-invert max-w-none text-white/80 selection:bg-[#00FFB2]/20 selection:text-white">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1
              className="text-2xl font-bold text-white tracking-tight my-6 pb-3 border-b border-white/[0.06]"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className="text-lg font-bold text-white tracking-tight my-5 flex items-center gap-2"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              <div className="w-1 h-4 bg-[#00FFB2] rounded-full" />
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className="text-base font-semibold text-white/70 tracking-tight my-4"
              style={{ fontFamily: "'Space Grotesk', monospace" }}
            >
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm leading-relaxed mb-4 text-white/70" style={{ fontFamily: "'Inter', sans-serif" }}>
              {children}
            </p>
          ),
          ul: ({ children }) => (
            <ul className="space-y-2 mb-5 list-none pl-0">
              {children}
            </ul>
          ),
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-sm text-white/70 leading-relaxed" style={{ fontFamily: "'Inter', sans-serif" }}>
              <div className="shrink-0 w-1.5 h-1.5 bg-[#00FFB2]/50 rounded-full mt-2" />
              <span>{children}</span>
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-[#00FFB2]/30 pl-4 my-5 py-1">
              <div className="text-sm italic text-white/50" style={{ fontFamily: "'Inter', sans-serif" }}>
                {children}
              </div>
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6 rounded-lg border border-white/[0.06] bg-white/[0.02]">
              <table className="w-full text-left border-collapse">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-white/[0.04] border-b border-white/[0.06]">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-4 py-3 text-[10px] font-semibold text-white/40 uppercase tracking-[0.1em]">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-4 py-3 border-t border-white/[0.04] text-xs text-white/50">
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-white/[0.02] transition-colors">
              {children}
            </tr>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noreferrer"
              className="text-[#00FFB2] hover:text-[#00FFB2]/80 underline decoration-[#00FFB2]/30 underline-offset-2 transition-colors"
            >
              {children}
            </a>
          ),
          code({ node, inline, className, children, ...props }: any) {
            const match = /language-(\w+)/.exec(className || "");
            const language = match ? match[1] : "";
            const content = String(children).trim();
            const isChart = language === "chart" || language === "json-chart";
            const isTikZ = language === "latex" || language === "tikz";
            const isTerminal = language === "terminal";
            const isAssets = language === "grounded-assets";
            const isResearchPlan = language === "research-plan";

            /* ─── Terminal / System Log ─── */
            if (!inline && isTerminal) {
              return (
                <div className="my-5 rounded-lg border border-white/[0.06] overflow-hidden bg-[#0A0A0A]">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
                    <div className="flex items-center gap-2">
                      <Terminal size={12} className="text-[#00FFB2]" />
                      <span className="text-[10px] font-medium text-white/30 uppercase tracking-[0.1em]">
                        System Log
                      </span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                      <div className="w-2 h-2 rounded-full bg-white/10" />
                    </div>
                  </div>
                  <div className="p-4 font-mono text-xs text-[#00FFB2]/70 leading-relaxed">
                    {content.split("\n").map((line, i) => (
                      <div key={i} className="flex gap-3 py-0.5 hover:bg-white/[0.02] rounded px-1 -mx-1">
                        <span className="text-white/10 text-[10px] select-none tabular-nums w-4 text-right">
                          {i + 1}
                        </span>
                        <span className="break-all">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            /* ─── Research Plan ─── */
            if (!inline && isResearchPlan) {
              const lines = content
                .split("\n")
                .filter(
                  (l) => l.trim() !== "" && !l.includes("RESEARCH_PLAN")
                );
              return (
                <div className="my-6 space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-7 h-7 rounded-md bg-[#FFD84D]/10 border border-[#FFD84D]/20 flex items-center justify-center">
                      <BookOpen size={14} className="text-[#FFD84D]" />
                    </div>
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.1em]">
                      Research Strategy
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {lines.map((l, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-3 px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:border-white/[0.08] transition-colors"
                      >
                        <span className="text-[10px] font-bold text-[#FFD84D]/60 mt-0.5 tabular-nums">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <p className="text-xs text-white/50 leading-relaxed">
                          {l.replace(/^\d+\.\s*/, "")}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              );
            }

            /* ─── Grounded Assets ─── */
            if (!inline && isAssets) {
              const lines = content
                .split("\n")
                .filter(
                  (l) =>
                    l.trim().length > 3 && !l.includes("GROUNDED_ASSETS")
                );
              return (
                <div className="my-6 space-y-2">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-md bg-[#00FFB2]/10 border border-[#00FFB2]/20 flex items-center justify-center">
                      <Database size={14} className="text-[#00FFB2]" />
                    </div>
                    <h3 className="text-xs font-bold text-white/50 uppercase tracking-[0.1em]">
                      Sources
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {lines.map((l, i) => {
                      const title = l
                        .split(" (")[0]
                        .replace(/^-\s*/, "")
                        .replace(/^\[/, "")
                        .split("]")[0];
                      const url =
                        l.match(/\((http[^)]+)\)/)?.[1] || "#";
                      return (
                        <a
                          key={i}
                          href={url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between px-4 py-3 rounded-lg bg-white/[0.03] border border-white/[0.04] hover:border-[#00FFB2]/20 hover:bg-[#00FFB2]/5 transition-all group"
                        >
                          <div className="flex items-center gap-3 overflow-hidden">
                            <Globe
                              size={14}
                              className="text-white/20 group-hover:text-[#00FFB2] transition-colors flex-shrink-0"
                            />
                            <div className="overflow-hidden">
                              <p className="text-xs font-medium text-white/50 group-hover:text-white/70 truncate transition-colors">
                                {title}
                              </p>
                              <p className="text-[9px] text-white/15 truncate mt-0.5">
                                {url}
                              </p>
                            </div>
                          </div>
                          <ExternalLink
                            size={12}
                            className="text-white/10 group-hover:text-[#00FFB2]/50 flex-shrink-0 transition-colors"
                          />
                        </a>
                      );
                    })}
                  </div>
                </div>
              );
            }

            /* ─── Chart ─── */
            if (!inline && isChart) {
              try {
                const data = JSON.parse(content);
                return (
                  <RegleChart
                    data={data.data}
                    type={data.type}
                    title={data.title}
                  />
                );
              } catch (e) {
                return null;
              }
            }

            /* ─── Code block ─── */
            return !inline && match ? (
              <div className="my-5 rounded-lg border border-white/[0.06] overflow-hidden group relative">
                <div className="flex items-center justify-between px-4 py-2 bg-white/[0.03] border-b border-white/[0.04]">
                  <span className="text-[10px] font-medium text-white/25 uppercase tracking-[0.08em]">
                    {language}
                  </span>
                  <button className="text-white/15 hover:text-white/40 transition-colors opacity-0 group-hover:opacity-100">
                    <Copy size={12} />
                  </button>
                </div>
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={language}
                  PreTag="div"
                  customStyle={{
                    margin: 0,
                    padding: "16px",
                    background: "rgba(10, 10, 10, 0.8)",
                    borderRadius: 0,
                    fontSize: "0.8rem",
                    fontWeight: "500",
                    lineHeight: "1.6",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code
                className="bg-white/[0.06] text-[#00FFB2] px-1.5 py-0.5 rounded text-[13px] font-medium"
                style={{ fontFamily: "'JetBrains Mono', monospace" }}
                {...props}
              >
                {children}
              </code>
            );
          },
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
};
