import React, { useState, useEffect, useRef } from 'react';
import { sendMentorMessage, getChatHistory } from '../api/mentor';
import { getAllTeams } from '../api/teams';
import { MentorModeSelector } from '../components/mentor/MentorModeSelector';
import { RichMessageRenderer } from '../components/mentor/RichMessageRenderer';
import { SmartSuggestions } from '../components/mentor/SmartSuggestions';
import { ProjectAwarenessCard } from '../components/mentor/ProjectAwarenessCard';
import { ProjectReviewModal } from '../components/mentor/ProjectReviewModal';
import { FileUploadModal } from '../components/mentor/FileUploadModal';
import { Page3DCanvas } from '../components/Page3DCanvas';
import {
  Bot,
  Send,
  Github,
  BookOpen,
  AlertCircle,
  Sparkles,
  Paperclip,
  Award,
  RefreshCw,
  Zap,
  Code2,
  Palette,
  Trophy,
  Rocket
} from 'lucide-react';

export function AIMentorPage() {
  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [currentMode, setCurrentMode] = useState('developer');
  const [repoUrl, setRepoUrl] = useState('https://github.com/neuralcrafters/hackops-agent');
  const [attachments, setAttachments] = useState([]);

  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      mode: 'developer',
      text: `Hello! I am your 24/7 **AI Technical Teammate & Mentor**.

I am trained across 4 specialized hackathon personas:
- 💻 **Developer Mode**: Systems architecture, code reviews, debugging & framework comparisons.
- 🎨 **Designer Mode**: UI/UX design, luxury glassmorphic layouts & micro-animations.
- ⚖️ **Judge Mode**: Hackathon rubric scoring & demo video polish.
- 🚀 **Startup Advisor Mode**: Value proposition, pitch deck outlines & market fit strategy.

How can I help you build a winning submission today?`,
      suggestions: ['Review Architecture', 'Optimize Performance', 'Improve UI', 'Run 9-Point Scorecard'],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [inputQuery, setInputQuery] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [error, setError] = useState('');

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [fileModalOpen, setFileModalOpen] = useState(false);

  const chatEndRef = useRef(null);

  // Load user teams & history
  useEffect(() => {
    async function loadTeamsAndHistory() {
      try {
        const res = await getAllTeams();
        const userTeams = res.teams || [];
        setTeams(userTeams);
        if (userTeams.length > 0) {
          const activeTeamId = userTeams[0].id;
          setSelectedTeamId(activeTeamId);

          // Hydrate past chat history from DB
          try {
            const histRes = await getChatHistory(activeTeamId);
            if (histRes.history && histRes.history.length > 0) {
              const formatted = histRes.history.map((h) => ({
                role: h.sender === 'user' ? 'user' : 'assistant',
                mode: h.mode || 'developer',
                text: h.content,
                suggestions: h.suggestions || [],
                fileAttachments: h.fileAttachments || [],
                timestamp: new Date(h.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              }));
              setMessages(formatted);
            }
          } catch (e) {
            console.warn('Could not load past chat history:', e);
          }
        }
      } catch (e) {
        console.warn('Failed to fetch user teams:', e);
      }
    }
    loadTeamsAndHistory();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, chatLoading]);

  const handleSendMessage = async (textToSend, customMode = null) => {
    const messageContent = (textToSend || inputQuery).trim();
    if (!messageContent || chatLoading) return;

    const targetMode = customMode || currentMode;

    setInputQuery('');
    setError('');

    const newMsg = {
      role: 'user',
      mode: targetMode,
      text: messageContent,
      fileAttachments: attachments,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, newMsg]);
    setChatLoading(true);

    try {
      const res = await sendMentorMessage({
        team_id: selectedTeamId || undefined,
        message: messageContent,
        mode: targetMode,
        repo_link: repoUrl || undefined,
        file_attachments: attachments,
      });

      const responseObj = res.response || res;

      const assistantMsg = {
        role: 'assistant',
        mode: responseObj.mode || targetMode,
        text: responseObj.content || responseObj.answer || 'No response generated.',
        suggestions: responseObj.suggestions || ['Review Architecture', 'Improve UI', 'Run 9-Point Scorecard'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setError(err.message || 'Failed to communicate with AI Mentor.');
    } finally {
      setChatLoading(false);
    }
  };

  const handleFileUploaded = (fileObj) => {
    setAttachments((prev) => [...prev, fileObj]);
  };

  const getModeBadgeIcon = (m) => {
    switch (m) {
      case 'designer': return <Palette className="w-3 h-3 text-purple-400" />;
      case 'judge': return <Trophy className="w-3 h-3 text-amber-400" />;
      case 'startup': return <Rocket className="w-3 h-3 text-emerald-400" />;
      default: return <Code2 className="w-3 h-3 text-cyan-400" />;
    }
  };

  return (
    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-white">
      {/* Background Neural Canvas */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-20 pointer-events-none hidden lg:block">
        <Page3DCanvas type="neural" />
      </div>

      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-[28px] border border-white/15 bg-black/60 backdrop-blur-2xl shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold rounded-full">
            <Bot className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>Intent-Driven AI Teammate & Tool Engine</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight uppercase text-glow">
            AI Mentor OS
          </h1>
          <p className="text-xs text-slate-300 max-w-2xl font-normal leading-relaxed">
            Automatically detects natural language intent to execute Code Reviews, Debugging, UI Audits, PPT Generation, API Documentation, and Combined Super-Reports.
          </p>
        </div>

        {/* Quick Intent Tool Execution Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 self-start md:self-center">
          <button
            onClick={() => handleSendMessage('Review everything and generate a complete report.')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-purple-500 text-black font-extrabold text-xs shadow-lg hover:scale-105 transition-all flex items-center space-x-1.5 active:scale-95 whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Review Everything</span>
          </button>
          <button
            onClick={() => handleSendMessage('Generate an 8-slide PPT presentation pitch deck for judges.')}
            className="px-4 py-2 rounded-xl bg-amber-400 text-black font-extrabold text-xs shadow-lg hover:scale-105 transition-all flex items-center space-x-1.5 active:scale-95 whitespace-nowrap"
          >
            <Award className="w-3.5 h-3.5 text-black" />
            <span>Generate PPT Deck</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold rounded-2xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Container: Chat Stream vs Sidebar Context */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Multi-Mode Selector & Chat Stream (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Mode Switcher */}
          <MentorModeSelector
            currentMode={currentMode}
            onSelectMode={(modeId) => setCurrentMode(modeId)}
          />

          {/* Chat Window */}
          <div className="glass-panel rounded-[28px] border border-white/15 bg-black/50 backdrop-blur-2xl flex flex-col h-[640px] shadow-2xl overflow-hidden relative">
            {/* Chat Stream Header */}
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center font-bold">
                  <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-bold text-white">AI Mentor Assistant</h3>
                    <span className="px-2.5 py-0.5 rounded-full bg-white/10 text-[10px] font-extrabold uppercase text-cyan-300 border border-white/15 flex items-center space-x-1">
                      {getModeBadgeIcon(currentMode)}
                      <span className="capitalize">{currentMode} Mode</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-400 font-semibold flex items-center space-x-1 mt-0.5">
                    <span>● RAG Context Loaded</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Messages Feed Stream */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-white/20">
              {messages.map((msg, idx) => {
                const isUser = msg.role === 'user';

                return (
                  <div
                    key={idx}
                    className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    {/* Avatar */}
                    <div
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center text-xs font-extrabold flex-shrink-0 shadow-lg ${
                        isUser
                          ? 'bg-white text-black font-mono'
                          : 'bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-cyan-400/40 text-cyan-300'
                      }`}
                    >
                      {isUser ? 'U' : <Bot className="w-5 h-5" />}
                    </div>

                    {/* Message Bubble */}
                    <div
                      className={`max-w-2xl p-5 rounded-2xl space-y-3 ${
                        isUser
                          ? 'bg-white text-black font-medium shadow-xl'
                          : 'glass-panel border border-white/15 bg-white/5 text-slate-200 backdrop-blur-xl shadow-2xl'
                      }`}
                    >
                      {/* Mode Pill Tag for Assistant */}
                      {!isUser && (
                        <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 border-b border-white/10 pb-2 mb-2">
                          <span className="flex items-center space-x-1 text-cyan-300 font-bold uppercase tracking-wider">
                            {getModeBadgeIcon(msg.mode || 'developer')}
                            <span className="capitalize">{msg.mode || 'developer'} Mode</span>
                          </span>
                          <span>{msg.timestamp}</span>
                        </div>
                      )}

                      {/* Content Renderer */}
                      {isUser ? (
                        <p className="text-xs text-black font-semibold whitespace-pre-wrap leading-relaxed">
                          {msg.text}
                        </p>
                      ) : (
                        <RichMessageRenderer
                          content={msg.text}
                          executedTools={msg.executedTools}
                          pptDeck={msg.pptDeck}
                        />
                      )}

                      {/* Attached File Indicator */}
                      {msg.fileAttachments?.length > 0 && (
                        <div className="pt-2 border-t border-white/10 space-y-1">
                          <span className="text-[10px] font-mono text-slate-400">Attached File:</span>
                          {msg.fileAttachments.map((f, fIdx) => (
                            <div key={fIdx} className="text-xs font-mono text-cyan-300">
                              📄 {f.name} ({f.size})
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Smart Suggestions Chips */}
                      {!isUser && msg.suggestions && msg.suggestions.length > 0 && (
                        <SmartSuggestions
                          suggestions={msg.suggestions}
                          onSelectSuggestion={(sugText) => handleSendMessage(sugText)}
                        />
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Typing Indicator */}
              {chatLoading && (
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                  <div className="p-4 glass-panel border border-white/15 bg-white/5 rounded-2xl text-xs text-slate-300 font-mono animate-pulse">
                    AI Mentor is retrieving project RAG context & formulating response...
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }} className="p-4 border-t border-white/10 bg-white/5 flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setFileModalOpen(true)}
                className="p-3 rounded-xl bg-white/5 border border-white/15 hover:bg-white/15 text-slate-300 hover:text-white transition-colors"
                title="Attach Document / File"
              >
                <Paperclip className="w-4 h-4 text-cyan-400" />
              </button>

              <input
                type="text"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                placeholder={`Ask AI Mentor in ${currentMode.toUpperCase()} mode...`}
                className="flex-1 px-4 py-3 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-cyan-400 focus:outline-none placeholder-slate-500"
              />

              <button
                type="submit"
                disabled={chatLoading || !inputQuery.trim()}
                className="px-6 py-3 bg-white text-black font-extrabold text-xs rounded-xl shadow-xl transition-all flex items-center space-x-1.5 active:scale-95 disabled:opacity-50"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5 text-black" />
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Project Awareness Sidebar (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <ProjectAwarenessCard
            team={teams.find((t) => t.id === selectedTeamId) || {}}
            repoUrl={repoUrl}
            onOpenReview={() => setReviewModalOpen(true)}
            onOpenFileUpload={() => setFileModalOpen(true)}
            attachments={attachments}
          />

          {/* Target Repo Config */}
          <div className="glass-panel p-6 rounded-[28px] border border-white/15 bg-black/60 backdrop-blur-2xl shadow-2xl space-y-3">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Github className="w-4 h-4 text-cyan-400" />
              <span>Target Repository URL</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-normal">
              Enter GitHub repository link to auto-fetch README context for AI Mentor responses.
            </p>

            <input
              type="url"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-white/5 border border-white/15 text-white text-xs rounded-xl focus:border-cyan-400 focus:outline-none font-mono"
              placeholder="https://github.com/user/repo"
            />
          </div>
        </div>
      </div>

      {/* 9-Metric AI Review Modal */}
      <ProjectReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        teamId={selectedTeamId}
        repoUrl={repoUrl}
      />

      {/* File Upload Modal */}
      <FileUploadModal
        isOpen={fileModalOpen}
        onClose={() => setFileModalOpen(false)}
        onFileUploaded={handleFileUploaded}
      />
    </div>
  );
}
