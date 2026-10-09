import React, { useState, useEffect, useMemo } from 'react';
import { FiveSUser, FiveSUnitConfig, FiveSCheckpoint, FiveSAudit, FiveSNonConformity } from './types';
import { FIVE_S_CHECKLIST, FIVE_S_UNITS } from './seedData';
import {
  ClipboardCheck,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Save,
  Send,
  Eye,
  History,
  Lock,
  Calendar,
  User,
  Building2,
  MapPin,
  Check,
  X
} from 'lucide-react';
import { NcReviewSection } from './NcReviewSection';

interface AuditorDashboardProps {
  currentUser: FiveSUser;
  units: FiveSUnitConfig[];
  audits: FiveSAudit[];
  ncs: FiveSNonConformity[];
  onUpdateNc: (ncId: string, updates: Partial<FiveSNonConformity>) => void;
  onSaveAudit: (audit: Partial<FiveSAudit>) => void;
  onAuditSubmitted: (audit: FiveSAudit, newNcs: FiveSNonConformity[]) => void;
}

export const AuditorDashboard: React.FC<AuditorDashboardProps> = ({
  currentUser,
  units,
  audits,
  ncs,
  onUpdateNc,
  onSaveAudit,
  onAuditSubmitted
}) => {
  const [activeTab, setActiveTab] = useState<'conduct' | 'history' | 'nc_review'>('conduct');

  // Hospital Units available to the auditor (defaults to all 14 network units)
  const availableUnits = React.useMemo(() => {
    const list = units && units.length > 0 ? units : FIVE_S_UNITS;
    if (currentUser.allowedUnits && currentUser.allowedUnits.length > 0) {
      const filtered = list.filter((u) => 
        currentUser.allowedUnits?.includes(u.code) ||
        currentUser.allowedUnits?.some(code => code.toLowerCase() === u.code.toLowerCase() || u.name.toLowerCase().includes(code.toLowerCase()))
      );
      if (filtered.length > 0) return filtered;
    }
    return list;
  }, [units, currentUser.allowedUnits]);

  // Resolve initial selected unit
  const initialUnitCode = React.useMemo(() => {
    const raw = (currentUser.unit || '').toLowerCase().trim();
    const matched = availableUnits.find(
      (u) => u.code.toLowerCase() === raw || u.name.toLowerCase().includes(raw)
    );
    return matched?.code || availableUnits[0]?.code || 'CBE';
  }, [availableUnits, currentUser.unit]);

  const [selectedUnit, setSelectedUnit] = useState<string>(initialUnitCode);

  useEffect(() => {
    if (!availableUnits.some((u) => u.code === selectedUnit)) {
      setSelectedUnit(initialUnitCode);
    }
  }, [availableUnits, initialUnitCode, selectedUnit]);

  const currentUnitConfig = availableUnits.find((u) => u.code === selectedUnit) || availableUnits[0] || FIVE_S_UNITS[0];

  // Dynamic Zones in selected unit
  const availableZones = React.useMemo(() => {
    const zList = Object.keys(currentUnitConfig?.zones || {});
    return zList.length > 0 ? zList : ['Zone 1', 'Zone 2', 'Zone 3', 'Zone 4'];
  }, [currentUnitConfig]);

  const [selectedZone, setSelectedZone] = useState<string>(availableZones[0] || 'Zone 1');

  useEffect(() => {
    if (!availableZones.includes(selectedZone)) {
      setSelectedZone(availableZones[0] || 'Zone 1');
    }
  }, [availableZones, selectedZone]);

  // Dynamic Departments in selected zone
  const availableDepts = React.useMemo(() => {
    const depts = currentUnitConfig?.zones?.[selectedZone] || [];
    return depts.length > 0 ? depts : ['Doctor consultation rooms'];
  }, [currentUnitConfig, selectedZone]);

  const [selectedDept, setSelectedDept] = useState<string>(availableDepts[0] || 'Doctor consultation rooms');

  useEffect(() => {
    if (!availableDepts.includes(selectedDept)) {
      setSelectedDept(availableDepts[0] || 'Doctor consultation rooms');
    }
  }, [availableDepts, selectedDept]);

  const [auditDate, setAuditDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [auditorName, setAuditorName] = useState<string>(currentUser.name);
  const [designation, setDesignation] = useState<string>(currentUser.designation);

  // Scoring State: checkpointId -> score (0, 1, 2, 3)
  const [scores, setScores] = useState<Record<string, number>>({});
  // Comments: checkpointId -> comment string
  const [comments, setComments] = useState<Record<string, string>>({});
  // Before Photos: checkpointId -> photoUrl
  const [beforePhotos, setBeforePhotos] = useState<Record<string, string>>({});

  const [activeSectionFilter, setActiveSectionFilter] = useState<string>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState<string | null>(null);

  // Filter conducted audits by this auditor
  const myAudits = audits.filter(
    (a) => a.auditorName.toLowerCase() === currentUser.name.toLowerCase() || a.auditorId === currentUser.id
  );

  const totalQuestions = FIVE_S_CHECKLIST.length; // 36
  const scoredCount = Object.keys(scores).length;
  const currentScoreSum = Object.values(scores).reduce((a, b) => a + b, 0);
  const maxPossible = totalQuestions * 3; // 108
  const currentPct = scoredCount > 0 ? Math.round((currentScoreSum / (scoredCount * 3)) * 100) : 0;

  const handleScoreSelect = (checkpointId: string, val: number) => {
    setScores((prev) => ({ ...prev, [checkpointId]: val }));
  };

  const handleCommentChange = (checkpointId: string, text: string) => {
    setComments((prev) => ({ ...prev, [checkpointId]: text }));
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

  const handleRemovePhoto = (checkpointId: string) => {
    setBeforePhotos((prev) => {
      const copy = { ...prev };
      delete copy[checkpointId];
      return copy;
    });
  };

  const handleSubmitAudit = () => {
    if (scoredCount < totalQuestions) {
      if (!window.confirm(`You have scored ${scoredCount} of ${totalQuestions} checkpoints. Are you sure you wish to submit this audit with unrated points?`)) {
        return;
      }
    }

    setIsSubmitting(true);

    const auditId = `AUD-${Date.now().toString().slice(-4)}`;
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const curMonth = months[new Date().getMonth()];
    const curYear = new Date().getFullYear().toString();

    // Generate Non-Conformities for points scored 0 or 1
    const generatedNcs: FiveSNonConformity[] = [];
    FIVE_S_CHECKLIST.forEach((cp) => {
      const sc = scores[cp.id];
      if (sc === 0 || sc === 1) {
        generatedNcs.push({
          id: `NC-${Date.now().toString().slice(-3)}${cp.slNo}`,
          auditId,
          unit: selectedUnit,
          zone: selectedZone,
          department: selectedDept,
          checkpointId: cp.id,
          checkpointNumber: cp.slNo,
          section: cp.section,
          area: cp.area,
          checkpointText: cp.point,
          score: sc,
          auditorComment: comments[cp.id] || 'Non-conformity identified during regular monthly 5S assessment.',
          beforePhoto: beforePhotos[cp.id] || undefined,
          status: 'Pending',
          raisedDate: auditDate,
          targetDays: sc === 0 ? 3 : 7,
          assignedInCharge: `Department Lead (${selectedDept})`
        });
      }
    });

    const newAudit: FiveSAudit = {
      id: auditId,
      auditNumber: auditId,
      unit: selectedUnit,
      zone: selectedZone,
      department: selectedDept,
      auditorId: currentUser.id,
      auditorName,
      auditorDesignation: designation,
      auditDate,
      month: curMonth,
      year: curYear,
      scores,
      comments,
      beforePhotos,
      totalScore: currentScoreSum,
      maxScore: totalQuestions * 3,
      compliancePercent: currentPct,
      status: 'Submitted',
      submittedAt: new Date().toISOString()
    };

    setTimeout(() => {
      setIsSubmitting(false);
      onAuditSubmitted(newAudit, generatedNcs);
      setSubmissionSuccess(`Audit #${auditId} successfully submitted! ${generatedNcs.length} Non-Conformities were logged.`);
      setScores({});
      setComments({});
      setBeforePhotos({});
      setTimeout(() => setSubmissionSuccess(null), 6000);
    }, 400);
  };

  const sections = ['1S – Sort', '2S – Set in Order', '3S – Shine', '4S – Standardize', '5S – Sustain'] as const;

  return (
    <div className="max-w-[1680px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Scope Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50/70 to-orange-50 border border-orange-200/90 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-orange-950 shadow-2xs">
        <div className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold">
          <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
          <span>
            <strong>Current Audit Scope:</strong> {currentUnitConfig?.name || selectedUnit} • {selectedZone} • Department: {selectedDept}
          </span>
        </div>
        <div className="text-[11px] font-bold text-orange-800 bg-white px-3 py-1 rounded-full border border-orange-200 shrink-0 shadow-2xs flex items-center gap-1.5">
          <ClipboardCheck className="w-3.5 h-3.5 text-orange-600" />
          <span>Internal 5S Auditor • 14 Units Network</span>
        </div>
      </div>

      {/* Tabs & Progress */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('conduct')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'conduct'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <ClipboardCheck className="w-4 h-4" />
            <span>Conduct 5S Audit</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'history'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>My Submitted Audits ({myAudits.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('nc_review')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
              activeTab === 'nc_review'
                ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-sm'
                : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>NC Review & Verification</span>
          </button>
        </div>

        {/* Live Completion Indicator */}
        {activeTab === 'conduct' && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="text-right">
              <span className="text-xs text-slate-500 font-bold">Scored:</span>
              <span className="ml-1.5 font-black text-slate-900">
                {scoredCount} / {totalQuestions}
              </span>
            </div>
            <div className="w-28 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-gradient-to-r from-orange-600 to-amber-500 transition-all duration-300"
                style={{ width: `${(scoredCount / totalQuestions) * 100}%` }}
              />
            </div>
            <span className="text-xs font-black text-orange-800 bg-orange-100 px-2 py-0.5 rounded-md">
              {currentPct}%
            </span>
          </div>
        )}
      </div>

      {submissionSuccess && (
        <div className="p-4 rounded-2xl bg-orange-50 border border-orange-300 text-orange-950 text-sm font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-orange-600 shrink-0" />
            <span>{submissionSuccess}</span>
          </div>
          <button onClick={() => setSubmissionSuccess(null)} className="text-orange-700 hover:text-orange-950 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* VIEW 1: CONDUCT AUDIT */}
      {activeTab === 'conduct' && (
        <div className="space-y-6">
          
          {/* Target Clinical Area Selectors Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2 mb-4">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-700">
                <MapPin className="w-4 h-4 text-orange-600" />
                Target Hospital Unit & Clinical Assessment Scope
              </div>
              <span className="text-xs text-slate-500 font-medium">
                {availableUnits.length} Hospital Units Available for Internal Audit
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Unit Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-orange-600" />
                    Hospital Unit *
                  </span>
                  <span className="text-[10px] font-mono text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200 font-bold">
                    Code: {selectedUnit}
                  </span>
                </label>
                <select
                  value={selectedUnit}
                  onChange={(e) => {
                    const newUnitCode = e.target.value;
                    setSelectedUnit(newUnitCode);
                    const u = availableUnits.find((x) => x.code === newUnitCode);
                    if (u) {
                      const firstZ = Object.keys(u.zones)[0] || 'Zone 1';
                      setSelectedZone(firstZ);
                      setSelectedDept(u.zones[firstZ]?.[0] || 'Doctor consultation rooms');
                    }
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
                >
                  {availableUnits.map((u) => (
                    <option key={u.code} value={u.code}>
                      {u.name} ({u.city}, {u.state}) — [{u.code}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Zone Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Zone Classification *</span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {availableZones.length} Zones Available
                  </span>
                </label>
                <select
                  value={selectedZone}
                  onChange={(e) => {
                    const newZone = e.target.value;
                    setSelectedZone(newZone);
                    const depts = currentUnitConfig?.zones?.[newZone] || [];
                    if (depts.length > 0) {
                      setSelectedDept(depts[0]);
                    }
                  }}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
                >
                  {availableZones.map((z) => (
                    <option key={z} value={z}>
                      {z} ({currentUnitConfig?.zones?.[z]?.length || 0} departments)
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
                  <span>Department / Functional Area *</span>
                  <span className="text-[10px] text-slate-500 font-semibold">
                    {availableDepts.length} Areas
                  </span>
                </label>
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="w-full py-2.5 px-3.5 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer shadow-2xs"
                >
                  {availableDepts.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Active Clinical Target Confirmation Strip */}
            <div className="p-3 bg-orange-50/70 border border-orange-200/90 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2">
              <div className="flex flex-wrap items-center gap-2 text-slate-700">
                <span className="font-bold text-slate-900">Current Scope:</span>
                <span className="font-extrabold text-orange-700">{currentUnitConfig?.name}</span>
                <span className="text-slate-300">•</span>
                <span className="font-bold text-slate-800">{selectedZone}</span>
                <span className="text-slate-300">•</span>
                <span className="font-medium text-slate-700">{selectedDept}</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 px-3 py-1 rounded-full shrink-0">
                Ready for Assessment
              </span>
            </div>

            {/* Auditor Details & Date */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3.5 border-t border-slate-100">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Auditor Name
                </label>
                <input
                  type="text"
                  value={auditorName}
                  onChange={(e) => setAuditorName(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Designation
                </label>
                <input
                  type="text"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Date of Audit
                </label>
                <input
                  type="date"
                  value={auditDate}
                  onChange={(e) => setAuditDate(e.target.value)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-900"
                />
              </div>
            </div>

          </div>

          {/* Section Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveSectionFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                activeSectionFilter === 'all'
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              All 36 Checkpoints
            </button>
            {sections.map((sec) => (
              <button
                key={sec}
                onClick={() => setActiveSectionFilter(sec)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all cursor-pointer ${
                  activeSectionFilter === sec
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-xs'
                    : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>

          {/* Checklists Grouped by 5S Element */}
          <div className="space-y-6">
            {sections
              .filter((sec) => activeSectionFilter === 'all' || activeSectionFilter === sec)
              .map((sectionName) => {
                const sectionItems = FIVE_S_CHECKLIST.filter((cp) => cp.section === sectionName);

                return (
                  <div key={sectionName} className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs">
                    
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                      <div>
                        <h3 className="text-base font-black text-slate-900">
                          {sectionName}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">
                          {sectionItems.length} clinical checkpoints • Standards verification
                        </p>
                      </div>
                      <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        Max Score: {sectionItems.length * 3} Pts
                      </span>
                    </div>

                    {/* Question Items */}
                    <div className="divide-y divide-slate-100">
                      {sectionItems.map((cp) => {
                        const currentScore = scores[cp.id];
                        const hasNC = currentScore === 0 || currentScore === 1;

                        return (
                          <div key={cp.id} className="py-4 space-y-3">
                            
                            {/* Checkpoint Header & Evidence */}
                            <div className="flex items-start gap-3">
                              <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-900 font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                                {cp.slNo}
                              </span>
                              <div className="flex-1 min-w-0">
                                <div className="text-[11px] font-black uppercase tracking-wider text-emerald-700">
                                  {cp.area}
                                </div>
                                <div className="text-sm font-bold text-slate-900 leading-snug">
                                  {cp.point}
                                </div>
                                <div className="text-xs text-slate-500 italic mt-0.5">
                                  Evidence Standard: {cp.evidence}
                                </div>
                              </div>
                            </div>

                            {/* Scoring Buttons (0 to 3) */}
                            <div className="grid grid-cols-4 gap-2 pt-1">
                              {[
                                { val: 0, label: '0 • Out of Control', selectedClass: 'bg-rose-600 text-white border-rose-600 shadow-xs', normalClass: 'bg-rose-50/50 hover:bg-rose-100/70 text-rose-800 border-rose-200' },
                                { val: 1, label: '1 • Needs Improvement', selectedClass: 'bg-amber-500 text-white border-amber-500 shadow-xs', normalClass: 'bg-amber-50/50 hover:bg-amber-100/70 text-amber-800 border-amber-200' },
                                { val: 2, label: '2 • Standard Met', selectedClass: 'bg-teal-600 text-white border-teal-600 shadow-xs', normalClass: 'bg-teal-50/50 hover:bg-teal-100/70 text-teal-800 border-teal-200' },
                                { val: 3, label: '3 • Benchmark Practice', selectedClass: 'bg-emerald-600 text-white border-emerald-600 shadow-xs', normalClass: 'bg-emerald-50/50 hover:bg-emerald-100/70 text-emerald-800 border-emerald-200' }
                              ].map((btn) => {
                                const isSelected = currentScore === btn.val;

                                return (
                                  <button
                                    key={btn.val}
                                    type="button"
                                    onClick={() => handleScoreSelect(cp.id, btn.val)}
                                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-center gap-1 text-center ${
                                      isSelected ? btn.selectedClass : btn.normalClass
                                    }`}
                                  >
                                    <span className="text-sm font-black">{btn.val}</span>
                                    <span className="text-[10px] hidden sm:inline">({btn.label.split('• ')[1]})</span>
                                  </button>
                                );
                              })}
                            </div>

                            {/* Comment and NC Photo Row */}
                            <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
                              <input
                                type="text"
                                value={comments[cp.id] || ''}
                                onChange={(e) => handleCommentChange(cp.id, e.target.value)}
                                placeholder={
                                  hasNC
                                    ? '⚠️ Non-Conformity Identified: Describe exact findings and deviation...'
                                    : 'Auditor observations / notes (optional)...'
                                }
                                className={`flex-1 px-3 py-2 rounded-xl text-xs border transition-all ${
                                  hasNC
                                    ? 'border-amber-300 bg-amber-50/40 text-amber-950 placeholder:text-amber-700/60 focus:bg-white'
                                    : 'border-slate-200 bg-slate-50/70 text-slate-900 placeholder:text-slate-400 focus:bg-white'
                                }`}
                              />

                              {beforePhotos[cp.id] ? (
                                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                                  <img
                                    src={beforePhotos[cp.id]}
                                    alt="NC Preview"
                                    className="w-7 h-7 object-cover rounded-lg border border-slate-300"
                                  />
                                  <span className="text-[11px] font-bold text-slate-800">Photo Attached</span>
                                  <button
                                    onClick={() => handleRemovePhoto(cp.id)}
                                    className="text-rose-600 hover:text-rose-800 p-0.5 rounded cursor-pointer"
                                    title="Remove photo"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => handlePhotoUploadSim(cp.id)}
                                  className={`flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
                                    hasNC
                                      ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                                  }`}
                                >
                                  <Camera className="w-3.5 h-3.5" />
                                  <span>📷 Upload Before Photo</span>
                                </button>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>

                  </div>
                );
              })}
          </div>

          {/* Sticky Bottom Actions Bar */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg sticky bottom-4 z-20">
            <div>
              <div className="text-xs font-bold text-slate-500">
                Checkpoints Scored: <strong className="text-slate-900">{scoredCount} / {totalQuestions}</strong>
              </div>
              <div className="text-xs font-black text-orange-600 mt-0.5">
                Calculated Score: {currentScoreSum} / {maxPossible} ({currentPct}% Compliance)
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => alert('Draft saved successfully.')}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              >
                <Save className="w-4 h-4 text-slate-500" />
                <span>Save Draft</span>
              </button>

              <button
                type="button"
                onClick={handleSubmitAudit}
                disabled={isSubmitting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-black shadow-md shadow-orange-600/25 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Monthly Audit</span>
                  </>
                )}
              </button>
            </div>
          </div>

        </div>
      )}

      {/* VIEW 2: CONDUCTED AUDITS HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-black text-slate-900">
                Audits Conducted by {currentUser.name}
              </h2>
              <p className="text-xs text-slate-500">
                History of completed 5S audits across your assigned clinical units
              </p>
            </div>
            <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full border border-emerald-200">
              {myAudits.length} Audits On Record
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 font-black uppercase tracking-wider">
                  <th className="py-3 px-3">Audit #</th>
                  <th className="py-3 px-3">Unit</th>
                  <th className="py-3 px-3">Zone</th>
                  <th className="py-3 px-3">Department</th>
                  <th className="py-3 px-3">Audit Date</th>
                  <th className="py-3 px-3">Score</th>
                  <th className="py-3 px-3">Compliance</th>
                  <th className="py-3 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {myAudits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-3 font-bold text-slate-900">{a.auditNumber}</td>
                    <td className="py-3 px-3 font-extrabold text-emerald-700">{a.unit}</td>
                    <td className="py-3 px-3">{a.zone}</td>
                    <td className="py-3 px-3 font-semibold text-slate-800">{a.department}</td>
                    <td className="py-3 px-3 text-slate-500">{a.auditDate}</td>
                    <td className="py-3 px-3">{a.totalScore} / {a.maxScore}</td>
                    <td className="py-3 px-3">
                      <span className="font-black text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        {a.compliancePercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full text-[10.5px]">
                        <Check className="w-3 h-3" />
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDITOR NC REVIEW & CLOSURE */}
      {activeTab === 'nc_review' && (
        <NcReviewSection
          currentUser={currentUser}
          ncs={ncs}
          onUpdateNc={onUpdateNc}
          allowedUnits={availableUnits.map((u) => u.code)}
          title="Auditor NC Review & Verification Portal"
          subtitle="Review before/after remedial evidence, verify corrective & preventive actions, request additional clarifications/photographs, or confirm resolution."
        />
      )}

    </div>
  );
};
