import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../hooks/useAuth';
import {
  getConversations,
  getMessages,
  sendMessage,
  markAsRead,
  getSuggestedConnections,
  generateAIIntro
} from '../api/chat';
import { Badge } from './Badge';
import { LoadingSpinner } from './LoadingSpinner';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Users,
  Hash,
  ChevronLeft
} from 'lucide-react';

export function FloatingChatWidget() {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const [selectedTarget, setSelectedTarget] = useState(null);

  const [teamChannels, setTeamChannels] = useState([]);
  const [directMessages, setDirectMessages] = useState([]);
  const [suggested, setSuggested] = useState([]);
  const [messages, setMessages] = useState([]);

  const [loadingConv, setLoadingConv] = useState(false);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const messagesEndRef = useRef(null);

  const totalUnread = [...teamChannels, ...directMessages].reduce(
    (acc, curr) => acc + (curr.unread_count || 0),
    0
  );

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadData = async () => {
    if (!isAuthenticated) return;
    setLoadingConv(true);
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
    } catch (err) {
      // Quiet fallback
    } finally {
      setLoadingConv(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
      const interval = setInterval(() => {
        loadData();
        if (selectedTarget) {
          fetchMessagesSilent(selectedTarget.id);
        }
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, selectedTarget]);

  const handleOpenWidget = () => {
    setIsOpen(true);
    loadData();
  };

  const handleSelectTarget = async (target) => {
    setSelectedTarget(target);
    setLoadingMsgs(true);
    setError('');

    try {
      const res = await getMessages(target.id);
      setMessages(res.messages || []);
      await markAsRead(target.id);
      scrollToBottom();
    } catch (err) {
      setError(err.message || 'Failed to load messages.');
    } finally {
      setLoadingMsgs(false);
    }
  };

  const fetchMessagesSilent = async (targetId) => {
    try {
      const res = await getMessages(targetId);
      setMessages(res.messages || []);
    } catch (e) {}
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
      loadData();
    } catch (err) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  const handleStartAIIntro = async (candidate) => {
    try {
      const introRes = await generateAIIntro(candidate.id);
      const targetObj = { id: candidate.id, name: candidate.name, type: 'DM', role: candidate.role };
      setSelectedTarget(targetObj);
      setInputText(introRes.icebreaker || '');
      await handleSelectTarget(targetObj);
    } catch (err) {
      setError(err.message || 'Failed to generate AI icebreaker.');
    }
  };

  if (!isAuthenticated || location.pathname === '/dashboard/chat') return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* FLOATING FAB BUTTON */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleOpenWidget}
            className="relative p-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-full shadow-2xl flex items-center justify-center border border-white/20 backdrop-blur-xl group"
            title="Open Smart Networking Chat"
          >
            <MessageSquare className="w-6 h-6" />
            <div className="absolute inset-0 bg-white/20 blur-md rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            {totalUnread > 0 && (
              <span className="absolute -top-1 -right-1 px-2 py-0.5 bg-rose-500 text-white font-extrabold text-[10px] rounded-full ring-2 ring-black animate-bounce shadow-lg">
                {totalUnread}
              </span>
            )}
          </motion.button>
        )}
      </AnimatePresence>

      {/* POPOVER CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[350px] sm:w-[390px] h-[530px] glass-card bg-black/90 text-slate-100 rounded-3xl border border-white/15 shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl"
          >
            {/* HEADER */}
            <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
              {selectedTarget ? (
                <button
                  onClick={() => setSelectedTarget(null)}
                  className="flex items-center space-x-1 text-xs text-slate-300 hover:text-white transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span className="font-bold truncate max-w-[200px]">{selectedTarget.name}</span>
                </button>
              ) : (
                <div className="flex items-center space-x-2.5">
                  <div className="p-1.5 bg-cyan-500/20 rounded-xl text-cyan-300 border border-cyan-500/30">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-extrabold text-white">Smart HackHub Chat</h4>
                    <div className="text-[10px] text-slate-400">Live Networking & Channels</div>
                  </div>
                </div>
              )}

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* CONTENT AREA */}
            {!selectedTarget ? (
              <div className="flex-1 flex flex-col overflow-hidden bg-black/40">
                {/* Tab Selector */}
                <div className="flex border-b border-white/10 bg-white/5 text-xs font-bold">
                  <button
                    onClick={() => setActiveTab('chats')}
                    className={`flex-1 py-2.5 text-center transition-colors border-b-2 ${
                      activeTab === 'chats'
                        ? 'border-cyan-400 text-cyan-300'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    Chats ({teamChannels.length + directMessages.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('ai')}
                    className={`flex-1 py-2.5 text-center transition-colors border-b-2 flex items-center justify-center space-x-1 ${
                      activeTab === 'ai'
                        ? 'border-purple-400 text-purple-300'
                        : 'border-transparent text-slate-400 hover:text-white'
                    }`}
                  >
                    <Sparkles className="w-3 h-3 text-purple-400" />
                    <span>AI Connections ({suggested.length})</span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-3 space-y-4">
                  {activeTab === 'chats' ? (
                    <>
                      {/* Team Channels */}
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                          <Hash className="w-3 h-3 text-cyan-400" />
                          <span>Team Channels</span>
                        </div>
                        <div className="space-y-1">
                          {teamChannels.map(t => (
                            <button
                              key={t.id}
                              onClick={() => handleSelectTarget({ id: t.id, name: t.name, type: 'TEAM' })}
                              className="w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-left flex items-center justify-between transition-all"
                            >
                              <div className="truncate pr-2">
                                <div className="text-xs font-bold text-white truncate">{t.name}</div>
                                <div className="text-[10px] text-slate-400 truncate">{t.last_message}</div>
                              </div>
                              {t.unread_count > 0 && (
                                <span className="px-1.5 py-0.5 bg-rose-500 text-white font-extrabold text-[9px] rounded-full">
                                  {t.unread_count}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Direct Messages */}
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                          <Users className="w-3 h-3 text-purple-400" />
                          <span>Direct Messages</span>
                        </div>
                        {directMessages.length === 0 ? (
                          <div className="text-[10px] text-slate-400 italic px-1">No active DMs yet.</div>
                        ) : (
                          <div className="space-y-1">
                            {directMessages.map(dm => (
                              <button
                                key={dm.id}
                                onClick={() => handleSelectTarget({ id: dm.id, name: dm.name, type: 'DM', role: dm.role })}
                                className="w-full p-2.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 text-left flex items-center justify-between transition-all"
                              >
                                <div className="truncate pr-2">
                                  <div className="text-xs font-bold text-white truncate">{dm.name}</div>
                                  <div className="text-[10px] text-slate-400 truncate">{dm.last_message}</div>
                                </div>
                                {dm.unread_count > 0 && (
                                  <span className="px-1.5 py-0.5 bg-rose-500 text-white font-extrabold text-[9px] rounded-full">
                                    {dm.unread_count}
                                  </span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  ) : (
                    /* AI Suggestions */
                    <div className="space-y-2">
                      {suggested.map(s => (
                        <div key={s.id} className="p-2.5 bg-white/5 rounded-2xl border border-white/10 space-y-1.5 backdrop-blur-md">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white truncate">{s.name}</span>
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
                              {s.role}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 leading-tight">{s.match_reason}</div>
                          <button
                            onClick={() => handleStartAIIntro(s)}
                            className="w-full py-1 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-[10px] font-bold rounded-xl border border-purple-500/30 transition-colors flex items-center justify-center space-x-1"
                          >
                            <Sparkles className="w-3 h-3 text-purple-400" />
                            <span>Start AI Intro</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* THREAD STREAM */
              <div className="flex-1 flex flex-col overflow-hidden bg-black/50">
                <div className="flex-1 p-3 overflow-y-auto space-y-2.5">
                  {loadingMsgs ? (
                    <div className="h-full flex items-center justify-center">
                      <LoadingSpinner label="Loading thread..." size="sm" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-xs text-slate-400">Say hello or trigger an AI Intro!</div>
                  ) : (
                    messages.map(msg => {
                      const isSelf = msg.sender_id === user.id;
                      return (
                        <div key={msg.id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-2.5 rounded-2xl text-xs space-y-0.5 shadow-md ${
                            isSelf
                              ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-br-none'
                              : 'bg-white/10 text-slate-200 border border-white/15 rounded-bl-none'
                          }`}>
                            <div className="text-[9px] opacity-75 font-semibold">
                              {isSelf ? 'You' : msg.sender?.name}
                            </div>
                            <p className="leading-snug whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* INPUT BAR */}
                <form onSubmit={handleSendMessage} className="p-2.5 border-t border-white/10 bg-black/60 flex items-center space-x-1.5">
                  <input
                    type="text"
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    placeholder="Type message..."
                    className="flex-1 px-3 py-2 text-xs bg-white/5 border border-white/15 text-white rounded-xl focus:border-white focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputText.trim() || sending}
                    className="p-2 bg-cyan-500 hover:bg-cyan-600 text-white text-xs font-bold rounded-xl shadow-lg transition-colors disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
