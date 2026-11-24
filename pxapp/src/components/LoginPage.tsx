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
  Building2,
  Eye,
  EyeOff,
  Award,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  MapPin,
  HeartHandshake,
  Activity
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: any) => void;
}

const QUICK_ROLES = [
  {
    role: 'Super Admin',
    name: 'Prabhanjan',
    email: 'prabhanjan@sankaraeye.com',
    pass: 'Sankara@123',
    badge: 'Central Directorate',
    color: 'from-orange-500 to-amber-600'
  },
  {
    role: 'President',
    name: 'Bharath Balasubramanian',
    email: 'bharath@sankaraeye.com',
    pass: 'password123',
    badge: 'Operations Directorate',
    color: 'from-blue-600 to-indigo-700'
  },
  {
    role: 'Unit Head - CBE',
    name: 'Coimbatore Apex',
    email: 'demo@sankaraeye.com',
    pass: 'Sankara@123',
    badge: 'Hospital Operations',
    color: 'from-emerald-600 to-teal-700'
  },
  {
    role: 'Unit Head - Jaipur',
    name: 'Jaipur Hospital',
    email: 'jaipur@sankaraeye.com',
    pass: 'Sankara@123',
    badge: 'Rajasthan Unit',
    color: 'from-amber-600 to-orange-700'
  },
  {
    role: 'Operations Team',
    name: 'Arsh Mishra',
    email: 'arsh.mishra@sankaraeye.com',
    pass: 'password123',
    badge: 'Quality & Governance',
    color: 'from-purple-600 to-violet-700'
  },
  {
    role: '5S Lead Auditor',
    name: 'Central 5S Team',
    email: 'auditor@sankaraeye.com',
    pass: 'Sankara@123',
    badge: 'Audit & Compliance',
    color: 'from-rose-600 to-pink-700'
  }
];

const HOSPITAL_UNITS = [
  { city: 'Coimbatore', state: 'HQ • Tamil Nadu' },
  { city: 'Bangalore', state: 'Karnataka' },
  { city: 'Guntur', state: 'Andhra Pradesh' },
  { city: 'Shimoga', state: 'Karnataka' },
  { city: 'Anand', state: 'Gujarat' },
  { city: 'Hyderabad', state: 'Telangana' },
  { city: 'Kanpur', state: 'Uttar Pradesh' },
  { city: 'Ludhiana', state: 'Punjab' },
  { city: 'Jaipur', state: 'Rajasthan' },
  { city: 'Indore', state: 'Madhya Pradesh' },
  { city: 'Panvel', state: 'Mumbai • Maharashtra' },
  { city: 'Madurai', state: 'Tamil Nadu' },
  { city: 'Lucknow', state: 'Uttar Pradesh' },
  { city: 'Coimbatore RS Puram', state: 'Tamil Nadu' }
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);

  const handleLogin = async (loginKey: string, loginPass?: string) => {
    setError(null);
    setLoading(true);
    try {
      const session = await api.login(loginKey, loginPass !== undefined ? loginPass : password);
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
      setError('Please enter your registered hospital email address or employee ID');
      return;
    }
    handleLogin(identifier, password);
  };

  const selectQuickRole = (qr: (typeof QUICK_ROLES)[0]) => {
    setIdentifier(qr.email);
    setPassword(qr.pass);
    setError(null);
  };

  return (
    <div className="min-h-screen w-screen overflow-x-hidden bg-slate-900 text-slate-100 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative font-sans">
      
      {/* Background Interactive Aura Canvas */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-40">
        <AuraCursor
          backdrop="dark"
          paletteColors={[
            "#EA580C", // Saffron Orange
            "#F59E0B", // Radiant Amber
            "#0284C7", // Medical Sky Blue
            "#0D9488", // Institutional Teal
            "#4F46E5", // Deep Royal
            "#E11D48"  // Crimson
          ]}
          densityDissipation={4.2}
          curl={3.8}
          splatRadius={4.2}
          splatForce={5.5}
          intensity={0.85}
          label={false}
        />
      </div>

      {/* Subtle Structural Ambient Grids & Vignette */}
      <div className="fixed inset-0 bg-radial-gradient from-slate-900/40 via-slate-950/80 to-slate-950 pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:3.5rem_3.5rem] pointer-events-none z-0 opacity-40" />

      {/* Institutional Top Header Bar */}
      <header className="relative z-20 bg-slate-900/90 backdrop-blur-xl border-b border-slate-800/80 py-3 px-4 sm:px-8 shadow-xl shrink-0">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo & Trust Heritage */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="p-1.5 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
              <img
                src="/sankara-emblem.png"
                alt="Sankara Emblem"
                className="w-9 h-9 sm:w-10 sm:h-10 object-contain rounded-xl"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black tracking-wider text-white uppercase">
                  Sankara Eye Foundation India
                </span>
                <span className="hidden md:inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 border border-orange-500/30">
                  <Award className="w-3 h-3" /> NABH Standards
                </span>
              </div>
              <span className="text-[11px] text-amber-400 font-bold block tracking-tight">
                Sri Kanchi Kamakoti Medical Trust • Est. 1977
              </span>
            </div>
          </div>

          {/* Network Live Status Indicator */}
          <div className="flex items-center gap-2.5 bg-slate-800/90 border border-slate-700/80 px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-200 shadow-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">14 Hospital Units Active</span>
            <span className="sm:hidden">14 Units</span>
            <span className="text-slate-600">•</span>
            <span className="text-orange-400 font-extrabold">Excellence Portal</span>
          </div>

        </div>
      </header>

      {/* Main Showcase Stage: Two-Column Panoramic Experience */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-center">
          
          {/* Left Column: Institutional Prestige, Hospital Network & 5S Excellence */}
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-5"
          >
            {/* Main Hospital Emblem & Official Title */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/30 text-orange-300 text-xs font-black uppercase tracking-wider shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Central Operations & Quality Directorate</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-2xl shadow-2xl border border-white/20 max-w-[280px] sm:max-w-[320px]">
                  <img
                    src="/sankara-logo.png"
                    alt="Sankara Eye Foundation India Logo"
                    className="w-full h-auto max-h-14 object-contain"
                  />
                </div>
              </div>

              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Business Excellence Platform
              </h1>
              <p className="text-sm sm:text-base text-slate-300 font-normal leading-relaxed max-w-xl">
                The centralized operational governance system powering clinical throughput, bottleneck resolution, patient experience, and 5S Lean workplace standards across India.
              </p>
            </div>

            {/* Key Trust Statistics & Highlights Grid */}
            <div className="grid grid-cols-3 gap-3 max-w-xl">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md">
                <div className="text-xl sm:text-2xl font-black text-orange-400">14 Units</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">Pan-India Network</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md">
                <div className="text-xl sm:text-2xl font-black text-amber-400">45+ Years</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">Trust & Service</div>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 backdrop-blur-md">
                <div className="text-xl sm:text-2xl font-black text-emerald-400">5S Certified</div>
                <div className="text-[11px] text-slate-400 font-medium mt-0.5">Lean Quality System</div>
              </div>
            </div>

            {/* Hospital Units Grid Cloud */}
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/60 backdrop-blur-md max-w-xl">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-orange-400" />
                  Connected Hospital Centers
                </span>
                <span className="text-[10px] text-slate-400 font-semibold">14 Centers Active</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {HOSPITAL_UNITS.map((unit, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-900/80 border border-slate-700/80 text-[11px] text-slate-300 font-medium hover:border-orange-500/50 transition-colors"
                  >
                    <MapPin className="w-2.5 h-2.5 text-orange-400 shrink-0" />
                    <span className="font-semibold text-white">{unit.city}</span>
                    <span className="text-[9px] text-slate-500">({unit.state})</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Accreditation Badges */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>256-Bit SSL Encrypted Healthcare Core</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-orange-400" />
                <span>Real-Time Clinical Bottleneck Tracking</span>
              </div>
            </div>

          </motion.div>

          {/* Right Column: Secure Access Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="lg:col-span-5 w-full"
          >
            <div className="w-full bg-white text-slate-900 rounded-3xl border border-slate-200/90 shadow-2xl shadow-black/50 overflow-hidden relative">
              
              {/* Saffron & Gold Header Accent Strip */}
              <div className="h-2 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400" />

              <div className="p-6 sm:p-8 space-y-5">
                
                {/* Form Header */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black uppercase tracking-wider text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                      Authorized Personnel
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">Internal Secure Gateway</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
                    Sign In to Portal
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Enter your registered Sankara hospital email or employee ID
                  </p>
                </div>

                {/* Error Banner */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3.5 rounded-xl flex items-center gap-2.5 shadow-xs"
                    >
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-bold leading-tight">{error}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Login Form */}
                <form onSubmit={handleFormSubmit} className="space-y-4" autoComplete="off">
                  
                  {/* Email ID / Employee ID Input */}
                  <div>
                    <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1.5">
                      Hospital Email / Employee ID
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        id="login-identifier-input"
                        placeholder="e.g. prabhanjan@sankaraeye.com"
                        autoComplete="username"
                        autoCapitalize="none"
                        autoCorrect="off"
                        spellCheck={false}
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        className="w-full pl-10 pr-3.5 py-3 rounded-xl bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium transition-all shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-[11px] font-black text-slate-700 uppercase tracking-wider">
                        Security Password
                      </label>
                      <span className="text-[10px] text-slate-400 font-semibold">Protected Credential</span>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        id="login-password-input"
                        placeholder="••••••••••••"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 text-slate-900 placeholder-slate-400 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-medium transition-all shadow-inner"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer rounded-lg hover:bg-slate-100"
                        title={showPassword ? 'Hide password' : 'View password'}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="w-4 h-4 text-slate-600" />
                        ) : (
                          <Eye className="w-4 h-4 text-slate-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    id="login-submit-btn"
                    disabled={loading}
                    className={`w-full py-3.5 px-5 btn-orange-gradient rounded-xl font-black text-sm text-white shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-orange-500/40 hover:scale-[1.01] active:scale-[0.99] ${
                      loading ? 'opacity-70 pointer-events-none' : ''
                    }`}
                  >
                    <span>{loading ? 'Authenticating...' : 'Sign In to Portal'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                </form>

                {/* Quick Role Access Assistant (Click-to-Test) */}
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowQuickAccess(!showQuickAccess)}
                    className="w-full flex items-center justify-between py-1.5 text-xs font-bold text-slate-600 hover:text-orange-600 cursor-pointer transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-orange-500" />
                      Quick Role Demonstration Assistant
                    </span>
                    {showQuickAccess ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  <AnimatePresence>
                    {showQuickAccess && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-2 grid grid-cols-2 gap-2 pt-1"
                      >
                        {QUICK_ROLES.map((qr, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => selectQuickRole(qr)}
                            className="text-left p-2 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-black text-slate-800 group-hover:text-orange-600">
                                {qr.role}
                              </span>
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700 group-hover:bg-orange-200 group-hover:text-orange-800">
                                {qr.badge}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 truncate mt-0.5 font-medium">
                              {qr.email}
                            </div>
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Central IT Support Footer Notice */}
                <div className="text-center pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Central IT & Quality Support: </span>
                  <a
                    href="mailto:is.support@sankaraeye.com"
                    className="text-orange-600 font-bold hover:underline"
                  >
                    is.support@sankaraeye.com
                  </a>
                </div>

              </div>

            </div>
          </motion.div>

        </div>

      </main>

      {/* Institutional Global Footer */}
      <footer className="relative z-20 bg-slate-900/90 backdrop-blur-md border-t border-slate-800 py-3 px-4 sm:px-8 text-xs text-slate-400 shrink-0">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <img src="/sankara-emblem.png" alt="Sankara Emblem" className="w-4 h-4 object-contain" />
            <span className="font-bold text-slate-200">Sankara Eye Foundation India</span>
            <span>•</span>
            <span className="text-slate-400">Sri Kanchi Kamakoti Medical Trust</span>
          </div>
          <div className="flex items-center gap-3 text-slate-400 text-[11px]">
            <span>Coimbatore Headquarters</span>
            <span>•</span>
            <span className="font-medium text-slate-300">All rights reserved © 2026</span>
          </div>
        </div>
      </footer>

    </div>
  );
};
