import React, { useState, useMemo, useEffect } from 'react';
import { HospitalUnit, OpsTeamTab, AuditLog, Bottleneck, User } from '../types';
import { DashboardOverview } from './DashboardOverview';
import { UnitsManagementView } from './UnitsManagementView';
import { EvidenceApprovalGrid } from './EvidenceApprovalGrid';
import { UnitHeadView } from './UnitHeadView';
import { CategoryDeptManager } from './CategoryDeptManager';
import { BottleneckCommentModal } from './BottleneckCommentModal';
import { api } from '../services/api';
import { calculateUnitStats, getStatusBadgeStyle, getImpactBadgeStyle, normalizeStatus } from '../utils/calc';
import {
  TrendingUp,
  Layers,
  CheckCircle2,
  History,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  Sparkles,
  ShieldAlert,
  ArrowUpRight,
  Filter,
  Camera,
  Activity,
  MessageSquare,
  ArrowLeft,
  Search,
  ArrowUpDown
} from 'lucide-react';

interface OperationsTeamViewProps {
  units: HospitalUnit[];
  activeTab: OpsTeamTab;
  onSelectUnitHead: (unitId: string) => void;
  onInitializeUnitAssessment: (unitId: string) => void;
  onUpdateBottleneck?: (unitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => void;
  onRefreshUnits?: () => void;
  currentUser?: User;
}

export const OperationsTeamView: React.FC<OperationsTeamViewProps> = ({
  units,
  activeTab,
  onSelectUnitHead,
  onInitializeUnitAssessment,
  onUpdateBottleneck,
  onRefreshUnits,
  currentUser = {
    id: 'user-opsteam',
    name: 'Central Operations Directorate',
    email: 'ops@sankara.org',
    role: 'Operations Team',
    avatarInitials: 'OP'
  }
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [inspectedUnitId, setInspectedUnitId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'targetDate' | 'impact'>('newest');
  const [activeCommentBottleneck, setActiveCommentBottleneck] = useState<{ unitId: string; bottleneck: Bottleneck } | null>(null);

  useEffect(() => {
    if (activeTab === 'activity') {
      setLogsLoading(true);
      api.getAuditLogs()
        .then(setLogs)
        .catch(console.error)
        .finally(() => setLogsLoading(false));
    }
  }, [activeTab]);

  // Flattened Bottlenecks for Network Active or Completed Tab
  const allBottlenecks = useMemo(() => {
    const list: { unit: HospitalUnit; bottleneck: Bottleneck }[] = [];
    for (const u of units) {
      for (const b of u.bottlenecks) {
        const norm = normalizeStatus(b.status);
        if (activeTab === 'bottlenecks' && norm === 'Completed') continue;
        if (activeTab === 'completed' && norm !== 'Completed') continue;
        if (selectedUnitFilter !== 'ALL' && u.id !== selectedUnitFilter) continue;

        const q = searchQuery.toLowerCase();
        if (
          q &&
          !b.title.toLowerCase().includes(q) &&
          !b.category.toLowerCase().includes(q) &&
          !u.name.toLowerCase().includes(q) &&
          !b.owner.toLowerCase().includes(q)
        ) {
          continue;
        }

        list.push({ unit: u, bottleneck: b });
      }
    }

    return list.sort((a, b) => {
      if (sortBy === 'newest') return (b.bottleneck.id || '').localeCompare(a.bottleneck.id || '');
      if (sortBy === 'targetDate') return (a.bottleneck.targetDate || '9999').localeCompare(b.bottleneck.targetDate || '9999');
      const imp: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      return (imp[b.bottleneck.impactLevel || 'Medium'] || 2) - (imp[a.bottleneck.impactLevel || 'Medium'] || 2);
    });
  }, [units, activeTab, selectedUnitFilter, searchQuery, sortBy]);

  // If inspecting a specific unit drilldown, render UnitHeadView
  if (inspectedUnitId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setInspectedUnitId(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-orange-600" />
            <span>← Back to Operations Overview</span>
          </button>

          <span className="text-xs font-semibold text-slate-500">
            Inspection Mode • Central Operations Directorate
          </span>
        </div>

        <UnitHeadView
          units={units}
          selectedUnitId={inspectedUnitId}
          currentUser={currentUser}
          activeTab="bottlenecks"
          onUpdateBottleneck={onUpdateBottleneck}
          viewOnly={false}
          onBackToDashboard={() => setInspectedUnitId(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* 1. DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <DashboardOverview
          units={units}
          currentUser={currentUser}
          onSelectUnit={(id) => setInspectedUnitId(id)}
        />
      )}

      {/* 2. HOSPITAL UNITS (14) DIRECTORY & BENCHMARKING */}
      {activeTab === 'units' && (
        <UnitsManagementView
          units={units}
          currentUser={currentUser}
          onRefreshUnits={onRefreshUnits || (() => {})}
          onInspectUnit={(id) => setInspectedUnitId(id)}
        />
      )}

      {/* 3. ACTIVE BOTTLENECKS OR COMPLETED ARCHIVE */}
      {(activeTab === 'bottlenecks' || activeTab === 'completed') && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                  {activeTab === 'completed' ? 'Resolved Archive' : 'Active Operational Registry'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-500">14 Hospital Units</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {activeTab === 'completed' ? 'Completed Bottlenecks Archive' : 'Network Active Bottlenecks'}
              </h2>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search title, category, owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <select
                value={selectedUnitFilter}
                onChange={(e) => setSelectedUnitFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500"
              >
                <option value="ALL">All Hospital Units (14)</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="targetDate">Sort: Target Date</option>
                <option value="impact">Sort: Impact Level</option>
              </select>
            </div>
          </div>

          {/* Bottlenecks List */}
          {allBottlenecks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-900">
                {activeTab === 'completed' ? 'No Completed Bottlenecks in Archive' : 'No Active Bottlenecks Matching Filter'}
              </h3>
            </div>
          ) : (
            <div className="space-y-3">
              {allBottlenecks.map(({ unit, bottleneck }) => {
                const badge = getStatusBadgeStyle(bottleneck.status);
                const impactBadge = getImpactBadgeStyle(bottleneck.impactLevel);
                const commentsCount = (bottleneck.comments || []).length;

                return (
                  <div
                    key={bottleneck.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                          {unit.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-800 border border-orange-200">
                          {bottleneck.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${impactBadge}`}>
                          {bottleneck.impactLevel || 'Medium'} Impact
                        </span>
                        {bottleneck.targetDate && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            🎯 Deadline: {bottleneck.targetDate}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-900">{bottleneck.title}</h4>
                      {bottleneck.notes && <p className="text-xs text-slate-600">{bottleneck.notes}</p>}

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => setActiveCommentBottleneck({ unitId: unit.id, bottleneck })}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-xs font-bold text-slate-700 hover:text-orange-700 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                          <span>Management Directives</span>
                          {commentsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-orange-600 text-white text-[10px] font-black">
                              {commentsCount}
                            </span>
                          )}
                        </button>

                        <button
                          onClick={() => setInspectedUnitId(unit.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          <span>Inspect Unit Workspace</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="min-w-[170px] space-y-1.5">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black border ${badge.badge}`}>
                        {badge.label} ({bottleneck.percentComplete}%)
                      </span>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div style={{ width: `${bottleneck.percentComplete}%` }} className={`h-full ${badge.bar}`} />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Owner: {bottleneck.owner}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 4. EVIDENCE APPROVALS TAB */}
      {activeTab === 'evidence' && (
        <EvidenceApprovalGrid
          units={units}
          onUpdateBottleneck={onUpdateBottleneck}
          currentUserRole={currentUser.role}
        />
      )}

      {/* 5. CATEGORIES & DEPARTMENTS MANAGEMENT TAB */}
      {activeTab === 'categories' && (
        <CategoryDeptManager
          currentUser={currentUser}
          onToast={(msg) => console.log(msg)}
        />
      )}

      {/* 6. REAL-TIME AUDIT LOG FEED */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <History className="w-5 h-5 text-orange-600" />
            <h3 className="text-lg font-black text-slate-900">Hospital Operational Audit Log</h3>
          </div>

          {logsLoading ? (
            <p className="text-xs text-slate-400 py-6 text-center">Loading audit records...</p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {logs.map((l) => (
                <div key={l.id} className="py-3 flex items-start justify-between gap-4">
                  <div>
                    <span className="font-bold text-slate-800">{l.action}</span>
                    <span className="text-slate-400 ml-2">• {l.userRole}</span>
                    <p className="text-slate-500 mt-0.5">{JSON.stringify(l.details)}</p>
                  </div>
                  <span className="text-slate-400 shrink-0 text-[10px]">
                    {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Comments Modal */}
      {activeCommentBottleneck && (
        <BottleneckCommentModal
          isOpen={Boolean(activeCommentBottleneck)}
          onClose={() => setActiveCommentBottleneck(null)}
          bottleneck={activeCommentBottleneck.bottleneck}
          currentUser={currentUser}
          onCommentAdded={(updated) => {
            onUpdateBottleneck?.(activeCommentBottleneck.unitId, updated.id, updated);
            setActiveCommentBottleneck({ unitId: activeCommentBottleneck.unitId, bottleneck: updated });
          }}
        />
      )}

    </div>
  );
};
