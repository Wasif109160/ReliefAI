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

function createMessage(
  sender: 'user' | 'assistant',
  content: string,
  mode: 'command' | 'citizen'
): AIChatMessage {
  return {
    id: `${sender}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    sender,
    content,
    timestamp: new Date().toLocaleTimeString(),
    mode,
  };
}

export default function AICopilotPage() {
  const [mode, setMode] = useState<'command' | 'citizen'>('command');
  const [inputPrompt, setInputPrompt] = useState('');
  const [messages, setMessages] = useState<AIChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      content:
        'ReliefAI Incident Copilot অনলাইন। আমি বাংলাদেশ পানি উন্নয়ন বোর্ড (BWDB), দুর্যোগ ব্যবস্থাপনা অধিদপ্তর (DDM), এবং ফায়ার সার্ভিস ও সিভিল ডিফেন্স (FSCD) রিয়েলটাইম ডেটাস্ট্রিমের সাথে সমন্বিত। কীভাবে সহায়তা করতে পারি?',
      timestamp: '12:00 PM',
      mode: 'command',
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(false);

  const commandPrompts = [
    'সুরমা-কুশিয়ারা অববাহিকার লাইভ পরিস্থিতি ও পূর্বাভাস (Surma Basin SITREP)',
    'Generate comprehensive Incident Action Plan (IAP) for Sylhet flash floods',
    'ঘূর্ণিঝড় ১০ নম্বর মহাবিপদ সংকেতে উপকূলীয় ইভাকুয়েশন প্রটোকল',
    'FSCD ও রেড ক্রিসেন্ট (BDRCS) উদ্ধারকারী দল মোতায়েন বিশ্লেষণ',
    'Analyze emergency relief grant disbursal thresholds for affected upazilas',
  ];

  const citizenPrompts = [
    'বন্যার পানি ফিটকিরি বা অ্যাকুয়াট্যাব দিয়ে কীভাবে বিশুদ্ধ করব?',
    'কাছের নিরাপদ ঘূর্ণিঝড় আশ্রয়কেন্দ্র কোথায় পাব?',
    'বন্যা বা প্লাবনে বিষধর সাপ কাটলে তাৎক্ষণিক প্রাথমিক চিকিৎসা কী?',
    'How do I request emergency shallow-draft boat rescue via SOS?',
    'ডায়রিয়া ও পানিবাহিত রোগ প্রতিরোধে ওআরএস প্রস্তুতি নিয়ম',
  ];

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputPrompt;
    if (!text.trim() || loading) return;

    const userMsg = createMessage('user', text, mode);

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

      const aiMsg = createMessage(
        'assistant',
        data.reply || 'System standby. Unable to generate response.',
        mode
      );

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
            ? 'সুইচ করা হয়েছে **জাতীয় ক্রাইসিস কমান্ড মোডে (Incident Command)**। IAP পরিকল্পনা, BWDB নদীর পানি বিপদসীমা ও উদ্ধারকর্মী মোতায়েনে প্রস্তুত।'
            : 'সুইচ করা হয়েছে **নাগরিক জীবনরক্ষা মোডে (Citizen Life-Safety)**। জরুরি প্রাথমিক চিকিৎসা, সাপ কাটার অ্যান্টিভেনম নির্দেশিকা, বিশুদ্ধ পানি এবং আশ্রয়কেন্দ্র নির্দেশনায় প্রস্তুত।',
        timestamp: new Date().toLocaleTimeString(),
        mode: newMode,
      },
    ]);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Title & Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-teal-700 uppercase tracking-wider">
            <Bot className="w-4 h-4 text-teal-600" />
            <span>AUTONOMOUS CRISIS COPILOT // NLP TRIAGE ENGINE</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-1">
            ReliefAI Copilot
          </h1>
          <p className="text-xs text-slate-500 mt-1 font-bangla font-medium">
            জরুরি দুর্যোগ ব্যবস্থাপনা ও নাগরিক পরামর্শ সহকারী
          </p>
        </div>

        {/* Dual Mode Switcher */}
        <div className="flex items-center p-1 rounded-2xl bg-slate-100 border border-slate-200">
          <button
            onClick={() => handleModeSwitch('command')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'command'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Activity className="w-4 h-4 text-blue-600" />
            <span>Incident Command</span>
          </button>

          <button
            onClick={() => handleModeSwitch('citizen')}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              mode === 'citizen'
                ? 'bg-white text-teal-700 shadow-xs border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HeartPulse className="w-4 h-4 text-teal-600" />
            <span>Citizen Life-Safety</span>
          </button>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden flex flex-col h-[650px] shadow-xs">
        {/* Chat Header Telemetry Bar */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between text-xs">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-slate-600 font-medium">
              ACTIVE PROTOCOL: <strong className="text-slate-900 uppercase font-bold">{mode} OPERATIONS</strong>
            </span>
          </div>

          <div className="flex items-center space-x-3 text-slate-400">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title="Toggle audio feedback"
              className="hover:text-slate-700 transition cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-teal-600" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMessages([])}
              title="Clear transcript"
              className="hover:text-red-600 transition cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/40">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-teal-50 border border-teal-200 p-0.5 shrink-0 flex items-center justify-center shadow-xs">
                    <Bot className="w-4 h-4 text-teal-600" />
                  </div>
                )}

                <div
                  className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-tr-none'
                      : 'bg-white border border-slate-200/90 text-slate-900 rounded-tl-none font-sans'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-slate max-w-none text-xs sm:text-sm">
                    {msg.content}
                  </div>
                  <div
                    className={`text-[9px] font-mono mt-2 flex items-center justify-end ${
                      isUser ? 'text-blue-100' : 'text-slate-400'
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
              <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 animate-pulse">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white border border-slate-200 p-3.5 rounded-2xl text-xs text-slate-700 font-mono animate-pulse flex items-center space-x-2 shadow-xs">
                <span>ReliefAI is synthesizing crisis telemetry & guidelines...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Action Suggestion Chips */}
        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center space-x-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] text-slate-500 uppercase shrink-0 flex items-center gap-1 font-bold">
            <Sparkles className="w-3 h-3 text-teal-600" /> QUICK:
          </span>
          {(mode === 'command' ? commandPrompts : citizenPrompts).map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="text-xs whitespace-nowrap px-3 py-1 rounded-full bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold transition shrink-0 shadow-xs cursor-pointer"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-white border-t border-slate-100">
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
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition shadow-xs"
            />

            <button
              type="submit"
              disabled={loading || !inputPrompt.trim()}
              className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider transition shadow-xs flex items-center space-x-1.5 shrink-0 cursor-pointer"
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
