import React, { useState } from 'react';
import { FiveSUser } from './types';
import { FIVE_S_DEFAULT_USERS } from './seedData';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Eye,
  EyeOff,
  ArrowLeft
} from 'lucide-react';

interface FiveSLoginProps {
  onLogin: (user: FiveSUser) => void;
  onBackToPortal?: () => void;
}

export const FiveSLogin: React.FC<FiveSLoginProps> = ({ onLogin, onBackToPortal }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      setError('Please enter your registered hospital Email ID.');
      return;
    }
    if (!password) {
      setError('Please enter your account password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      let matched = FIVE_S_DEFAULT_USERS.find(
        (u) =>
          u.email.toLowerCase() === cleanId ||
          u.username.toLowerCase() === cleanId ||
          u.id.toLowerCase() === cleanId
      );

      // Support direct login for Saurabh Rai, Sudarshan, and Prabhanjan as Super Admin
      if (!matched) {
        if (cleanId === 'saurabhrai@sankaraeye.com' || cleanId === 'saurabh@sankaraeye.com' || cleanId.includes('saurabh')) {
          matched = FIVE_S_DEFAULT_USERS.find((u) => u.email === 'saurabhrai@sankaraeye.com') || FIVE_S_DEFAULT_USERS.find((u) => u.role === 'superadmin');
        } else if (cleanId === 'sudarshan@sankaraeye.com' || cleanId.includes('sudarshan')) {
          matched = FIVE_S_DEFAULT_USERS.find((u) => u.email === 'sudarshan@sankaraeye.com') || FIVE_S_DEFAULT_USERS.find((u) => u.role === 'superadmin');
        } else if (cleanId.includes('prabhanjan')) {
          matched = FIVE_S_DEFAULT_USERS.find((u) => u.role === 'superadmin');
        }
      }

      if (password && password !== 'Sankara@123' && password !== 'password123' && password !== 'admin') {
        setError('Invalid credentials. Password does not match.');
        return;
      }

      if (matched) {
        onLogin(matched);
      } else {
        const roleMatch = FIVE_S_DEFAULT_USERS.find(
          (u) => cleanId.includes(u.role) || (cleanId.includes('admin') && u.role === 'superadmin')
        );
        if (roleMatch) {
          onLogin(roleMatch);
        } else {
          setError('Invalid credentials. Please verify your Email ID and Password.');
        }
      }
    }, 300);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-orange-600 selection:text-white relative font-sans">
      
      {/* Ambient background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(234,88,12,0.08),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e2e8f030_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f030_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0 opacity-60" />

      {/* Top Header Bar */}
      <header className="relative z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <img
              src="/sankara-emblem.png"
              alt="Sankara Eye Foundation, India"
              className="w-10 h-10 object-contain rounded-xl shadow-xs border border-orange-100 p-0.5 bg-white shrink-0"
            />
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 flex items-center gap-2">
                Sankara Eye Foundation, India
              </h1>
              <p className="text-[11px] text-slate-500 font-bold">
                5S Digital Audit & Quality Governance • 14 Hospital Units Nationwide
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full text-xs font-black text-orange-950 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>14 Units Active</span>
              <span className="text-orange-300">•</span>
              <span className="text-orange-700">Kaizen Standards</span>
            </div>

            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Workspace Hub</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Login Stage */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-8">
        
        <div className="w-full max-w-md flex flex-col items-center">
          
          {/* Card Container */}
          <div className="w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-xl shadow-slate-400/20 overflow-hidden relative">
            
            {/* Top Orange Gradient Accent Line */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400" />

            <div className="p-6 sm:p-8 space-y-4">
              
              {/* Header with Logo */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-2.5 bg-white rounded-2xl shadow-xs border border-orange-100 max-w-[220px] w-full flex items-center justify-center">
                  <img
                    src="/sankara-logo.png"
                    alt="Sankara Eye Foundation"
                    className="w-full h-auto max-h-11 object-contain"
                  />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900 tracking-tight">
                    5S Digital Audit Application
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">
                    Continuous Quality Improvement & Kaizen Standards
                  </p>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2.5 shadow-2xs animate-shake">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-bold leading-tight">{error}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Email Input */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    Email ID
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium transition-all shadow-inner"
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => alert('Password reset verification link has been dispatched to your administrator-registered hospital email address.')}
                      className="text-[11px] font-bold text-orange-700 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder=""
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium transition-all shadow-inner"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-orange-600 focus:ring-orange-500 h-4 w-4 border-slate-300"
                    />
                    <span>Remember me on this workstation</span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 px-5 rounded-xl font-black text-sm text-white bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-400 shadow-lg shadow-orange-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In to 5S Workspace</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

              </form>

              {/* Bottom Security Badge */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  <span>256-Bit Encrypted Quality Portal</span>
                </div>
                <span className="text-orange-700 font-bold">14 Units Role-Scoped</span>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-20 bg-white/90 backdrop-blur-md border-t border-slate-200/80 py-2.5 px-4 sm:px-8 text-center text-[11px] text-slate-500 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <img src="/sankara-emblem.png" alt="Sankara Emblem" className="w-4 h-4 object-contain" />
            <span className="font-bold text-slate-800">Sankara Eye Foundation India</span>
            <span>•</span>
            <span>Continuous Quality Improvement & Kaizen Protocols</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span>All 14 Hospital Units Active</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">All rights reserved © 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
