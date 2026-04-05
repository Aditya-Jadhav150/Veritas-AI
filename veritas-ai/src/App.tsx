/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, FormEvent } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Terminal, 
  Key, 
  ArrowRight, 
  Cpu, 
  Activity,
  AlertTriangle
} from 'lucide-react';

export default function App() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isInitializing, setIsInitializing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsInitializing(true);
    setErrorMsg('');
    
    if (username.length < 5 && !isLogin) {
      setErrorMsg('Username must be at least 5 characters');
      setIsInitializing(false);
      return;
    }

    const endpoint = isLogin ? '/api/login' : '/api/register';
    
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      
      if (data.success) {
        window.location.href = '/';
      } else {
        setErrorMsg(data.message || 'Authentication failed');
        setIsInitializing(false);
      }
    } catch (err) {
      setErrorMsg('Server error. Try again.');
      setIsInitializing(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    setIsInitializing(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
           credential: credentialResponse.credential, 
           clientId: credentialResponse.clientId 
        })
      });
      const data = await res.json();
      if (data.success) {
        window.location.href = '/';
      } else {
        setErrorMsg(data.message || 'Google Authentication failed');
        setIsInitializing(false);
      }
    } catch {
      setErrorMsg('Server error during Google Auth.');
      setIsInitializing(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="324506141677-i5110j0ld14iveadefj2qnui4o7eub1t.apps.googleusercontent.com">
    <div className="min-h-screen bg-background flex flex-col relative overflow-hidden selection:bg-white/20">
      {/* Abstract Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 -right-1/4 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
        
        {/* Grid Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_80%)]" />
      </div>

      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Shield className="w-6 h-6 text-white" />
              <motion.div 
                animate={{ opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white blur-md" 
              />
            </div>
            <span className="font-headline text-xl font-black tracking-tighter text-white uppercase">
              Veritas AI
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
              <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] animate-pulse" />
              <span className="text-[10px] font-headline uppercase tracking-[0.2em] text-secondary">
                Operational Status: Active
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[420px] relative"
        >
          <div className="obsidian-glass p-10 rounded-xl shadow-[0_40px_100px_-20px_rgba(0,0,0,0.8)] border border-white/5 relative overflow-hidden">
            {/* Decorative Corner Accents */}
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-white/20 rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-white/20 rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b border-l border-white/20 rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-white/20 rounded-br-xl" />

            {/* Branding Section */}
            <div className="mb-10 text-center">
              <motion.h1 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="font-headline text-2xl font-bold tracking-tighter text-white uppercase mb-2"
              >
                Advanced Deepfake Detection
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-secondary font-headline text-[10px] uppercase tracking-[0.15em] opacity-70"
              >
                Neural Identity Verification System
              </motion.p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {errorMsg && (
                <div className="bg-red-500/10 border border-red-500/50 p-3 rounded-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-red-500 text-xs font-mono">{errorMsg}</p>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label className="font-headline text-[10px] uppercase tracking-widest text-secondary ml-1">
                  Username
                </label>
                <div className="input-glow flex items-center bg-surface-container-lowest border border-white/10 rounded-sm p-4 transition-all duration-300 group">
                  <Terminal className="w-4 h-4 text-secondary/50 group-focus-within:text-white transition-colors mr-3" />
                  <input 
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-transparent border-none p-0 text-sm text-white focus:ring-0 w-full placeholder:text-white/10 font-mono focus:outline-none"
                    placeholder="SECURE_USER_01"
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-headline text-[10px] uppercase tracking-widest text-secondary">
                    Password
                  </label>
                  {isLogin && (
                    <button type="button" className="font-headline text-[9px] uppercase tracking-widest text-secondary/50 hover:text-white transition-colors">
                      Forgot Password?
                    </button>
                  )}
                </div>
                <div className="input-glow flex items-center bg-surface-container-lowest border border-white/10 rounded-sm p-4 transition-all duration-300 group">
                  <Key className="w-4 h-4 text-secondary/50 group-focus-within:text-white transition-colors mr-3" />
                  <input 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-none p-0 text-sm text-white focus:ring-0 w-full placeholder:text-white/10 font-mono focus:outline-none"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={isInitializing}
                  className="chrome-gradient w-full py-4 rounded-sm text-background font-headline font-black text-xs uppercase tracking-[0.2em] shadow-chrome active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2 group disabled:opacity-50"
                >
                  <AnimatePresence mode="wait">
                    {isInitializing ? (
                      <motion.div 
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <Cpu className="w-4 h-4 animate-spin" />
                        <span>{isLogin ? 'Authenticating...' : 'Registering...'}</span>
                      </motion.div>
                    ) : (
                      <motion.div 
                        key="ready"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center gap-2"
                      >
                        <span>{isLogin ? 'Enter' : 'Sign Up'}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="mt-8 text-center border-t border-white/5 pt-8">
                <div className="flex justify-center mb-6">
                   <GoogleLogin
                     onSuccess={handleGoogleSuccess}
                     onError={() => setErrorMsg("Google Pop-up was closed or failed.")}
                     theme="filled_black"
                     size="large"
                     text="continue_with"
                     shape="rectangular"
                   />
                </div>
                <p className="text-secondary font-headline text-[11px] uppercase tracking-wider">
                  {isLogin ? "Don't have an account?" : "Already have an account?"}
                  <button 
                    type="button" 
                    onClick={() => {
                        setIsLogin(!isLogin);
                        setErrorMsg('');
                    }}
                    className="text-white font-bold ml-2 hover:underline underline-offset-4 transition-all"
                  >
                    {isLogin ? 'Sign Up' : 'Login'}
                  </button>
                </p>
              </div>
            </form>

          </div>

          {/* Decorative Machined Element */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex gap-2 items-center px-4 py-1.5 bg-background rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)] z-10 whitespace-nowrap">
            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
            <span className="text-[9px] font-headline text-secondary uppercase tracking-[0.1em] font-medium">
              Encrypted Connection
            </span>
          </div>
        </motion.div>
      </main>

      {/* Footer Security Notice */}
      <footer className="p-8 text-center relative z-10">
        <div className="flex flex-col items-center gap-4">
          <div className="h-[1px] w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          <p className="text-[9px] text-secondary/40 font-headline uppercase tracking-[0.3em] max-w-md mx-auto leading-relaxed">
            Proprietary Technology of Veritas Intelligence Systems. 
            <br />
            Unauthorized access is strictly monitored and logged.
          </p>
        </div>
      </footer>

      {/* Side Status Indicators (Desktop Only) */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-12">
        <StatusIndicator label="Network" value="Secure" />
        <StatusIndicator label="Encryption" value="AES-256" />
        <StatusIndicator label="Node" value="VX-09" />
      </div>

      <div className="fixed right-8 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-12 items-end">
        <StatusIndicator label="Uptime" value="99.99%" align="right" />
        <StatusIndicator label="Latency" value="14ms" align="right" />
        <StatusIndicator label="Threat" value="Minimal" align="right" />
      </div>
    </div>
    </GoogleOAuthProvider>
  );
}

function StatusIndicator({ label, value, align = 'left' }: { label: string, value: string, align?: 'left' | 'right' }) {
  return (
    <div className={`flex flex-col ${align === 'right' ? 'items-end' : 'items-start'} gap-1`}>
      <span className="text-[9px] uppercase tracking-[0.2em] text-secondary/30 font-headline">{label}</span>
      <div className="flex items-center gap-2">
        {align === 'left' && <div className="w-1 h-1 bg-white/40 rounded-full" />}
        <span className="text-[11px] uppercase tracking-widest text-white font-headline font-medium">{value}</span>
        {align === 'right' && <div className="w-1 h-1 bg-white/40 rounded-full" />}
      </div>
    </div>
  );
}

