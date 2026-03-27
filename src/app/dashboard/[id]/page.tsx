"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";

// Types
type Insight = { label: string; value: string; desc: string; };
type Agent = { role: string; name: string; verdict: string; color: string; reasoning: string; };
type DashboardData = { score: number; decision: string; insights: Insight[]; agents: Agent[]; };

const getAgentStyles = (color: string) => {
  switch(color) {
    case 'blue': return { bgLight: 'bg-blue-500/10 hover:bg-blue-500/20', text: 'text-blue-400', bg: 'bg-blue-500', shadow: 'shadow-blue-500/20', border: 'border-blue-500/20' };
    case 'purple': return { bgLight: 'bg-purple-500/10 hover:bg-purple-500/20', text: 'text-purple-400', bg: 'bg-purple-500', shadow: 'shadow-purple-500/20', border: 'border-purple-500/20' };
    case 'amber': return { bgLight: 'bg-amber-500/10 hover:bg-amber-500/20', text: 'text-amber-400', bg: 'bg-amber-500', shadow: 'shadow-amber-500/20', border: 'border-amber-500/20' };
    default: return { bgLight: 'bg-slate-500/10 hover:bg-slate-500/20', text: 'text-slate-400', bg: 'bg-slate-500', shadow: 'shadow-slate-500/20', border: 'border-slate-500/20' };
  }
};

export default function DashboardPage() {
  const params = useParams();
  const candidateId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDecision = async () => {
      try {
        const res = await fetch(`/api/decision?id=${candidateId}`);
        const result = await res.json();
        if (result.success) {
          setData(result.data);
        }
      } catch (error) {
        console.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDecision();
  }, [candidateId]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 animate-pulse duration-1000">
        <div className="relative w-24 h-24 mb-6">
          <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-purple-500 rounded-full border-t-transparent animate-spin"></div>
          <div className="absolute inset-2 border-4 border-white/10 rounded-full"></div>
          <div className="absolute inset-2 border-4 border-blue-500 rounded-full border-b-transparent animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <h2 className="text-2xl font-bold text-white tracking-widest uppercase mb-2">Simulating Panel</h2>
        <p className="text-slate-400 font-mono text-sm">Aggregating multi-agent independent evaluations...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 pb-20 animate-fade-in-up">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold tracking-widest uppercase border border-green-500/20">Evaluation Complete</span>
            <span className="text-slate-500 font-mono text-xs">ID: {candidateId}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Panel <span className="text-gradient">Decision</span></h1>
        </div>
        
        <div className="flex items-center gap-6 glass-card px-8 py-5 rounded-3xl backdrop-blur-3xl shadow-[0_0_50px_rgba(59,130,246,0.15)]">
          <div className="text-center">
            <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-1">Score</p>
            <p className="text-5xl font-black text-white">{data.score}<span className="text-xl text-slate-500">/100</span></p>
          </div>
          <div className="h-16 w-px bg-white/10"></div>
          <div className="text-center">
            <p className="text-sm text-slate-400 uppercase tracking-widest font-semibold mb-1">Verdict</p>
            <p className="text-2xl font-black text-green-400 uppercase tracking-widest drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">{data.decision}</p>
          </div>
        </div>
      </div>

      {/* Talent Discovery Insights */}
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 relative z-10">Discovery Engine Insights</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 relative z-10">
        {data.insights.map((insight, i) => (
          <div key={i} className="glass-card rounded-3xl p-6 border-t border-t-white/10 hover:-translate-y-1 transition-transform cursor-default">
            <h3 className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">{insight.label}</h3>
            <p className="text-3xl font-black text-white mb-3 tracking-tight">{insight.value}</p>
            <p className="text-sm text-slate-300 leading-relaxed">{insight.desc}</p>
          </div>
        ))}
      </div>

      {/* Multi-Agent Simulation */}
      <h2 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4 flex items-center gap-3 relative z-10">
        Multi-Agent Evaluation
        <span className="text-xs font-bold tracking-widest uppercase text-purple-400 bg-purple-500/20 border border-purple-500/20 px-3 py-1 rounded-full">Simulated Panel</span>
      </h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {data.agents.map((agent, i) => {
          const styles = getAgentStyles(agent.color);
          return (
            <div key={i} className="glass-card rounded-3xl p-6 md:p-8 flex flex-col h-full border-t border-t-white/10 relative overflow-hidden group">
              <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -mr-10 -mt-10 transition-colors duration-500 ${styles.bgLight}`}></div>
              
              <div className="flex items-center gap-4 mb-6 relative z-10">
                <div className={`w-14 h-14 rounded-2xl ${styles.bg} flex items-center justify-center shadow-lg ${styles.shadow} text-white font-black text-xl border ${styles.border}`}>
                  {agent.name.split(' ')[1].charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">{agent.name}</h3>
                  <p className={`text-xs uppercase tracking-widest ${styles.text} font-bold mt-1`}>{agent.role}</p>
                </div>
              </div>
              
              <div className="mb-6 relative z-10">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border ${styles.bgLight} ${styles.text} ${styles.border}`}>
                  {agent.verdict}
                </span>
              </div>
              
              <div className="flex-1 relative z-10">
                <p className="text-slate-300 leading-relaxed text-[15px] font-medium opacity-90">"{agent.reasoning}"</p>
              </div>
            </div>
          );
        })}
      </div>
      
      <div className="mt-20 text-center relative z-10 border-t border-white/5 pt-10">
        <Link href="/" className="inline-flex px-10 py-4 rounded-full bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10 hover:border-white/20 hover:scale-105">
          Start New Evaluation
        </Link>
      </div>
    </div>
  );
}
