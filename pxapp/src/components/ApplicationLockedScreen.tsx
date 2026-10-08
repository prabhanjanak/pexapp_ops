import React from 'react';
import { User } from '../types';
import {
  Lock,
  ShieldAlert,
  ArrowRight,
  LogOut,
  Building2,
  Mail,
  UserCheck,
  Layers,
  Activity,
  ArrowLeft
} from 'lucide-react';

interface ApplicationLockedScreenProps {
  attemptedApp: '5s' | 'bottleneck';
  allowedApp: '5s' | 'bottleneck';
  currentUser: User;
  onNavigateToAllowed: () => void;
  onBackToPortal?: () => void;
  onLogout: () => void;
}

export const ApplicationLockedScreen: React.FC<ApplicationLockedScreenProps> = ({
  attemptedApp,
  allowedApp,
  currentUser,
  onNavigateToAllowed,
  onBackToPortal,
  onLogout
}) => {
  const attemptedTitle =
    attemptedApp === '5s'
      ? '5S : Rapid Transformation Initiative'
      : 'Project Patient Experience (Bottleneck Management)';

  const allowedTitle =
    allowedApp === '5s'
      ? '5S : Rapid Transformation Initiative'
      : 'Project Patient Experience (Bottleneck Management)';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-white relative">
      
      {/* Ambient background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(244,63,94,0.08),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#e2e8f030_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f030_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0 opacity-60" />

      {/* Top Header Bar */}
      <header className="relative z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-8 py-3.5 shadow-2xs">
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
                Access Governance & License Verification • Sri Kanchi Kamakoti Medical Trust
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            {onBackToPortal && (
              <button
                onClick={onBackToPortal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Workspace Hub</span>
              </button>
            )}

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Lock Card */}
      <main className="relative z-10 max-w-2xl mx-auto px-4 py-8 sm:py-16 flex-1 flex flex-col justify-center w-full">
        <div className="bg-white rounded-3xl border-2 border-rose-200/90 shadow-2xl shadow-rose-500/10 p-6 sm:p-10 space-y-6 text-center overflow-hidden relative">
          
          {/* Top Rose Bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

          {/* Lock Icon */}
          <div className="w-20 h-20 rounded-3xl bg-rose-50 border-2 border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-inner">
            <Lock className="w-10 h-10" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-[11px] font-black uppercase tracking-wider mb-2 border border-rose-200">
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>Application Access Restricted</span>
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
              You Don't Have Access to this Application
            </h2>
            
            <p className="text-slate-600 text-xs sm:text-sm mt-2 max-w-lg mx-auto font-medium leading-relaxed">
              Your account is not licensed to access <span className="font-bold text-slate-900">{attemptedTitle}</span>. Your portal credentials have been provisioned strictly for the application below:
            </p>
          </div>

          {/* Account License Profile Card */}
          <div className="bg-slate-50/90 rounded-2xl border border-slate-200 p-4 sm:p-5 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">Account Credentials</span>
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                {currentUser.role}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Staff Member</span>
                <p className="font-black text-slate-900">{currentUser.name}</p>
                <p className="text-slate-500 text-[11px] font-normal">{currentUser.email}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Employee ID</span>
                <p className="font-mono font-bold text-slate-800">{currentUser.empId || 'N/A'}</p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Unit Scope</span>
                <p className="font-semibold text-slate-800 flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-slate-400" />
                  <span>{currentUser.unitName || 'All 14 Units Network'}</span>
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Licensed Application</span>
                <p className="font-bold text-emerald-700 flex items-center gap-1">
                  {allowedApp === '5s' ? <Layers className="w-3.5 h-3.5 text-emerald-600" /> : <Activity className="w-3.5 h-3.5 text-orange-600" />}
                  <span>{allowedTitle}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-2">
            <button
              onClick={onNavigateToAllowed}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <span>Switch to Licensed Workspace ({allowedApp === '5s' ? '5S Kaizen' : 'Patient Experience'})</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-3">
              {onBackToPortal && (
                <button
                  onClick={onBackToPortal}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
                >
                  Return to Workspace Selector
                </button>
              )}
              <span className="text-slate-300">•</span>
              <button
                onClick={onLogout}
                className="px-4 py-2 rounded-xl text-rose-600 hover:text-rose-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Sign Out & Switch Account
              </button>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 border-t border-slate-100 pt-3">
            Need dual-application access? Please contact your Central Super Administrator (<strong className="text-slate-700">Prabhanjan / Central Directorate</strong>).
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-20 bg-white/90 backdrop-blur-md border-t border-slate-200/80 py-3.5 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/sankara-emblem.png" alt="Sankara Emblem" className="w-4 h-4 object-contain" />
            <span className="font-bold text-slate-800">Sankara Eye Foundation, India</span>
            <span>•</span>
            <span>Sri Kanchi Kamakoti Medical Trust</span>
          </div>
          <span className="font-medium text-slate-600">Access Governance System © 2026</span>
        </div>
      </footer>

    </div>
  );
};
