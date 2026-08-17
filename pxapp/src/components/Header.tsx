import React from 'react';
import { User, UnitHeadTab, OpsTeamTab, SuperAdminTab } from '../types';
import {
  LogOut,
  Sliders,
  History,
  RefreshCw,
  Building2,
  TrendingUp,
  Layers,
  PieChart,
  UserCheck,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Camera
} from 'lucide-react';

interface HeaderProps {
  currentUser: User;
  onLogout: () => void;
  onOpenProfile?: () => void;
  // Tabs
  activeUnitTab?: UnitHeadTab;
  onUnitTabChange?: (tab: UnitHeadTab) => void;
  activeOpsTab?: OpsTeamTab;
  onOpsTabChange?: (tab: OpsTeamTab) => void;
  activeAdminTab?: SuperAdminTab;
  onAdminTabChange?: (tab: SuperAdminTab) => void;
  onRefreshData: () => void;
  assessedCount: number;
  totalUnits: number;
  orgAvgPercent: number;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentUser,
  onLogout,
  onOpenProfile,
  activeUnitTab,
  onUnitTabChange,
  activeOpsTab,
  onOpsTabChange,
  activeAdminTab,
  onAdminTabChange,
  onRefreshData,
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
    <header className="bg-white text-slate-800 shadow-xs border-b border-slate-200 sticky top-0 z-40">
      {/* Top Saffron Accent Line */}
      <div className="h-1 w-full bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400" />

      {/* Main Header Container */}
      <div className="max-w-[1680px] mx-auto px-4 sm:px-8 lg:px-10 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Official Brand Identity */}
          <div className="flex items-center space-x-3.5">
            <img
              src="/sankara-emblem.png"
              alt="Sankara Eye Hospital"
              className="w-11 h-11 object-contain rounded-xl shadow-xs shrink-0"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-xl font-black tracking-tight text-slate-900 flex items-center gap-2">
                  PPE - Project Patient Experience
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${getRoleBadge(currentUser.role)}`}>
                  {currentUser.role}
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                {currentUser.role === 'Unit Head' && currentUser.unitName
                  ? `Dedicated Unit Workspace • ${currentUser.unitName}`
                  : 'Sankara Eye Foundation India • Patient Experience & Quality Operations'}
              </p>
            </div>
          </div>

          {/* Right Header Controls: Network Counters, User Profile Chip & Logout */}
          <div className="flex flex-wrap items-center gap-3 justify-between lg:justify-end">
            
            {/* Quick Network Stat Pill (for Ops and Super Admin) */}
            {currentUser.role !== 'Unit Head' && (
              <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Network Units</span>
                  <span className="font-extrabold text-slate-800 text-xs">{assessedCount} / {totalUnits} Active</span>
                </div>
                <div className="w-px h-5 bg-slate-200" />
                <div>
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Org Resolution</span>
                  <span className="font-black text-orange-600 text-xs">{orgAvgPercent}%</span>
                </div>
              </div>
            )}

            {/* Interactive User Profile Chip (Click to view Profile / Change Password) */}
            <button
              type="button"
              id="header-user-profile-btn"
              onClick={onOpenProfile}
              title="Click to view locked profile or change portal password"
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-200 transition-all cursor-pointer text-left group"
            >
              <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center font-black text-xs shadow-xs group-hover:scale-105 transition-transform">
                {currentUser.avatarInitials || 'SK'}
              </div>
              <div className="text-left">
                <span className="text-xs font-black text-slate-900 block leading-tight group-hover:text-orange-600 transition-colors">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium block leading-tight truncate max-w-[140px]">
                  {currentUser.empId ? `ID: ${currentUser.empId}` : (currentUser.designation || currentUser.email)}
                </span>
              </div>
            </button>

            {/* Refresh Live Data */}
            <button
              type="button"
              id="refresh-data-btn"
              onClick={onRefreshData}
              title="Refresh live operational data"
              className={`p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors border border-slate-200 cursor-pointer ${
                isLoading ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-orange-500' : ''}`} />
            </button>

            {/* Logout Button */}
            <button
              type="button"
              id="logout-btn"
              onClick={onLogout}
              title="Sign out of portal"
              className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-600 transition-colors border border-slate-200 hover:border-rose-200 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>

          </div>

        </div>

        {/* ROLE-SPECIFIC WORKSPACE TABS */}
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1">
          
          {/* 1. Unit Head Tabs */}
          {currentUser.role === 'Unit Head' && onUnitTabChange && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="tab-uh-bottlenecks"
                onClick={() => onUnitTabChange('bottlenecks')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeUnitTab === 'bottlenecks'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Bottleneck Registry
              </button>

              <button
                type="button"
                id="tab-uh-analytics"
                onClick={() => onUnitTabChange('analytics')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeUnitTab === 'analytics'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                Category Analytics
              </button>

              <button
                type="button"
                id="tab-uh-profile"
                onClick={() => onUnitTabChange('profile')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeUnitTab === 'profile'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Unit Profile & Directory
              </button>
            </div>
          )}

          {/* 2. Operations Team / Super Admin View Only Tabs */}
          {(currentUser.role === 'Operations Team' || currentUser.role === 'Super Admin (View Only)') && onOpsTabChange && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="tab-ops-dashboard"
                onClick={() => onOpsTabChange('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeOpsTab === 'dashboard'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                14-Units Dashboard
              </button>

              <button
                type="button"
                id="tab-ops-evidence"
                onClick={() => onOpsTabChange('evidence')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeOpsTab === 'evidence'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Photo Approvals
              </button>

              <button
                type="button"
                id="tab-ops-categories"
                onClick={() => onOpsTabChange('categories')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeOpsTab === 'categories'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Category Heatmap
              </button>

              <button
                type="button"
                id="tab-ops-compliance"
                onClick={() => onOpsTabChange('compliance')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeOpsTab === 'compliance'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Compliance & Deadlines
              </button>

              <button
                type="button"
                id="tab-ops-activity"
                onClick={() => onOpsTabChange('activity')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeOpsTab === 'activity'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                Activity Feed
              </button>
            </div>
          )}

          {/* 3. Super Admin Tabs */}
          {currentUser.role === 'Super Admin' && onAdminTabChange && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                id="tab-admin-dashboard"
                onClick={() => onAdminTabChange('dashboard')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAdminTab === 'dashboard'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" />
                14-Units Dashboard
              </button>

              <button
                type="button"
                id="tab-admin-evidence"
                onClick={() => onAdminTabChange('evidence')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAdminTab === 'evidence'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                Evidence Approvals
              </button>

              <button
                type="button"
                id="tab-admin-operations"
                onClick={() => onAdminTabChange('operations')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAdminTab === 'operations'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Unit Operations
              </button>

              <button
                type="button"
                id="tab-admin-analytics"
                onClick={() => onAdminTabChange('analytics')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAdminTab === 'analytics'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                Network Analytics
              </button>

              <button
                type="button"
                id="tab-admin-users"
                onClick={() => onAdminTabChange('users')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAdminTab === 'users'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                User Management (CRUD)
              </button>

              <button
                type="button"
                id="tab-admin-database"
                onClick={() => onAdminTabChange('database')}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeAdminTab === 'database'
                    ? 'btn-orange-gradient shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Master Database Control
              </button>
            </div>
          )}

        </div>

      </div>
    </header>
  );
};
