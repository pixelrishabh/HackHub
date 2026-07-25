import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { getFieldConfig } from '../config/fieldConfig';
import { getAllTeams } from '../api/teams';
import { sendMentorMessage, getChatHistory } from '../api/mentor';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import {
  Bot,
  Send,
  Github,
  Sparkles,
  BookOpen,
  User,
  AlertCircle,
  HelpCircle,
  Code
} from 'lucide-react';

export function AIMentorPage() {
  const { user, isStaff, primaryField } = useAuth();
  const fieldConfig = getFieldConfig(primaryField);

  const [teams, setTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [repoLink, setRepoLink] = useState('');
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const chatBottomRef = useRef(null);

  // Load accessible teams
  useEffect(() => {
    async function loadTeams() {
      setLoadingTeams(true);
      setError('');
      try {
        const res = await getAllTeams();
        const availableTeams = res.teams || [];
        setTeams(availableTeams);
        if (availableTeams.length > 0) {
          setSelectedTeamId(availableTeams[0].id);
        }
      } catch (err) {
        setError(err.message || 'Failed to fetch team list.');
      } finally {
        setLoadingTeams(false);
      }
    }

    loadTeams();
  }, []);

  // Fetch chat history whenever selectedTeamId changes
  useEffect(() => {
    if (!selectedTeamId) return;

    async function loadHistory() {
      setLoadingHistory(true);
      setError('');
      try {
        const res = await getChatHistory(selectedTeamId);
        setMessages(res.history || []);
      } catch (err) {
        setError(err.message || 'Failed to load mentor chat history.');
      } finally {
        setLoadingHistory(false);
      }
    }

    loadHistory();
  }, [selectedTeamId]);

  // Scroll chat to bottom
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (msgToSend = inputMessage) => {
    if (!msgToSend || !msgToSend.trim() || !selectedTeamId) return;

    const trimmedMsg = msgToSend.trim();
    setInputMessage('');
    setSending(true);
    setError('');

    // Optimistic UI append user message
    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      content: trimmedMsg,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await sendMentorMessage({
        team_id: selectedTeamId,
        message: trimmedMsg,
        repo_link: repoLink || undefined,
      });

      if (res.response) {
        setMessages((prev) => [...prev, res.response]);
      }
    } catch (err) {
      setError(err.message || 'Failed to get AI mentor response.');
    } finally {
      setSending(false);
    }
  };

  if (loadingTeams) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center">
        <LoadingSpinner label="Initializing AI Mentor session..." size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Header & Team Selector */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-primary-50 text-primary-700 text-xs font-semibold rounded-md border border-primary-200 mb-2">
            <Bot className="w-3.5 h-3.5" />
            <span>24/7 Context-Aware Technical Assistant</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">AI Mentor Assistant</h1>
          <p className="text-sm text-slate-500">
            Ask technical architecture questions, resolve repository bugs, or inspect hackathon track rulebooks.
          </p>
        </div>

        {/* Team Dropdown Selector */}
        {teams.length > 0 ? (
          <div className="flex flex-col text-right">
            <label className="text-xs font-semibold text-slate-500 mb-1">Select Hackathon Team</label>
            <select
              value={selectedTeamId}
              onChange={(e) => setSelectedTeamId(e.target.value)}
              className="px-3 py-2 text-sm font-semibold border border-slate-300 rounded-xl bg-surface focus:ring-2 focus:ring-primary-500 focus:outline-none"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <Badge variant="warning">No Active Team</Badge>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold rounded-xl flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Chat Feed + Rulebook Helper */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chat Feed (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm flex flex-col h-[650px] overflow-hidden">
          {/* Repo Link Context Bar */}
          <div className="px-6 py-3 border-b border-slate-100 bg-surface flex items-center space-x-3">
            <Github className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              type="url"
              value={repoLink}
              onChange={(e) => setRepoLink(e.target.value)}
              placeholder="Attach GitHub Repo link for README context (optional)..."
              className="w-full text-xs bg-transparent border-none focus:outline-none text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Chat Messages Container */}
          <div className="flex-1 p-6 overflow-y-auto space-y-4">
            {loadingHistory ? (
              <LoadingSpinner label="Fetching chat history..." size="md" />
            ) : messages.length === 0 ? (
              <EmptyState
                title="No Mentor Chat Messages Yet"
                description={`Start the conversation with the AI Mentor for team '${teams.find(t => t.id === selectedTeamId)?.name || 'HackOps'}'.`}
                icon={Bot}
              />
            ) : (
              messages.map((msg, idx) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id || idx}
                    className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        isUser
                          ? 'bg-primary-500 text-white shadow-sm'
                          : 'bg-emerald-500 text-white shadow-sm'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div
                      className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-primary-500 text-white rounded-tr-none'
                          : 'bg-surface border border-slate-200/80 text-slate-800 rounded-tl-none whitespace-pre-wrap'
                      }`}
                    >
                      <div className="text-[10px] font-semibold opacity-70 mb-1">
                        {isUser ? 'You' : 'AI Mentor'} • {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </div>
                      <div>{msg.content}</div>
                    </div>
                  </div>
                );
              })
            )}

            {sending && (
              <div className="flex items-start space-x-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="p-4 rounded-2xl bg-surface border border-slate-200/80 text-xs text-slate-500 italic">
                  AI Mentor is crafting a response based on hackathon rules & code context...
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* Quick Field Prompt Chips */}
          <div className="px-6 py-2 bg-surface/50 border-t border-slate-100 flex flex-wrap gap-1.5">
            <span className="text-[11px] font-bold text-slate-400 self-center mr-1">Suggested ({primaryField}):</span>
            {fieldConfig.quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={sending || !selectedTeamId}
                className="px-2.5 py-1 text-[11px] bg-white hover:bg-primary-50 hover:text-primary-700 text-slate-600 rounded-full border border-slate-200/80 transition-colors truncate max-w-[240px]"
              >
                💡 {prompt}
              </button>
            ))}
          </div>

          {/* Input Form */}
          <div className="p-4 border-t border-slate-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Ask AI Mentor anything about your project build..."
                disabled={sending || !selectedTeamId}
                className="flex-1 px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={sending || !inputMessage.trim() || !selectedTeamId}
                className="p-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl shadow-sm transition-colors disabled:opacity-50"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Rulebook & Track Guidance Drawer (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 text-slate-900 font-bold">
              <BookOpen className="w-5 h-5 text-primary-500" />
              <span>Hackathon Rulebook</span>
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3 bg-surface rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Pre-existing Code Policy:</span> All submitted code must be authored during the official hackathon window. Open-source libraries and APIs are permitted.
              </div>

              <div className="p-3 bg-surface rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Sponsor Tracks:</span> Integrate Gemini API or Node.js microservices to qualify for extra track prizes.
              </div>

              <div className="p-3 bg-surface rounded-xl border border-slate-200">
                <span className="font-bold text-slate-800">Submission Checklist:</span> Public GitHub link, 2-minute demo video, and clear project description are required.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
