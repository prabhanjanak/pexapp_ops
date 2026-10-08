import React, { useState } from 'react';
import { FiveSUser, FiveSNonConformity, FiveSAudit } from './types';
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Camera,
  Send,
  Upload,
  Lock,
  Building2,
  ShieldCheck,
  Eye,
  FileText,
  Sparkles,
  BarChart3,
  TrendingUp,
  X
} from 'lucide-react';

interface DepartmentDashboardProps {
  currentUser: FiveSUser;
  ncs: FiveSNonConformity[];
  onUpdateNc: (ncId: string, updates: Partial<FiveSNonConformity>) => void;
  onGoReports: () => void;
}

export const DepartmentDashboard: React.FC<DepartmentDashboardProps> = ({
  currentUser,
  ncs,
  onUpdateNc,
  onGoReports
}) => {
  // Strict Scope: Assigned Department Only
  const targetDept = currentUser.department || 'Doctor consultation rooms';
  const targetUnit = currentUser.unit || 'CBE';
  const targetZone = currentUser.zone || 'Zone 1';

  // Filter NCs for this specific department only
  const deptNcs = ncs.filter(
    (n) => n.department.toLowerCase() === targetDept.toLowerCase()
  );

  const openNcs = deptNcs.filter((n) => n.status !== 'Closed');
  const closedNcs = deptNcs.filter((n) => n.status === 'Closed');

  // Local state for editing corrective, preventive, and supporting answers
  const [editingActions, setEditingActions] = useState<Record<string, string>>({});
  const [editingPreventive, setEditingPreventive] = useState<Record<string, string>>({});
  const [editingAnswers, setEditingAnswers] = useState<Record<string, string>>({});
  const [afterPhotos, setAfterPhotos] = useState<Record<string, string>>({});
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCorrectiveActionChange = (id: string, text: string) => {
    setEditingActions((prev) => ({ ...prev, [id]: text }));
  };

  const handlePreventiveActionChange = (id: string, text: string) => {
    setEditingPreventive((prev) => ({ ...prev, [id]: text }));
  };

  const handleSupportingAnswerChange = (id: string, text: string) => {
    setEditingAnswers((prev) => ({ ...prev, [id]: text }));
  };

  const handleAfterPhotoUpload = (ncId: string) => {
    const samples = [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=500&q=80'
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setAfterPhotos((prev) => ({ ...prev, [ncId]: picked }));
  };

  const handleSubmitVerification = (nc: FiveSNonConformity) => {
    const actionText = editingActions[nc.id] !== undefined ? editingActions[nc.id] : (nc.correctiveAction || '');
    const prevText = editingPreventive[nc.id] !== undefined ? editingPreventive[nc.id] : (nc.preventiveAction || '');
    const ansText = editingAnswers[nc.id] !== undefined ? editingAnswers[nc.id] : (nc.supportingAnswer || '');

    if (!actionText.trim()) {
      alert('Please describe the immediate corrective action taken before submitting.');
      return;
    }
    if (!prevText.trim()) {
      alert('Please describe the preventive action taken to prevent recurrence.');
      return;
    }

    const photo = afterPhotos[nc.id] || nc.afterPhoto;

    onUpdateNc(nc.id, {
      correctiveAction: actionText,
      preventiveAction: prevText,
      supportingAnswer: ansText,
      afterPhoto: photo,
      status: 'Submitted for Verification'
    });

    setSuccessMsg(`Corrective & Preventive Action for ${nc.id} submitted for Auditor/Unit Head verification!`);
    setTimeout(() => setSuccessMsg(null), 5000);
  };

  // Performance data for own department
  const elements = [
    { k: '1S – Sort', short: '1S', score: 15, max: 18 },
    { k: '2S – Set in Order', short: '2S', score: 20, max: 24 },
    { k: '3S – Shine', short: '3S', score: 14, max: 18 },
    { k: '4S – Standardize', short: '4S', score: 19, max: 24 },
    { k: '5S – Sustain', short: '5S', score: 21, max: 24 }
  ];

  const totalScore = elements.reduce((a, b) => a + b.score, 0);
  const maxScore = elements.reduce((a, b) => a + b.max, 0);
  const compliancePct = Math.round((totalScore / maxScore) * 100);

  const monthsTrend = [
    { m: 'Jan', val: 68 },
    { m: 'Feb', val: 71 },
    { m: 'Mar', val: 70 },
    { m: 'Apr', val: 74 },
    { m: 'May', val: 76 },
    { m: 'Jun', val: 78 },
    { m: 'Jul', val: 80 },
    { m: 'Aug', val: 81 },
    { m: 'Sep', val: 84 }
  ];

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

  return (
    <div className="max-w-[1680px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Strict Scope Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50 border border-orange-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-orange-950 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <Lock className="w-4 h-4 text-orange-600 shrink-0" />
          <span>
            <strong>Isolated Department Scope:</strong> {targetDept} • {targetZone} • {targetUnit}
          </span>
        </div>
        <div className="text-[11px] font-bold text-orange-800 bg-white px-3 py-1 rounded-full border border-orange-200 shrink-0 shadow-2xs">
          Department In-Charge / Area Owner
        </div>
      </div>

      {successMsg && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-300 text-orange-950 text-sm font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-orange-700 hover:text-orange-950 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Stats KPI Overview */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <div className="text-3xl font-black text-amber-600">{openNcs.length}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Open Non-Conformities</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <div className="text-3xl font-black text-emerald-600">{closedNcs.length}</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Closed This Cycle</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <div className="text-3xl font-black text-slate-900">3.2 Days</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Average Days to Close</div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs">
          <div className="text-3xl font-black text-orange-600">{compliancePct}%</div>
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">Dept 5S Compliance</div>
        </div>
      </div>

      {/* Main Section: Actionable NC Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Active Non-Conformities Requiring Corrective Action
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Review auditor findings, implement corrective action, and upload after photos for audit verification.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
            {openNcs.length} Pending Actions
          </span>
        </div>

        {openNcs.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center text-slate-500 space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-black text-slate-900">All Non-Conformities Cleared!</h3>
            <p className="text-xs max-w-sm mx-auto font-medium">
              There are currently no open NCs for {targetDept}. Excellent workplace discipline and Kaizen maintenance.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {openNcs.map((nc) => {
              const currentAction = editingActions[nc.id] !== undefined ? editingActions[nc.id] : (nc.correctiveAction || '');
              const currentAfterPhoto = afterPhotos[nc.id] || nc.afterPhoto;

              return (
                <div
                  key={nc.id}
                  className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4 hover:border-amber-400 transition-all"
                >
                  {/* NC Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2.5">
                      <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-black text-xs border border-rose-200">
                        {nc.id}
                      </span>
                      <span className="text-xs font-black text-slate-900">
                        {nc.section} • Checkpoint #{nc.checkpointNumber}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 font-medium">Raised on: {nc.raisedDate}</span>
                      <span className={`text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        nc.status === 'Submitted for Verification'
                          ? 'bg-blue-100 text-blue-800 border border-blue-300'
                          : 'bg-amber-100 text-amber-900 border border-amber-300'
                      }`}>
                        {nc.status}
                      </span>
                    </div>
                  </div>

                  {/* Finding & Auditor Comment */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                    <div className="text-xs font-bold text-slate-900 mb-1">
                      {nc.checkpointText}
                    </div>
                    <blockquote className="text-xs text-slate-600 italic border-l-2 border-emerald-600 pl-2.5 py-0.5">
                      "{nc.auditorComment}" — Auditor Finding (Score: {nc.score})
                    </blockquote>
                  </div>

                  {/* Side-by-Side Photos */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Before Photo */}
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex flex-col justify-between">
                      <div className="text-[11px] font-bold text-slate-500 mb-2">
                        📷 Before Photo (Uploaded by Auditor)
                      </div>
                      {nc.beforePhoto ? (
                        <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-slate-200 shadow-2xs">
                          <img
                            src={nc.beforePhoto}
                            alt="Before NC"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="aspect-4/3 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">
                          No photo attached
                        </div>
                      )}
                    </div>

                    {/* After Photo */}
                    <div className="bg-emerald-50/40 border border-emerald-200 rounded-2xl p-3.5 flex flex-col justify-between">
                      <div className="text-[11px] font-bold text-emerald-900 mb-2 flex items-center justify-between">
                        <span>📷 After Photo (Remediation Evidence)</span>
                        {currentAfterPhoto && (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            Attached
                          </span>
                        )}
                      </div>

                      {currentAfterPhoto ? (
                        <div className="relative aspect-4/3 rounded-xl overflow-hidden border border-emerald-300 shadow-2xs group">
                          <img
                            src={currentAfterPhoto}
                            alt="After Photo"
                            className="w-full h-full object-cover"
                          />
                          <button
                            onClick={() => handleAfterPhotoUpload(nc.id)}
                            className="absolute bottom-2 right-2 px-2.5 py-1 rounded-lg bg-white/95 backdrop-blur-xs text-[10px] font-bold text-slate-800 shadow-xs cursor-pointer hover:bg-white"
                          >
                            Replace Photo
                          </button>
                        </div>
                      ) : (
                        <div className="aspect-4/3 rounded-xl border-2 border-dashed border-emerald-300 bg-white flex flex-col items-center justify-center p-4 text-center">
                          <Camera className="w-6 h-6 text-orange-600 mb-1" />
                          <span className="text-xs font-bold text-slate-900">Upload Corrective Photo</span>
                          <span className="text-[10px] text-slate-500 mt-0.5">Show standard restored</span>
                          <button
                            type="button"
                            onClick={() => handleAfterPhotoUpload(nc.id)}
                            className="mt-2.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            Upload Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Reviewer Feedback / Clarification Notices */}
                  {nc.reopenReason && (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black">NC Reopened by Auditor / Unit Head:</span> {nc.reopenReason}
                      </div>
                    </div>
                  )}

                  {nc.infoRequestedNotes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-900 flex items-start gap-2">
                      <FileText className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-black">Clarification Requested by Reviewer:</span> {nc.infoRequestedNotes}
                      </div>
                    </div>
                  )}

                  {nc.requestPhotos && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 text-xs text-amber-900 flex items-center gap-2">
                      <Camera className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold">Auditor requested additional photographic evidence showing restored 5S state.</span>
                    </div>
                  )}

                  {/* Supporting Answer Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Supporting Answer / Department Explanation *
                    </label>
                    <textarea
                      rows={2}
                      value={editingAnswers[nc.id] !== undefined ? editingAnswers[nc.id] : (nc.supportingAnswer || '')}
                      onChange={(e) => handleSupportingAnswerChange(nc.id, e.target.value)}
                      placeholder="Explain the background, reason for deviation, and how the department evaluated this checkpoint..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Corrective Action Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Corrective Action Taken (Immediate Remediation) *
                    </label>
                    <textarea
                      rows={2}
                      value={currentAction}
                      onChange={(e) => handleCorrectiveActionChange(nc.id, e.target.value)}
                      placeholder="Detail immediate physical rearrangement, removal of unnecessary items, or standard restoring actions..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Preventive Action Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preventive Action (Systemic Fix to Avoid Recurrence) *
                    </label>
                    <textarea
                      rows={2}
                      value={editingPreventive[nc.id] !== undefined ? editingPreventive[nc.id] : (nc.preventiveAction || '')}
                      onChange={(e) => handlePreventiveActionChange(nc.id, e.target.value)}
                      placeholder="Detail daily check frequency, departmental responsibilities, or signage installed to ensure sustained adherence..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => {
                        const curPrev = editingPreventive[nc.id] !== undefined ? editingPreventive[nc.id] : (nc.preventiveAction || '');
                        const curAns = editingAnswers[nc.id] !== undefined ? editingAnswers[nc.id] : (nc.supportingAnswer || '');
                        onUpdateNc(nc.id, {
                          correctiveAction: currentAction,
                          preventiveAction: curPrev,
                          supportingAnswer: curAns,
                          afterPhoto: currentAfterPhoto
                        });
                        alert('Draft response, corrective action, and preventive action saved.');
                      }}
                      className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
                    >
                      Save Draft
                    </button>

                    <button
                      type="button"
                      onClick={() => handleSubmitVerification(nc)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-black shadow-sm transition-all cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit for Verification</span>
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Department 5S Performance */}
      <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5">
        <div className="border-b border-slate-100 pb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900">
              5S Performance — {targetDept}
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Department-level compliance metrics. Zone and unit-wide rollups are strictly restricted from this role.
            </p>
          </div>
          <button
            onClick={onGoReports}
            className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-200 cursor-pointer"
          >
            📊 View Full Department Reports
          </button>
        </div>

        {/* Score Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 font-black uppercase tracking-wider">
                <th className="py-2.5 px-3">5S Element</th>
                <th className="py-2.5 px-3">Score Obtained</th>
                <th className="py-2.5 px-3">Maximum Score</th>
                <th className="py-2.5 px-3">% Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {elements.map((e) => (
                <tr key={e.k} className="hover:bg-slate-50/70">
                  <td className="py-2.5 px-3 font-bold text-slate-900">{e.k}</td>
                  <td className="py-2.5 px-3">{e.score}</td>
                  <td className="py-2.5 px-3">{e.max}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      {Math.round((e.score / e.max) * 100)}%
                    </span>
                  </td>
                </tr>
              ))}
              <tr className="font-extrabold bg-slate-50">
                <td className="py-2.5 px-3 text-slate-900">Total</td>
                <td className="py-2.5 px-3">{totalScore}</td>
                <td className="py-2.5 px-3">{maxScore}</td>
                <td className="py-2.5 px-3 text-emerald-800 font-black">
                  {compliancePct}%
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Radar & Trend Visualizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Radar Pentagon */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-900 mb-2">
              Monthly 5S Radar Chart Balance
            </h4>
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
                fill="#059669"
                fillOpacity="0.22"
                stroke="#059669"
                strokeWidth="2"
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

          {/* Month on Month Bars */}
          <div className="flex flex-col justify-between p-4 bg-slate-50/70 rounded-2xl border border-slate-200">
            <div>
              <h4 className="text-xs font-bold text-slate-900 mb-1">
                Month-on-Month Compliance Trend
              </h4>
              <p className="text-[11px] text-slate-500 mb-4 font-medium">
                Own department progress over 2026
              </p>
            </div>

            <div className="flex items-end gap-2 h-36 pt-4">
              {monthsTrend.map((m, idx) => (
                <div key={m.m} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[9px] font-bold text-slate-500">{m.val}%</span>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      idx === monthsTrend.length - 1 ? 'bg-gradient-to-t from-orange-600 to-amber-500' : 'bg-orange-300'
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

    </div>
  );
};
