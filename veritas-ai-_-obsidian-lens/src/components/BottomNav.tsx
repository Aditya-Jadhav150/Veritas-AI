import React, { useState, useEffect } from 'react';
import { LayoutDashboard, Eye, Settings, X, ChevronRight, ArrowLeft, User, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function BottomNav() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'main' | 'profile'>('main');

  // Form states
  const [username, setUsername] = useState("");
  const [isLocked, setIsLocked] = useState(false);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [isGoogle, setIsGoogle] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [dob, setDob] = useState("");
  const [email, setEmail] = useState("");
  const [optIn, setOptIn] = useState(false);
  const [showOptInConfirm, setShowOptInConfirm] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Load standard settings from localstorage
  useEffect(() => {
    const s = localStorage.getItem('veritas_settings');
    if (s) {
      try {
        const parsed = JSON.parse(s);
        if (parsed.dob) setDob(parsed.dob);
        if (parsed.optIn !== undefined) setOptIn(parsed.optIn);
      } catch(e) {}
    }
  }, []);

  // Fetch verified profile from backend
  useEffect(() => {
    if (isSettingsOpen && activeTab === 'profile') {
       fetch('/api/me')
         .then(res => res.json())
         .then(data => {
            if (data.success) {
               setUsername(data.user.username);
               setEmail(data.user.email || '');
               setIsLocked(data.user.is_locked);
               setDaysRemaining(data.user.days_remaining);
               setIsGoogle(data.user.is_google);
            }
         }).catch(() => {});
    }
  }, [isSettingsOpen, activeTab]);

  // Save settings
  useEffect(() => {
    localStorage.setItem('veritas_settings', JSON.stringify({ dob, optIn }));
  }, [dob, optIn]);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollToAnalyzer = () => {
    document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const openSettings = () => {
    setIsSettingsOpen(true);
    setActiveTab('main');
  };

  const handleOptInToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setShowOptInConfirm(true);
    } else {
      setOptIn(false);
    }
  };

  const handleClearHistory = () => {
    localStorage.removeItem('veritas_history');
    window.dispatchEvent(new Event('veritas_history_cleared'));
    setShowClearConfirm(false);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setProfileMessage("");
    try {
      const res = await fetch('/api/update_username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ new_username: username })
      });
      const data = await res.json();
      if (data.success) {
        setIsLocked(true);
        setDaysRemaining(7);
        setProfileMessage("Username officially updated.");
      } else {
        setProfileMessage(data.message || "Failed to parse username.");
      }
    } catch {
       setProfileMessage("Network error during update.");
    }
    setIsSaving(false);
  };

  return (
    <>
      <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 bg-[#0f1224]/60 backdrop-blur-2xl rounded-2xl px-2 py-2 border border-white/10 shadow-[0_0_30_rgba(255,255,255,0.08)]">
        <button 
          onClick={scrollToTop}
          className="group relative bg-gradient-to-b from-white to-[#D8D8E0] text-black rounded-xl p-3 shadow-[0_0_15px_rgba(255,255,255,0.3)] active:scale-90 transition-all"
        >
          <LayoutDashboard className="w-6 h-6 fill-current" />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0f1224]/90 border border-white/10 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-md">Dashboard</span>
        </button>
        
        <button 
          onClick={scrollToAnalyzer}
          className="group relative text-[#c6c6ce] p-3 hover:bg-white/5 rounded-xl transition-all active:scale-90"
        >
          <Eye className="w-6 h-6" />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0f1224]/90 border border-white/10 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-md">Analyzer</span>
        </button>
        
        <button 
          onClick={openSettings}
          className="group relative text-[#c6c6ce] p-3 hover:bg-white/5 rounded-xl transition-all active:scale-90"
        >
          <Settings className="w-6 h-6" />
          <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#0f1224]/90 border border-white/10 text-white text-[10px] font-bold uppercase px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none backdrop-blur-md">Settings</span>
        </button>
      </nav>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg min-h-[400px] flex flex-col glass-panel rounded-xl border border-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] bg-[#0f1224] overflow-hidden"
            >
              {activeTab === 'main' ? (
                <>
                  <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-3">
                      <Settings className="w-5 h-5 text-white" />
                      <h2 className="text-lg font-black tracking-tighter text-white uppercase font-headline">Settings</h2>
                    </div>
                    <button 
                      onClick={() => setIsSettingsOpen(false)}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-6 space-y-6">
                    <button 
                      onClick={() => setActiveTab('profile')}
                      className="w-full flex items-center justify-between p-4 rounded-lg bg-surface-container-lowest border border-white/5 hover:border-white/20 transition-all text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white/5 rounded-full text-white group-hover:bg-white/10 transition-colors">
                          <User className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-white text-sm">Personal Profile</h3>
                          <p className="text-[10px] uppercase tracking-widest text-secondary mt-1">Name, Birthdate, Email</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-secondary group-hover:text-white transition-colors" />
                    </button>

                    <div className="w-full p-5 rounded-lg bg-surface-container-lowest border border-white/5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-blue-500/10 rounded-full text-blue-500">
                            <ShieldCheck className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-sm">AI Data Opt-in</h3>
                          </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" checked={optIn} onChange={handleOptInToggle} />
                          <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
                        </label>
                      </div>
                      <p className="text-secondary text-[11px] leading-relaxed mt-2 p-3 bg-white/5 rounded text-justify">
                        Allow your uploaded deepfakes and images to be anonymously incorporated into our training corpus. By default, <strong className="text-white">this is strictly disabled</strong> and your data operates firmly under end-to-end encryption. Enable only if you wish to assist in algorithmic accuracy improvements.
                      </p>
                    </div>
                    <div className="w-full mt-6 pt-6 border-t border-white/5 flex flex-col items-start">
                      <h3 className="text-white font-bold text-sm mb-2">Data Management</h3>
                      <button 
                        onClick={() => setShowClearConfirm(true)}
                        className="px-4 py-2 border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors rounded text-xs font-bold uppercase tracking-widest"
                      >
                        Clear Analysis History
                      </button>
                      <p className="text-secondary/50 text-[10px] uppercase tracking-widest mt-2">Removes all local logs</p>
                    </div>
                  </div>

                  <AnimatePresence>
                    {showOptInConfirm && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-[#0f1224]/90 backdrop-blur-md p-6"
                      >
                        <div className="bg-surface-container-lowest border border-white/20 p-6 rounded-xl max-w-sm w-full text-center shadow-2xl">
                          <ShieldCheck className="w-10 h-10 text-blue-500 mx-auto mb-4" />
                          <h3 className="text-white font-bold mb-2">Confirm Data Opt-In</h3>
                          <p className="text-secondary text-xs mb-6 px-2 leading-relaxed">
                            By proceeding, your analyzed images and result metadata will be securely transmitted and used to train future VERITAS AI models.
                          </p>
                          <div className="flex gap-3">
                            <button onClick={() => setShowOptInConfirm(false)} className="flex-1 px-4 py-2 rounded border border-white/10 text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest">
                              Cancel
                            </button>
                            <button onClick={() => { setOptIn(true); setShowOptInConfirm(false); }} className="flex-1 px-4 py-2 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 hover:bg-blue-500/30 transition-colors text-xs font-bold uppercase tracking-widest">
                              Confirm
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {showClearConfirm && (
                      <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 flex items-center justify-center bg-[#0f1224]/90 backdrop-blur-md p-6"
                      >
                        <div className="bg-surface-container-lowest border border-red-500/20 p-6 rounded-xl max-w-sm w-full text-center shadow-2xl">
                          <X className="w-10 h-10 text-red-500 mx-auto mb-4" />
                          <h3 className="text-white font-bold mb-2">Clear History?</h3>
                          <p className="text-secondary text-xs mb-6 px-2 leading-relaxed">
                            This will permanently delete all your previous scan logs and thumbnails from this local device. This action cannot be undone.
                          </p>
                          <div className="flex gap-3">
                            <button onClick={() => setShowClearConfirm(false)} className="flex-1 px-4 py-2 rounded border border-white/10 text-white hover:bg-white/5 transition-colors text-xs font-bold uppercase tracking-widest">
                              Cancel
                            </button>
                            <button onClick={handleClearHistory} className="flex-1 px-4 py-2 rounded bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-colors text-xs font-bold uppercase tracking-widest">
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                <>
                  <div className="flex items-center p-6 border-b border-white/10 bg-white/5 gap-3">
                    <button 
                      onClick={() => setActiveTab('main')}
                      className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white mr-2"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <User className="w-5 h-5 text-white" />
                    <h2 className="text-lg font-black tracking-tighter text-white uppercase font-headline">Personal Profile</h2>
                  </div>
                  
                  <div className="p-6 space-y-5">
                    {profileMessage && (
                      <div className="p-3 bg-white/5 border border-white/10 rounded-sm text-xs font-mono text-center">
                        {profileMessage}
                      </div>
                    )}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center ml-1">
                        <label className="font-headline text-[10px] uppercase tracking-widest text-secondary">
                          Unique Handle (Username)
                        </label>
                        {isLocked && (
                          <span className="text-[9px] uppercase tracking-widest text-red-400 flex items-center gap-1 font-bold">
                            Locked • {daysRemaining} days left
                          </span>
                        )}
                      </div>
                      <input 
                        type="text" 
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={isLocked || isSaving}
                        className="w-full bg-surface-container-lowest border border-white/10 rounded p-3 text-sm text-white focus:ring-0 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Secure Username"
                      />
                      <p className="text-[10px] text-secondary/50 font-mono ml-1">Must be at least 5 characters. Changes restricted to once per week.</p>
                    </div>
                    
                    <div className="space-y-2">
                      <label className="font-headline text-[10px] uppercase tracking-widest text-secondary ml-1">Email Address</label>
                      <input 
                        type="email" 
                        value={email}
                        disabled={isGoogle}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-white/10 rounded p-3 text-sm text-white focus:ring-0 placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="secure@veritas.ai"
                      />
                      {isGoogle && <p className="text-[9px] text-blue-400 capitalize font-mono">Managed by Google</p>}
                    </div>

                    <div className="space-y-2">
                      <label className="font-headline text-[10px] uppercase tracking-widest text-secondary ml-1">Date of Birth</label>
                      <input 
                        type="date" 
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full bg-surface-container-lowest border border-white/10 rounded p-3 text-sm text-white focus:ring-0 focus:outline-none focus:border-white/30 transition-colors [color-scheme:dark]"
                      />
                    </div>
                    
                    <div className="pt-4 flex justify-end gap-3">
                      <button 
                        onClick={() => setActiveTab('main')}
                        className="px-4 py-2.5 text-secondary text-xs font-bold uppercase tracking-widest"
                      >
                        Back
                      </button>
                      <button 
                        onClick={handleSaveProfile}
                        disabled={isLocked || isSaving}
                        className="px-6 py-2.5 bg-white text-black text-xs font-bold uppercase tracking-widest rounded hover:bg-neutral-200 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? "Saving..." : "Save Profile"}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
