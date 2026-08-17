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
  KeyRound,
  Sparkles
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

  const toggleLoginMode = () => {
    setError(null);
    setLoginMode((prev) => (prev === 'email' ? 'empid' : 'email'));
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAFA] text-slate-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative overflow-hidden font-sans">
      
      {/* Fullscreen Interactive Aura Cursor WebGL Fluid (High Intensity, Dynamic Chromatic Flow) */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <AuraCursor
          backdrop="light"
          paletteColors={[
            "#FF4500", // Fiery Saffron-Red
            "#FF1493", // Vibrant Deep Pink / Magenta
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

      {/* Top Header Bar */}
      <header className="relative z-20 bg-white/85 backdrop-blur-md border-b border-slate-200/80 py-4 px-4 sm:px-10 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          <div className="flex items-center gap-3.5">
            <img
              src="/sankara-emblem.png"
              alt="Sankara Emblem"
              className="w-11 h-11 object-contain rounded-xl shadow-xs border border-orange-100"
            />
            <div>
              <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 block uppercase">
                Sankara Eye Care Institutions
              </span>
              <span className="text-xs text-orange-600 font-bold block">
                Sri Kanchi Kamakoti Medical Trust • Established 1977
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5 bg-orange-50 border border-orange-200/80 px-4 py-2 rounded-full text-xs font-extrabold text-orange-950 shadow-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
            <span className="hidden sm:inline">14 Hospital Units Active</span>
            <span className="sm:hidden">14 Units</span>
            <span className="text-orange-300">•</span>
            <span className="text-orange-600 font-black">PPE Portal</span>
          </div>

        </div>
      </header>

      {/* Main Center Stage */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8 lg:p-12">
        
        <div className="w-full max-w-xl sm:max-w-2xl flex flex-col items-center">
          
          {/* EXTRA LARGE SANKARA EYE FOUNDATION LOGO OUTSIDE THE CONTAINER */}
          <motion.div
            initial={{ opacity: 0, y: -24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full flex flex-col items-center mb-8 text-center"
          >
            <div className="p-6 sm:p-7 bg-white/95 backdrop-blur-md rounded-3xl shadow-2xl shadow-orange-500/12 border border-orange-100/90 max-w-[440px] sm:max-w-[540px] w-full flex items-center justify-center transform transition-all hover:scale-[1.02] hover:shadow-orange-500/20">
              <img
                src="/sankara-logo.png"
                alt="Sankara Eye Foundation India"
                className="w-full h-auto max-h-28 sm:max-h-36 object-contain drop-shadow-sm"
              />
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-4">
              PPE - Project Patient Experience
            </h1>
            <p className="text-sm sm:text-base text-slate-500 font-medium max-w-lg mt-1">
              Operational Quality & Clinical Workflow Governance across 14 Hospital Units in India
            </p>
          </motion.div>

          {/* Expanded & Elegant Centered Login Container */}
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="w-full bg-white/95 backdrop-blur-2xl rounded-3xl border border-slate-200/90 shadow-2xl shadow-slate-400/30 overflow-hidden relative"
          >
            {/* Top Saffron Orange Bar */}
            <div className="h-2 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 shadow-xs" />

            <div className="p-8 sm:p-10 space-y-6">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                    Secure Staff Sign In
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                    {loginMode === 'email' 
                      ? 'Enter your official hospital email to access your workspace'
                      : 'Enter your 6-digit Employee ID (Emp ID) to access your workspace'}
                  </p>
                </div>
                <div className="p-2.5 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 shadow-2xs">
                  {loginMode === 'email' ? <Mail className="w-5 h-5" /> : <BadgeCheck className="w-5 h-5" />}
                </div>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm p-4 rounded-2xl flex items-center gap-3 shadow-xs"
                  >
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span className="font-bold leading-tight">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleFormSubmit} className="space-y-5">
                
                {/* Dynamic Input: Email vs Emp ID */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      {loginMode === 'email' ? 'Official Hospital Email' : 'Employee ID (Emp ID)'}
                    </label>
                    <span className="text-[11px] text-orange-600 font-bold">
                      {loginMode === 'email' ? 'Email Sign In' : 'Emp ID Sign In'}
                    </span>
                  </div>
                  <div className="relative">
                    {loginMode === 'email' ? (
                      <Mail className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    ) : (
                      <BadgeCheck className="w-5 h-5 text-orange-500 absolute left-4 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type={loginMode === 'email' ? 'email' : 'text'}
                      required
                      id="login-identifier-input"
                      placeholder={loginMode === 'email' ? 'e.g. prabhanjan@sankaraeye.com' : 'e.g. 010177'}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl bg-slate-50/90 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium transition-all shadow-inner"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-wider">
                      Security Password
                    </label>
                    <span className="text-xs text-slate-400 font-medium">Default: Sankara@123 / password123</span>
                  </div>
                  <div className="relative">
                    <Lock className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      id="login-password-input"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 sm:py-4 rounded-2xl bg-slate-50/90 hover:bg-slate-50 focus:bg-white border border-slate-200/90 text-slate-900 placeholder-slate-400 text-sm sm:text-base focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium transition-all shadow-inner"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  id="login-submit-btn"
                  disabled={loading}
                  className={`w-full py-4 px-6 btn-orange-gradient rounded-2xl font-black text-base text-white shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2.5 transition-all cursor-pointer hover:shadow-orange-500/50 hover:scale-[1.01] active:scale-[0.99] ${
                    loading ? 'opacity-70 pointer-events-none' : ''
                  }`}
                >
                  <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>

                {/* Switch between Email and Emp ID button */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={toggleLoginMode}
                    className="w-full py-3 px-4 rounded-2xl bg-orange-50/90 hover:bg-orange-100/90 border border-orange-200 text-orange-950 font-black text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs hover:scale-[1.01] active:scale-[0.99]"
                  >
                    {loginMode === 'email' ? (
                      <>
                        <BadgeCheck className="w-4.5 h-4.5 text-orange-600" />
                        <span>Sign in with Employee ID (Emp ID) instead</span>
                      </>
                    ) : (
                      <>
                        <Mail className="w-4.5 h-4.5 text-orange-600" />
                        <span>Switch to Official Hospital Email Sign In</span>
                      </>
                    )}
                  </button>
                </div>

              </form>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>256-Bit Encrypted Healthcare Governance</span>
                </div>
                <span className="text-orange-600 font-bold">Role-Scoped</span>
              </div>

            </div>

          </motion.div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative z-20 bg-white/85 backdrop-blur-md border-t border-slate-200/80 py-4 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <img src="/sankara-emblem.png" alt="Sankara Emblem" className="w-4.5 h-4.5 object-contain" />
            <span className="font-bold text-slate-800">Sankara Eye Foundation India</span>
            <span>•</span>
            <span>Sri Kanchi Kamakoti Medical Trust</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-600 font-medium">
            <span>Coimbatore HQ</span>
            <span>•</span>
            <span className="font-semibold text-slate-700">All rights reserved to Sankara Eye Foundation India</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
