'use client';

import React, { useState } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  HeartPulse,
  Activity,
  Volume2,
  VolumeX,
  Trash2,
} from 'lucide-react';
import { AIChatMessage } from '@/lib/types';

export default function AICopilotPage() {
  const [mode, setMode] = useState<'command' | 'citizen'>('command');
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      content:
        'ReliefAI Incident Copilot online. I am synced with real-time sensor streams, active SOS triage queues, and regional shelter capacities. How can I assist your operation?',
      timestamp: '12:00 PM',
      mode: 'command',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const commandPrompts = [
    'Generate comprehensive Incident Action Plan (IAP)',
    'Summarize current live Situation Report (SITREP)',
    'Analyze critical resource deficits and supply reorder thresholds',
    'Assess swift-water rescue feasibility in Sector 4',
  ];

  const citizenPrompts = [
    'How do I stop severe arterial bleeding from a leg wound?',
    'How do I safely purify flood water for drinking?',
    'What should I do during and after an earthquake?',
    'Where is the nearest safe shelter that accepts pets?',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || loading) return;

    const userMsg: AIChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString(),
      mode,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt('');
    setLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: text, mode }),
      });
      const data = await res.json();

      const aiMsg: AIChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        content: data.reply || 'System standby. Unable to generate response.',
        timestamp: new Date().toLocaleTimeString(),
        mode,
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeSwitch = (newMode: 'command' | 'citizen') => {
    setMode(newMode);
    setMessages([
      {
        id: `msg-mode-${Date.now()}`,
        sender: 'assistant',
        content:
          newMode === 'command'
            ? 'Switched to **Incident Command Operations Mode**. Ready to generate IAPs, SITREPs, and resource allocations.'
            : 'Switched to **Citizen Life-Safety Mode**. Ready to guide you through emergency first aid, safe water disinfection, and evacuation shelter directions.',
        timestamp: new Date().toLocaleTimeString(),
        mode: newMode,
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
            <Bot className="w-4 h-4 animate-pulse" />
            <span>AUTONOMOUS CRISIS COPILOT // NLP TRIAGE ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mt-1">
            ReliefAI Copilot
          </h1>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-900 border border-slate-800">
          <button
            onClick={() => handleModeSwitch('command')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'command'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Incident Command</span>
          </button>

          <button
            onClick={() => handleModeSwitch('citizen')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition ${
              mode === 'citizen'
                ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Citizen Life-Safety</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-panel-elevated rounded-3xl border border-slate-800 overflow-hidden flex flex-col h-[650px] shadow-2xl">
        {/* Chat Header Telemetry Bar */}
        <div className="bg-slate-900/90 border-b border-slate-800 px-5 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-slate-300">
              ACTIVE PROTOCOL: <strong className="text-white uppercase">{mode} OPERATIONS</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title="Toggle audio feedback"
              className="hover:text-white transition"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMessages([])}
              title="Clear transcript"
              className="hover:text-red-400 transition"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 p-0.5 shrink-0 shadow-md">
                    <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                      <Bot className="w-4 h-4 text-cyan-400" />
                    </div>
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
                      : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none font-sans'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert max-w-none text-xs sm:text-sm">
                    {msg.content}
                  </div>
                  <div
                    className={`text-[9px] font-mono mt-2 flex items-center justify-end ${
                      isUser ? 'text-cyan-200' : 'text-slate-500'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                  </div>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 max-w-md items-center">
              <div className="w-8 h-8 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center text-cyan-400 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl text-xs text-cyan-300 font-mono animate-pulse flex items-center space-x-2">
                <span>ReliefAI is synthesizing crisis telemetry & guidelines...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Suggestion Chips */}
        <div className="px-5 py-2.5 bg-slate-950/70 border-t border-slate-800/80 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono text-slate-500 uppercase shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-cyan-400" /> QUICK:
          </span>
          {(mode === 'command' ? commandPrompts : citizenPrompts).map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-[11px] whitespace-nowrap px-3 py-1 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition shrink-0"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputPrompt}
              onChange={(e) => setInputPrompt(e.target.value)}
              placeholder={
                mode === 'command'
                  ? 'Ask for tactical reports, situation summaries, or resource plans...'
                  : 'Ask for immediate first-aid instructions, shelter locations, or water purification...'
              }
              className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white focus:outline-none focus:border-cyan-500 transition"
            />

            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-950 flex items-center space-x-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
