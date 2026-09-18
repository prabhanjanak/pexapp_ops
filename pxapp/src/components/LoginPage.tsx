import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../services/api';
import { AuraCursor } from './ui/AuraCursor';
import {
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  BadgeCheck,
  Building2
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [loginMode, setLoginMode] = useState<'email' | 'empid'>('email');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (loginKey: string, loginPass?: string) => {
    setError(null);
    setLoading(true);
    try {
      const session = await api.login(loginKey, loginPass || password);
      onLoginSuccess(session.user);
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError(loginMode === 'email' ? 'Please enter your registered hospital email address' : 'Please enter your official Employee ID (Emp ID)');
      return;
    }
    handleLogin(identifier, password);
  };

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-[#FAFAFA] text-slate-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative font-sans">
      
      {/* Fullscreen Interactive Aura Cursor WebGL Fluid Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AuraCursor
          backdrop="light"
          paletteColors={[
            "#FF4500", // Fiery Saffron-Red
            "#FF1493", // Deep Magenta
            "#8B5CF6", // Electric Violet
            "#3B82F6", // Royal Blue
            "#00D2FF", // Luminous Cyan
            "#10B981", // Emerald
            "#FFB800"  // Radiant Gold
          ]}
          densityDissipation={4.0}
          curl={4.0}
          splatRadius={4.0}
          splatForce={5.8}
          intensity={0.95}
          label={false}
        />
      </div>

      {/* Subtle Ambient Background Grid & Radial Glow */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(249,115,22,0.1),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e2e8f040_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f040_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0 opacity-70" />

      {/* Top Header Bar (Compact) */}
      <header className="relative z-20 bg-white/90 backdrop-blur-md border-b border-slate-200/80 py-2.5 px-4 sm:px-8 shadow-2xs shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3">
            <img
              src="/sankara-emblem.png"
              alt="Sankara Emblem"
              className="w-9 h-9 object-contain rounded-xl shadow-xs border border-orange-100"
            />
            <div>
              <span className="text-xs sm:text-sm font-black tracking-tight text-slate-900 block uppercase">
                Sankara Eye Foundation, India
              </span>
              <span className="text-[11px] text-orange-600 font-bold block">
                Sri Kanchi Kamakoti Medical Trust • Est. 1977
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-orange-50 border border-orange-200/80 px-3 py-1.5 rounded-full text-xs font-extrabold text-orange-950 shadow-xs">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span className="hidden sm:inline">14 Hospital Units Active</span>
            <span className="sm:hidden">14 Units</span>
            <span className="text-orange-300">•</span>
            <span className="text-orange-600 font-black">Business Excellence</span>
          </div>

        </div>
      </header>

      {/* Main Center Stage (Strictly fits without scroll) */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-3 sm:p-4 overflow-hidden">
        
        <div className="w-full max-w-md sm:max-w-lg flex flex-col items-center">
          
          {/* Elegant Centered Login Container */}
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-400/25 overflow-hidden relative"
          >
            {/* Top Saffron Orange Gradient Bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400" />

            <div className="p-6 sm:p-8 space-y-4">
              
              {/* Header inside card with Logo & Titles */}
              <div className="flex flex-col items-center text-center space-y-2">
                <div className="p-3 bg-white rounded-2xl shadow-md border border-orange-100 max-w-[220px] sm:max-w-[260px] w-full flex items-center justify-center">
                  <img
                    src="/sankara-logo.png"
                    alt="Sankara Eye Foundation, India"
                    className="w-full h-auto max-h-12 object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Business Excellence Platform
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">
                    Business Excellence Application • Operations & Quality Governance
                  </p>
                </div>
              </div>

              {/* Mode Switcher Tabs */}
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/70">
                <button
                  type="button"
                  onClick={() => { setError(null); setLoginMode('email'); }}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMode === 'email'
                      ? 'bg-white text-orange-600 shadow-xs border border-orange-200/50'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Hospital Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setError(null); setLoginMode('empid'); }}
                  className={`py-2 px-3 rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    loginMode === 'empid'
                      ? 'bg-white text-orange-600 shadow-xs border border-orange-200/50'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BadgeCheck className="w-3.5 h-3.5" />
                  <span>Employee ID</span>
                </button>
              </div>

              {/* Error Banner */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-xl flex items-center gap-2.5 shadow-xs"
                  >
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span className="font-bold leading-tight">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sign In Form */}
              <form onSubmit={handleFormSubmit} className="space-y-3.5">
                
                {/* Dynamic Identifier Input */}
                <div>
                  <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                    {loginMode === 'email' ? 'Registered Hospital Email' : 'Official Employee ID (Emp ID)'}
                  </label>
                  <div className="relative">
                    {loginMode === 'email' ? (
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <BadgeCheck className="w-4 h-4 text-orange-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type={loginMode === 'email' ? 'email' : 'text'}
                      required
                      id="login-identifier-input"
                      placeholder={loginMode === 'email' ? 'e.g. superadmin@sankara.com' : 'e.g. 010177'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                      Security Password
                    </label>
                    <span className="text-[10px] text-slate-400 font-medium">Default: admin123 / unit123</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      id="login-password-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50/90 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder-slate-400 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium transition-all shadow-inner"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading}
                  className={`w-full py-3 px-5 btn-orange-gradient rounded-xl font-black text-sm text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] ${
                    loading ? 'opacity-70 pointer-events-none' : ''
                  }`}
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>

              {/* Bottom Security Badge */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit Encrypted Healthcare Portal</span>
                </div>
                <span className="text-orange-600 font-bold">14 Units Role-Scoped</span>
              </div>

            </div>

          </motion.div>

        </div>

      </main>

      {/* Footer (Compact Single Line) */}
      <footer className="relative z-20 bg-white/90 backdrop-blur-md border-t border-slate-200/80 py-2.5 px-4 sm:px-8 text-center text-[11px] text-slate-500 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <img src="/sankara-emblem.png" alt="Sankara Emblem" className="w-4 h-4 object-contain" />
            <span className="font-bold text-slate-800">Sankara Eye Foundation India</span>
            <span>•</span>
            <span>Sri Kanchi Kamakoti Medical Trust</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span>Coimbatore HQ</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">All rights reserved © 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
};

