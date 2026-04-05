import { Shield, User, X, Clock, CheckCircle2, AlertTriangle, Activity } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AnalysisResult } from '../types';

export default function Header() {
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  useEffect(() => {
    if (isHistoryOpen) {
      const stored = localStorage.getItem('veritas_history');
      if (stored) {
        try {
          setHistory(JSON.parse(stored));
        } catch (e) {
          console.error("Failed to parse history");
        }
      } else {
        setHistory([]);
      }
    }
  }, [isHistoryOpen]);

  useEffect(() => {
    const handleClear = () => setHistory([]);
    window.addEventListener('veritas_history_cleared', handleClear);
    return () => window.removeEventListener('veritas_history_cleared', handleClear);
  }, []);

  return (
    <>
      <header className="fixed top-0 w-full z-[40] bg-[#0f1224]/80 backdrop-blur-xl shadow-[0_0_20px_0_rgba(255,255,255,0.05)]">
        <div className="bg-gradient-to-b from-white/10 to-transparent h-[1px] w-full" />
        <div className="flex justify-between items-center px-6 py-4 w-full max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <Shield className="text-white w-6 h-6" />
            <h1 className="text-xl font-black tracking-tighter text-white uppercase font-headline">
              VERITAS AI
            </h1>
          </div>
          
          <nav className="flex items-center gap-4 sm:gap-8">
            <button onClick={() => {
              document.getElementById('analyzer')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }} className="text-white font-bold font-headline tracking-tight uppercase text-xs sm:text-sm hover:text-white transition-colors duration-300">
              Analyzer
            </button>
            <button onClick={() => setIsHistoryOpen(true)} className="text-[#c6c6ce] font-headline tracking-tight uppercase text-xs sm:text-sm hover:text-white transition-colors duration-300 cursor-pointer">
              History
            </button>
          </nav>

          <div className="flex items-center gap-4">
            <a href="/logout" className="text-[#c6c6ce] hover:text-white transition-colors duration-300 font-headline uppercase text-sm border border-white/20 px-4 py-2 rounded-sm hover:bg-white/10 flex items-center gap-2">
              <User className="w-4 h-4" />
              Logout
            </a>
          </div>
        </div>
      </header>

      {/* History Modal */}
      <AnimatePresence>
        {isHistoryOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsHistoryOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-3xl max-h-[85vh] flex flex-col glass-panel rounded-xl border border-white/10 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] bg-[#0f1224]"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-white" />
                  <h2 className="text-lg font-black tracking-tighter text-white uppercase font-headline">Analysis Logs</h2>
                </div>
                <button 
                  onClick={() => setIsHistoryOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/50 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {history.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-40 text-secondary/50">
                    <Clock className="w-8 h-8 mb-3 opacity-50" />
                    <p className="font-headline text-xs uppercase tracking-widest">No previous scans found</p>
                  </div>
                ) : (
                  history.map((record, i) => (
                    <div key={i} className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-surface-container-lowest border border-white/5 hover:border-white/20 transition-all group">
                      <div className="flex items-center gap-4 w-full sm:w-auto">
                        <div className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl overflow-hidden ${record.status === 'REAL' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                          {record.thumbnail ? (
                            <img src={record.thumbnail} alt="scan result" className="w-full h-full object-cover" />
                          ) : (
                            record.status === 'REAL' ? <CheckCircle2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{record.status} ({typeof record.confidenceScore === 'number' ? record.confidenceScore.toFixed(2) : record.confidenceScore}%)</p>
                          <p className="text-secondary text-[10px] uppercase font-headline tracking-wider mt-1">
                            {new Date(record.timestamp).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-left sm:text-right w-full sm:w-auto hidden sm:block">
                        <p className="text-xs text-secondary/70">{record.integrityLevel}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
