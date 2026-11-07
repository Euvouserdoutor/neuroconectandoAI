import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  X, 
  Send, 
  Sparkles, 
  Heart, 
  Wind, 
  Activity, 
  Frown, 
  Smile, 
  Info, 
  Battery, 
  Zap,
  HelpCircle,
  TrendingDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CognitiveState, BiometricState } from '../types';

interface WellnessCompanionSidebarProps {
  cognitive: CognitiveState;
  biometric: BiometricState;
}

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  isQuickAction?: boolean;
}

export default function WellnessCompanionSidebar({ cognitive, biometric }: WellnessCompanionSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome_msg_1',
      role: 'model',
      text: "Hello! I am **Soma**, your G-powered **Wellness Companion**. I am synchronizing with your live EEG cranial and HRV biometric data. Feel free to type anything or ask for an immediate on-demand stress relief exercise!",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to lowest message
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading]);

  // Handle active stress spike detection to prompt the user
  const prevStressRef = useRef<string>('Low');
  useEffect(() => {
    if (cognitive.stress === 'High' && prevStressRef.current !== 'High' && isOpen === false) {
      // Trigger user awareness silently or encourage opening the companion
      prevStressRef.current = 'High';
    } else {
      prevStressRef.current = cognitive.stress;
    }
  }, [cognitive.stress, isOpen]);

  // Clean format helper for markdown bold and bullet points
  const formatText = (text: string) => {
    // Basic formatting for a pristine layout
    return text.split('\n').map((line, index) => {
      let content = line;
      
      // Bold text converter
      const boldRegex = /\*\*(.*?)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(content)) !== null) {
        if (match.index > lastIndex) {
          parts.push(content.substring(lastIndex, match.index));
        }
        parts.push(
          <strong key={match.index} className="text-indigo-400 font-extrabold">
            {match[1]}
          </strong>
        );
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < content.length) {
        parts.push(content.substring(lastIndex));
      }

      const parsedLine = parts.length > 0 ? parts : content;

      // Handle bullet lists
      if (line.trim().startsWith('-') || line.trim().startsWith('*')) {
        const cleanedLine = line.replace(/^[\s-*]+/, '').trim();
        return (
          <li key={index} className="ml-4 list-disc text-[11px] text-slate-350 leading-relaxed mb-1">
            {parsedLine}
          </li>
        );
      }

      // Handle subheadings
      if (line.trim().startsWith('###')) {
        const cleaned = line.replace(/^###+/, '').trim();
        return (
          <h5 key={index} className="text-xs font-black font-sans uppercase tracking-tight text-white mt-3 mb-1.5 flex items-center gap-1.5 border-b border-slate-900 pb-1">
            <Sparkles className="h-3 w-3 text-indigo-400 animate-pulse" />
            {cleaned}
          </h5>
        );
      }

      if (line.trim() === '') {
        return <div key={index} className="h-2" />;
      }

      return (
        <p key={index} className="text-[11px] text-slate-300 leading-snug mb-1.5">
          {parsedLine}
        </p>
      );
    });
  };

  const sendMessage = async (textToSend: string, isQuick: boolean = false) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsg: Message = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isQuickAction: isQuick
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // Map current messages to history form for Gemini payload
      const historyPayload = messages
        .filter(m => m.id !== 'welcome_msg_1') // skip default greeting to conserve tokens
        .slice(-6) // send last 6 messages
        .map(m => ({
          role: m.role,
          text: m.text
        }));

      const res = await fetch('/api/gemini/wellness-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          history: historyPayload,
          cognitiveState: cognitive,
          biometricState: biometric
        })
      });

      const data = await res.json();
      if (data.success && data.text) {
        setMessages(prev => [...prev, {
          id: `msg_${Date.now()}_m`,
          role: 'model',
          text: data.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]);
      } else {
        throw new Error(data.error || 'Invalid API response format');
      }
    } catch (err: any) {
      console.error(err);
      setMessages(prev => [...prev, {
        id: `msg_${Date.now()}_err`,
        role: 'model',
        text: "My apologies, I experienced a minor synapse interruption while querying our Gemini engine. Please try sending and synapsing again.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = (type: 'breathing' | 'tip' | 'check') => {
    let prompt = '';
    if (type === 'breathing') {
      prompt = `Provide a customized breathing exercise tailored precisely to my current stress condition (${cognitive.stress} Stress). Give me instructions now.`;
    } else if (type === 'tip') {
      prompt = `Give me a rapid physical stress-relief tip for my current state (Stress: ${cognitive.stress}, Fatigue: ${cognitive.fatigue}).`;
    } else {
      prompt = `Review my current cognitive telemetry (Stress: ${cognitive.stress}, HRV: ${biometric.hrv}ms, GSR: ${biometric.gsr}uS). Give me a 10-second wellness assessment.`;
    }
    sendMessage(prompt, true);
  };

  // Stress-indicative styles for sidebar background
  const stressColor = cognitive.stress === 'High' 
    ? 'border-red-500 text-red-400 bg-red-950/25 shadow-[0_0_15px_rgba(239,68,68,0.25)]' 
    : 'border-slate-800 text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-850';

  return (
    <>
      {/* PERSISTENT FLOATING SIDEBAR TOGGLE TRIGGER */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 p-3 rounded-2xl flex items-center space-x-2 border transition-all cursor-pointer font-sans shadow-2xl ${stressColor}`}
        id="wellness-sidebar-toggle-trigger"
        title="Open Wellness Companion Sidebar"
      >
        <span className="relative flex h-3 w-3">
          {cognitive.stress === 'High' ? (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
            </>
          ) : (
            <>
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500"></span>
            </>
          )}
        </span>
        <Heart className={`h-4.5 w-4.5 ${cognitive.stress === 'High' ? 'animate-bounce text-red-500' : 'text-indigo-400'}`} />
        <span className="text-xs font-black uppercase tracking-wider font-mono">
          {cognitive.stress === 'High' ? 'STRESS HELPER' : 'SOMA COMPANION'}
        </span>
      </button>

      {/* COMPANION SIDEBAR DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[80] overflow-hidden pointer-events-none" id="wellness-sidebar-container">
            {/* Dark blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm pointer-events-auto cursor-pointer"
            />

            {/* Sidebar drawer body */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 24, stiffness: 220 }}
              className="absolute top-0 right-0 h-full w-full sm:w-[420px] bg-slate-950 border-l border-slate-900 shadow-2xl pointer-events-auto flex flex-col justify-between"
              id="wellness-sidebar-panel"
            >
              {/* Header block with biometrics dashboard */}
              <div className="p-4 border-b border-slate-900 bg-slate-900/60 sticky top-0 backdrop-blur-md z-10 space-y-3">
                <div className="flex items-center justify-between">
                  {/* Brand info */}
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 bg-indigo-950/50 border border-indigo-900/60 rounded-xl">
                      <Wind className="h-5 w-5 text-indigo-400 animate-pulse" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-100 uppercase tracking-tight flex items-center gap-1 font-sans">
                        Soma Coach
                        <span className="text-[10px] bg-indigo-950 text-indigo-400 font-mono px-1.5 py-0.5 rounded border border-indigo-900/30">Gemini</span>
                      </h3>
                      <p className="text-[9.5px] text-slate-400 uppercase tracking-wider font-mono">Wellness Biofeedback Companion</p>
                    </div>
                  </div>

                  {/* Close trigger */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                    title="Close Sidebar"
                    type="button"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Live Biometrics sync tracker snippet */}
                <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850 grid grid-cols-3 gap-2 font-mono text-[9px]">
                  {/* Stress metric */}
                  <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                    <span className="text-slate-500 uppercase font-black tracking-wider block mb-0.5">Stress (EEG)</span>
                    <div className="flex items-center gap-1">
                      {cognitive.stress === 'High' ? (
                        <>
                          <Activity className="h-3.5 w-3.5 text-red-500 animate-pulse" />
                          <span className="text-red-400 font-extrabold font-mono text-[9.5px]">HIGH</span>
                        </>
                      ) : cognitive.stress === 'Moderate' ? (
                        <>
                          <Activity className="h-3.5 w-3.5 text-amber-500 animate-pulse" />
                          <span className="text-amber-400 font-extrabold font-mono text-[9.5px]">MOD</span>
                        </>
                      ) : (
                        <>
                          <Activity className="h-3.5 w-3.5 text-emerald-500 animate-pulse" />
                          <span className="text-emerald-400 font-extrabold font-mono text-[9.5px]">LOW</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Galvanic skin feedback */}
                  <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                    <span className="text-slate-500 uppercase font-black tracking-wider block mb-0.5">Sweat (GSR)</span>
                    <span className="text-slate-200 font-extrabold font-mono text-[9.5px]">
                      {biometric.gsr.toFixed(1)} µS
                    </span>
                  </div>

                  {/* Cardiac rhythm state */}
                  <div className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-slate-900/50 border border-slate-800/80">
                    <span className="text-slate-500 uppercase font-black tracking-wider block mb-0.5">Heart Rate</span>
                    <span className="text-slate-200 font-extrabold font-mono text-[9.5px] flex items-center gap-0.5">
                      <Heart className="h-3 w-3 text-rose-500 animate-pulse shrink-0" />
                      {biometric.heartRate} bpm
                    </span>
                  </div>
                </div>
              </div>

              {/* Chat screen log block */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth" id="wellness-sidebar-messages">
                <AnimatePresence initial={false}>
                  {messages.map((m) => {
                    const isUser = m.role === 'user';
                    return (
                      <motion.div
                        key={m.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl p-3 shadow-md border ${
                          isUser 
                            ? 'bg-indigo-650/40 border-indigo-700/50 text-indigo-50 font-sans' 
                            : 'bg-slate-900/80 border-slate-850 text-slate-100 font-sans'
                        }`}>
                          {/* Sender name & time */}
                          <div className="flex items-center justify-between gap-4 font-mono text-[8.5px] text-slate-500 mb-1">
                            <span className="font-bold flex items-center gap-1">
                              {!isUser && <Wind className="h-3 w-3 text-indigo-400" />}
                              {isUser ? 'Alex Mercer' : 'Soma Wellness Companion'}
                            </span>
                            <span>{m.timestamp}</span>
                          </div>

                          {/* Message core */}
                          <div className="space-y-1">
                            {formatText(m.text)}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}

                  {/* Thinking Loading output indicator */}
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex w-full justify-start"
                    >
                      <div className="max-w-[85%] rounded-2xl p-3 bg-slate-900/40 border border-slate-850">
                        <div className="flex items-center space-x-2 text-indigo-400 text-[10px] font-mono font-bold font-sans">
                          <Wind className="h-3.5 w-3.5 animate-spin-slow text-indigo-400" />
                          <span>Soma is synthesizing bio-relief exercises...</span>
                        </div>
                        <div className="flex space-x-1 mt-2.5 ml-1">
                          <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="h-1.5 w-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Stress trigger awareness notice logic */}
              {cognitive.stress === 'High' && (
                <div className="px-4 py-2 bg-red-950/20 border-t border-b border-red-900/40 text-[10px] text-red-300 flex items-center gap-2 font-mono" id="stress-indicator-coaching-box">
                  <TrendingDown className="h-4 w-4 text-red-500 animate-pulse shrink-0" />
                  <span>
                    <strong>Cranial Stress Warning:</strong> Your EEG signals are currently highly hyperactive. We strongly recommend launching an on-demand breathing cycle below.
                  </span>
                </div>
              )}

              {/* Quick action panel bar list */}
              <div className="p-3 bg-slate-900/40 border-t border-slate-900">
                <span className="text-[8.5px] font-mono text-slate-500 block uppercase tracking-wider mb-2 font-extrabold uppercase">
                  Quick Remedies customized to EEG State
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => handleQuickAction('breathing')}
                    className="py-2 px-1.5 bg-slate-900 hover:bg-indigo-950/40 border border-slate-850 hover:border-indigo-900/30 text-indigo-300 rounded-lg text-[9.5px] font-bold font-mono transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1"
                    type="button"
                  >
                    <Wind className="h-3.5 w-3.5 text-indigo-400" />
                    <span>Breathing Prompt</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('tip')}
                    className="py-2 px-1.5 bg-slate-900 hover:bg-emerald-950/40 border border-slate-850 hover:border-emerald-900/30 text-emerald-300 rounded-lg text-[9.5px] font-bold font-mono transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1"
                    type="button"
                  >
                    <Heart className="h-3.5 w-3.5 text-emerald-400" />
                    <span>Stress Tip</span>
                  </button>
                  <button
                    onClick={() => handleQuickAction('check')}
                    className="py-2 px-1.5 bg-slate-900 hover:bg-indigo-950/40 border border-slate-850 hover:border-indigo-900/30 text-indigo-300 rounded-lg text-[9.5px] font-bold font-mono transition-all cursor-pointer text-center flex flex-col items-center justify-center gap-1"
                    type="button"
                  >
                    <Activity className="h-3.5 w-3.5 text-indigo-400 animate-pulse" />
                    <span>State Sync</span>
                  </button>
                </div>
              </div>

              {/* Chat Input entry bar */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  sendMessage(input);
                }}
                className="p-3 border-t border-slate-900 bg-slate-950 flex items-center space-x-2 z-10 sticky bottom-0"
              >
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={cognitive.stress === 'High' ? "Need help? Type here or use Quick Remedies..." : "Ask Soma for tips, posture updates, breathing checks..."}
                  className="flex-1 bg-slate-900 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
                  disabled={isLoading}
                  id="wellness-sidebar-input-field"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className={`p-2 rounded-xl transition-all h-8 w-8 flex items-center justify-center cursor-pointer ${
                    input.trim() && !isLoading 
                      ? 'bg-indigo-600 text-white shadow-lg' 
                      : 'bg-slate-900 text-slate-600 border border-slate-850/50 cursor-not-allowed'
                  }`}
                  id="wellness-sidebar-submit-btn"
                  title="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
