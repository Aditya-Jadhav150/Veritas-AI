"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";

type Message = { id: string; role: "ai" | "candidate"; content: string; isAgentAda?: boolean; };

export default function InterviewPage() {
  const params = useParams();
  const router = useRouter();
  const candidateId = params.id as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [interviewComplete, setInterviewComplete] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [roleInfo, setRoleInfo] = useState({ targetRole: "", experienceLevel: "" });
  const [warnings, setWarnings] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const targetRole = window.localStorage.getItem("targetRole") || "Software Engineer";
      const experienceLevel = window.localStorage.getItem("experienceLevel") || "";
      setRoleInfo({ targetRole, experienceLevel });
      
      const targetPos = experienceLevel ? `${experienceLevel} ${targetRole}` : targetRole;
      
      setMessages([
        {
          id: "1",
          role: "ai",
          content: `Hello! I'm the TalentLens AI interviewer. We're excited you're applying for the ${targetPos} position. Based on the complex technical problem you described in your application, could you explain the specific trade-offs you considered when choosing your approach?`,
        }
      ]);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            currentTranscript += event.results[i][0].transcript;
          }
          setInput(currentTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error("Speech recognition error", event.error);
          setIsListening(false);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };
      }
    }
  }, []);

  useEffect(() => {
    if (interviewComplete) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation("Tab switching or minimizing the browser is not allowed during the interview.");
      }
    };

    const handleBlur = () => {
      handleViolation("Window lost focus. Please keep the interview window active.");
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
    };
  }, [interviewComplete]);

  const handleViolation = useCallback((reason: string) => {
    if (interviewComplete) return;
    
    setWarnings((prev) => {
      const newWarnings = prev + 1;
      if (newWarnings >= 3) {
        setInterviewComplete(true);
        const terminationMsg: Message = {
          id: Date.now().toString(),
          role: "ai",
          content: "System Notice: Interview forcibly terminated due to multiple policy violations (tab switching / loss of window focus). Please review your dashboard.",
          isAgentAda: true
        };
        setMessages(prevMsgs => [...prevMsgs, terminationMsg]);
        return newWarnings;
      }
      
      setWarningMessage(reason);
      setShowWarning(true);
      setTimeout(() => setShowWarning(false), 5000);
      return newWarnings;
    });
  }, [interviewComplete]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      if (!recognitionRef.current) {
        alert("Speech recognition is not supported in this browser. Try Chrome.");
        return;
      }
      setInput("");
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage: Message = { id: Date.now().toString(), role: "candidate", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch('/api/interview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: [...messages, userMessage],
          targetRole: roleInfo.targetRole,
          experienceLevel: roleInfo.experienceLevel
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        const updatedMessages = [...messages, userMessage, data.message];
        setMessages(updatedMessages);

        if ('speechSynthesis' in window) {
           const utterance = new SpeechSynthesisUtterance(data.message.content);
           const voices = window.speechSynthesis.getVoices();
           const preferredVoice = voices.find(v => v.name.includes("Google") || v.lang.includes("en-US"));
           if (preferredVoice) utterance.voice = preferredVoice;
           utterance.rate = 1.05;
           window.speechSynthesis.speak(utterance);
        }
        if (data.isComplete) {
          setInterviewComplete(true);
          if (typeof window !== "undefined") {
            window.localStorage.setItem('candidateTranscript', JSON.stringify(updatedMessages));
          }
        }
      }
    } catch (e) {
      console.error("Failed to fetch interview response:", e);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div 
      className="max-w-4xl mx-auto px-2 sm:px-4 h-[calc(100vh-8rem)] min-h-[500px] flex flex-col animate-fade-in-up select-none"
      onContextMenu={(e) => e.preventDefault()}
    >
      {showWarning && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-fade-in-down">
          <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-bold text-sm">Policy Violation Detected!</p>
            <p className="text-xs text-red-100">Warning {warnings}/3: {warningMessage}</p>
          </div>
        </div>
      )}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row justify-start sm:justify-between items-start sm:items-center gap-3 sm:gap-0 bg-white border border-slate-200 rounded-2xl p-4 premium-shadow relative z-10">
        <div>
          <h1 className="text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-2">
            <span className="relative flex h-3 w-3 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
            Adaptive Interview Session
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 font-mono">ID: {candidateId}</p>
        </div>
        {interviewComplete && (
          <button 
            onClick={() => router.push(`/dashboard/${candidateId}`)}
            className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base bg-slate-900 text-white font-medium rounded-full premium-shadow hover:bg-slate-800 transition-all animate-pulse"
          >
            Review Evaluation Dashboard
          </button>
        )}
      </div>

      <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl sm:rounded-3xl p-3 sm:p-6 overflow-y-auto mb-4 sm:mb-6 flex flex-col space-y-4 sm:space-y-6 scrollbar-hide">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === "candidate" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[95%] sm:max-w-[85%] rounded-2xl sm:rounded-3xl p-4 sm:p-5 text-sm sm:text-base ${
              msg.role === "candidate" ? "bg-slate-900 text-white rounded-tr-sm shadow-md" : 
              msg.isAgentAda ? "bg-amber-50 text-amber-900 rounded-tl-sm border border-amber-200 shadow-sm" :
              "bg-white text-slate-800 rounded-tl-sm border border-slate-200 shadow-sm"
            }`}>
              {msg.role === "ai" && (
                <div className={`flex items-center gap-2 mb-3 border-b pb-2 ${msg.isAgentAda ? 'border-amber-200/50' : 'border-slate-100'}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center ${msg.isAgentAda ? 'bg-amber-200' : 'bg-blue-100'}`}>
                    <svg className={`w-3 h-3 ${msg.isAgentAda ? 'text-amber-700' : 'text-blue-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className={`text-xs font-semibold tracking-wider uppercase ${msg.isAgentAda ? 'text-amber-700' : 'text-slate-500'}`}>
                    {msg.isAgentAda ? 'Agent Ada (Risk Evaluator)' : 'TalentLens Evaluator'}
                  </span>
                </div>
              )}
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}
        {isTyping && (
           <div className="flex justify-start">
             <div className="bg-white rounded-3xl p-5 rounded-tl-sm border border-slate-200 shadow-sm flex gap-1.5 items-center">
               <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }}></span>
               <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }}></span>
               <span className="w-2 h-2 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }}></span>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="relative group shrink-0">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={interviewComplete || isTyping}
          onPaste={(e) => { e.preventDefault(); handleViolation("Copying or pasting text is not allowed."); }}
          onCopy={(e) => { e.preventDefault(); handleViolation("Copying or pasting text is not allowed."); }}
          placeholder={interviewComplete ? "Interview complete. Review dashboard." : "Type your response..."}
          className="w-full bg-white border border-slate-300 rounded-2xl pl-4 sm:pl-6 pr-28 py-3 sm:py-4 text-sm sm:text-base text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-400 resize-none h-20 sm:h-24 premium-shadow"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(e); }
          }}
        />
        <button 
          type="button"
          onClick={toggleListening}
          disabled={interviewComplete || isTyping}
          className={`absolute right-14 sm:right-16 bottom-2 sm:bottom-3 p-2 sm:p-3 rounded-xl transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          title="Toggle Voice Input"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </button>
        <button 
          type="submit" 
          disabled={!input.trim() || interviewComplete || isTyping}
          className="absolute right-2 sm:right-3 bottom-2 sm:bottom-3 p-2 sm:p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 disabled:opacity-50 transition-all"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
