import React, { useState } from 'react';
import { User, UnitHeadTab, OpsTeamTab, SuperAdminTab, HospitalUnit } from '../types';
import {
  LayoutDashboard,
  Layers,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Building2,
  Camera,
  Tag,
  Users,
  Database,
  History,
  Activity,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  onTabChange: (tab: any) => void;
  onBackToPortal: () => void;
  units: HospitalUnit[];
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  activeTab,
  onTabChange,
  onBackToPortal,
  units,
  isCollapsed = false,
  onToggleCollapse
}) => {
  // Compute badge counts
  let activeCount = 0;
  let completedCount = 0;

  if (currentUser.role === 'Unit Head') {
    const unit = units.find(u => u.id === currentUser.unitId);
    if (unit) {
      activeCount = unit.bottlenecks.filter(b => b.status !== 'Completed').length;
      completedCount = unit.bottlenecks.filter(b => b.status === 'Completed').length;
    }
  } else {
    for (const u of units) {
      activeCount += u.bottlenecks.filter(b => b.status !== 'Completed').length;
      completedCount += u.bottlenecks.filter(b => b.status === 'Completed').length;
    }
  }

  // Navigation Items per Role
  const getNavItems = () => {
    if (currentUser.role === 'Unit Head') {
      return [
        { id: 'dashboard', label: 'Dashboard & Stats', icon: LayoutDashboard },
        { id: 'bottlenecks', label: 'Active Bottlenecks', icon: Activity, count: activeCount, countColor: 'bg-amber-500 text-slate-950' },
        { id: 'completed', label: 'Completed Archive', icon: CheckCircle2, count: completedCount, countColor: 'bg-emerald-500 text-white' },
        { id: 'analytics', label: 'Unit Trends', icon: TrendingUp },
        { id: 'profile', label: 'Unit Profile', icon: UserCheck }
      ];
    }

    if (currentUser.role === 'Operations Team' || currentUser.role === 'Super Admin (View Only)') {
      return [
        { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
        { id: 'units', label: '14 Units & Unit Heads', icon: Building2 },
        { id: 'bottlenecks', label: 'Network Bottlenecks', icon: Activity, count: activeCount, countColor: 'bg-amber-500 text-slate-950' },
        { id: 'completed', label: 'Completed Archive', icon: CheckCircle2, count: completedCount, countColor: 'bg-emerald-500 text-white' },
        { id: 'evidence', label: 'Evidence Approvals', icon: Camera },
        { id: 'categories', label: 'Categories & Depts', icon: Tag },
        { id: 'activity', label: 'Audit Log Feed', icon: History }
      ];
    }

    // Super Admin
    return [
      { id: 'dashboard', label: 'Executive Overview', icon: LayoutDashboard },
      { id: 'units', label: '14 Units & Unit Heads', icon: Building2 },
      { id: 'bottlenecks', label: 'Active Bottlenecks', icon: Activity, count: activeCount, countColor: 'bg-amber-500 text-slate-950' },
      { id: 'completed', label: 'Completed Archive', icon: CheckCircle2, count: completedCount, countColor: 'bg-emerald-500 text-white' },
      { id: 'evidence', label: 'Photo Approvals', icon: Camera },
      { id: 'categories', label: 'Categories & Depts', icon: Tag },
      { id: 'users', label: 'Staff Directory', icon: Users },
      { id: 'database', label: 'Database Health', icon: Database }
    ];
  };

  const navItems = getNavItems();

  return (
    <aside
      className={`bg-slate-900 text-white border-r border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-300 z-30 ${
        isCollapsed ? 'w-20' : 'w-64 sm:w-72'
      }`}
    >
      {/* Top Brand & Portal Switcher */}
      <div>
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3 overflow-hidden">
              <img
                src="/sankara-emblem.png"
                alt="Sankara"
                className="w-8 h-8 object-contain rounded-lg shrink-0 bg-white p-0.5"
              />
              <div className="truncate">
                <h2 className="text-sm font-black text-white leading-tight truncate">
                  PPE Operations
                </h2>
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-wider truncate">
                  {currentUser.role}
                </p>
              </div>
            </div>
          )}

          {isCollapsed && (
            <img
              src="/sankara-emblem.png"
              alt="Sankara"
              className="w-8 h-8 object-contain rounded-lg mx-auto bg-white p-0.5"
            />
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Quick Portal Switcher Button */}
        <div className="p-3">
          <button
            onClick={onBackToPortal}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700/80 text-xs font-bold text-slate-300 hover:text-white transition-all cursor-pointer ${
              isCollapsed ? 'justify-center px-2' : ''
            }`}
            title="Switch Workspace Portal"
          >
            <ArrowLeft className="w-4 h-4 text-orange-400 shrink-0" />
            {!isCollapsed && <span>Switch Portal (5S / PPE)</span>}
          </button>
        </div>

        {/* User Scope Banner (Unit Head) */}
        {currentUser.role === 'Unit Head' && currentUser.unitName && !isCollapsed && (
          <div className="mx-3 mb-2 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-[11px] text-orange-300">
            <p className="font-bold flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />
              <span>{currentUser.unitName}</span>
            </p>
          </div>
        )}

        {/* Navigation List */}
        <nav className="px-3 py-2 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-md shadow-orange-600/20'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                } ${isCollapsed ? 'justify-center px-2' : ''}`}
                title={item.label}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.count !== undefined && (
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.countColor || 'bg-slate-700 text-slate-300'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-500">
        {!isCollapsed ? (
          <div>
            <p className="font-bold text-slate-400 truncate">Sankara Operations</p>
            <p className="text-[10px] text-slate-600">v2.0 • PostgreSQL DB</p>
          </div>
        ) : (
          <div className="text-center">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" title="Online" />
          </div>
        )}
      </div>

    </aside>
  );
};
