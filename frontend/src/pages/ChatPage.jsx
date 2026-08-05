import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getSuggestedConnections,
  generateAIIntro
} from '../api/chat';
import { LoadingSpinner } from '../components/LoadingSpinner';
import { EmptyState } from '../components/EmptyState';
import { Badge } from '../components/Badge';
import { Page3DCanvas } from '../components/Page3DCanvas';
import { CustomSpotlight } from '../components/CustomSpotlight';
import { MagneticButton } from '../components/MagneticButton';
import {
  MessageSquare,
  Users,
  Send,
  Sparkles,
  AlertCircle,
  Hash
} from 'lucide-react';

export function ChatPage() {
  const { user } = useAuth();

  const [teamChannels, setTeamChannels] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [suggested, setSuggested] = useState([]);

  const [selectedTarget, setSelectedTarget] = useState(null);
  const [messages, setMessages] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [icebreakerLoading, setIcebreakerLoading] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      const [convRes, suggRes] = await Promise.all([
        getConversations(),
        getSuggestedConnections(),
      ]);

      const teams = convRes.team_channels || [];
      const dms = convRes.direct_messages || [];

      setTeamChannels(teams);
      setDirectMessages(dms);
      setSuggested(suggRes.suggestions || []);

      if (!selectedTarget) {
        if (teams.length > 0) {
          handleSelectTarget({ id: teams[0].id, name: teams[0].name, type: 'TEAM' });
        } else if (dms.length > 0) {
          handleSelectTarget({ id: dms[0].id, name: dms[0].name, type: 'DM', role: dms[0].role });
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load chat channels.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessagesSilent = async (targetId) => {
    if (!targetId || document.hidden) return;
    try {
      const res = await getMessages(targetId);
      const newMsgs = res.messages || [];
      setMessages((prev) => {
        if (newMsgs.length > prev.length) {
          setTimeout(scrollToBottom, 100);
        }
        return newMsgs;
      });
    } catch (e) {}
  };

  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    loadConversations();
    // Real-time synchronization interval (3 seconds)
    const interval = setInterval(() => {
      if (selectedTarget && !document.hidden) {
        fetchMessagesSilent(selectedTarget.id);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [selectedTarget]);

  const handleSelectTarget = async (target) => {
    setSelectedTarget(target);
    setLoadingMessages(true);
    setError('');

    try {
      const res = await getMessages(target.id);
      setMessages(res.messages || []);
      await markAsRead(target.id);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      setError(err.message || 'Failed to load messages.');
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!inputText.trim() || !selectedTarget || sending) return;

    const payload = {
      content: inputText.trim(),
      ...(selectedTarget.type === 'TEAM'
        ? { team_id: selectedTarget.id }
        : { receiver_id: selectedTarget.id }),
    };

    setSending(true);
    setInputText('');

    try {
      const res = await sendMessage(payload);
      setMessages(prev => [...prev, res.message]);
      scrollToBottom();
      await loadConversations();
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleStartAIIntro = async (candidate) => {
    setIcebreakerLoading(true);
    setError('');

    try {
      const introRes = await generateAIIntro(candidate.id);
      const targetObj = { id: candidate.id, name: candidate.name, type: 'DM', role: candidate.role };
      setSelectedTarget(targetObj);

      setInputText(introRes.icebreaker || '');
      await handleSelectTarget(targetObj);
    } catch (err) {
      setError(err.message || 'Failed to generate AI icebreaker.');
    } finally {
      setIcebreakerLoading(false);
    }
  };

  const getRoleBadge = (roleStr) => {
    const r = (roleStr || '').toLowerCase();
    if (r === 'mentor') return <Badge variant="info">Mentor</Badge>;
    if (r === 'sponsor') return <Badge variant="success">Sponsor</Badge>;
    if (r === 'organizer' || r === 'judge') return <Badge variant="primary">Staff</Badge>;
    return <Badge variant="neutral">Participant</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center bg-black">
        <LoadingSpinner label="Loading Smart Chat & Networking Channels..." size="lg" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-black text-slate-100 overflow-hidden pb-8">
      {/* 3D Background Canvas & Spotlight */}
      <Page3DCanvas />
      <CustomSpotlight />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 h-[88vh] flex flex-col space-y-4">
        {/* Header Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card px-6 py-4 rounded-3xl border border-white/10 shadow-2xl backdrop-blur-2xl bg-white/5 flex items-center justify-between"
        >
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/20 text-cyan-300 rounded-2xl border border-cyan-500/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-white">Smart Networking & Live Chat</h1>
              <p className="text-xs text-slate-300">
                Connect with team members, mentors, sponsors, and AI-recommended hackathon peers.
              </p>
            </div>
          </div>
        </motion.div>

        {error && (
          <div className="p-3 bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-semibold rounded-2xl flex items-center space-x-2 backdrop-blur-xl">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main 2-Column Chat Container */}
        <div className="flex-1 glass-card rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row backdrop-blur-2xl bg-white/5">
          
          {/* LEFT SIDEBAR: Channels & Direct Messages */}
          <div className="w-full md:w-80 border-r border-white/10 flex flex-col bg-black/40">
            <div className="p-4 border-b border-white/10">
              <h2 className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">Conversations</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-6">
              
              {/* Team Channels */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Hash className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Team Channels ({teamChannels.length})</span>
                </div>
                <div className="space-y-1">
                  {teamChannels.map((t) => {
                    const isSelected = selectedTarget?.id === t.id && selectedTarget?.type === 'TEAM';
                    return (
                      <button
                        key={t.id}
                        onClick={() => handleSelectTarget({ id: t.id, name: t.name, type: 'TEAM' })}
                        className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-center justify-between ${
                          isSelected
                            ? 'bg-white text-black font-bold shadow-lg shadow-white/20'
                            : 'hover:bg-white/10 text-slate-200'
                        }`}
                      >
                        <div className="truncate">
                          <div className="text-xs font-bold truncate">{t.name}</div>
                          <div className={`text-[10px] truncate ${isSelected ? 'text-slate-700' : 'text-slate-400'}`}>
                            {t.last_message}
                          </div>
                        </div>
                        {t.unread_count > 0 && !isSelected && (
                          <span className="px-2 py-0.5 bg-rose-500 text-white font-extrabold text-[10px] rounded-full animate-pulse">
                            {t.unread_count}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Direct Messages */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                  <span>Direct Messages ({directMessages.length})</span>
                </div>
                {directMessages.length === 0 ? (
                  <div className="text-[11px] text-slate-400 italic px-2">No active direct messages yet.</div>
                ) : (
                  <div className="space-y-1">
                    {directMessages.map((dm) => {
                      const isSelected = selectedTarget?.id === dm.id && selectedTarget?.type === 'DM';
                      return (
                        <button
                          key={dm.id}
                          onClick={() => handleSelectTarget({ id: dm.id, name: dm.name, type: 'DM', role: dm.role })}
                          className={`w-full p-2.5 rounded-2xl text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-white text-black font-bold shadow-lg shadow-white/20'
                              : 'hover:bg-white/10 text-slate-200'
                          }`}
                        >
                          <div className="truncate">
                            <div className="text-xs font-bold truncate flex items-center space-x-1">
                              <span>{dm.name}</span>
                            </div>
                            <div className={`text-[10px] truncate ${isSelected ? 'text-slate-700' : 'text-slate-400'}`}>
                              {dm.last_message}
                            </div>
                          </div>
                          {dm.unread_count > 0 && !isSelected && (
                            <span className="px-2 py-0.5 bg-rose-500 text-white font-extrabold text-[10px] rounded-full animate-pulse">
                              {dm.unread_count}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* AI Suggested Connections */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center space-x-1">
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>AI Suggested Connections</span>
                </div>
                <div className="space-y-2">
                  {suggested.map((s) => (
                    <div key={s.id} className="p-2.5 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white truncate">{s.name}</span>
                        {getRoleBadge(s.role)}
                      </div>
                      <div className="text-[10px] text-slate-400 leading-tight">{s.match_reason}</div>
                      <button
                        onClick={() => handleStartAIIntro(s)}
                        disabled={icebreakerLoading}
                        className="w-full py-1 px-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold rounded-xl border border-purple-500/30 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Start AI Intro</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

          {/* RIGHT CHAT STREAM */}
          <div className="flex-1 flex flex-col bg-black/20">
            
            {/* Stream Header */}
            {selectedTarget ? (
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-extrabold flex items-center justify-center text-xs">
                    {selectedTarget.type === 'TEAM' ? '#' : selectedTarget.name?.charAt(0)}
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-white">{selectedTarget.name}</h3>
                    <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse"></span>
                      <span>{selectedTarget.type === 'TEAM' ? 'Active Team Channel' : 'Direct Conversation'}</span>
                    </div>
                  </div>
                </div>

                {selectedTarget.type === 'DM' && selectedTarget.role && (
                  <div>{getRoleBadge(selectedTarget.role)}</div>
                )}
              </div>
            ) : (
              <div className="p-4 border-b border-white/10 text-xs text-slate-400">Select a conversation to start messaging.</div>
            )}

            {/* Messages List Area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-black/30">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center">
                  <LoadingSpinner label="Loading message history..." size="md" />
                </div>
              ) : messages.length === 0 ? (
                <EmptyState
                  title="No Messages Yet"
                  description="Send a friendly greeting or trigger a Smart AI Icebreaker to start the discussion."
                  icon={MessageSquare}
                />
              ) : (
                messages.map((msg) => {
                  const isSelf = msg.sender_id === user.id;
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-md p-3.5 rounded-2xl text-xs space-y-1 shadow-lg backdrop-blur-md ${
                        isSelf
                          ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-none'
                          : 'bg-white/10 text-slate-100 border border-white/15 rounded-bl-none'
                      }`}>
                        <div className="flex items-center justify-between text-[10px] opacity-80 gap-3 border-b border-current/10 pb-1 mb-1">
                          <span className="font-bold">{isSelf ? 'You' : msg.sender?.name || 'Team Member'}</span>
                          <span className="flex items-center space-x-1">
                            <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            {isSelf && (
                              <span className="font-bold text-cyan-200 ml-1">
                                {msg.is_read || msg.isRead ? '✓✓ Read' : '✓ Delivered'}
                              </span>
                            )}
                          </span>
                        </div>
                        <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              {isTyping && (
                <div className="flex items-center space-x-2 text-[11px] text-cyan-400 italic px-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
                  <span>Teammate is typing...</span>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            {selectedTarget && (
              <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10 bg-black/40 flex items-center space-x-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    setIsTyping(e.target.value.length > 0);
                  }}
                  onBlur={() => setIsTyping(false)}
                  placeholder={`Type a message to ${selectedTarget.name}...`}
                  className="flex-1 px-4 py-2.5 text-xs bg-white/5 border border-white/15 text-white rounded-2xl focus:border-white focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || sending}
                  className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white text-xs font-bold rounded-2xl shadow-lg transition-all disabled:opacity-50 flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? 'Sending...' : 'Send'}</span>
                </button>
              </form>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
