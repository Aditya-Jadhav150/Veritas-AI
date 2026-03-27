import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
      <div className="max-w-4xl mx-auto text-center animate-fade-in-up">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-md">
          <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
          <span className="text-sm font-medium text-slate-300">The new standard for intelligent hiring</span>
        </div>
        
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 text-white leading-[1.1]">
          Hire <span className="text-gradient">Potential.</span> <br />
          <span className="text-slate-200">Not Just Resumes.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
          TalentLens AI evaluates candidates through real-world signals, adaptive autonomous interviews, and multi-agent decision simulations.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Link href="/apply" className="px-8 py-4 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold text-lg hover:shadow-[0_0_40px_rgba(59,130,246,0.4)] transition-all duration-300 transform hover:-translate-y-1 w-full sm:w-auto">
            Start Candidate Journey
          </Link>
        </div>
      </div>
      
      {/* Feature grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mt-32 w-full animate-fade-in-up" style={{ animationDelay: '0.2s', animationFillMode: 'both' }}>
        <div className="glass-card rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 text-left border-t border-t-white/10">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_30px_rgba(59,130,246,0.1)]">
            <svg className="w-7 h-7 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Talent Discovery</h3>
          <p className="text-slate-400 leading-relaxed text-sm">We analyze non-traditional signals like GitHub activity, open-source contributions, and projects to find hidden gems.</p>
        </div>
        
        <div className="glass-card rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 text-left border-t border-t-white/10">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center mb-6 border border-purple-500/20 shadow-[0_0_30px_rgba(168,85,247,0.1)]">
            <svg className="w-7 h-7 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Adaptive Interviews</h3>
          <p className="text-slate-400 leading-relaxed text-sm">Our AI conducts dynamic real-time interviews that adapt to the candidate's answers, evaluating their core reasoning skills.</p>
        </div>
        
        <div className="glass-card rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300 text-left border-t border-t-white/10">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mb-6 border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
            <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-white mb-3 tracking-tight">Multi-Agent System</h3>
          <p className="text-slate-400 leading-relaxed text-sm">A panel of AI agents evaluate the candidate independently to reach a well-rounded and unbiased decision.</p>
        </div>
      </div>
    </div>
  );
}
