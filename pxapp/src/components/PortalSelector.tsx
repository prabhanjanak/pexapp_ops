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
  UserCheck
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 text-white flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      
      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <img
              src="/sankara-emblem.png"
              alt="Sankara Eye Hospital"
              className="w-10 h-10 object-contain rounded-xl shadow-md shrink-0 bg-white p-1"
            />
            <div>
              <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
                Sankara Eye Care Institutions
              </h1>
              <p className="text-xs text-slate-400 font-medium">
                Operational Excellence & Clinical Quality Directory • Sri Kanchi Kamakoti Medical Trust
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-200 transition-colors"
            >
              <div className="w-6 h-6 rounded-lg bg-orange-600 text-white font-bold flex items-center justify-center text-[11px]">
                {currentUser.avatarInitials}
              </div>
              <div className="text-left hidden sm:block">
                <p className="leading-none text-[12px] font-bold">{currentUser.name}</p>
                <p className="text-[10px] text-orange-400">{currentUser.role}</p>
              </div>
            </button>

            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 text-rose-300 text-xs font-bold transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Hero & Module Cards */}
      <main className="max-w-7xl mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            Central Operational Portal Selection
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white mb-4">
            Select Your Workspace
          </h2>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Welcome, <span className="text-white font-semibold">{currentUser.name}</span>. Access the hospital network's real-time operational platforms or explore organizational quality programs below.
          </p>
        </div>

        {/* 2 Interactive Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto w-full">
          
          {/* Card 1: 5S Workplace Organization & Kaizen Audit */}
          <div
            onClick={() => onSelectPortal('5s')}
            className="group relative bg-slate-800/40 hover:bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/60 rounded-3xl p-8 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-amber-500/10 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:bg-amber-500/20 transition-all duration-500" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Layers className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                  Under Active Development
                </span>
              </div>

              <h3 className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors mb-3 flex items-center gap-2">
                5S Kaizen Audit System
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Workplace organization methodology across all clinics, wards, and operating rooms based on 5S Japanese protocols: <em>Sort, Set in order, Shine, Standardize, Sustain</em>.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Red-tagging & Kaizen photo audit scoring</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Clinical unit cleanliness & standardization checklists</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Benchmarking compliance across 14 hospital units</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/60 flex items-center justify-between text-amber-400 font-bold text-sm group-hover:translate-x-1 transition-transform">
              <span>View 5S Development Status</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Card 2: Bottleneck Resolution & Patient Experience (PPE) */}
          <div
            onClick={() => onSelectPortal('bottleneck')}
            className="group relative bg-gradient-to-br from-slate-800/80 to-slate-900/90 hover:bg-slate-800 border-2 border-orange-500/60 hover:border-orange-400 rounded-3xl p-8 transition-all duration-300 shadow-2xl hover:shadow-orange-500/20 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            {/* Ambient glow */}
            <div className="absolute top-0 right-0 w-56 h-56 bg-orange-500/20 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16 group-hover:bg-orange-500/30 transition-all duration-500" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-rose-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Activity className="w-7 h-7" />
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Production • Active
                </span>
              </div>

              <h3 className="text-2xl font-black text-white group-hover:text-orange-400 transition-colors mb-3 flex items-center gap-2">
                Bottleneck Resolution (PPE)
              </h3>
              <p className="text-slate-300 text-sm leading-relaxed mb-6">
                Project Patient Experience (PPE) operations platform for tracking outpatient flow, surgical turnaround, before/after clinical photo evidence, and executive directives.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Real-time resolution workflows across 14 hospital units</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Management directives, photo evidence & audit history</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Executive dashboards & monthly trend analysis</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-700/60 flex items-center justify-between text-orange-400 font-black text-sm group-hover:translate-x-1 transition-transform">
              <span>Launch Bottleneck Workspace</span>
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-4 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sankara Eye Foundation India • Sri Kanchi Kamakoti Medical Trust</span>
          <span>Project Patient Experience (PPE) & 5S Operational Systems</span>
        </div>
      </footer>

    </div>
  );
};
