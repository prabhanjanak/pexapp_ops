import React, { useState } from 'react';
import { FiveSUser, FiveSUnitConfig, FiveSAudit, FiveSNonConformity } from './types';
import { UNIT_BASE_SCORES } from './seedData';
import {
  ShieldCheck,
  Building2,
  TrendingUp,
  Award,
  AlertCircle,
  Eye,
  BarChart2,
  Layers,
  ArrowUpRight,
  Download,
  Calendar,
  Sparkles,
  Activity
} from 'lucide-react';

interface PresidentDashboardProps {
  currentUser: FiveSUser;
  units: FiveSUnitConfig[];
  audits: FiveSAudit[];
  ncs: FiveSNonConformity[];
  onGoReports: () => void;
}

export const PresidentDashboard: React.FC<PresidentDashboardProps> = ({
  currentUser,
  units,
  audits,
  ncs,
  onGoReports
}) => {
  const [selectedMonth, setSelectedMonth] = useState<string>('Oct');
  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [compareMetric, setCompareMetric] = useState<string>('overall');
  const [selectedUnit, setSelectedUnit] = useState<string>('CBE');
  const [selectedZone, setSelectedZone] = useState<string>('Zone 1');

  // Executive Stats
  const totalUnits = units.length;
  const overallCompliance = 79;
  const totalNcs = ncs.length;
  const pendingNcs = ncs.filter((n) => n.status !== 'Closed').length;
  const closedNcs = ncs.filter((n) => n.status === 'Closed').length;

  const currentUnitConfig = units.find((u) => u.code === selectedUnit) || units[0];

  // Month on month organization compliance
  const orgTrend = [
    { m: 'May', val: 68 },
    { m: 'Jun', val: 71 },
    { m: 'Jul', val: 74 },
    { m: 'Aug', val: 76 },
    { m: 'Sep', val: 79 },
    { m: 'Oct', val: 82 }
  ];

  // Unit ranking data
  const unitRankings = units.map((u, i) => {
    const base = UNIT_BASE_SCORES[u.code] || 70;
    const offsets = [
      [3, -2, 1, -1, 0],
      [-2, 2, 0, 1, -2],
      [1, 1, -3, 2, -1],
      [0, -2, 2, -1, 1]
    ][i % 4];

    const elementScores = offsets.map((o) => Math.max(50, Math.min(96, base + o)));
    const openNcCount = Math.max(1, Math.round((100 - base) / 3));

    return {
      code: u.code,
      name: u.name,
      overall: base,
      s1: elementScores[0],
      s2: elementScores[1],
      s3: elementScores[2],
      s4: elementScores[3],
      s5: elementScores[4],
      openNcs: openNcCount
    };
  });

  const getMetricValue = (item: typeof unitRankings[0]) => {
    if (compareMetric === '0') return item.s1;
    if (compareMetric === '1') return item.s2;
    if (compareMetric === '2') return item.s3;
    if (compareMetric === '3') return item.s4;
    if (compareMetric === '4') return item.s5;
    return item.overall;
  };

  const sortedRankings = [...unitRankings].sort((a, b) => getMetricValue(b) - getMetricValue(a));
  const topUnit = sortedRankings[0];
  const lowestUnit = sortedRankings[sortedRankings.length - 1];

  // Radar for inspected unit/zone
  const elements = [
    { k: '1S – Sort (Seiri)', short: '1S', score: 16, max: 18 },
    { k: '2S – Set in Order (Seiton)', short: '2S', score: 21, max: 24 },
    { k: '3S – Shine (Seiso)', short: '3S', score: 15, max: 18 },
    { k: '4S – Standardize (Seiketsu)', short: '4S', score: 20, max: 24 },
    { k: '5S – Sustain (Shitsuke)', short: '5S', score: 21, max: 24 }
  ];

  const cx = 130, cy = 130, maxR = 85;
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

  const getScoreBadge = (v: number) => {
    if (v >= 80) return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (v >= 70) return 'text-teal-700 bg-teal-50 border-teal-200';
    if (v >= 60) return 'text-amber-700 bg-amber-50 border-amber-200';
    return 'text-rose-700 bg-rose-50 border-rose-200';
  };

  const getBarFill = (v: number) => {
    if (v >= 80) return 'bg-emerald-600';
    if (v >= 70) return 'bg-teal-500';
    if (v >= 60) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Executive Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black uppercase tracking-wider mb-3">
            <Activity className="w-3.5 h-3.5" />
            Executive Leadership Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            National 5S Operational Quality Overview
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Real-time multi-hospital audit compliance, cross-unit benchmarking, and Kaizen standard discipline across all 14 Sankara Eye Hospitals nationwide.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center min-w-[110px]">
            <p className="text-2xl font-black text-orange-400">{overallCompliance}%</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Compliance</p>
          </div>
          <button
            onClick={onGoReports}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all cursor-pointer"
          >
            <BarChart2 className="w-4 h-4" />
            <span>Generate Full Reports</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Network Compliance</span>
            <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-orange-600 mt-2">{overallCompliance}%</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Weighted Network Average</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reporting Units</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><Building2 className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{totalUnits} Units</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">100% Units Active This Month</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending NCs</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><AlertCircle className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">{pendingNcs}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Under Corrective Resolution</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closed This Quarter</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-teal-600 mt-2">{closedNcs}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Formally Verified & Cleared</div>
        </div>
      </div>

      {/* Network Monthly Trend Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-5">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              National 5S Compliance Trajectory (May – Oct 2026)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Steady climb in audit rigor and compliance across all 14 hospitals.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full self-start sm:self-auto">
            +14% Increase in 6 Months
          </span>
        </div>

        <div className="flex items-end gap-3 h-44 pt-4">
          {orgTrend.map((m, idx) => (
            <div key={m.m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
              <span className="text-xs font-black text-slate-900">{m.val}%</span>
              <div
                className={`w-full rounded-t-lg transition-all ${
                  idx === orgTrend.length - 1 ? 'bg-gradient-to-t from-orange-600 to-amber-500' : 'bg-orange-300'
                }`}
                style={{ height: `${(m.val / 100) * 100}%` }}
              />
              <span className="text-xs font-bold text-slate-500">{m.m}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Executive Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-emerald-700">
                Top Performing Unit
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {topUnit.name} ({topUnit.code}) — {topUnit.overall}%
              </div>
              <div className="text-xs text-slate-500">
                Only {topUnit.openNcs} open NCs • Standard-setting clinical discipline
              </div>
            </div>
          </div>
          <span className="font-bold text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            Rank #1
          </span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-700">
                Priority Assistance Required
              </div>
              <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                {lowestUnit.name} ({lowestUnit.code}) — {lowestUnit.overall}%
              </div>
              <div className="text-xs text-slate-500">
                {lowestUnit.openNcs} open NCs logged • Focused Kaizen drive recommended
              </div>
            </div>
          </div>
          <span className="font-bold text-xs text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
            Needs Support
          </span>
        </div>
      </div>

      {/* 14-Unit Comparative Ranking Table */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              14-Hospital Unit 5S Ranking & Element Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Comparative benchmark across all network hospital units for Oct 2026.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-500">Rank By:</label>
            <select
              value={compareMetric}
              onChange={(e) => setCompareMetric(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
            >
              <option value="overall">Overall 5S Compliance</option>
              <option value="0">1S – Sort</option>
              <option value="1">2S – Set in Order</option>
              <option value="2">3S – Shine</option>
              <option value="3">4S – Standardize</option>
              <option value="4">5S – Sustain</option>
            </select>
          </div>
        </div>

        {/* Visual Progress Bar Ranking */}
        <div className="space-y-2.5">
          {sortedRankings.map((item, idx) => {
            const val = getMetricValue(item);
            return (
              <div key={item.code} className="flex items-center gap-3 text-xs">
                <span className="w-5 text-xs font-black text-slate-400 text-right">{idx + 1}.</span>
                <span className="w-28 text-xs font-extrabold text-slate-800 truncate">{item.code} — {item.name.replace('Sankara Eye Hospital, ', '')}</span>
                <div className="flex-1 h-3.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                  <div
                    className={`h-full ${getBarFill(val)} transition-all rounded-full`}
                    style={{ width: `${val}%` }}
                  />
                </div>
                <span className={`w-12 text-xs font-black text-right ${val >= 80 ? 'text-emerald-700' : 'text-slate-800'}`}>
                  {val}%
                </span>
              </div>
            );
          })}
        </div>

        {/* Detailed Matrix Table */}
        <div className="overflow-x-auto pt-4 border-t border-slate-100">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-2.5 px-3">Unit</th>
                <th className="py-2.5 px-3">Hospital Name</th>
                <th className="py-2.5 px-3">Overall</th>
                <th className="py-2.5 px-3">1S (Sort)</th>
                <th className="py-2.5 px-3">2S (Order)</th>
                <th className="py-2.5 px-3">3S (Shine)</th>
                <th className="py-2.5 px-3">4S (Standard)</th>
                <th className="py-2.5 px-3">5S (Sustain)</th>
                <th className="py-2.5 px-3">Open NCs</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedRankings.map((item) => (
                <tr key={item.code} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-extrabold text-slate-900">{item.code}</td>
                  <td className="py-3 px-3 font-medium text-slate-700">{item.name}</td>
                  <td className="py-3 px-3">
                    <span className={`font-black px-2 py-0.5 rounded-full border text-xs ${getScoreBadge(item.overall)}`}>
                      {item.overall}%
                    </span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{item.s1}%</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{item.s2}%</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{item.s3}%</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{item.s4}%</td>
                  <td className="py-3 px-3 font-semibold text-slate-700">{item.s5}%</td>
                  <td className="py-3 px-3">
                    <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                      {item.openNcs} NCs
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Unit & Zone Audit Inspector (Executive View-Only) */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900">
              Unit & Zone Audit Inspector (Executive View-Only)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Inspect specific zones across any of the 14 units without modifying audit data.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedUnit}
              onChange={(e) => {
                setSelectedUnit(e.target.value);
                const u = units.find((x) => x.code === e.target.value);
                if (u) setSelectedZone(Object.keys(u.zones)[0] || 'Zone 1');
              }}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
            >
              {units.map((u) => (
                <option key={u.code} value={u.code}>{u.name} ({u.code})</option>
              ))}
            </select>

            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30"
            >
              {Object.keys(currentUnitConfig.zones).map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="overflow-hidden rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3.5">5S Pillar</th>
                  <th className="py-2.5 px-3.5">Score</th>
                  <th className="py-2.5 px-3.5 text-right">% Compliance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {elements.map((e) => (
                  <tr key={e.k} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3.5 font-bold text-slate-900">{e.k}</td>
                    <td className="py-3 px-3.5 text-slate-600 font-medium">{e.score} / {e.max}</td>
                    <td className="py-3 px-3.5 text-right">
                      <span className="font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {Math.round((e.score / e.max) * 100)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-extrabold text-slate-800 mb-2">{selectedUnit} • {selectedZone} Radar Balance</span>
            <svg viewBox="0 0 260 260" className="w-52 h-52">
              {[0.25, 0.5, 0.75, 1].map((f) => (
                <polygon
                  key={f}
                  points={elements.map((_, i) => getPt(i, maxR * f).join(',')).join(' ')}
                  fill="none"
                  stroke="#cbd5e1"
                  strokeWidth="1"
                />
              ))}
              <polygon
                points={radarPolygonPoints}
                fill="#059669"
                fillOpacity="0.2"
                stroke="#059669"
                strokeWidth="2.5"
              />
            </svg>
          </div>
        </div>
      </div>

    </div>
  );
};
