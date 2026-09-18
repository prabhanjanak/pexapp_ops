import React, { useState, useMemo, useEffect } from 'react';
import { HospitalUnit, OpsTeamTab, AuditLog, Bottleneck, User } from '../types';
import { DashboardOverview } from './DashboardOverview';
import { UnitsManagementView } from './UnitsManagementView';
import { EvidenceApprovalGrid } from './EvidenceApprovalGrid';
import { UnitHeadView } from './UnitHeadView';
import { AddBottleneckModal } from './AddBottleneckModal';
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
  ArrowUpDown,
  Plus
} from 'lucide-react';

interface OperationsTeamViewProps {
  units: HospitalUnit[];
  activeTab: OpsTeamTab;
  onSelectUnitHead: (unitId: string) => void;
  onInitializeUnitAssessment: (unitId: string) => void;
  onUpdateBottleneck?: (unitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => void;
  onAddBottleneck?: (unitId: string, newBottleneck: Omit<Bottleneck, 'id' | 'lastUpdated'>) => void;
  onDeleteBottleneck?: (unitId: string, bottleneckId: string) => void;
  onRefreshUnits?: () => void;
  currentUser?: User;
}

export const OperationsTeamView: React.FC<OperationsTeamViewProps> = ({
  units,
  activeTab,
  onSelectUnitHead,
  onInitializeUnitAssessment,
  onUpdateBottleneck,
  onAddBottleneck,
  onDeleteBottleneck,
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
  const [isAddBottleneckModalOpen, setIsAddBottleneckModalOpen] = useState(false);
  const [viewScope, setViewScope] = useState<'active' | 'completed' | 'all'>(
    activeTab === 'completed' ? 'completed' : 'active'
  );

  useEffect(() => {
    if (activeTab === 'completed') setViewScope('completed');
    else if (activeTab === 'bottlenecks') setViewScope('active');
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'activity') {
      setLogsLoading(true);
      api.getAuditLogs()
        .then(setLogs)
        .catch(console.error)
        .finally(() => setLogsLoading(false));
    }
  }, [activeTab]);

  // Counts for Scope Pills
  const { totalCount, activeCount, completedCount } = useMemo(() => {
    let total = 0;
    let active = 0;
    let completed = 0;
    for (const u of units) {
      if (selectedUnitFilter !== 'ALL' && u.id !== selectedUnitFilter) continue;
      for (const b of u.bottlenecks) {
        total++;
        const norm = normalizeStatus(b.status, b.percentComplete);
        if (norm === 'Completed') completed++;
        else active++;
      }
    }
    return { totalCount: total, activeCount: active, completedCount: completed };
  }, [units, selectedUnitFilter]);

  // Flattened Bottlenecks for Network Active or Completed Tab
  const allBottlenecks = useMemo(() => {
    const list: { unit: HospitalUnit; bottleneck: Bottleneck }[] = [];
    for (const u of units) {
      for (const b of u.bottlenecks) {
        const norm = normalizeStatus(b.status, b.percentComplete);
        if (viewScope === 'active' && norm === 'Completed') continue;
        if (viewScope === 'completed' && norm !== 'Completed') continue;
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
  }, [units, viewScope, selectedUnitFilter, searchQuery, sortBy]);

  const handleStatusChange = (unitId: string, bottleneck: Bottleneck, targetStatus: BottleneckStatus) => {
    let newPercent = 0;
    if (targetStatus === 'Completed') newPercent = 100;
    else if (targetStatus === 'In progress') {
      newPercent = bottleneck.percentComplete > 0 && bottleneck.percentComplete < 100 ? bottleneck.percentComplete : 50;
    } else {
      newPercent = 0;
    }

    onUpdateBottleneck?.(unitId, bottleneck.id, {
      status: targetStatus,
      percentComplete: newPercent,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  const handlePercentChange = (unitId: string, bottleneck: Bottleneck, percent: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    let targetStatus: BottleneckStatus = 'In progress';
    if (clamped >= 100) targetStatus = 'Completed';
    else if (clamped <= 0) targetStatus = 'Pending';

    onUpdateBottleneck?.(unitId, bottleneck.id, {
      status: targetStatus,
      percentComplete: clamped,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

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
          onAddBottleneck={onAddBottleneck}
          onDeleteBottleneck={onDeleteBottleneck}
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
          onAddBottleneck={onAddBottleneck}
        />
      )}

      {/* 2. HOSPITAL UNITS (14) DIRECTORY & BENCHMARKING */}
      {activeTab === 'units' && (
        <UnitsManagementView
          units={units}
          currentUser={currentUser}
          onRefreshUnits={onRefreshUnits || (() => {})}
          onInspectUnit={(id) => setInspectedUnitId(id)}
          onAddBottleneck={onAddBottleneck}
        />
      )}

      {/* 3. ACTIVE BOTTLENECKS OR COMPLETED ARCHIVE */}
      {(activeTab === 'bottlenecks' || activeTab === 'completed') && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Header Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                    Operational Bottleneck Registry
                  </span>
                  <span className="text-xs text-slate-400">•</span>
                  <span className="text-xs font-bold text-slate-500">14 Hospital Units</span>
                </div>
                <h2 className="text-2xl font-black text-slate-900">
                  {viewScope === 'completed' ? 'Completed Bottlenecks Archive' : viewScope === 'all' ? 'All Operational Bottlenecks' : 'Network Active Bottlenecks'}
                </h2>
              </div>

              {/* View Scope Toggle */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => setViewScope('active')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewScope === 'active'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>⚡ Active</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    viewScope === 'active' ? 'bg-orange-700/50 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {activeCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewScope('completed')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewScope === 'completed'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>✅ Completed</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    viewScope === 'completed' ? 'bg-emerald-700/50 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {completedCount}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewScope('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer ${
                    viewScope === 'all'
                      ? 'bg-slate-800 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  <span>📋 All Items</span>
                  <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-black ${
                    viewScope === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {totalCount}
                  </span>
                </button>
              </div>
            </div>

            {/* Filter Bar & Add Action */}
            <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2.5 flex-1">
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

              {onAddBottleneck && (
                <button
                  type="button"
                  id="ops-add-bottleneck-btn"
                  onClick={() => setIsAddBottleneckModalOpen(true)}
                  className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-600/20 hover:scale-[1.02] transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Bottleneck</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottlenecks List */}
          {allBottlenecks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-900">
                {viewScope === 'completed' ? 'No Completed Bottlenecks in Archive' : 'No Bottlenecks Matching Filter'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {viewScope === 'active' ? 'All bottlenecks in this view are completed or no bottlenecks recorded yet.' : 'Try changing your search filter or view scope.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {allBottlenecks.map(({ unit, bottleneck }) => {
                const badge = getStatusBadgeStyle(bottleneck.status);
                const impactBadge = getImpactBadgeStyle(bottleneck.impactLevel);
                const commentsCount = (bottleneck.comments || []).length;
                const norm = normalizeStatus(bottleneck.status, bottleneck.percentComplete);

                return (
                  <div
                    key={bottleneck.id}
                    className="bg-white border border-slate-200 hover:border-orange-200 rounded-2xl p-5 shadow-xs transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
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
                        {norm === 'Completed' && (
                          <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                            ✓ RESOLVED
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-900">{bottleneck.title}</h4>
                      {bottleneck.notes && <p className="text-xs text-slate-600">{bottleneck.notes}</p>}

                      <div className="flex items-center gap-3 pt-1 flex-wrap">
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

                    {/* Interactive Status & Progress Controls */}
                    <div className="min-w-[240px] space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                      <div className="flex items-center justify-between gap-2">
                        <select
                          value={norm}
                          onChange={(e) => handleStatusChange(unit.id, bottleneck, e.target.value as BottleneckStatus)}
                          className={`text-xs font-black px-2.5 py-1 rounded-lg border focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer ${
                            norm === 'Completed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : norm === 'In progress'
                              ? 'bg-blue-50 text-blue-800 border-blue-300'
                              : 'bg-amber-50 text-amber-800 border-amber-300'
                          }`}
                        >
                          <option value="Pending">Pending (0%)</option>
                          <option value="In progress">In progress</option>
                          <option value="Completed">Completed (100%)</option>
                        </select>

                        <span className="text-xs font-black text-slate-700">
                          {bottleneck.percentComplete}%
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${bottleneck.percentComplete}%` }}
                          className={`h-full transition-all duration-300 ${
                            norm === 'Completed'
                              ? 'bg-emerald-500'
                              : norm === 'In progress'
                              ? 'bg-blue-500'
                              : 'bg-amber-500'
                          }`}
                        />
                      </div>

                      {/* Quick Percentage Adjusters */}
                      <div className="flex items-center justify-between gap-1 pt-0.5">
                        {[0, 25, 50, 75, 100].map((pct) => (
                          <button
                            key={pct}
                            type="button"
                            onClick={() => handlePercentChange(unit.id, bottleneck, pct)}
                            className={`px-1.5 py-0.5 text-[10px] font-black rounded transition-all cursor-pointer ${
                              bottleneck.percentComplete === pct
                                ? 'bg-orange-600 text-white shadow-xs'
                                : 'bg-white text-slate-600 hover:bg-orange-100 hover:text-orange-900 border border-slate-200'
                            }`}
                          >
                            {pct}%
                          </button>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-medium pt-1 border-t border-slate-200/50">
                        <span>Owner: {bottleneck.owner || 'Unit Team'}</span>
                        <span>{bottleneck.lastUpdated ? `Updated: ${bottleneck.lastUpdated}` : ''}</span>
                      </div>
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

      {/* Add Bottleneck Modal */}
      {isAddBottleneckModalOpen && (
        <AddBottleneckModal
          isOpen={isAddBottleneckModalOpen}
          onClose={() => setIsAddBottleneckModalOpen(false)}
          units={units}
          defaultUnitId={selectedUnitFilter !== 'ALL' ? selectedUnitFilter : units[0]?.id}
          onAdd={(newB, targetUnitId) => {
            const destUnit = targetUnitId || (selectedUnitFilter !== 'ALL' ? selectedUnitFilter : units[0]?.id);
            if (destUnit && onAddBottleneck) {
              onAddBottleneck(destUnit, newB);
            }
            setIsAddBottleneckModalOpen(false);
          }}
        />
      )}

    </div>
  );
};
