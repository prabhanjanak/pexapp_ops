import React, { useState } from 'react';
import { FiveSUser, FiveSUnitConfig, FiveSAudit, FiveSNonConformity } from './types';
import { Record5SAuditModal } from './Record5SAuditModal';
import {
  Building2,
  Lock,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  Award,
  Layers,
  BarChart2,
  Camera,
  Calendar,
  ChevronRight,
  ShieldCheck,
  Check,
  Plus,
  Sparkles,
  ClipboardCheck
} from 'lucide-react';

interface UnitHeadDashboardProps {
  currentUser: FiveSUser;
  units: FiveSUnitConfig[];
  audits: FiveSAudit[];
  ncs: FiveSNonConformity[];
  onGoReports: () => void;
  onAuditSubmitted?: (audit: FiveSAudit, newNcs: FiveSNonConformity[]) => void;
}

export const UnitHeadDashboard: React.FC<UnitHeadDashboardProps> = ({
  currentUser,
  units,
  audits,
  ncs,
  onGoReports,
  onAuditSubmitted
}) => {
  // Strict Scope: Own Unit Only
  const targetUnitCode = currentUser.unit || 'CBE';
  const unitConfig = units.find((u) => u.code === targetUnitCode) || units[0];

  const zoneNames = Object.keys(unitConfig.zones);
  const [selectedZone, setSelectedZone] = useState<string>(zoneNames[0] || 'Zone 1');
  const [selectedMonth, setSelectedMonth] = useState<string>('Oct');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Modal State for adding 5S audits & points
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Filter unit's NCs and audits
  const unitNcs = ncs.filter((n) => n.unit === targetUnitCode);
  const openNcs = unitNcs.filter((n) => n.status !== 'Closed');
  const closedNcs = unitNcs.filter((n) => n.status === 'Closed');

  const unitAudits = audits.filter((a) => a.unit === targetUnitCode);

  // Calculate dynamic Zone scores & audit completion
  const totalDepts = zoneNames.reduce((acc, z) => acc + (unitConfig.zones[z]?.length || 0), 0);

  const zoneStats = zoneNames.map((zName) => {
    const depts = unitConfig.zones[zName] || [];
    const zoneNcsCount = unitNcs.filter(
      (n) => n.zone.toLowerCase() === zName.toLowerCase() && n.status !== 'Closed'
    ).length;

    // Check actual audits for this zone
    const matchingAudits = unitAudits.filter(
      (a) => a.zone.toLowerCase() === zName.toLowerCase()
    );

    let pct = 75;
    if (matchingAudits.length > 0) {
      const sum = matchingAudits.reduce((acc, a) => acc + a.compliancePercent, 0);
      pct = Math.round(sum / matchingAudits.length);
    } else {
      const basePcts: Record<string, number> = {
        'Zone 1': 85,
        'Zone 2': 71,
        'Zone 3': 64,
        'Zone 4': 94,
        'Zone 5': 78,
        'Zone 6': 82,
        'Zone 7': 69
      };
      pct = basePcts[zName] || 75;
    }

    return {
      name: zName,
      deptCount: depts.length,
      compliance: pct,
      openNcs: zoneNcsCount,
      auditedCount: matchingAudits.length
    };
  });

  const completedDepts = Math.min(
    totalDepts,
    Math.max(Math.round(totalDepts * 0.78), unitAudits.length)
  );
  const pendingDepts = Math.max(0, totalDepts - completedDepts);

  // Selected Zone Elements
  const selectedZoneAudits = unitAudits.filter(
    (a) => a.zone.toLowerCase() === selectedZone.toLowerCase()
  );
  const latestZoneAudit = selectedZoneAudits[0];

  const elements = [
    { k: '1S – Sort (Seiri)', short: '1S', score: latestZoneAudit ? Math.round(18 * (latestZoneAudit.compliancePercent / 100)) : 16, max: 18 },
    { k: '2S – Set in Order (Seiton)', short: '2S', score: latestZoneAudit ? Math.round(24 * (latestZoneAudit.compliancePercent / 100)) : 21, max: 24 },
    { k: '3S – Shine (Seiso)', short: '3S', score: latestZoneAudit ? Math.round(18 * (latestZoneAudit.compliancePercent / 100)) : 15, max: 18 },
    { k: '4S – Standardize (Seiketsu)', short: '4S', score: latestZoneAudit ? Math.round(24 * (latestZoneAudit.compliancePercent / 100)) : 20, max: 24 },
    { k: '5S – Sustain (Shitsuke)', short: '5S', score: latestZoneAudit ? Math.round(24 * (latestZoneAudit.compliancePercent / 100)) : 21, max: 24 }
  ];

  const totalObtained = elements.reduce((a, b) => a + b.score, 0);
  const totalMax = elements.reduce((a, b) => a + b.max, 0);
  const zonePct = Math.round((totalObtained / totalMax) * 100);

  // Radar Polygon Points Generator
  const cx = 140, cy = 140, maxR = 90;
  const n = elements.length;
  const step = (2 * Math.PI) / n;
  const startAngle = -Math.PI / 2;
  const getPt = (i: number, r: number) => [
    cx + r * Math.cos(startAngle + i * step),
    cy + r * Math.sin(startAngle + i * step)
  ];

  const radarPolygonPoints = elements
    .map((e, i) => {
      const r = maxR * (e.score / e.max);
      return getPt(i, r).join(',');
    })
    .join(' ');

  const monthsTrend = [
    { m: 'Jan', val: 70 },
    { m: 'Feb', val: 72 },
    { m: 'Mar', val: 75 },
    { m: 'Apr', val: 78 },
    { m: 'May', val: 79 },
    { m: 'Jun', val: 81 },
    { m: 'Jul', val: 82 },
    { m: 'Aug', val: 84 },
    { m: 'Sep', val: 85 },
    { m: 'Oct', val: Math.max(87, zonePct) }
  ];

  const handleAuditSubmitInternal = (newAudit: FiveSAudit, newNcs: FiveSNonConformity[]) => {
    if (onAuditSubmitted) {
      onAuditSubmitted(newAudit, newNcs);
    }
    setSuccessToast(`5S Audit ${newAudit.auditNumber} submitted successfully for ${newAudit.department}! Compliance: ${newAudit.compliancePercent}%`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-orange-500/20 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-200" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Scope Restriction Banner with Sankara Orange Gradient Theme */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50 border border-orange-200/80 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-orange-950 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-orange-950">Isolated Hospital Unit Scope:</span>{' '}
            <span className="font-extrabold text-orange-900">{unitConfig.name} ({targetUnitCode})</span> •{' '}
            <span className="text-orange-800">All {zoneNames.length} Zones & {totalDepts} Departments</span>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => setIsAuditModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
            <span>Audit Unit / Record 5S Points</span>
          </button>

          <div className="text-[11px] font-black uppercase tracking-wider text-orange-800 bg-white/90 px-3 py-1.5 rounded-full border border-orange-300 shadow-2xs shrink-0">
            Unit Head Authority
          </div>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audits Completed</span>
            <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-orange-600 mt-2">
            {completedDepts} <span className="text-base font-bold text-slate-400">/ {totalDepts}</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Departments Evaluated</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audits Pending</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><Clock className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">{pendingDepts}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Pending Cycle Close</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Unit NCs</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><Layers className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{unitNcs.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Historical Logged</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending NCs</span>
            <span className="p-1.5 rounded-lg bg-rose-50 text-rose-600"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-rose-600 mt-2">{openNcs.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Open Corrective Items</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closed NCs</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-teal-600 mt-2">{closedNcs.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Resolved & Verified</div>
        </div>
      </div>

      {/* Unit Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 border border-orange-200 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-orange-700">
                Top Performing Zone
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                Zone 4 (Specialty OT & Surgical Complex)
              </div>
              <div className="text-xs text-slate-500">
                All NCs cleared • 94% 5S Benchmark Compliance
              </div>
            </div>
          </div>
          <span className="font-bold text-xs text-orange-800 bg-orange-50 border border-orange-200 px-3 py-1 rounded-full">
            On Track
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-700">
                Focus Area Identified
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                Zone 3 (Pediatric OPD & Recovery Rooms)
              </div>
              <div className="text-xs text-slate-500">
                Needs attention on 3S Shine & High-Touch cleaning routines
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              setSelectedZone('Zone 3');
              setIsAuditModalOpen(true);
            }}
            className="font-bold text-xs text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100 px-3 py-1 rounded-full cursor-pointer transition-colors"
          >
            Audit Now
          </button>
        </div>
      </div>

      {/* Zone-wise Compliance Cards & Selection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Zone-wise 5S Compliance — {unitConfig.name} ({targetUnitCode})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Select any zone below to examine specific element scores, radar balance, and Kaizen monthly trends.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white text-xs font-black shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Record Audit Points</span>
            </button>

            <button
              onClick={onGoReports}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 transition-all cursor-pointer shadow-2xs"
            >
              <BarChart2 className="w-3.5 h-3.5 text-slate-600" />
              <span>Unit Reports</span>
            </button>
          </div>
        </div>

        {/* Zone Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {zoneStats.map((z) => {
            const isSelected = selectedZone === z.name;
            const badgeCls =
              z.compliance >= 80
                ? 'text-orange-700 bg-orange-50 border-orange-200'
                : z.compliance >= 70
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-rose-700 bg-rose-50 border-rose-200';

            return (
              <div
                key={z.name}
                onClick={() => setSelectedZone(z.name)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                  isSelected
                    ? 'border-orange-500 bg-orange-50/50 ring-2 ring-orange-400/30 shadow-xs'
                    : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-extrabold text-sm text-slate-900">{z.name}</span>
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${badgeCls}`}>
                      {z.compliance}%
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {z.deptCount} Departments Assigned
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {z.openNcs > 0 ? (
                      <span className="text-amber-700 font-bold">{z.openNcs} Open NCs</span>
                    ) : (
                      <span className="text-orange-700 font-bold">0 Open NCs</span>
                    )}
                  </span>
                  <span className={`font-bold flex items-center gap-1 ${isSelected ? 'text-orange-700' : 'text-slate-400'}`}>
                    <span>Inspect</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Zone Deep-Dive Inspection */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
              <h3 className="text-base font-extrabold text-slate-900">
                Detailed Audit Matrix: {selectedZone}
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown across the 5 pillars (Sort, Set in Order, Shine, Standardize, Sustain)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAuditModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold transition-all cursor-pointer"
            >
              <ClipboardCheck className="w-3.5 h-3.5 text-orange-600" />
              <span>Score {selectedZone}</span>
            </button>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
            >
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
            >
              <option value="2026">2026</option>
              <option value="2025">2025</option>
            </select>
          </div>
        </div>

        {/* 5S Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">5S Element</th>
                <th className="py-3 px-4">Score Obtained</th>
                <th className="py-3 px-4">Maximum Score</th>
                <th className="py-3 px-4">Compliance Pct</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {elements.map((e) => {
                const pct = Math.round((e.score / e.max) * 100);
                return (
                  <tr key={e.k} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{e.k}</td>
                    <td className="py-3 px-4 font-semibold text-slate-700">{e.score}</td>
                    <td className="py-3 px-4 text-slate-500">{e.max}</td>
                    <td className="py-3 px-4">
                      <span className="font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-0.5 rounded-full text-xs">
                        {pct}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              <tr className="font-extrabold bg-slate-50 border-t border-slate-200 text-slate-900">
                <td className="py-3 px-4">Total Compliance</td>
                <td className="py-3 px-4">{totalObtained}</td>
                <td className="py-3 px-4">{totalMax}</td>
                <td className="py-3 px-4 text-orange-600 font-black text-sm">{zonePct}%</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Visual Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Radar Chart with Warm Saffron/Orange Theme */}
          <div className="flex flex-col items-center justify-center p-6 bg-orange-50/30 rounded-2xl border border-orange-200/60">
            <h4 className="text-xs font-bold text-slate-900 mb-2">
              {selectedZone} Radar Balance Chart
            </h4>
            <svg viewBox="0 0 280 280" className="w-56 h-56 max-w-full">
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <polygon
                  key={f}
                  points={elements.map((_, i) => getPt(i, maxR * f).join(',')).join(' ')}
                  fill="none"
                  stroke="#fed7aa"
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
                    stroke="#fed7aa"
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
                const [x, y] = getPt(i, maxR * (e.score / e.max));
                const [lx, ly] = getPt(i, maxR + 18);
                return (
                  <g key={e.short}>
                    <circle cx={x} cy={y} r="3.5" fill="#ea580c" />
                    <text
                      x={lx}
                      y={ly}
                      fontSize="11"
                      fontWeight="800"
                      fill="#9a3412"
                      textAnchor="middle"
                      dominantBaseline="middle"
                    >
                      {e.short}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Month Trend Bars */}
          <div className="flex flex-col justify-between p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                {selectedZone} Month-on-Month Progression
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                Consistent Kaizen compliance improvement across operational cycles
              </p>
            </div>

            <div className="flex items-end gap-2.5 h-40 pt-4">
              {monthsTrend.map((m) => (
                <div key={m.m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-bold text-slate-500">{m.val}%</span>
                  <div
                    className={`w-full rounded-t-lg transition-all ${
                      m.m === selectedMonth
                        ? 'bg-gradient-to-t from-orange-600 to-amber-500 shadow-sm'
                        : 'bg-slate-300 hover:bg-slate-400'
                    }`}
                    style={{ height: `${(m.val / 100) * 100}%` }}
                  />
                  <span className={`text-[11px] font-bold ${m.m === selectedMonth ? 'text-orange-700 font-black' : 'text-slate-600'}`}>
                    {m.m}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Modal for Recording 5S Audits & Points */}
      <Record5SAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        currentUser={currentUser}
        units={units}
        defaultUnitCode={targetUnitCode}
        defaultZoneName={selectedZone}
        lockUnit={true}
        onAuditSubmitted={handleAuditSubmitInternal}
      />

    </div>
  );
};
