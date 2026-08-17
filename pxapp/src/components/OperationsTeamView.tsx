import React, { useState, useMemo, useEffect } from 'react';
import { HospitalUnit, OpsTeamTab, AuditLog, Bottleneck } from '../types';
import { LeadershipView } from './LeadershipView';
import { EvidenceApprovalGrid } from './EvidenceApprovalGrid';
import { UnitHeadView } from './UnitHeadView';
import { api } from '../services/api';
import { CATEGORIES } from '../data/seedData';
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
  Camera
} from 'lucide-react';

interface OperationsTeamViewProps {
  units: HospitalUnit[];
  activeTab: OpsTeamTab;
  onSelectUnitHead: (unitId: string) => void;
  onInitializeUnitAssessment: (unitId: string) => void;
  onUpdateBottleneck?: (unitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => void;
}

export const OperationsTeamView: React.FC<OperationsTeamViewProps> = ({
  units,
  activeTab,
  onSelectUnitHead,
  onInitializeUnitAssessment,
  onUpdateBottleneck
}) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [inspectedUnitId, setInspectedUnitId] = useState<string | null>(null);

  useEffect(() => {
    if (activeTab === 'activity') {
      setLogsLoading(true);
      api.getAuditLogs()
        .then(setLogs)
        .catch(console.error)
        .finally(() => setLogsLoading(false));
    }
  }, [activeTab]);

  // Aggregate Category Analytics across all 14 units for Tab 2
  const categoryHeatmap = useMemo(() => {
    const map = new Map<string, { total: number; completed: number; inProgress: number; notStarted: number; unitsCount: Set<string> }>();

    for (const u of units) {
      for (const b of u.bottlenecks) {
        if (!map.has(b.category)) {
          map.set(b.category, { total: 0, completed: 0, inProgress: 0, notStarted: 0, unitsCount: new Set() });
        }
        const row = map.get(b.category)!;
        row.total++;
        row.unitsCount.add(u.id);
        if (b.status === 'Completed') row.completed++;
        else if (b.status === 'In Progress') row.inProgress++;
        else row.notStarted++;
      }
    }

    return Array.from(map.entries()).map(([category, stats]) => ({
      category,
      total: stats.total,
      completed: stats.completed,
      inProgress: stats.inProgress,
      notStarted: stats.notStarted,
      affectedUnits: stats.unitsCount.size,
      resolutionRate: Math.round((stats.completed / (stats.total || 1)) * 100)
    })).sort((a, b) => b.total - a.total);
  }, [units]);

  // Compliance & Target Date Tracker for Tab 3
  const complianceItems = useMemo(() => {
    const list: {
      unitName: string;
      unitCity: string;
      unitId: string;
      title: string;
      category: string;
      status: string;
      percentComplete: number;
      targetDate: string;
      impactLevel: string;
      isOverdue: boolean;
      owner: string;
    }[] = [];

    const todayStr = new Date().toISOString().split('T')[0];

    for (const u of units) {
      for (const b of u.bottlenecks) {
        const isOverdue = Boolean(b.targetDate && b.targetDate < todayStr && b.status !== 'Completed');
        list.push({
          unitName: u.name,
          unitCity: u.city,
          unitId: u.id,
          title: b.title,
          category: b.category,
          status: b.status,
          percentComplete: b.percentComplete,
          targetDate: b.targetDate || 'Pending Date',
          impactLevel: b.impactLevel || 'Medium',
          isOverdue,
          owner: b.owner
        });
      }
    }

    return list.sort((a, b) => (b.isOverdue ? 1 : 0) - (a.isOverdue ? 1 : 0));
  }, [units]);

  const overdueCount = complianceItems.filter((i) => i.isOverdue).length;

  return (
    <div className="space-y-6">
      
      {/* TAB 1: NETWORK EXECUTIVE DASHBOARD OR VIEW-ONLY UNIT HEAD WORKSPACE */}
      {activeTab === 'dashboard' && (
        inspectedUnitId ? (
          <UnitHeadView
            units={units}
            selectedUnitId={inspectedUnitId}
            onSelectUnit={setInspectedUnitId}
            currentUser={{
              id: 'user-opsteam',
              name: 'Central Operations Directorate',
              email: 'ops@sankara.org',
              role: 'Operations Team',
              avatarInitials: 'OP'
            }}
            activeTab="bottlenecks"
            viewOnly={true}
            allowUnitSwitch={true}
            onBackToDashboard={() => setInspectedUnitId(null)}
          />
        ) : (
          <LeadershipView
            units={units}
            onSelectUnitHead={(unitId) => setInspectedUnitId(unitId)}
            onInitializeUnitAssessment={onInitializeUnitAssessment}
          />
        )
      )}

      {/* TAB: EVIDENCE & BEFORE/AFTER PHOTO APPROVALS */}
      {activeTab === 'evidence' && (
        <EvidenceApprovalGrid
          units={units}
          onUpdateBottleneck={onUpdateBottleneck}
        />
      )}

      {/* TAB 2: CATEGORY HEATMAP & TRENDS */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <Layers className="w-5 h-5 text-orange-600" />
                  Network-Wide Clinical Category Heatmap
                </h3>
                <p className="text-xs text-slate-500">
                  Cross-unit bottleneck aggregation across all 14 Sankara Eye Hospital centers
                </p>
              </div>
              <span className="px-3.5 py-1 rounded-full text-xs font-black bg-orange-50 text-orange-800 border border-orange-200">
                15 Clinical & PX Categories
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryHeatmap.map((item) => (
                <div
                  key={item.category}
                  className="bg-slate-50/70 p-4 rounded-2xl border border-slate-200 hover:border-orange-300 hover:bg-white transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                      {item.category}
                    </h4>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-white text-orange-600 border border-slate-200 shrink-0">
                      {item.total} Total
                    </span>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Network Resolution Rate</span>
                      <span className="font-black text-orange-600">{item.resolutionRate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all"
                        style={{ width: `${item.resolutionRate}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600 border-t border-slate-200/60">
                    <span>Active in <strong className="text-slate-900">{item.affectedUnits}</strong> units</span>
                    <span className="font-extrabold text-emerald-700">{item.completed} Resolved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUALITY COMPLIANCE & TARGET DATES */}
      {activeTab === 'compliance' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  Target Date Compliance & Escalation Tracker
                </h3>
                <p className="text-xs text-slate-500">
                  Monitoring timeline resolution SLAs across all hospital units
                </p>
              </div>

              {overdueCount > 0 && (
                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1.5 shrink-0">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                  {overdueCount} Overdue Items
                </span>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                    <th className="py-3 px-4 pl-6">Hospital Unit</th>
                    <th className="py-3 px-4">Bottleneck Title</th>
                    <th className="py-3 px-4">Status & %</th>
                    <th className="py-3 px-4">Target Date</th>
                    <th className="py-3 px-4">Responsible Owner</th>
                    <th className="py-3 px-4 pr-6 text-right">SLA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-xs sm:text-sm">
                  {complianceItems.slice(0, 20).map((item, idx) => (
                    <tr key={idx} className="hover:bg-orange-50/20 transition-colors">
                      <td className="py-3.5 px-4 pl-6 font-bold text-slate-900 whitespace-nowrap">
                        {item.unitName}
                        <span className="text-[11px] font-normal text-slate-500 block">{item.unitCity}</span>
                      </td>

                      <td className="py-3.5 px-4 max-w-xs">
                        <span className="font-bold text-slate-900 block">{item.title}</span>
                        <span className="text-[11px] text-slate-500">{item.category}</span>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-900">{item.percentComplete}%</span>
                          <span className="text-[11px] text-slate-500">({item.status})</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                        {item.targetDate}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-600 font-medium">
                        {item.owner}
                      </td>

                      <td className="py-3.5 px-4 pr-6 text-right whitespace-nowrap">
                        {item.status === 'Completed' ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200">
                            ✓ Resolved
                          </span>
                        ) : item.isOverdue ? (
                          <span className="px-2.5 py-1 rounded-full text-xs font-black bg-rose-50 text-rose-800 border border-rose-200">
                            ⚠ Overdue SLA
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            On Track
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE ACTIVITY FEED */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <History className="w-5 h-5 text-orange-600" />
                Live Network Activity Stream
              </h3>
              <p className="text-xs text-slate-500">
                Chronological stream of bottleneck creations, % updates, and resolutions by Unit Heads
              </p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-slate-100 text-slate-700">
              {logs.length} Recent Actions
            </span>
          </div>

          {logsLoading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              Loading latest activity stream...
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No activity logs recorded yet.
            </div>
          ) : (
            <div className="space-y-3">
              {logs.map((l) => (
                <div key={l.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-orange-100 text-orange-800">
                        {l.action}
                      </span>
                      <span className="font-extrabold text-xs text-slate-900">{l.unitName || 'System'}</span>
                      <span className="text-[11px] text-slate-400">by {l.userRole}</span>
                    </div>
                    {l.bottleneckTitle && (
                      <p className="text-xs font-semibold text-slate-700">{l.bottleneckTitle}</p>
                    )}
                  </div>
                  <span className="text-xs text-slate-400 whitespace-nowrap shrink-0">
                    {new Date(l.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
