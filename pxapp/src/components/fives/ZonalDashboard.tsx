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

  // Follow-up modal state
  const [activeFollowUpNc, setActiveFollowUpNc] = useState<FiveSNonConformity | null>(null);
  const [followUpNote, setFollowUpNote] = useState('');
  const [activeTab, setActiveTab] = useState<'departments' | 'ncs' | 'performance'>('departments');

  // Department Audit Status Mapping
  const deptStatuses = departmentsInZone.map((deptName) => {
    const match = audits.find(
      (a) => a.unit === targetUnit && a.zone === targetZone && a.department === deptName
    );
    const deptNcCount = zoneNcs.filter((n) => n.department === deptName && n.status !== 'Closed').length;

    return {
      name: deptName,
      isAudited: !!match,
      score: match ? match.compliancePercent : null,
      lastAuditDate: match ? match.auditDate : 'Pending Audit',
      openNcs: deptNcCount
    };
  });

  const auditedCount = deptStatuses.filter((d) => d.isAudited).length;
  const auditedPct = Math.round((auditedCount / (departmentsInZone.length || 1)) * 100);

  const zoneCompliance = Math.round(
    deptStatuses
      .filter((d) => d.score !== null)
      .reduce((sum, d) => sum + (d.score || 0), 0) / (auditedCount || 1)
  ) || 85;

  const handleSendFollowUp = () => {
    if (!activeFollowUpNc || !followUpNote.trim()) return;

    const newNote = {
      id: `fn-${Date.now()}`,
      author: currentUser.name,
      role: 'Zonal In-Charge',
      date: new Date().toISOString().slice(0, 10),
      text: followUpNote
    };

    const existing = activeFollowUpNc.followUpNotes || [];
    onUpdateNc(activeFollowUpNc.id, {
      followUpNotes: [...existing, newNote]
    });

    alert(`Follow-up notification sent to Department In-Charge for ${activeFollowUpNc.department}.`);
    setFollowUpNote('');
    setActiveFollowUpNc(null);
  };

  const handleVerifyClose = (nc: FiveSNonConformity) => {
    if (window.confirm(`Verify and formally close Non-Conformity ${nc.id}?`)) {
      onUpdateNc(nc.id, {
        status: 'Closed',
        closedDate: new Date().toISOString().slice(0, 10),
        daysToClose: 4
      });
    }
  };

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
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Zone Compliance</span>
            <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600"><TrendingUp className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-orange-600 mt-2">{zoneCompliance}%</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Rolling 30-Day Average</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Audits Completed</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><CheckCircle2 className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">
            {auditedCount} <span className="text-lg font-bold text-slate-400">/ {departmentsInZone.length}</span>
          </div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">{auditedPct}% Coverage Achieved</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Open Zone NCs</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">{openNcs.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Requires Department Action</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Closed NCs</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600"><ShieldCheck className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-teal-600 mt-2">{closedNcs.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Verified & Resolved</div>
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
                Departments Under {targetZone} — {unitConfig.name}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Track monthly audit execution progress and non-conformity density across all assigned departments.
              </p>
            </div>
            <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              Audit Target: 100% Monthly
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
                  <th className="py-3 px-4">Last Audited</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {deptStatuses.map((d) => (
                  <tr key={d.name} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{d.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        d.isAudited
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {d.isAudited ? <Check className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {d.isAudited ? 'Completed' : 'Pending Audit'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold">
                      {d.score !== null ? (
                        <span className="font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 text-xs">
                          {d.score}%
                        </span>
                      ) : (
                        <span className="text-slate-400 font-semibold">—</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {d.openNcs > 0 ? (
                        <span className="font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full text-xs">
                          {d.openNcs} Open
                        </span>
                      ) : (
                        <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full text-xs">
                          Clear
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 font-medium">{d.lastAuditDate}</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={onGoReports}
                        className="px-3 py-1 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                      >
                        Inspect Scores
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ZONE NON-CONFORMITIES */}
      {activeTab === 'ncs' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Non-Conformities in {targetZone}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Monitor corrective actions, send department reminders, and review before/after photo evidence.
              </p>
            </div>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {openNcs.length} Pending Closure
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {zoneNcs.map((nc) => (
              <div
                key={nc.id}
                className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 shadow-xs space-y-3 transition-all"
              >
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-black text-xs">
                      {nc.id}
                    </span>
                    <span className="font-extrabold text-xs text-slate-900">
                      {nc.department}
                    </span>
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      nc.status === 'Closed'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : nc.status === 'Submitted for Verification'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {nc.status}
                  </span>
                </div>

                {/* Description */}
                <div className="text-xs font-bold text-slate-800 leading-snug">
                  {nc.checkpointText}
                </div>

                {/* Auditor Comment */}
                <div className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <span className="font-bold text-slate-700 block mb-0.5">Auditor Remark:</span>
                  {nc.auditorComment || 'NC logged during audit.'}
                </div>

                {/* Photos */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">Before Photo:</span>
                    {nc.beforePhoto ? (
                      <img src={nc.beforePhoto} alt="Before" className="h-24 w-full object-cover rounded-xl border border-slate-200" />
                    ) : (
                      <div className="h-24 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[11px] text-slate-400 bg-slate-50">
                        No photo
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 block mb-1">After Photo:</span>
                    {nc.afterPhoto ? (
                      <img src={nc.afterPhoto} alt="After" className="h-24 w-full object-cover rounded-xl border border-slate-200" />
                    ) : (
                      <div className="h-24 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[11px] text-slate-400 bg-slate-50">
                        Awaiting fix
                      </div>
                    )}
                  </div>
                </div>

                {/* Follow-up Notes Log */}
                {nc.followUpNotes && nc.followUpNotes.length > 0 && (
                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="font-bold text-slate-700 block">Zonal Follow-up History:</span>
                    {nc.followUpNotes.map((f) => (
                      <div key={f.id} className="text-[11px]">
                        <strong>{f.role} ({f.date}):</strong> {f.text}
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    onClick={() => setActiveFollowUpNc(nc)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
                    <span>Follow Up</span>
                  </button>

                  {nc.status === 'Submitted for Verification' && (
                    <button
                      onClick={() => handleVerifyClose(nc)}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Verify & Close NC</span>
                    </button>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ZONE PERFORMANCE & RADAR */}
      {activeTab === 'performance' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">
              5S Element Balance — {targetZone} ({unitConfig.name})
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Rollup across all {departmentsInZone.length} departments under your zonal jurisdiction.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Element Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3.5">5S Pillar</th>
                    <th className="py-2.5 px-3.5">Status</th>
                    <th className="py-2.5 px-3.5 text-right">Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { k: '1S – Sort (Seiri)', s: '88%', status: 'Standard Met' },
                    { k: '2S – Set in Order (Seiton)', s: '84%', status: 'Standard Met' },
                    { k: '3S – Shine (Seiso)', s: '82%', status: 'Standard Met' },
                    { k: '4S – Standardize (Seiketsu)', s: '85%', status: 'Standard Met' },
                    { k: '5S – Sustain (Shitsuke)', s: '86%', status: 'Standard Met' }
                  ].map((row) => (
                    <tr key={row.k} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-3.5 font-bold text-slate-800">{row.k}</td>
                      <td className="py-3 px-3.5 text-slate-500 font-medium">
                        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold">
                          <Check className="w-3 h-3" />
                          {row.status}
                        </span>
                      </td>
                      <td className="py-3 px-3.5 font-black text-right text-emerald-700">{row.s}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Radar Preview */}
            <div className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-xs font-extrabold text-slate-800 mb-2">Zonal Radar Polygon</span>
              <svg viewBox="0 0 240 240" className="w-52 h-52">
                {[0.25, 0.5, 0.75, 1].map((f) => (
                  <polygon
                    key={f}
                    points="120,40 196,95 167,185 73,185 44,95"
                    transform={`scale(${f}) translate(${120 * (1 - f)}, ${120 * (1 - f)})`}
                    fill="none"
                    stroke="#cbd5e1"
                    strokeWidth="1"
                  />
                ))}
                <polygon
                  points="120,50 185,100 160,175 80,175 55,100"
                  fill="#ea580c"
                  fillOpacity="0.2"
                  stroke="#ea580c"
                  strokeWidth="2.5"
                />
              </svg>
              <div className="flex items-center gap-4 text-[11px] font-bold text-slate-500 mt-2">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />
                  Achieved: 85%
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" />
                  Target: 100%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Note Modal */}
      {activeFollowUpNc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Follow Up: {activeFollowUpNc.id}
                </h3>
              </div>
              <button
                onClick={() => setActiveFollowUpNc(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-slate-500">
              Send reminder note / inquiry to <strong>{activeFollowUpNc.department}</strong> in-charge regarding:
              <div className="font-bold text-slate-800 mt-1 p-2 bg-slate-50 rounded-xl border border-slate-200">
                "{activeFollowUpNc.checkpointText}"
              </div>
            </div>

            <textarea
              rows={3}
              value={followUpNote}
              onChange={(e) => setFollowUpNote(e.target.value)}
              placeholder="e.g. Please expedite after photos for cable management by tomorrow morning..."
              className="w-full p-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
            />

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setActiveFollowUpNc(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSendFollowUp}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send Follow Up</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
