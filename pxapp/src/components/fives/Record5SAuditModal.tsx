import React, { useState } from 'react';
import { FiveSUser, FiveSUnitConfig, FiveSAudit, FiveSNonConformity } from './types';
import { FIVE_S_CHECKLIST } from './seedData';
import {
  X,
  ClipboardCheck,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Calendar,
  Building2,
  MapPin,
  Sparkles,
  Sliders,
  Send,
  Save,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';

interface Record5SAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: FiveSUser;
  units: FiveSUnitConfig[];
  defaultUnitCode?: string;
  defaultZoneName?: string;
  defaultDeptName?: string;
  lockUnit?: boolean;
  onAuditSubmitted: (audit: FiveSAudit, newNcs: FiveSNonConformity[]) => void;
}

export const Record5SAuditModal: React.FC<Record5SAuditModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  units,
  defaultUnitCode,
  defaultZoneName,
  defaultDeptName,
  lockUnit = false,
  onAuditSubmitted
}) => {
  const getResolvedUnitCode = (code?: string) => {
    if (!code) return currentUser.unit || 'CBE';
    const match = units.find(
      (u) =>
        u.code.toUpperCase() === code.toUpperCase() ||
        u.name.toLowerCase().includes(code.toLowerCase())
    );
    return match ? match.code : code.toUpperCase();
  };

  const [selectedUnitCode, setSelectedUnitCode] = useState<string>(() =>
    getResolvedUnitCode(defaultUnitCode)
  );

  React.useEffect(() => {
    if (defaultUnitCode) {
      setSelectedUnitCode(getResolvedUnitCode(defaultUnitCode));
    }
  }, [defaultUnitCode]);

  const activeUnitConfig =
    units.find((u) => u.code === selectedUnitCode) || units[0];
  const availableZones = Object.keys(activeUnitConfig.zones);

  const [selectedZoneName, setSelectedZoneName] = useState<string>(
    defaultZoneName && availableZones.includes(defaultZoneName)
      ? defaultZoneName
      : availableZones[0] || 'Zone 1'
  );

  const availableDepts = activeUnitConfig.zones[selectedZoneName] || [];
  const [selectedDeptName, setSelectedDeptName] = useState<string>(
    defaultDeptName && availableDepts.includes(defaultDeptName)
      ? defaultDeptName
      : availableDepts[0] || 'General Area'
  );

  const [auditDate, setAuditDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [evaluatorName, setEvaluatorName] = useState<string>(currentUser.name);
  const [evaluatorRole, setEvaluatorRole] = useState<string>(currentUser.roleLabel);

  // Mode: 'checklist' (36 items) | 'pillars' (Quick 5S points)
  const [entryMode, setEntryMode] = useState<'checklist' | 'pillars'>('checklist');

  // Checklist state: checkpointId -> score (0, 1, 2, 3)
  const [scores, setScores] = useState<Record<string, number>>({});
  const [comments, setComments] = useState<Record<string, string>>({});
  const [beforePhotos, setBeforePhotos] = useState<Record<string, string>>({});

  // Quick Pillar Points state (max: 18, 24, 18, 24, 24 = 108)
  const [pillarPoints, setPillarPoints] = useState<Record<string, number>>({
    '1S': 15,
    '2S': 20,
    '3S': 16,
    '4S': 21,
    '5S': 20
  });

  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Checklist Calculations
  const scoredCount = Object.keys(scores).length;
  const checklistTotalObtained = Object.values(scores).reduce((a, b) => a + b, 0);
  const checklistMaxPossible = 36 * 3; // 108
  const checklistCompliancePct =
    scoredCount > 0 ? Math.round((checklistTotalObtained / (scoredCount * 3)) * 100) : 0;

  // Pillar Points Calculations
  const pillarTotalObtained = Object.values(pillarPoints).reduce((a, b) => a + b, 0);
  const pillarCompliancePct = Math.round((pillarTotalObtained / 108) * 100);

  const effectiveTotal = entryMode === 'checklist' ? checklistTotalObtained : pillarTotalObtained;
  const effectiveMax = entryMode === 'checklist' ? (scoredCount > 0 ? scoredCount * 3 : 108) : 108;
  const effectivePct = entryMode === 'checklist' ? checklistCompliancePct : pillarCompliancePct;

  const handleScoreSelect = (checkpointId: string, val: number) => {
    setScores((prev) => ({ ...prev, [checkpointId]: val }));
  };

  const handlePhotoUploadSim = (checkpointId: string) => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1583912267550-d44d9c961f67?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=500&q=80',
      'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=500&q=80'
    ];
    const picked = samplePhotos[Math.floor(Math.random() * samplePhotos.length)];
    setBeforePhotos((prev) => ({ ...prev, [checkpointId]: picked }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (entryMode === 'checklist' && scoredCount < 10) {
      if (
        !window.confirm(
          `You have scored ${scoredCount} of 36 checkpoints. Do you want to submit this audit with unrated points counted as standard?`
        )
      ) {
        return;
      }
    }

    setIsSubmitting(true);

    const auditId = `AUD-${Date.now().toString().slice(-4)}`;
    const newNcs: FiveSNonConformity[] = [];

    // If in checklist mode, auto-generate NCs for scores 0 or 1
    if (entryMode === 'checklist') {
      Object.entries(scores).forEach(([cpId, scoreVal]) => {
        if (scoreVal <= 1) {
          const cp = FIVE_S_CHECKLIST.find((c) => c.id === cpId);
          if (cp) {
            newNcs.push({
              id: `NC-${Date.now().toString().slice(-3)}-${cp.slNo}`,
              auditId,
              unit: selectedUnitCode,
              zone: selectedZoneName,
              department: selectedDeptName,
              checkpointId: cp.id,
              checkpointText: `${cp.area} — ${cp.point}`,
              score: scoreVal,
              auditorComment: comments[cp.id] || 'Logged during 5S operational audit.',
              beforePhoto: beforePhotos[cp.id],
              raisedDate: auditDate,
              status: 'Open'
            });
          }
        }
      });
    }

    const newAudit: FiveSAudit = {
      id: auditId,
      auditNumber: `AUD-${selectedUnitCode}-${Date.now().toString().slice(-4)}`,
      unit: selectedUnitCode,
      zone: selectedZoneName,
      department: selectedDeptName,
      auditorId: currentUser.id,
      auditorName: evaluatorName,
      auditorDesignation: evaluatorRole,
      auditDate,
      month: new Date(auditDate).toLocaleDateString('en-US', { month: 'short' }),
      year: new Date(auditDate).getFullYear().toString(),
      scores: entryMode === 'checklist' ? scores : {},
      comments: entryMode === 'checklist' ? comments : {},
      beforePhotos: entryMode === 'checklist' ? beforePhotos : {},
      totalScore: effectiveTotal,
      maxScore: effectiveMax,
      compliancePercent: effectivePct,
      status: 'Submitted',
      submittedAt: new Date().toISOString()
    };

    onAuditSubmitted(newAudit, newNcs);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Signature Sankara Orange Gradient */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xs">
              <ClipboardCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Record 5S Audit & Add Points
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/25 text-white border border-white/30">
                  {evaluatorRole}
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium mt-0.5">
                Input departmental 5S scores, record findings, and log non-conformities
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Target Scope Selection Strip */}
          <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between text-xs font-black uppercase tracking-wider text-orange-900">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-orange-600" />
                Target Audit Scope & Evaluator Credentials
              </span>
              <span className="text-[11px] font-bold text-orange-700">
                Live Audit Scoring Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Unit Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Hospital Unit
                </label>
                <select
                  disabled={lockUnit}
                  value={selectedUnitCode}
                  onChange={(e) => {
                    setSelectedUnitCode(e.target.value);
                    const u = units.find((x) => x.code === e.target.value);
                    if (u) {
                      const firstZone = Object.keys(u.zones)[0] || 'Zone 1';
                      setSelectedZoneName(firstZone);
                      setSelectedDeptName(u.zones[firstZone]?.[0] || 'General Area');
                    }
                  }}
                  className={`w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none ${
                    lockUnit ? 'bg-slate-100 opacity-90 cursor-not-allowed' : ''
                  }`}
                >
                  {units.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.name} ({u.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Zone Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Zone
                </label>
                <select
                  value={selectedZoneName}
                  onChange={(e) => {
                    setSelectedZoneName(e.target.value);
                    const depts = activeUnitConfig.zones[e.target.value] || [];
                    setSelectedDeptName(depts[0] || 'General Area');
                  }}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {availableZones.map((z) => (
                    <option key={z} value={z}>{z}</option>
                  ))}
                </select>
              </div>

              {/* Department Selector */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Department / Work Area
                </label>
                <select
                  value={selectedDeptName}
                  onChange={(e) => setSelectedDeptName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-300 text-xs font-bold text-slate-800 bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                >
                  {availableDepts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 border-t border-orange-200/50">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Audit Date</label>
                <input
                  type="date"
                  value={auditDate}
                  onChange={(e) => setAuditDate(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Evaluator Name</label>
                <input
                  type="text"
                  value={evaluatorName}
                  onChange={(e) => setEvaluatorName(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Role / Designation</label>
                <input
                  type="text"
                  value={evaluatorRole}
                  onChange={(e) => setEvaluatorRole(e.target.value)}
                  className="w-full py-1.5 px-3 rounded-xl border border-slate-300 text-xs font-semibold text-slate-800 bg-white"
                />
              </div>
            </div>
          </div>

          {/* Scoring Mode Switcher & Live Score Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Input Mode:</span>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
                <button
                  type="button"
                  onClick={() => setEntryMode('checklist')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    entryMode === 'checklist'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  36 Checkpoints (Q1–Q36)
                </button>
                <button
                  type="button"
                  onClick={() => setEntryMode('pillars')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    entryMode === 'pillars'
                      ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Quick 5S Pillars Entry
                </button>
              </div>
            </div>

            {/* Live Score Counter */}
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500">Total Audit Points</div>
                <div className="text-lg font-black text-orange-600">
                  {effectiveTotal} <span className="text-xs text-slate-400 font-bold">/ {effectiveMax}</span>
                </div>
              </div>
              <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black text-sm shadow-sm">
                {effectivePct}%
              </div>
            </div>
          </div>

          {/* MODE A: 36 STANDARDIZED CHECKPOINTS */}
          {entryMode === 'checklist' && (
            <div className="space-y-4">
              {/* Section Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {['all', '1S', '2S', '3S', '4S', '5S'].map((sec) => (
                  <button
                    key={sec}
                    type="button"
                    onClick={() => setActiveSectionFilter(sec)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                      activeSectionFilter === sec
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {sec === 'all' ? 'All 36 Questions' : `${sec} Pillar`}
                  </button>
                ))}
              </div>

              {/* Checklist Items */}
              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
                {FIVE_S_CHECKLIST.filter((cp) => {
                  if (activeSectionFilter === 'all') return true;
                  return cp.section.startsWith(activeSectionFilter);
                }).map((cp) => {
                  const currentVal = scores[cp.id];
                  const hasPhoto = !!beforePhotos[cp.id];

                  return (
                    <div key={cp.id} className="p-4 hover:bg-slate-50/70 transition-colors space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-lg bg-orange-100 text-orange-800 font-black text-xs flex items-center justify-center shrink-0">
                            {cp.slNo}
                          </span>
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200 mr-2">
                              {cp.section.split('–')[0].trim()}
                            </span>
                            <span className="text-xs font-bold text-slate-900">{cp.area}</span>
                          </div>
                        </div>

                        {/* 4 Tactile Score Buttons */}
                        <div className="flex items-center gap-1.5 self-start sm:self-auto">
                          {[
                            { val: 0, label: '0 – Bad', cls: 'hover:bg-rose-500 hover:text-white', activeCls: 'bg-rose-600 text-white ring-2 ring-rose-600/30' },
                            { val: 1, label: '1 – Poor', cls: 'hover:bg-amber-500 hover:text-white', activeCls: 'bg-amber-600 text-white ring-2 ring-amber-600/30' },
                            { val: 2, label: '2 – Good', cls: 'hover:bg-teal-500 hover:text-white', activeCls: 'bg-teal-600 text-white ring-2 ring-teal-600/30' },
                            { val: 3, label: '3 – Best', cls: 'hover:bg-emerald-500 hover:text-white', activeCls: 'bg-emerald-600 text-white ring-2 ring-emerald-600/30' }
                          ].map((b) => (
                            <button
                              key={b.val}
                              type="button"
                              onClick={() => handleScoreSelect(cp.id, b.val)}
                              className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer border ${
                                currentVal === b.val
                                  ? b.activeCls
                                  : `bg-slate-100 text-slate-700 border-slate-200 ${b.cls}`
                              }`}
                            >
                              {b.val}
                            </button>
                          ))}
                        </div>
                      </div>

                      <p className="text-xs text-slate-700 font-medium pl-8">{cp.point}</p>
                      <p className="text-[11px] text-slate-500 italic pl-8">Evidence: {cp.evidence}</p>

                      {/* Non-Conformity Trigger & Photo input for 0 or 1 */}
                      {currentVal !== undefined && currentVal <= 1 && (
                        <div className="ml-8 mt-2 p-3 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                            <span className="flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                              Non-Conformity Detected (Score {currentVal}) — Requires Photo & Remarks
                            </span>
                            <button
                              type="button"
                              onClick={() => handlePhotoUploadSim(cp.id)}
                              className="flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-white px-2.5 py-1 rounded-lg border border-amber-300 hover:bg-amber-100 cursor-pointer shadow-2xs"
                            >
                              <Camera className="w-3.5 h-3.5" />
                              <span>{hasPhoto ? 'Photo Attached' : 'Attach Photo'}</span>
                            </button>
                          </div>

                          <input
                            type="text"
                            placeholder="Enter specific remark / non-conformity explanation..."
                            value={comments[cp.id] || ''}
                            onChange={(e) => setComments({ ...comments, [cp.id]: e.target.value })}
                            className="w-full py-1.5 px-3 rounded-lg border border-amber-300 bg-white text-xs text-slate-800 focus:outline-none"
                          />

                          {hasPhoto && (
                            <div className="flex items-center gap-2 pt-1">
                              <img
                                src={beforePhotos[cp.id]}
                                alt="NC Evidence"
                                className="w-12 h-12 rounded-lg object-cover border border-amber-300"
                              />
                              <span className="text-[11px] font-medium text-amber-800">
                                Photographic evidence recorded for corrective resolution
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* MODE B: QUICK 5S PILLARS ENTRY */}
          {entryMode === 'pillars' && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-5">
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Direct 5S Pillar Points Evaluation
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Adjust points for each of the 5 pillars. Ideal for executive spot audits or rapid monthly score inputs.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { key: '1S', name: '1S – Sort (Seiri)', max: 18, desc: 'Sorting essential from unneeded clinical items, red-tagging.' },
                  { key: '2S', name: '2S – Set in Order (Seiton)', max: 24, desc: 'Labeled locations, demarcations, shadow boards, signage.' },
                  { key: '3S', name: '3S – Shine (Seiso)', max: 18, desc: 'Equipment cleanliness, spill kits, daily cleaning check sheets.' },
                  { key: '4S', name: '4S – Standardize (Seiketsu)', max: 24, desc: 'Standard operating procedures, color coding, visual controls.' },
                  { key: '5S', name: '5S – Sustain (Shitsuke)', max: 24, desc: 'Shift discipline, Kaizen culture, self-audits and training.' }
                ].map((pillar) => {
                  const val = pillarPoints[pillar.key] || 0;
                  const pct = Math.round((val / pillar.max) * 100);

                  return (
                    <div key={pillar.key} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-extrabold text-sm text-slate-900">{pillar.name}</span>
                          <p className="text-xs text-slate-500">{pillar.desc}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-base font-black text-orange-600">{val}</span>
                          <span className="text-xs font-bold text-slate-400"> / {pillar.max}</span>
                          <span className="ml-2 font-black text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                            {pct}%
                          </span>
                        </div>
                      </div>

                      <input
                        type="range"
                        min="0"
                        max={pillar.max}
                        value={val}
                        onChange={(e) =>
                          setPillarPoints({ ...pillarPoints, [pillar.key]: parseInt(e.target.value) || 0 })
                        }
                        className="w-full accent-orange-600 cursor-pointer"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>Submit 5S Audit & Update Points</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
