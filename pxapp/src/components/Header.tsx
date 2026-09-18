import React from 'react';
import { User } from '../types';
import {
  LogOut,
  RefreshCw,
  ArrowLeft,
  ShieldCheck,
  Building2,
  Activity,
  UserCheck
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onOpenProfile?: () => void;
  onRefreshData: () => void;
  onGlobalBack?: () => void;
  canGoBack?: boolean;
  backLabel?: string;
  pageTitle?: string;
  assessedCount: number;
  totalUnits: number;
  orgAvgPercent: number;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenProfile,
  onRefreshData,
  onGlobalBack,
  canGoBack = false,
  backLabel = 'Back',
  pageTitle,
  assessedCount,
  totalUnits,
  orgAvgPercent,
  isLoading
}) => {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'Super Admin':
        return 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-xs';
      case 'Super Admin (View Only)':
        return 'bg-purple-100 text-purple-900 border border-purple-300';
      case 'Operations Team':
        return 'bg-amber-100 text-amber-900 border border-amber-300';
      case 'Unit Head':
      default:
        return 'bg-orange-50 text-orange-800 border border-orange-200';
    }
  };

  return (
    <header className="bg-white text-slate-800 shadow-xs border-b border-slate-200 sticky top-0 z-20">
      {/* Top Saffron Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400" />

      {/* Main Header Container */}
      <div className="w-full px-4 sm:px-8 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        
        {/* Left Side: Back Button & Page Breadcrumb Title */}
        <div className="flex items-center space-x-3">
          {canGoBack && onGlobalBack && (
            <button
              onClick={onGlobalBack}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-600 text-slate-700 text-xs font-bold transition-all border border-slate-200 hover:border-orange-300 cursor-pointer group"
              title={backLabel}
            >
              <ArrowLeft className="w-4 h-4 text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
              <span>{backLabel}</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900">
                {pageTitle || 'Project Patient Experience (PPE)'}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getRoleBadge(currentUser.role)}`}>
                {currentUser.role}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {currentUser.role === 'Unit Head' && currentUser.unitName
                ? `Dedicated Unit Workspace • ${currentUser.unitName}`
                : 'Sankara Eye Foundation India • Operations Directorate'}
            </p>
          </div>
        </div>

        {/* Right Header Controls: Network Counters & Refresh Data */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          
          {/* Quick Network Stat Pill (for Ops and Super Admin) */}
          {currentUser.role !== 'Unit Head' && (
            <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Network Units</span>
                <span className="font-extrabold text-slate-800 text-xs">{assessedCount} / {totalUnits} Active</span>
              </div>
              <div className="w-px h-5 bg-slate-200" />
              <div>
                <span className="text-slate-400 block text-[9px] uppercase font-bold">Org Resolution</span>
                <span className="font-black text-orange-600 text-xs">{orgAvgPercent}%</span>
              </div>
            </div>
          )}

          {/* Refresh Live Data */}
          <button
            type="button"
            onClick={onRefreshData}
            title="Refresh live operational data"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 cursor-pointer text-xs font-bold ${
              isLoading ? 'opacity-50 pointer-events-none' : ''
            }`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-orange-500' : 'text-slate-600'}`} />
            <span className="hidden sm:inline">Sync Data</span>
          </button>

        </div>

      </div>
    </header>
  );
};
