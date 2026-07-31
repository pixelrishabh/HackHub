import React, { useState } from 'react';
import { Copy, Check, Terminal, Code, Cpu, Network, CheckCircle2, Wrench } from 'lucide-react';
import { PPTViewer } from './PPTViewer';

export function RichMessageRenderer({ content = '', executedTools = [], pptDeck = null }) {
  const [copiedIndex, setCopiedIndex] = useState(null);

  if (!content) return null;

  const handleCopyCode = (codeText, idx) => {
    navigator.clipboard.writeText(codeText);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Helper to parse blocks of text, code blocks, mermaid diagrams, and tables
  const renderFormattedContent = (rawText) => {
    // Check if json_ppt block is embedded
    let parsedPptData = pptDeck;
    let cleanText = rawText;

    const pptMatch = rawText.match(/```json_ppt\s*([\s\S]*?)\s*```/i);
    if (pptMatch) {
      try {
        parsedPptData = JSON.parse(pptMatch[1]);
        cleanText = rawText.replace(/```json_ppt\s*[\s\S]*?\s*```/i, '').trim();
      } catch (e) {
        parsedPptData = null;
      }
    }

    // Split by code blocks ```...```
    const parts = cleanText.split(/(```[\s\S]*?```)/g);

    return (
      <div className="space-y-3">
        {/* Executed Tools Badges */}
        {executedTools && executedTools.length > 0 && (
          <div className="flex items-center space-x-2 flex-wrap gap-y-1 pb-2 border-b border-white/10">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 flex items-center space-x-1">
              <Wrench className="w-3 h-3 text-cyan-400" />
              <span>Executed Tools:</span>
            </span>
            {executedTools.map((tool, tIdx) => (
              <span
                key={tIdx}
                className="px-2.5 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-400/40 text-cyan-200 text-[10px] font-bold font-mono"
              >
                ⚡ {tool}
              </span>
            ))}
          </div>
        )}

        {/* Embedded PPT Deck Viewer */}
        {parsedPptData && <PPTViewer pptData={parsedPptData} />}

        {parts.map((part, pIdx) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        // Extract language and code content
        const lines = part.slice(3, -3).trim().split('\n');
        const firstLine = lines[0].trim().toLowerCase();

        let language = 'code';
        let codeBody = part.slice(3, -3).trim();

        if (/^(javascript|js|typescript|ts|python|py|html|css|json|bash|sh|go|rust|sql|mermaid|math)/i.test(firstLine)) {
          language = firstLine;
          codeBody = lines.slice(1).join('\n');
        }

        // Check if Mermaid Diagram
        if (language === 'mermaid' || codeBody.includes('graph TD') || codeBody.includes('graph LR') || codeBody.includes('sequenceDiagram')) {
          return (
            <div key={pIdx} className="my-4 glass-panel p-4 rounded-2xl border border-cyan-500/40 bg-black/80 backdrop-blur-xl shadow-xl space-y-3">
              <div className="flex items-center justify-between border-b border-white/10 pb-2 text-xs font-mono font-bold text-cyan-300">
                <span className="flex items-center space-x-1.5">
                  <Network className="w-4 h-4 text-cyan-400" />
                  <span>Mermaid Architecture Diagram</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-200">Interactive Visualizer</span>
              </div>
              <div className="p-4 bg-white/5 rounded-xl border border-white/10 overflow-x-auto text-xs font-mono space-y-2">
                {codeBody.split('\n').map((line, lIdx) => (
                  <div key={lIdx} className="flex items-center space-x-2 text-slate-200">
                    <span className="text-cyan-400 font-bold">➔</span>
                    <span className="px-2 py-1 rounded bg-white/10 border border-white/15 text-white font-semibold">{line}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }

        // Regular Code Block with Syntax Highlighting Theme
        return (
          <div key={pIdx} className="my-4 rounded-2xl border border-white/15 bg-[#0a0a0f] overflow-hidden shadow-2xl font-mono text-xs">
            <div className="px-4 py-2 bg-white/5 border-b border-white/10 flex items-center justify-between text-slate-400">
              <div className="flex items-center space-x-2">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span className="font-bold text-[11px] uppercase tracking-wider text-slate-300">{language}</span>
              </div>
              <button
                type="button"
                onClick={() => handleCopyCode(codeBody, pIdx)}
                className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white transition-all text-[11px]"
              >
                {copiedIndex === pIdx ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 overflow-x-auto text-slate-200 leading-relaxed scrollbar-thin scrollbar-thumb-white/20">
              <code>{codeBody}</code>
            </pre>
          </div>
        );
      }

      // Render standard markdown lines
      return (
        <div key={pIdx} className="space-y-2">
          {part.split('\n\n').map((paragraph, bgIdx) => {
            if (!paragraph.trim()) return null;

            // Header 3 / 2
            if (paragraph.startsWith('### ')) {
              return (
                <h3 key={bgIdx} className="text-base font-bold text-white tracking-tight pt-2 pb-1 border-b border-white/10">
                  {paragraph.replace(/^### /, '')}
                </h3>
              );
            }
            if (paragraph.startsWith('## ')) {
              return (
                <h2 key={bgIdx} className="text-lg font-black text-white tracking-tight pt-3 pb-1 border-b border-white/15 text-glow">
                  {paragraph.replace(/^## /, '')}
                </h2>
              );
            }

            // Bullet points
            if (paragraph.includes('\n- ') || paragraph.startsWith('- ') || paragraph.startsWith('• ')) {
              const items = paragraph.split(/\n[-•]\s*/).filter((i) => i.trim());
              return (
                <ul key={bgIdx} className="space-y-1.5 my-2 pl-2">
                  {items.map((item, iIdx) => (
                    <li key={iIdx} className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
                      <span className="text-cyan-400 font-bold mt-0.5">•</span>
                      <span>{renderInlineFormatting(item)}</span>
                    </li>
                  ))}
                </ul>
              );
            }

            return (
              <p key={bgIdx} className="text-xs text-slate-200 leading-relaxed">
                {renderInlineFormatting(paragraph)}
              </p>
            );
          })}
        </div>
      );
    })}
      </div>
    );
  };

  // Helper to format **bold**, `code inline`, and LaTeX
  const renderInlineFormatting = (textStr) => {
    // Replace **bold**
    const parts = textStr.split(/(\*\*.*?\*\*|`.*?`|\$\$.*?\$\$)/g);
    return parts.map((chunk, cIdx) => {
      if (chunk.startsWith('**') && chunk.endsWith('**')) {
        return <strong key={cIdx} className="font-bold text-white">{chunk.slice(2, -2)}</strong>;
      }
      if (chunk.startsWith('`') && chunk.endsWith('`')) {
        return <code key={cIdx} className="px-1.5 py-0.5 rounded bg-white/10 border border-white/15 text-cyan-300 font-mono text-[11px]">{chunk.slice(1, -1)}</code>;
      }
      if (chunk.startsWith('$$') && chunk.endsWith('$$')) {
        return <span key={cIdx} className="px-2 py-1 rounded bg-purple-950/60 border border-purple-500/40 text-purple-200 font-mono text-xs font-bold">{chunk.slice(2, -2)}</span>;
      }
      return chunk;
    });
  };

  return <div className="space-y-2">{renderFormattedContent(content)}</div>;
}
