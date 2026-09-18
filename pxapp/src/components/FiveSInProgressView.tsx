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
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col justify-between selection:bg-orange-500 selection:text-white relative font-sans">
      
      {/* Top Bar with Back Button */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-md px-4 sm:px-8 py-3.5 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-600 border border-slate-200 hover:border-orange-300 text-slate-700 text-xs font-bold transition-all hover:translate-x-[-2px] cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-orange-500" />
              <span>Back to Workspace Selection</span>
            </button>
            <div className="hidden sm:block h-5 w-px bg-slate-200" />
            <span className="text-xs font-bold text-slate-600 hidden sm:inline">
              Sankara Eye Foundation, India • 5S Rapid Transformation Initiative
            </span>
          </div>

          <div className="flex items-center space-x-2 text-xs font-black text-amber-900 bg-amber-100 border border-amber-300 px-3 py-1.5 rounded-full shadow-2xs">
            <Clock className="w-3.5 h-3.5 animate-spin text-amber-600" />
            <span>Target Launch: Q4 2026</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-14 flex-1 flex flex-col items-center justify-center text-center relative z-10">
        
        {/* Badge & Icon */}
        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-0.5 shadow-2xl shadow-orange-500/20 mb-6 flex items-center justify-center">
          <div className="w-full h-full bg-white rounded-[22px] flex items-center justify-center">
            <Layers className="w-10 h-10 text-orange-600 animate-pulse" />
          </div>
        </div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-black uppercase tracking-wider mb-4 shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Rapid Transformation Initiative In Progress
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-slate-900 mb-4 max-w-2xl">
          5S : Rapid Transformation Initiative
        </h2>

        <p className="text-slate-600 text-sm sm:text-base max-w-2xl mb-8 leading-relaxed font-medium">
          The 5S Operational & Kaizen Audit module for <strong>Sankara Eye Foundation, India</strong> is actively being engineered. It will go live with digital red-tagging, photo scoring, and cross-hospital quality benchmarking!
        </p>

        {/* Back Button Prominent CTA */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-12">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-sm shadow-xl shadow-orange-600/25 hover:scale-[1.02] transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Workspace Selection</span>
          </button>
        </div>

        {/* 5S Pillars Preview Cards */}
        <div className="w-full max-w-5xl text-left">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4 text-center">
            5S Operational Framework Architecture Under Construction
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-300 shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className={`h-1.5 w-8 rounded-full bg-gradient-to-r ${p.color} mb-3`} />
                  <p className="text-[10px] font-black text-orange-600 uppercase tracking-wider">{p.jp}</p>
                  <h4 className="text-sm font-black text-slate-900 mb-1.5">{p.en}</h4>
                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{p.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-bold">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {p.progress}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white/80 py-3.5 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Sankara Eye Foundation, India • Continuous Quality Improvement & Kaizen Protocols</span>
          <span>Sri Kanchi Kamakoti Medical Trust</span>
        </div>
      </footer>

    </div>
  );
};

