"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ApplyPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    linkedin: "",
    github: "",
    portfolio: "",
    achievements: "",
    problemSolving: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/interview/${data.candidateId}`);
      } else {
        alert('Failed to process application.');
        setIsSubmitting(false);
      }
    } catch (e) {
      console.error(e);
      alert('Error occurred.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-6 animate-fade-in-up">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-black tracking-tight mb-4 text-white">Candidate <span className="text-purple-400">Application</span></h1>
        <p className="text-slate-400">Submit your real-world signals. We evaluate your potential, not just your past.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-8 sm:p-10 space-y-8 border-t border-t-white/10">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Basic Info</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-slate-300">Full Name</label>
              <input required type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-600" placeholder="Jane Doe" />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium text-slate-300">Email Address</label>
              <input required type="email" id="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-600" placeholder="jane@example.com" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Digital Footprint</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="linkedin" className="block text-sm font-medium text-slate-300">LinkedIn Profile</label>
              <input required type="url" id="linkedin" name="linkedin" value={formData.linkedin} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-slate-600" placeholder="https://linkedin.com/in/janedoe" />
            </div>
            <div className="space-y-2">
              <label htmlFor="github" className="block text-sm font-medium text-slate-300">GitHub Profile</label>
              <input required type="url" id="github" name="github" value={formData.github} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-slate-500/50 transition-all placeholder:text-slate-600" placeholder="https://github.com/janedoe" />
            </div>
            <div className="space-y-2">
              <label htmlFor="portfolio" className="block text-sm font-medium text-slate-300">Portfolio / Personal Site</label>
              <input type="url" id="portfolio" name="portfolio" value={formData.portfolio} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-600" placeholder="https://janedoe.dev" />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white border-b border-white/10 pb-2">Beyond the Resume</h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="achievements" className="block text-sm font-medium text-slate-300">Key Achievements</label>
              <p className="text-xs text-slate-500">Briefly list your top 3 professional or personal achievements.</p>
              <textarea required id="achievements" name="achievements" value={formData.achievements} onChange={handleChange} rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 resize-none" placeholder="- Scaled database to 1M daily queries&#10;- Won 1st place at HackMIT&#10;- Maintained an open source library with 5k stars"></textarea>
            </div>
            <div className="space-y-2">
              <label htmlFor="problemSolving" className="block text-sm font-medium text-slate-300">Base Problem Solving</label>
              <p className="text-xs text-slate-500">Describe a complex technical problem you solved, how you approached it, and what you learned.</p>
              <textarea required id="problemSolving" name="problemSolving" value={formData.problemSolving} onChange={handleChange} rows={5} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all placeholder:text-slate-600 resize-none" placeholder="When migrating our monolithic architecture to microservices..."></textarea>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg hover:shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center">
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing Signals...
              </span>
            ) : "Submit & Start Adaptive Interview"}
          </button>
        </div>
      </form>
    </div>
  );
}
