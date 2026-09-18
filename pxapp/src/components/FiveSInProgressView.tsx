import React from 'react';
import { ArrowLeft, Sparkles, Layers, ShieldCheck, CheckCircle2, Clock, Check, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { User } from '../types';

interface FiveSInProgressViewProps {
  currentUser: User;
  onBack: () => void;
}

export const FiveSInProgressView: React.FC<FiveSInProgressViewProps> = ({
  currentUser,
  onBack
}) => {
  const pillars = [
    { jp: 'Seiri (整理)', en: '1S - Sort', desc: 'Identify unnecessary equipment, obsolete supplies, and red-tag clinical areas.', progress: 'Phase 1 Complete', color: 'from-amber-500 to-orange-500' },
    { jp: 'Seiton (整頓)', en: '2S - Set In Order', desc: 'Organize surgical kits, instruments, OPD file storage, and visual demarcation lines.', progress: 'In Active Development', color: 'from-orange-500 to-rose-500' },
    { jp: 'Seiso (清掃)', en: '3S - Shine', desc: 'Daily equipment maintenance, hygiene routines, and infection control compliance.', progress: 'Framework Drafted', color: 'from-rose-500 to-pink-500' },
    { jp: 'Seiketsu (清潔)', en: '4S - Standardize', desc: 'Uniform checklists, visual Kanban boards, and cross-hospital standard operating procedures.', progress: 'Planned', color: 'from-blue-500 to-indigo-500' },
    { jp: 'Shitsuke (躾)', en: '5S - Sustain', desc: 'Monthly self-audits, leadership inspection tours, and recognition awards for top units.', progress: 'Planned', color: 'from-emerald-500 to-teal-500' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      
      {/* Top Bar with Back Button */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md px-6 py-4 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-bold transition-all hover:translate-x-[-2px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
              <span>Back to Portal Selection</span>
            </button>
            <div className="hidden sm:block h-5 w-px bg-slate-700" />
            <span className="text-xs font-medium text-slate-400 hidden sm:inline">
              Sankara Eye Hospital • 5S Kaizen Audit Portal
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-semibold text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-full">
            <Clock className="w-3.5 h-3.5 animate-spin text-amber-400" />
            <span>Target Launch: Q4 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center">
        
        {/* Badge & Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-0.5 shadow-2xl shadow-amber-500/20 mb-6 flex items-center justify-center">
          <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center">
            <Layers className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          Development In Progress
        </div>

        <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-4 max-w-2xl">
          5S Workplace Organization & Audit Dashboard
        </h2>

        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
          The 5S Operational & Kaizen Audit module for <strong>Sankara Eye Hospitals</strong> is actively being engineered. It will go live soon with digital red-tagging, photo scoring, and hospital benchmarking!
        </p>

        {/* Back Button Prominent CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-14">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-orange-600/30 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workspace Selection</span>
          </button>
        </div>

        {/* 5S Pillars Preview Cards */}
        <div className="w-full max-w-5xl text-left">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 text-center">
            5S Operational Framework Architecture Under Construction
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="bg-slate-800/60 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-slate-600 transition-colors"
              >
                <div>
                  <div className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${p.color} mb-3`} />
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">{p.jp}</p>
                  <h4 className="text-sm font-black text-white mb-2">{p.en}</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    {p.progress}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-4 px-6 text-center text-xs text-slate-500">
        <span>Sankara Eye Foundation India • Continuous Quality Improvement & Kaizen Protocols</span>
      </footer>

    </div>
  );
};
