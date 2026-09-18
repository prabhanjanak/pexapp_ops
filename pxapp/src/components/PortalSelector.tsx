import React from 'react';
import { User } from '../types';
import {
  Sparkles,
  Activity,
  ArrowRight,
  ShieldCheck,
  Building2,
  Layers,
  CheckCircle2,
  Flame,
  BarChart3,
  Clock,
  LogOut,
  UserCheck,
  TrendingUp,
  Award
} from 'lucide-react';

interface PortalSelectorProps {
  currentUser: User;
  onSelectPortal: (portal: '5s' | 'bottleneck') => void;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const PortalSelector: React.FC<PortalSelectorProps> = ({
  currentUser,
  onSelectPortal,
  onLogout,
  onOpenProfile
}) => {
  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative font-sans">
      
      {/* Ambient background decoration */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(249,115,22,0.08),rgba(255,255,255,0))] pointer-events-none z-0" />
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
                Business Excellence Platform • Sri Kanchi Kamakoti Medical Trust • Est. 1977
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 text-xs font-semibold text-slate-800 transition-all cursor-pointer shadow-xs group"
            >
              <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black flex items-center justify-center text-[11px] shadow-2xs">
                {currentUser.avatarInitials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="leading-none text-[12px] font-black text-slate-900 group-hover:text-orange-600 transition-colors">{currentUser.name}</p>
                <p className="text-[10px] text-orange-600 font-bold">{currentUser.role}</p>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-700 hover:text-rose-600 text-xs font-bold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Module Cards */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex-1 flex flex-col justify-center">
        
        {/* Hero Title Section */}
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-100/80 border border-orange-200 text-orange-800 text-xs font-black uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-orange-600" />
            <span>Sankara Business Excellence Platforms</span>
          </div>
          <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-3">
            Select Your Workspace
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-medium">
            Welcome, <span className="text-orange-600 font-black">{currentUser.name}</span>. Access live operational bottlenecks across 14 hospital units or explore organizational quality initiatives.
          </p>
        </div>

        {/* 2 Interactive Portal Cards (Light UI with Orange Gradient Styling) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto w-full">
          
          {/* Card 1: 5S : Rapid Transformation Initiative */}
          <div
            onClick={() => onSelectPortal('5s')}
            className="group relative bg-white hover:bg-gradient-to-br hover:from-white hover:via-amber-50/40 hover:to-orange-50/50 border-2 border-slate-200 hover:border-orange-400 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-orange-500/10 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Accent Orange Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 to-orange-500" />
            
            {/* Ambient subtle glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-amber-400/10 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-400/20 transition-all duration-500" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-300">
                  <Layers className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300/80 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  Rapid Transformation
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors mb-2.5 flex items-center gap-2">
                5S : Rapid Transformation Initiative
              </h3>
              
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5 font-medium">
                Workplace organization & Kaizen audit protocols across 14 hospital units: <span className="font-bold text-slate-800">Sort, Set in Order, Shine, Standardize, Sustain</span>.
              </p>

              <div className="space-y-2 mb-6 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Digital Red-tagging & Kaizen photo audit scoring</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>Clinical cleanliness & standardization checklists</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-700 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0" />
                  <span>14-Unit hospital quality benchmarking</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-orange-600 font-black text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
              <span>View 5S Development Status</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Project Patient Experience */}
          <div
            onClick={() => onSelectPortal('bottleneck')}
            className="group relative bg-gradient-to-br from-white via-orange-50/20 to-amber-50/30 hover:to-orange-50/50 border-2 border-orange-300 hover:border-orange-500 rounded-3xl p-6 sm:p-8 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-orange-500/15 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Top Saffron Gradient Bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400" />
            
            {/* Ambient glow */}
            <div className="absolute -top-12 -right-12 w-44 h-44 bg-orange-500/15 rounded-full blur-2xl pointer-events-none group-hover:bg-orange-500/25 transition-all duration-500" />

            <div>
              <div className="flex items-center justify-between mb-5">
                <div className="w-13 h-13 rounded-2xl bg-gradient-to-br from-orange-600 via-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md shadow-orange-600/30 group-hover:scale-105 transition-transform duration-300">
                  <Activity className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300/90 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Production • Active
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 group-hover:text-orange-600 transition-colors mb-2.5 flex items-center gap-2">
                Project Patient Experience
              </h3>
              
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-5 font-medium">
                Live operational bottleneck platform tracking outpatient flow, surgical turnaround, before/after evidence photos, and directives.
              </p>

              <div className="space-y-2 mb-6 bg-orange-50/50 p-3.5 rounded-2xl border border-orange-100/80">
                <div className="flex items-center gap-2.5 text-xs text-slate-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Real-time resolution workflows across 14 hospital units</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Before & after photo evidence with directives</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-800 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Action task checklists & monthly trend analysis</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-orange-100 flex items-center justify-between text-orange-600 font-black text-xs sm:text-sm group-hover:translate-x-1 transition-transform">
              <span className="flex items-center gap-1.5">
                <span>Launch Patient Experience Workspace</span>
              </span>
              <ArrowRight className="w-4 h-4 text-orange-600" />
            </div>
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
          <span className="font-medium text-slate-600">Business Excellence Application • All rights reserved © 2026</span>
        </div>
      </footer>

    </div>
  );
};
