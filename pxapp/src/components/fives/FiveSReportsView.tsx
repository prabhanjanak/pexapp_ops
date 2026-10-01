import React, { useState } from 'react';
import { FiveSUser, FiveSUnitConfig, FiveSReportType, FiveSAudit, FiveSNonConformity } from './types';
import { FIVE_S_CHECKLIST, UNIT_BASE_SCORES } from './seedData';
import {
  Download,
  Calendar,
  Lock,
  Layers,
  Building2,
  FileSpreadsheet,
  BarChart3,
  TrendingUp,
  Award,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Clock,
  ArrowUpRight,
  Activity,
  UserCheck,
  Check
} from 'lucide-react';

interface FiveSReportsViewProps {
  currentUser: FiveSUser;
  units: FiveSUnitConfig[];
  audits: FiveSAudit[];
  ncs: FiveSNonConformity[];
  onBackToDashboard: () => void;
}

export const FiveSReportsView: React.FC<FiveSReportsViewProps> = ({
  currentUser,
  units,
  audits,
  ncs,
  onBackToDashboard
}) => {
  const role = currentUser.role;

  // Available Reports by Role
  const ALL_REPORT_ROLES = ['incharge', 'zonal', 'unithead', 'superadmin', 'president'];
  const ZONE_PLUS = ['zonal', 'unithead', 'superadmin', 'president'];
  const UNIT_PLUS = ['unithead', 'superadmin', 'president'];

  const reportTabs = [
    { id: 'summary', label: 'Score Summary', roles: ALL_REPORT_ROLES },
    { id: 'question', label: 'Question-wise (Q1–Q36)', roles: ALL_REPORT_ROLES },
    { id: 'nc', label: 'NC & Corrective Action', roles: ALL_REPORT_ROLES },
    { id: 'change', label: 'Change vs Previous Month', roles: ALL_REPORT_ROLES },
    { id: 'coverage', label: 'Audit Coverage', roles: ZONE_PLUS },
    { id: 'weakest', label: 'Weakest Checkpoints', roles: ZONE_PLUS },
    { id: 'ranking', label: 'Department Ranking', roles: ZONE_PLUS },
    { id: 'heatmap', label: 'Zone Heat Map', roles: UNIT_PLUS },
    { id: 'auditors', label: 'Auditor Activity', roles: UNIT_PLUS },
    { id: 'comparison', label: '14-Unit Comparison', roles: ['superadmin', 'president'] }
  ].filter((r) => r.roles.includes(role));

  const [activeReport, setActiveReport] = useState<FiveSReportType>('summary');
  const [selectedMonth, setSelectedMonth] = useState<string>('Oct');
  const [selectedYear, setSelectedYear] = useState<string>('2026');

  // Scope Selection based on role
  const isDeptLocked = role === 'incharge';
  const isZoneLocked = role === 'zonal';
  const isUnitLocked = role === 'unithead';

  const defaultUnit = currentUser.unit && currentUser.unit !== 'All 14 Units' ? currentUser.unit : 'CBE';
  const [selectedUnit, setSelectedUnit] = useState<string>(defaultUnit);

  const activeUnitConfig = units.find((u) => u.code === selectedUnit) || units[0];
  const availableZones = Object.keys(activeUnitConfig.zones);

  const defaultZone = currentUser.zone || availableZones[0] || 'Zone 1';
  const [selectedZone, setSelectedZone] = useState<string>(defaultZone);

  const availableDepts = ['All departments', ...(activeUnitConfig.zones[selectedZone] || [])];
  const defaultDept = currentUser.department || 'All departments';
  const [selectedDept, setSelectedDept] = useState<string>(defaultDept);

  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const YEARS = ['2026', '2025'];

  // Scaled 5S Elements
  const baseScore = UNIT_BASE_SCORES[selectedUnit] || 78;
  const monthIdx = MONTHS.indexOf(selectedMonth);
  const monthFactor = 0.82 + (monthIdx / 12) * 0.22;

  const elements = [
    { k: '1S – Sort (Seiri)', short: '1S', score: Math.round(18 * (baseScore / 100) * monthFactor), max: 18 },
    { k: '2S – Set in Order (Seiton)', short: '2S', score: Math.round(24 * (baseScore / 100) * monthFactor), max: 24 },
    { k: '3S – Shine (Seiso)', short: '3S', score: Math.round(18 * (baseScore / 100) * monthFactor), max: 18 },
    { k: '4S – Standardize (Seiketsu)', short: '4S', score: Math.round(24 * (baseScore / 100) * monthFactor), max: 24 },
    { k: '5S – Sustain (Shitsuke)', short: '5S', score: Math.round(24 * (baseScore / 100) * monthFactor), max: 24 }
  ].map((e) => ({ ...e, score: Math.min(e.max, Math.max(9, e.score)) }));

  const totalScore = elements.reduce((a, b) => a + b.score, 0);
  const maxScore = elements.reduce((a, b) => a + b.max, 0);
  const compliancePct = Math.round((totalScore / maxScore) * 100);

  // Month on month values
  const monthVals = MONTHS.map((m, idx) => ({
    m,
    val: Math.min(95, Math.round(baseScore * (0.8 + (idx / 12) * 0.25)))
  }));

  // Radar math
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

  // Filter NCs matching selected scope
  const filteredNcs = ncs.filter((n) => {
    if (n.unit !== selectedUnit) return false;
    if (selectedZone && n.zone.toLowerCase() !== selectedZone.toLowerCase()) return false;
    if (selectedDept !== 'All departments' && n.department.toLowerCase() !== selectedDept.toLowerCase()) return false;
    return true;
  });

  const closedNcs = filteredNcs.filter((n) => n.status === 'Closed');
  const openNcs = filteredNcs.filter((n) => n.status !== 'Closed');
  const overdueNcs = filteredNcs.filter((n) => n.status === 'Open');
  const closureRate = filteredNcs.length ? Math.round((closedNcs.length / filteredNcs.length) * 100) : 100;

  // Helper for CSV download
  const downloadCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.map(x => `"${String(x).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCurrent = () => {
    const filename = `5S_${activeReport}_${selectedUnit}_${selectedZone.replace(/\s+/g, '')}_${selectedMonth}${selectedYear}.csv`;
    
    if (activeReport === 'summary') {
      const rows = [
        ['5S Element', 'Score Obtained', 'Max Score', 'Compliance %'],
        ...elements.map((e) => [e.k, e.score, e.max, `${Math.round((e.score / e.max) * 100)}%`]),
        ['Total', totalScore, maxScore, `${compliancePct}%`]
      ];
      downloadCSV(filename, rows);
    } else if (activeReport === 'question') {
      const rows = [
        ['#', '5S Pillar', 'Area', 'Checkpoint Text', 'Evidence Required', 'Score (0-3)'],
        ...FIVE_S_CHECKLIST.map((cp) => [
          cp.slNo,
          cp.section,
          cp.area,
          cp.point,
          cp.evidence,
          (2.2 + ((cp.slNo * 3) % 8) * 0.1).toFixed(1)
        ])
      ];
      downloadCSV(filename, rows);
    } else if (activeReport === 'nc') {
      const rows = [
        ['NC ID', 'Unit', 'Zone', 'Department', 'Checkpoint', 'Score', 'Status', 'Days to Close', 'Raised Date'],
        ...filteredNcs.map((n) => [
          n.id,
          n.unit,
          n.zone,
          n.department,
          n.checkpointText,
          n.score,
          n.status,
          n.daysToClose || 'Pending',
          n.raisedDate
        ])
      ];
      downloadCSV(filename, rows);
    } else {
      const rows = [
        ['Report', activeReport],
        ['Hospital Unit', selectedUnit],
        ['Zone', selectedZone],
        ['Department', selectedDept],
        ['Period', `${selectedMonth} ${selectedYear}`],
        ['Compliance %', `${compliancePct}%`]
      ];
      downloadCSV(filename, rows);
    }
  };

  const getScoreBadge = (v: number) => {
    if (v >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (v >= 70) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (v >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Scope Restriction Header */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50 border border-orange-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-orange-950 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-black text-orange-900">Enforced Analytics Scope:</span>{' '}
            <span className="font-extrabold text-orange-800">{currentUser.unit || 'Network'}</span>
            {currentUser.zone && <span> • {currentUser.zone}</span>}
            {currentUser.department && <span> • {currentUser.department}</span>}
            <span className="text-orange-700 block text-xs mt-0.5">Role: {currentUser.roleLabel} • Access Strictly Isolated</span>
          </div>
        </div>
        <button
          onClick={onBackToDashboard}
          className="text-xs font-bold text-orange-700 hover:text-orange-950 bg-white/80 px-3.5 py-1.5 rounded-xl border border-orange-300 shadow-2xs transition-all cursor-pointer shrink-0"
        >
          ← Return to Dashboard
        </button>
      </div>

      {/* Report Selection Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-3">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
          {reportTabs.map((tab) => {
            const isSel = activeReport === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveReport(tab.id as FiveSReportType)}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSel
                    ? 'bg-white text-orange-800 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Global Filter Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black uppercase tracking-wider text-slate-500">
            Report Scope & Target Period Filter
          </div>
          <button
            onClick={handleExportCurrent}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Download CSV</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {/* Unit Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Hospital Unit</label>
            {isUnitLocked || isZoneLocked || isDeptLocked ? (
              <div className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedUnit}</span>
              </div>
            ) : (
              <select
                value={selectedUnit}
                onChange={(e) => {
                  setSelectedUnit(e.target.value);
                  const u = units.find((x) => x.code === e.target.value);
                  if (u) {
                    const firstZ = Object.keys(u.zones)[0] || 'Zone 1';
                    setSelectedZone(firstZ);
                    setSelectedDept('All departments');
                  }
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              >
                {units.map((u) => (
                  <option key={u.code} value={u.code}>{u.name} ({u.code})</option>
                ))}
              </select>
            )}
          </div>

          {/* Zone Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Zone</label>
            {isZoneLocked || isDeptLocked ? (
              <div className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>{selectedZone}</span>
              </div>
            ) : (
              <select
                value={selectedZone}
                onChange={(e) => {
                  setSelectedZone(e.target.value);
                  setSelectedDept('All departments');
                }}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              >
                {availableZones.map((z) => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            )}
          </div>

          {/* Department Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Department</label>
            {isDeptLocked ? (
              <div className="py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
                <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{selectedDept}</span>
              </div>
            ) : (
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
              >
                {availableDepts.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            )}
          </div>

          {/* Month Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Audit Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
            >
              {MONTHS.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Year Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Audit Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* REPORT 1: SCORE SUMMARY */}
      {activeReport === 'summary' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Overall Compliance</span>
              <div className="text-3xl font-black text-orange-600 mt-2">{compliancePct}%</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">{totalScore} / {maxScore} points</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scope</span>
              <div className="text-xl font-black text-slate-900 mt-2 truncate">{selectedZone}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">{selectedUnit} • {selectedDept}</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open NCs</span>
              <div className="text-3xl font-black text-amber-600 mt-2">{openNcs.length}</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Pending remediation</div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closure Rate</span>
              <div className="text-3xl font-black text-teal-600 mt-2">{closureRate}%</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">{closedNcs.length} resolved</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 5S Element Table */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-base font-extrabold text-slate-900">
                  5S Element Score Table
                </h3>
                <span className="text-xs font-bold text-slate-500">
                  {selectedMonth} {selectedYear}
                </span>
              </div>

              <div className="overflow-hidden rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="py-2.5 px-3">5S Element</th>
                      <th className="py-2.5 px-3">Score</th>
                      <th className="py-2.5 px-3">Max</th>
                      <th className="py-2.5 px-3 text-right">Compliance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {elements.map((e) => (
                      <tr key={e.k} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-800">{e.k}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{e.score}</td>
                        <td className="py-3 px-3 text-slate-500">{e.max}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs">
                            {Math.round((e.score / e.max) * 100)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    <tr className="font-extrabold bg-slate-50 border-t border-slate-200 text-slate-900">
                      <td className="py-3 px-3">Total Compliance</td>
                      <td className="py-3 px-3">{totalScore}</td>
                      <td className="py-3 px-3">{maxScore}</td>
                      <td className="py-3 px-3 text-right text-emerald-700 font-black text-sm">{compliancePct}%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Radar Polygon */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center justify-center">
              <h3 className="text-base font-extrabold text-slate-900 mb-1">
                Radar Compliance Polygon
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Pillar balance for {selectedUnit} • {selectedZone}
              </p>
              <svg viewBox="0 0 280 280" className="w-56 h-56 max-w-full">
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
                    <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1" />
                  );
                })}
                <polygon
                  points={radarPolygonPoints}
                  fill="#059669"
                  fillOpacity="0.2"
                  stroke="#059669"
                  strokeWidth="2.5"
                />
                {elements.map((e, i) => {
                  const [x, y] = getPt(i, maxR * (e.score / e.max));
                  const [lx, ly] = getPt(i, maxR + 18);
                  return (
                    <g key={e.short}>
                      <circle cx={x} cy={y} r="3.5" fill="#059669" />
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
            </div>
          </div>

          {/* Month Trend Bars */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Monthly % Compliance Progression ({selectedYear})
              </h3>
              <p className="text-xs text-slate-500">
                Historical monthly audits for {selectedUnit} — {selectedZone}
              </p>
            </div>

            <div className="flex items-end gap-2.5 h-40 pt-4">
              {monthVals.map((m) => {
                const isCur = m.m === selectedMonth;
                return (
                  <div key={m.m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <span className={`text-[10px] font-bold ${isCur ? 'text-emerald-700 font-black' : 'text-slate-500'}`}>
                      {m.val}%
                    </span>
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isCur ? 'bg-emerald-600' : 'bg-slate-300 hover:bg-slate-400'
                      }`}
                      style={{ height: `${m.val}%` }}
                    />
                    <span className={`text-[11px] font-bold ${isCur ? 'text-emerald-700 font-black' : 'text-slate-600'}`}>
                      {m.m}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* REPORT 2: QUESTION-WISE (Q1–Q36) */}
      {activeReport === 'question' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Question-Wise Breakdown (Q1 to Q36)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed scores across individual checkpoints for {selectedUnit} • {selectedZone}
              </p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              36 Checkpoints Standard
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">5S Pillar</th>
                  <th className="py-2.5 px-3">Focus Area</th>
                  <th className="py-2.5 px-3">Clinical Standard Checkpoint</th>
                  <th className="py-2.5 px-3">Evidence Required</th>
                  <th className="py-2.5 px-3 text-right">Average Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {FIVE_S_CHECKLIST.map((cp) => {
                  const fakeScore = (2.2 + ((cp.slNo * 3) % 8) * 0.1).toFixed(1);
                  return (
                    <tr key={cp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{cp.slNo}</td>
                      <td className="py-3 px-3 font-bold text-emerald-700">{cp.section}</td>
                      <td className="py-3 px-3 font-semibold text-slate-800">{cp.area}</td>
                      <td className="py-3 px-3 text-slate-600 max-w-sm">{cp.point}</td>
                      <td className="py-3 px-3 text-slate-500 italic max-w-xs">{cp.evidence}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs">
                          {fakeScore} / 3.0
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 3: NC & CORRECTIVE ACTION */}
      {activeReport === 'nc' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Non-Conformity & Corrective Action Register
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Audit trail of deviations, remediation timeline, before/after photographic proof, and sign-offs.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {closedNcs.length} Closed
              </span>
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                {openNcs.length} Open
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">NC ID</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Checkpoint Text</th>
                  <th className="py-2.5 px-3">Score</th>
                  <th className="py-2.5 px-3">Raised Date</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Days to Close</th>
                  <th className="py-2.5 px-3 text-right">Photo Proof</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredNcs.map((n) => (
                  <tr key={n.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-black text-slate-900">{n.id}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{n.department}</td>
                    <td className="py-3 px-3 text-slate-600 max-w-sm truncate">{n.checkpointText}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded text-xs">
                        {n.score}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{n.raisedDate}</td>
                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        n.status === 'Closed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {n.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-700">{n.status === 'Closed' ? `${n.daysToClose || 3} days` : 'Pending'}</td>
                    <td className="py-3 px-3 text-right">
                      {n.beforePhoto && n.afterPhoto ? (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          Before & After
                        </span>
                      ) : n.beforePhoto ? (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                          Before Only
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">None</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 4: CHANGE VS PREVIOUS MONTH */}
      {activeReport === 'change' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Change vs Previous Month ({selectedMonth} {selectedYear})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative element deltas and Kaizen velocity against the prior cycle.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3.5">5S Element</th>
                  <th className="py-2.5 px-3.5">Previous Month</th>
                  <th className="py-2.5 px-3.5">Current Month</th>
                  <th className="py-2.5 px-3.5 text-right">Net Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {elements.map((e, idx) => {
                  const curPct = Math.round((e.score / e.max) * 100);
                  const prevPct = Math.max(50, curPct - (idx % 2 === 0 ? 3 : -2));
                  const delta = curPct - prevPct;

                  return (
                    <tr key={e.k} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-900">{e.k}</td>
                      <td className="py-3 px-3.5 text-slate-600">{prevPct}%</td>
                      <td className="py-3 px-3.5 font-bold text-slate-900">{curPct}%</td>
                      <td className="py-3 px-3.5 text-right font-black">
                        {delta > 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs">
                            ▲ +{delta}%
                          </span>
                        ) : delta < 0 ? (
                          <span className="text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-full text-xs">
                            ▼ {delta}%
                          </span>
                        ) : (
                          <span className="text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full text-xs">
                            — 0%
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 5: AUDIT COVERAGE */}
      {activeReport === 'coverage' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Audit Coverage & Department Execution Status
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Auditor dispatch log and completion rate for {selectedUnit} • {selectedZone}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Department Area</th>
                  <th className="py-2.5 px-3">Audit Status</th>
                  <th className="py-2.5 px-3">Assigned Auditor</th>
                  <th className="py-2.5 px-3">Execution Date</th>
                  <th className="py-2.5 px-3 text-right">Achieved Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeUnitConfig.zones[selectedZone] || []).map((dept, i) => {
                  const done = i !== 1;
                  return (
                    <tr key={dept} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-bold text-slate-900">{dept}</td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center gap-1 font-bold text-xs px-2.5 py-0.5 rounded-full ${
                          done ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {done ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                          {done ? 'Completed' : 'Pending Audit'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">{done ? 'Dr. Kavitha S' : '—'}</td>
                      <td className="py-3 px-3 text-slate-500">{done ? `1${i + 2} ${selectedMonth} ${selectedYear}` : 'Pending'}</td>
                      <td className="py-3 px-3 text-right">
                        {done ? (
                          <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-xs">
                            {82 + (i % 4) * 3}%
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 6: WEAKEST CHECKPOINTS */}
      {activeReport === 'weakest' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Weakest Checkpoints (Lowest 10 Across Network)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Specific clinical and operational standards requiring prioritized corrective drives.
            </p>
          </div>

          <div className="space-y-3">
            {FIVE_S_CHECKLIST.slice(0, 10).map((cp, idx) => {
              const avgScore = (1.1 + (idx % 4) * 0.15).toFixed(1);
              return (
                <div key={cp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs">
                        Q{cp.slNo}
                      </span>
                      <span className="font-extrabold text-xs text-slate-900">{cp.section} • {cp.area}</span>
                    </div>
                    <span className="font-black text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded-full text-xs">
                      {avgScore} / 3.0 Avg
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{cp.point}</p>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Evidence: {cp.evidence}</span>
                    <span className="font-bold text-amber-700">3 Departments scored 0 or 1</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* REPORT 7: DEPARTMENT RANKING */}
      {activeReport === 'ranking' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Department 5S Compliance Ranking
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sorted by overall compliance within {selectedZone} — {selectedUnit}
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Department Area</th>
                  <th className="py-2.5 px-3">1S</th>
                  <th className="py-2.5 px-3">2S</th>
                  <th className="py-2.5 px-3">3S</th>
                  <th className="py-2.5 px-3">4S</th>
                  <th className="py-2.5 px-3">5S</th>
                  <th className="py-2.5 px-3 text-right">Overall Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(activeUnitConfig.zones[selectedZone] || []).map((d, idx) => {
                  const score = Math.max(65, 94 - idx * 5);
                  return (
                    <tr key={d} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-black text-slate-500">{idx + 1}</td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">{d}</td>
                      <td className="py-3 px-3 text-slate-700">{score + 2}%</td>
                      <td className="py-3 px-3 text-slate-700">{score - 1}%</td>
                      <td className="py-3 px-3 text-slate-700">{score + 1}%</td>
                      <td className="py-3 px-3 text-slate-700">{score - 2}%</td>
                      <td className="py-3 px-3 text-slate-700">{score}%</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-black px-2.5 py-1 rounded-full border text-xs ${getScoreBadge(score)}`}>
                          {score}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 8: ZONE HEAT MAP */}
      {activeReport === 'heatmap' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Zone 5S Heat Map — {selectedUnit}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Comprehensive compliance matrix of all zones against the five 5S pillars.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3">1S (Sort)</th>
                  <th className="py-2.5 px-3">2S (Order)</th>
                  <th className="py-2.5 px-3">3S (Shine)</th>
                  <th className="py-2.5 px-3">4S (Standard)</th>
                  <th className="py-2.5 px-3">5S (Sustain)</th>
                  <th className="py-2.5 px-3 text-right">Zone Average</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {availableZones.map((z, idx) => {
                  const zAvg = Math.max(68, 88 - idx * 4);
                  return (
                    <tr key={z} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-extrabold text-slate-900">{z}</td>
                      <td className="py-3 px-3">
                        <span className={`font-bold px-2 py-0.5 rounded ${getScoreBadge(zAvg + 2)}`}>{zAvg + 2}%</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold px-2 py-0.5 rounded ${getScoreBadge(zAvg - 1)}`}>{zAvg - 1}%</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold px-2 py-0.5 rounded ${getScoreBadge(zAvg + 1)}`}>{zAvg + 1}%</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold px-2 py-0.5 rounded ${getScoreBadge(zAvg - 2)}`}>{zAvg - 2}%</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`font-bold px-2 py-0.5 rounded ${getScoreBadge(zAvg)}`}>{zAvg}%</span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-black text-xs text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md">
                          {zAvg}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 9: AUDITOR ACTIVITY */}
      {activeReport === 'auditors' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">
              Auditor Activity & Audit Volume Log
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Conducted audits, zones covered, and scoring distribution by auditor.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Auditor Name</th>
                  <th className="py-2.5 px-3">Designation</th>
                  <th className="py-2.5 px-3">Audits Completed</th>
                  <th className="py-2.5 px-3">Zones Audited</th>
                  <th className="py-2.5 px-3">Average Score Given</th>
                  <th className="py-2.5 px-3 text-right">Last Audit Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { n: 'Dr. Kavitha S', desig: 'Clinical Quality Auditor', c: 14, z: 'Zone 1, Zone 2', s: '84%', d: '14 Oct 2026' },
                  { n: 'Mr. Ramesh Babu', desig: 'Operations Executive', c: 11, z: 'Zone 3, Zone 4', s: '79%', d: '12 Oct 2026' },
                  { n: 'Sister Mary Joseph', desig: 'Nursing Quality Lead', c: 9, z: 'Zone 5', s: '88%', d: '10 Oct 2026' }
                ].map((a) => (
                  <tr key={a.n} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-extrabold text-slate-900">{a.n}</td>
                    <td className="py-3 px-3 text-slate-600">{a.desig}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{a.c}</td>
                    <td className="py-3 px-3 text-slate-700">{a.z}</td>
                    <td className="py-3 px-3 font-black text-emerald-700">{a.s}</td>
                    <td className="py-3 px-3 text-right text-slate-500">{a.d}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REPORT 10: 14-UNIT COMPARISON */}
      {activeReport === 'comparison' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                All 14 Hospital Units Side-by-Side Comparison
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Executive network ranking and compliance benchmarks for {selectedMonth} {selectedYear}.
              </p>
            </div>
            <button
              onClick={() => {
                const rows = [
                  ['Unit Code', 'Hospital Name', '5S Compliance %', 'Pending NCs'],
                  ...units.map((u) => [u.code, u.name, `${UNIT_BASE_SCORES[u.code] || 75}%`, 4])
                ];
                downloadCSV(`14_Units_Comparison_${selectedMonth}${selectedYear}.csv`, rows);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs self-start sm:self-auto"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Download Comparison CSV</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Hospital Name</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3 text-right">5S Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {units.map((u) => {
                  const score = UNIT_BASE_SCORES[u.code] || 75;
                  return (
                    <tr key={u.code} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3 font-black text-emerald-700">{u.code}</td>
                      <td className="py-3 px-3 font-extrabold text-slate-900">{u.name}</td>
                      <td className="py-3 px-3 text-slate-500">{u.city}, {u.state}</td>
                      <td className="py-3 px-3 text-right">
                        <span className={`font-black px-2.5 py-1 rounded-full border text-xs ${getScoreBadge(score)}`}>
                          {score}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
