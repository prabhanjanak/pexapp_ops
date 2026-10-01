import React from 'react';
import { FiveSUser, FiveSRole } from './types';
import {
  LogOut,
  BarChart2,
  LayoutDashboard,
  ShieldCheck,
  Building2,
  MapPin,
  ArrowLeft,
  Sparkles,
  Layers
} from 'lucide-react';

interface FiveSHeaderProps {
  currentUser: FiveSUser;
  activeScreen: 'dashboard' | 'reports';
  onScreenChange: (screen: 'dashboard' | 'reports') => void;
  onLogout: () => void;
  onBackToPortal?: () => void;
  onRoleSwitch?: (role: FiveSRole) => void;
}

export const FiveSHeader: React.FC<FiveSHeaderProps> = ({
  currentUser,
  activeScreen,
  onScreenChange,
  onLogout,
  onBackToPortal,
  onRoleSwitch
}) => {
  const roleBadgeStyles: Record<FiveSRole, { bg: string; text: string; border: string }> = {
    auditor: { bg: 'bg-orange-50', text: 'text-orange-800', border: 'border-orange-200' },
    incharge: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
    zonal: { bg: 'bg-blue-50', text: 'text-blue-800', border: 'border-blue-200' },
    unithead: { bg: 'bg-orange-100', text: 'text-orange-900', border: 'border-orange-300' },
    superadmin: { bg: 'bg-purple-50', text: 'text-purple-800', border: 'border-purple-200' },
    president: { bg: 'bg-orange-500', text: 'text-white', border: 'border-orange-600' }
  };

  const badgeStyle = roleBadgeStyles[currentUser.role] || roleBadgeStyles.auditor;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-xs">
      {/* Top Saffron/Orange Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400" />

      <div className="max-w-[1680px] mx-auto px-4 sm:px-8 py-3 flex flex-wrap items-center justify-between gap-3">
        
        {/* Brand & Scope Indicator */}
        <div className="flex items-center gap-3">
          <img
            src="/sankara-emblem.png"
            alt="Sankara Emblem"
            className="w-10 h-10 object-contain rounded-xl border border-orange-200/80 p-0.5 bg-white shadow-2xs shrink-0"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-base sm:text-lg tracking-tight">
                5S Digital Audit
              </span>
              <span className="text-xs text-slate-400 font-bold hidden sm:inline">•</span>
              <span className="text-xs font-bold text-slate-600 hidden sm:inline">
                Sankara Eye Hospitals
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-900 border border-orange-300">
                Kaizen Operational Excellence
              </span>
            </div>

            {/* Scope Badge */}
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mt-0.5">
              <span className="inline-flex items-center gap-1 font-bold text-orange-700">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                {currentUser.unit}
              </span>
              {currentUser.zone && <span>/ {currentUser.zone}</span>}
              {currentUser.department && (
                <span className="truncate max-w-[200px]">/ {currentUser.department}</span>
              )}
            </div>
          </div>
        </div>

        {/* Center / Right Navigation Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Navigation Tabs (Dashboard & Reports) */}
          <div className="flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => onScreenChange('dashboard')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeScreen === 'dashboard'
                  ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            {currentUser.role !== 'auditor' && (
              <button
                onClick={() => onScreenChange('reports')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeScreen === 'reports'
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <BarChart2 className="w-3.5 h-3.5" />
                <span>Reports & Analytics</span>
              </button>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center text-xs font-black shadow-2xs">
              {currentUser.avatarInitials}
            </div>
            <div className="text-left hidden lg:block">
              <div className="text-xs font-bold text-slate-900 leading-none">
                {currentUser.name}
              </div>
              <div className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">
                {currentUser.designation}
              </div>
            </div>

            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${badgeStyle.bg} ${badgeStyle.text} ${badgeStyle.border}`}>
              {currentUser.roleLabel}
            </span>
          </div>

          {/* Switch to Bottleneck Portal Button */}
          {onBackToPortal && (
            <button
              onClick={onBackToPortal}
              title="Return to Workspace Hub (Switch to Bottlenecks / PPE)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden sm:inline">Workspace Hub</span>
            </button>
          )}

          {/* Logout Button */}
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
  );
};
