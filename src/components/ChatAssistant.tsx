import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Task } from '../types';
import { sendChatMessage } from '../services/gemini';
import { Terminal, Send, Bot, User, Trash2, Cpu, HelpCircle, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

interface ChatAssistantProps {
  activeTask: Task | null;
}

export default function ChatAssistant({ activeTask }: ChatAssistantProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init',
      sender: 'ai',
      text: "Tactical Officer active. I've synched with your HUD telemetry. What roadblock are we dealing with? Prompt me to adjust your deadlines, practice interview questions, drill study formulas, or resolve a compiler lock.",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto scroll to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const prompt = inputText.trim();
    if (!prompt) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: prompt,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);

    try {
      const responseText = await sendChatMessage([...messages, userMsg], activeTask || undefined);
      
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: responseText,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "Error linking to tactical comms. Action step recommendation: close non-essential background browser windows, stand up for 30 seconds to re-oxygenate your brain, and try prompting me again.",
        timestamp: new Date().toISOString()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'init',
        sender: 'ai',
        text: "Tactical Officer reset. Comms cleared. Awaiting next command directive.",
        timestamp: new Date().toISOString()
      }
    ]);
  };

  const insertQuickPrompt = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="backdrop-blur-md bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-2xl relative overflow-hidden h-full flex flex-col min-h-[500px]">
      {/* Decorative top strip */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-purple-500 to-transparent"></div>
      
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800/60 mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-slate-950 border border-slate-800 rounded text-cyan-400">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-display font-medium text-base text-slate-100 tracking-wide flex items-center gap-2">
              AI TACTICAL COMMAND <span className="text-[10px] text-cyan-400 font-mono border border-cyan-500/30 px-1.5 py-0.2 rounded bg-cyan-950/40 font-bold">TERMINAL</span>
            </h3>
            <p className="text-[10px] text-slate-400 font-mono">SECURE REAL-TIME VOICE &amp; LOG CO-PILOT</p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="p-1.5 border border-slate-800 hover:border-rose-500/40 hover:text-rose-400 text-slate-500 rounded transition-all cursor-pointer"
          title="Clear Terminal Comms"
        >
          <Trash2 className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* active task badge indicator */}
      {activeTask && (
        <div className="bg-cyan-950/25 border border-cyan-500/20 rounded p-2 mb-3 flex items-center justify-between">
          <div className="flex items-center space-x-2 truncate">
            <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
            <span className="text-[10px] font-mono text-cyan-400 truncate">
              LINKED CONTEXT: "{activeTask.title}"
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 shrink-0">
            CAT: {activeTask.category}
          </span>
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-1 min-h-[250px] max-h-[380px]">
        {messages.map((msg) => {
          const isAI = msg.sender === 'ai';
          return (
            <div
              key={msg.id}
              className={`flex items-start space-x-2.5 ${isAI ? 'justify-start' : 'justify-end'}`}
            >
              {isAI && (
                <div className="p-1 bg-cyan-950 border border-cyan-500/30 rounded-full text-cyan-400 shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              
              <div
                className={`max-w-[85%] rounded-lg p-3 text-xs leading-relaxed font-sans ${
                  isAI
                    ? 'bg-slate-950/80 border border-slate-800 text-slate-200'
                    : 'bg-cyan-500 text-slate-950 font-medium font-semibold'
                }`}
              >
                <div className="flex items-center justify-between mb-1 opacity-70 font-mono text-[9px]">
                  <span>{isAI ? 'TACTICAL OFFICER' : 'OPERATIVE'}</span>
                  <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                </div>
                <p className="whitespace-pre-wrap">{msg.text}</p>
              </div>

              {!isAI && (
                <div className="p-1 bg-slate-800 border border-slate-700 rounded-full text-cyan-400 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
        {isLoading && (
          <div className="flex items-start space-x-2.5 justify-start">
            <div className="p-1 bg-cyan-950 border border-cyan-500/30 rounded-full text-cyan-400 shrink-0 animate-spin mt-0.5">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 max-w-[85%] text-xs text-slate-400 font-mono animate-pulse">
              DECRYPTING SECTOR STRATEGY VECTOR...
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="mb-4">
        <span className="text-[10px] font-mono text-slate-500 block mb-1.5 uppercase">Quick Tactical Inquiries:</span>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => insertQuickPrompt("I need a mock interview practice session for this career role. Ask me the first tough question.")}
            className="text-[10px] font-sans bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 px-2 py-1 rounded cursor-pointer transition-all"
          >
            🎙️ Interview Practice
          </button>
          <button
            onClick={() => insertQuickPrompt("Explain the core algorithm concept/definition involved here in simple terms.")}
            className="text-[10px] font-sans bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 px-2 py-1 rounded cursor-pointer transition-all"
          >
            💡 Explain Concept
          </button>
          <button
            onClick={() => insertQuickPrompt("This deadline is too tight. Help me prune secondary requirements and adjust scope.")}
            className="text-[10px] font-sans bg-slate-950/60 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-400 px-2 py-1 rounded cursor-pointer transition-all"
          >
            ⏱️ Prune Scope
          </button>
        </div>
      </div>

      {/* Prompt input Form */}
      <form onSubmit={handleSendMessage} className="flex items-center space-x-2 mt-auto">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={isLoading ? "Officer processing request..." : "Ask for code, advice, interview, or notes summaries..."}
          disabled={isLoading}
          className="flex-1 text-xs bg-slate-950 border border-slate-800 focus:border-cyan-500/50 rounded-lg p-3 text-slate-100 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-cyan-500/30"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 p-3 rounded-lg transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_10px_rgba(6,182,212,0.15)]"
        >
          <Send className="w-4 h-4 fill-current" />
        </button>
      </form>
    </div>
  );
}
