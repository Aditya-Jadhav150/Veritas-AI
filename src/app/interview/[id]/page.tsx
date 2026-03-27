"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";

// Mock types
type Message = {
  id: string;
  role: "ai" | "candidate";
  content: string;
};

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "ai",
      content: "Hello! I'm the TalentLens AI interviewer. Based on the complex technical problem you described in your application, could you explain the specific trade-offs you considered when choosing your approach?",
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "candidate",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });
      const data = await res.json();
      
      if (data.success) {
        setMessages(prev => [...prev, data.message]);
        if (data.isComplete) {
          setInterviewComplete(true);
        }
      }
    } catch (e) {
      console.error("Failed to fetch interview response:", e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 h-[80vh] flex flex-col animate-fade-in-up">
      <div className="mb-6 flex justify-between items-center bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            Adaptive Interview Session
          </h1>
          <p className="text-sm text-slate-400 mt-1 font-mono">ID: {candidateId}</p>
        </div>
        {interviewComplete && (
          <button 
            onClick={() => router.push(`/dashboard/${candidateId}`)}
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-full shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)] transition-all animate-pulse-slow"
          >
            Review Evaluation Dashboard
          </button>
        )}
      </div>

      <div className="flex-1 glass-card rounded-3xl p-6 overflow-y-auto mb-6 flex flex-col space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-3xl p-5 ${msg.role === "candidate" ? "bg-gradient-to-br from-blue-600 to-indigo-800 text-white rounded-tr-sm shadow-lg shadow-blue-500/20" : "bg-white/5 text-slate-200 rounded-tl-sm border border-white/10 shadow-lg shadow-black/20"}`}>
              {msg.role === "ai" && (
                <div className="flex items-center gap-2 mb-3 border-b border-white/10 pb-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold tracking-wider text-purple-300 uppercase">TalentLens Evaluator</span>
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white/5 rounded-3xl p-5 rounded-tl-sm border border-white/10 flex gap-1.5 items-center">
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
              <span className="w-2 h-2 rounded-full bg-purple-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={interviewComplete || isTyping}
          placeholder={interviewComplete ? "Interview complete. Please proceed to the dashboard." : "Type your response..."}
          className="w-full bg-white/5 border border-white/10 rounded-2xl pl-6 pr-16 py-4 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-500 resize-none h-24 group-hover:border-white/20"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend(e);
            }
          }}
        />
        <button 
          type="submit" 
          disabled={!input.trim() || interviewComplete || isTyping}
          className="absolute right-3 bottom-3 p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-[0_0_15px_rgba(168,85,247,0.5)] disabled:opacity-50 disabled:shadow-none disabled:from-slate-700 disabled:to-slate-700 transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
