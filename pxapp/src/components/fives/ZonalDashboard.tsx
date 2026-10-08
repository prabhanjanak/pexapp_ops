import React, { useState } from 'react';
import { FiveSUser, FiveSUnitConfig, FiveSNonConformity, FiveSAudit } from './types';
import {
  MapPin,
  Lock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Send,
  MessageSquare,
  ShieldCheck,
  Eye,
  Camera,
  Check,
  X,
  TrendingUp,
  BarChart2,
  Calendar,
  Layers,
  Sparkles
} from 'lucide-react';

import { NcReviewSection } from './NcReviewSection';

interface ZonalDashboardProps {
  currentUser: FiveSUser;
  units: FiveSUnitConfig[];
  audits: FiveSAudit[];
  ncs: FiveSNonConformity[];
  onUpdateNc: (ncId: string, updates: Partial<FiveSNonConformity>) => void;
  onGoReports: () => void;
}

export const ZonalDashboard: React.FC<ZonalDashboardProps> = ({
  currentUser,
  units,
  audits,
  ncs,
  onUpdateNc,
  onGoReports
}) => {
  // Strict Scope: Assigned Zone Only (e.g. Zone 1 of CBE)
  const targetUnit = currentUser.unit || 'CBE';
  const targetZone = currentUser.zone || 'Zone 1';

  const unitConfig = units.find((u) => u.code === targetUnit) || units[0];
  const departmentsInZone = unitConfig.zones[targetZone] || [];

  // Filter NCs for this specific zone
  const zoneNcs = ncs.filter(
    (n) => n.unit === targetUnit && n.zone.toLowerCase() === targetZone.toLowerCase()
  );

  const openNcs = zoneNcs.filter((n) => n.status !== 'Closed');
  const closedNcs = zoneNcs.filter((n) => n.status === 'Closed');

  const [activeTab, setActiveTab] = useState<'departments' | 'ncs' | 'performance'>('departments');

  // Department Audit Status Mapping
  const deptStatuses = departmentsInZone.map((deptName) => {
    const match = audits.find(
      (a) => a.unit === targetUnit && a.zone === targetZone && a.department === deptName
    );
    const deptAllNcs = zoneNcs.filter((n) => n.department === deptName);
    const deptOpenNcs = deptAllNcs.filter((n) => n.status !== 'Closed');
    const deptClosedNcs = deptAllNcs.filter((n) => n.status === 'Closed');
    const hasSubmittedAfter = deptOpenNcs.some((n) => n.status === 'Submitted for Verification');

    return {
      name: deptName,
      isAudited: !!match,
      score: match ? match.compliancePercent : null,
      lastAuditDate: match ? match.auditDate : 'Pending Audit',
      openNcs: deptOpenNcs.length,
      closedNcs: deptClosedNcs.length,
      hasSubmittedAfter,
      deptNcs: deptAllNcs
    };
  });

  const auditedCount = deptStatuses.filter((d) => d.isAudited).length;
  const pendingCount = departmentsInZone.length - auditedCount;
  const auditedPct = Math.round((auditedCount / (departmentsInZone.length || 1)) * 100);

  const zoneCompliance = Math.round(
    deptStatuses
      .filter((d) => d.score !== null)
      .reduce((sum, d) => sum + (d.score || 0), 0) / (auditedCount || 1)
  ) || 85;

  const monthsTrend = [
    { m: 'Jan', val: 72 },
    { m: 'Feb', val: 75 },
    { m: 'Mar', val: 74 },
    { m: 'Apr', val: 78 },
    { m: 'May', val: 80 },
    { m: 'Jun', val: 82 },
    { m: 'Jul', val: 83 },
    { m: 'Aug', val: 85 },
    { m: 'Sep', val: 86 }
  ];

  const elements = [
    { k: '1S – Sort', short: '1S', score: 88 },
    { k: '2S – Set in Order', short: '2S', score: 84 },
    { k: '3S – Shine', short: '3S', score: 82 },
    { k: '4S – Standardize', short: '4S', score: 85 },
    { k: '5S – Sustain', short: '5S', score: 86 }
  ];

  // Radar Polygon Points Generator
  const cx = 130, cy = 130, maxR = 85;
  const n = elements.length;
  const step = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;
  const getPt = (i: number, r: number) => [
    cx + r * Math.cos(startAngle + i * step),
    cy + r * Math.sin(startAngle + i * step)
  ];

  const radarPolygonPoints = elements
    .map((e, i) => getPt(i, maxR * (e.score / 100)).join(','))
    .join(' ');

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Scope Restriction Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50 border border-orange-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-orange-950 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-orange-900">Isolated Zonal Scope:</span>{' '}
            <span className="font-extrabold text-orange-800">{targetZone}</span> • {unitConfig.name} ({targetUnit}) —{' '}
            <span className="text-orange-700">{departmentsInZone.length} Clinical & Operational Areas</span>
          </div>
        </div>
        <div className="text-[11px] font-black uppercase tracking-wider text-orange-800 bg-white/80 px-3 py-1 rounded-full border border-orange-300 shadow-2xs shrink-0">
          Zonal In-Charge Authority
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Departments</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-700"><Building2 className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">{departmentsInZone.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Under {targetZone} Scope</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audits Completed</span>
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 mt-2">
            {auditedCount} <span className="text-sm font-bold text-slate-400">/ {departmentsInZone.length}</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">{auditedPct}% Monthly Coverage</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Audits</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Clock className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 mt-2">{pendingCount}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Requires Scheduling</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Zone NCs</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 mt-2">{openNcs.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">{closedNcs.length} Closed</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zone Score</span>
            <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-orange-600 mt-2">{zoneCompliance}%</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Rolling 30-Day Avg</div>
        </div>
      </div>

      {/* Navigation Pill Tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3 border-b border-slate-200 pb-3">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'departments'
                ? 'bg-white text-orange-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Department Audit Status ({departmentsInZone.length})
          </button>

          <button
            onClick={() => setActiveTab('ncs')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'ncs'
                ? 'bg-white text-orange-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Zone Non-Conformities ({openNcs.length} Open)
          </button>

          <button
            onClick={() => setActiveTab('performance')}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'performance'
                ? 'bg-white text-orange-800 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Zone Performance & Radar
          </button>
        </div>

        <button
          onClick={onGoReports}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs"
        >
          <BarChart2 className="w-3.5 h-3.5 text-slate-600" />
          <span>View Detailed Zone Reports</span>
        </button>
      </div>

      {/* TAB 1: DEPARTMENTS STATUS */}
      {activeTab === 'departments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                All {departmentsInZone.length} Departments Under {targetZone} — {unitConfig.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Department-wise audit completion, scores, open/closed NCs, corrective and preventive actions, and before/after status.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                {auditedCount} Completed
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                {pendingCount} Pending
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Department / Clinical Area</th>
                  <th className="py-3 px-4">Audit Status</th>
                  <th className="py-3 px-4">5S Score</th>
                  <th className="py-3 px-4">Open NCs</th>
                  <th className="py-3 px-4">Closed NCs</th>
                  <th className="py-3 px-4">Before & After Status</th>
                  <th className="py-3 px-4">Last Audited</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptStatuses.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{d.name}</td>
                    
                    {/* Audit Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        d.isAudited
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {d.isAudited ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {d.isAudited ? 'Completed' : 'Pending'}
                      </span>
                    </td>

                    {/* 5S Score */}
                    <td className="py-3.5 px-4 font-bold">
                      {d.score !== null ? (
                        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                          {d.score}%
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">—</span>
                      )}
                    </td>

                    {/* Open NCs */}
                    <td className="py-3.5 px-4">
                      {d.openNcs > 0 ? (
                        <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-xs">
                          {d.openNcs} Open
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs">
                          0
                        </span>
                      )}
                    </td>

                    {/* Closed NCs */}
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                        {d.closedNcs} Closed
                      </span>
                    </td>

                    {/* Before & After Status */}
                    <td className="py-3.5 px-4">
                      {d.hasSubmittedAfter ? (
                        <span className="font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full text-[11px]">
                          Evidence Submitted
                        </span>
                      ) : d.openNcs > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-[11px]">
                          Action In Progress
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-[11px]">
                          All Standards Met
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-500 font-medium">{d.lastAuditDate}</td>

                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveTab('ncs')}
                        className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-orange-500 text-orange-700 hover:bg-orange-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        Review NCs
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ZONE NON-CONFORMITIES REVIEW & CLOSURE */}
      {activeTab === 'ncs' && (
        <NcReviewSection
          currentUser={currentUser}
          ncs={zoneNcs}
          onUpdateNc={onUpdateNc}
          title={`Zone NC Review & Closure — ${targetZone}`}
          subtitle={`Review department corrective and preventive actions, evaluate before & after comparison, request clarifications or supporting photos, and track formal closure status.`}
        />
      )}

      {/* TAB 3: ZONE PERFORMANCE & RADAR & MONTH-ON-MONTH TREND */}
      {activeTab === 'performance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Overall Zone Performance & Month-on-Month Trend — {targetZone} ({unitConfig.name})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                5S element radar balance and continuous improvement trend across all {departmentsInZone.length} departments.
              </p>
            </div>
            <span className="text-xs font-black text-orange-800 bg-orange-100 px-3 py-1 rounded-xl">
              Average Zone Compliance: {zoneCompliance}%
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Radar Preview */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50/70 rounded-2xl border border-slate-200">
              <span className="text-xs font-extrabold text-slate-800 mb-2">
                5S Pillar Radar Balance ({targetZone})
              </span>
              <svg viewBox="0 0 260 260" className="w-56 h-56">
                {[0.25, 0.5, 0.75, 1].map((f) => (
                  <polygon
                    key={f}
                    points={elements.map((_, i) => getPt(i, maxR * f).join(',')).join(' ')}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                ))}
                {elements.map((_, i) => {
                  const [x, y] = getPt(i, maxR);
                  return (
                    <line
                      key={i}
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke="#cbd5e1"
                      strokeWidth="1"
                    />
                  );
                })}
                <polygon
                  points={radarPolygonPoints}
                  fill="#ea580c"
                  fillOpacity="0.22"
                  stroke="#ea580c"
                  strokeWidth="2.5"
                />
                {elements.map((e, i) => {
                  const [x, y] = getPt(i, maxR * (e.score / 100));
                  const [lx, ly] = getPt(i, maxR + 18);
                  return (
                    <g key={e.short}>
                      <circle cx={x} cy={y} r="3.5" fill="#ea580c" />
                      <text
                        x={lx}
                        y={ly}
                        fontSize="11"
                        fontWeight="800"
                        fill="#0f172a"
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        {e.short}
                      </text>
                    </g>
                  );
                })}
              </svg>
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 mt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                  Achieved: {zoneCompliance}%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  Standard Target: 100%
                </span>
              </div>
            </div>

            {/* Month-on-Month Trend Bar Graph */}
            <div className="flex flex-col justify-between p-6 bg-slate-50/70 rounded-2xl border border-slate-200">
              <div>
                <h4 className="text-xs font-bold text-slate-900 mb-1">
                  Month-on-Month Zonal Compliance Trend (2026)
                </h4>
                <p className="text-[11px] text-slate-500 mb-4 font-medium">
                  Continuous improvement progression across auditing cycles
                </p>
              </div>

              <div className="flex items-end gap-2.5 h-44 pt-4">
                {monthsTrend.map((m, idx) => (
                  <div key={m.m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className="text-[9px] font-bold text-slate-500">{m.val}%</span>
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        idx === monthsTrend.length - 1
                          ? 'bg-gradient-to-t from-orange-600 to-amber-500 shadow-sm'
                          : 'bg-orange-300 hover:bg-orange-400'
                      }`}
                      style={{ height: `${(m.val / 100) * 100}%` }}
                    />
                    <span className="text-[10px] font-bold text-slate-700">{m.m}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
