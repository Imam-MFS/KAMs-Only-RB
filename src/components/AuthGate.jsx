import React, { useState, useEffect, useRef } from 'react';
import {
  Lock,
  Unlock,
  KeyRound,
  Eye,
  EyeOff,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import bkashLogo from '../assets/logo.png';

export default function AuthGate({ onAuthenticated, isDark }) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (password.trim() === 'RBP') {
      setError(false);
      setIsSuccess(true);
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
      setTimeout(() => {
        sessionStorage.setItem('rbp_authenticated', 'true');
        onAuthenticated();
      }, 500);
    } else {
      setError(true);
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 600);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 bg-[#F8FAFC] dark:bg-[#060810] text-slate-800 dark:text-slate-100 overflow-hidden select-none">
      
      {/* Aurora Ambient Mesh Background Glows */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/3 w-[550px] h-[550px] rounded-full mesh-glow-1 blur-[130px] opacity-40 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-[500px] h-[500px] rounded-full mesh-glow-2 blur-[130px] opacity-35" />
        <div className="absolute -bottom-32 left-1/4 w-[450px] h-[450px] rounded-full mesh-glow-3 blur-[120px] opacity-30" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        
        {/* Glassmorphic Security Card */}
        <div
          className={`glass-panel-elevated rounded-3xl p-8 sm:p-10 border border-white/20 dark:border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300 ${
            isShaking ? 'animate-shake' : ''
          }`}
        >
          {/* Top Neon Accent Hairline */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#E2136E] via-[#FF2E88] to-purple-600" />

          {/* Central Logo & Shield Emblem */}
          <div className="text-center space-y-4">
            <div className="relative inline-flex items-center justify-center">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-2xl bg-[#E2136E]/20 blur-xl animate-pulse" />
              
              <div className="relative w-16 h-16 rounded-2xl p-1 bg-gradient-to-tr from-[#E2136E]/20 via-purple-600/20 to-sky-500/20 flex items-center justify-center shadow-xl shadow-[#E2136E]/40 border border-white/30 backdrop-blur-md">
                {isSuccess ? (
                  <Unlock className="w-8 h-8 text-[#E2136E] dark:text-pink-400 animate-bounce" />
                ) : (
                  <img
                    src={bkashLogo}
                    alt="bKash"
                    className="w-14 h-14 object-contain drop-shadow-[0_4px_16px_rgba(226,19,110,0.5)]"
                  />
                )}
              </div>

              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white dark:border-[#0B0F19]" />
              </span>
            </div>

            <div>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#E2136E]/15 text-[#E2136E] dark:text-pink-300 border border-[#E2136E]/30 mb-2">
                <Lock className="w-3 h-3" />
                <span>Restricted Portal Access</span>
              </div>
              
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
                Regional Business Portal
              </h2>
              
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                bKash Commercial Operations | Territory Intelligence
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-7 space-y-4">
            <div className="space-y-1.5 text-left">
              <label className="text-[11px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>Security Passcode</span>
                <span className="text-[10px] font-mono text-slate-400 font-normal">Case-Sensitive</span>
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>

                <input
                  ref={inputRef}
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError(false);
                  }}
                  placeholder="Enter security passcode..."
                  className={`w-full glass-input rounded-xl pl-10 pr-10 py-3 text-sm font-semibold tracking-wider transition placeholder-slate-400 ${
                    error
                      ? 'border-rose-500 ring-2 ring-rose-500/20 text-rose-600 dark:text-rose-400'
                      : 'focus:border-[#E2136E] focus:ring-2 focus:ring-[#E2136E]/20'
                  }`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {error && (
                <div className="flex items-center space-x-1.5 text-xs text-rose-500 dark:text-rose-400 font-bold pt-1 animate-fade-in">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>Invalid passcode. Please enter the correct portal key.</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-gradient-to-r from-[#E2136E] to-[#FF2E88] hover:from-[#d01063] hover:to-[#eb227a] text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg shadow-[#E2136E]/30 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 border border-white/20"
            >
              <span>{isSuccess ? 'Access Granted...' : 'Unlock Portal'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Footer Note */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 dark:border-white/[0.08] text-center">
            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Commercial Operations Security Gateway</span>
            </div>
          </div>

        </div>

      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20%, 60% { transform: translateX(-8px); }
          40%, 80% { transform: translateX(8px); }
        }
        .animate-shake {
          animation: shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97) both;
        }
      `}</style>
    </div>
  );
}
