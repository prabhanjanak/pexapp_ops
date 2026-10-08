import React, { useState } from 'react';
import { FiveSUser, FiveSNonConformity } from './types';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  HelpCircle,
  Camera,
  Search,
  Filter,
  Check,
  X,
  Send,
  Eye,
  Clock,
  Sparkles,
  Building2,
  MessageSquare,
  FileText,
  ShieldCheck,
  Trash2
} from 'lucide-react';

interface NcReviewSectionProps {
  currentUser: FiveSUser;
  ncs: FiveSNonConformity[];
  onUpdateNc: (ncId: string, updates: Partial<FiveSNonConformity>) => void;
  onDeleteNc?: (ncId: string) => void;
  title?: string;
  subtitle?: string;
  allowedUnits?: string[];
  allowedZones?: string[];
}

export const NcReviewSection: React.FC<NcReviewSectionProps> = ({
  currentUser,
  ncs,
  onUpdateNc,
  onDeleteNc,
  title = '5S Non-Conformity (NC) Review & Closure Portal',
  subtitle = 'Formal review, verification, and closure governance for 5S audit observations across clinical and operational areas.',
  allowedUnits,
  allowedZones
}) => {
  // Scoped NCs
  const scopedNcs = ncs.filter((n) => {
    if (allowedUnits && allowedUnits.length > 0 && !allowedUnits.includes(n.unit)) return false;
    if (allowedZones && allowedZones.length > 0 && !allowedZones.includes(n.zone)) return false;
    return true;
  });

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedZone, setSelectedZone] = useState<string>('ALL');

  // Modals for Actions
  const [activeNcForAction, setActiveNcForAction] = useState<FiveSNonConformity | null>(null);
  const [actionType, setActionType] = useState<'close' | 'reopen' | 'request_info' | 'request_photo' | null>(null);
  const [actionNotes, setActionNotes] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  // Distinct Zones
  const uniqueZones = Array.from(new Set(scopedNcs.map((n) => n.zone))).sort();

  // Filtered NC List
  const filteredNcs = scopedNcs.filter((n) => {
    if (statusFilter !== 'ALL') {
      if (statusFilter === 'READY_FOR_REVIEW' && n.status !== 'Submitted for Verification') return false;
      if (statusFilter === 'OPEN' && (n.status === 'Closed')) return false;
      if (statusFilter === 'CLOSED' && n.status !== 'Closed') return false;
      if (statusFilter === 'INFO_REQUESTED' && n.status !== 'Info Requested') return false;
      if (statusFilter === 'REOPENED' && n.status !== 'Reopened') return false;
    }
    if (selectedZone !== 'ALL' && n.zone !== selectedZone) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        n.id.toLowerCase().includes(q) ||
        n.department.toLowerCase().includes(q) ||
        n.checkpointText.toLowerCase().includes(q) ||
        n.auditorComment.toLowerCase().includes(q) ||
        (n.correctiveAction && n.correctiveAction.toLowerCase().includes(q)) ||
        (n.preventiveAction && n.preventiveAction.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalCount = scopedNcs.length;
  const readyForReviewCount = scopedNcs.filter((n) => n.status === 'Submitted for Verification').length;
  const openCount = scopedNcs.filter((n) => n.status !== 'Closed').length;
  const closedCount = scopedNcs.filter((n) => n.status === 'Closed').length;
  const infoRequestedCount = scopedNcs.filter((n) => n.status === 'Info Requested').length;

  // Handle Action Execution
  const handleExecuteAction = () => {
    if (!activeNcForAction || !actionType) return;
    const nc = activeNcForAction;
    const dateStr = new Date().toISOString().slice(0, 10);
    const existingFollowUps = nc.followUpNotes || [];

    if (actionType === 'close') {
      onUpdateNc(nc.id, {
        status: 'Closed',
        closedDate: dateStr,
        closureReviewedBy: currentUser.name,
        closureReviewedRole: currentUser.roleLabel,
        closureComments: actionNotes.trim() || 'Verified and confirmed compliance restoration.',
        daysToClose: Math.max(1, Math.round((new Date(dateStr).getTime() - new Date(nc.raisedDate).getTime()) / (1000 * 60 * 60 * 24)))
      });
      showToast(`✅ Non-Conformity ${nc.id} verified and formally CLOSED.`);
    } else if (actionType === 'reopen') {
      if (!actionNotes.trim()) {
        alert('Please specify the reason for reopening this NC so the Department In-Charge can take corrective steps.');
        return;
      }
      const newFollowUp = {
        id: `fn-${Date.now()}`,
        author: currentUser.name,
        role: currentUser.roleLabel,
        date: dateStr,
        text: `NC REOPENED: ${actionNotes.trim()}`
      };
      onUpdateNc(nc.id, {
        status: 'Reopened',
        reopenReason: actionNotes.trim(),
        followUpNotes: [...existingFollowUps, newFollowUp]
      });
      showToast(`⚠️ Non-Conformity ${nc.id} reopened with feedback.`);
    } else if (actionType === 'request_info') {
      if (!actionNotes.trim()) {
        alert('Please state the additional information required from the department in-charge.');
        return;
      }
      const newFollowUp = {
        id: `fn-${Date.now()}`,
        author: currentUser.name,
        role: currentUser.roleLabel,
        date: dateStr,
        text: `INFORMATION REQUESTED: ${actionNotes.trim()}`
      };
      onUpdateNc(nc.id, {
        status: 'Info Requested',
        infoRequestedNotes: actionNotes.trim(),
        followUpNotes: [...existingFollowUps, newFollowUp]
      });
      showToast(`ℹ️ Information request sent to Department In-Charge for ${nc.id}.`);
    } else if (actionType === 'request_photo') {
      const noteText = actionNotes.trim() || 'Additional photographic evidence / documentation required showing restored physical 5S standard.';
      const newFollowUp = {
        id: `fn-${Date.now()}`,
        author: currentUser.name,
        role: currentUser.roleLabel,
        date: dateStr,
        text: `SUPPORTING EVIDENCE REQUESTED: ${noteText}`
      };
      onUpdateNc(nc.id, {
        status: 'Info Requested',
        requestPhotos: true,
        infoRequestedNotes: noteText,
        followUpNotes: [...existingFollowUps, newFollowUp]
      });
      showToast(`📷 Photographic / documentary evidence requested for ${nc.id}.`);
    }

    setActiveNcForAction(null);
    setActionType(null);
    setActionNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-bold border border-slate-700 animate-in fade-in duration-200">
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-orange-500 animate-pulse" />
              <h2 className="text-lg font-black text-slate-900">{title}</h2>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-1 max-w-3xl">
              {subtitle}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-xl bg-orange-50 text-orange-800 border border-orange-200 text-xs font-extrabold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
              Reviewer: {currentUser.name} ({currentUser.roleLabel})
            </span>
          </div>
        </div>

        {/* Quick KPI Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
            <span className="text-[11px] font-bold text-slate-500">Total Observations</span>
            <p className="text-xl font-black text-slate-900 mt-0.5">{totalCount}</p>
          </div>
          <div className="bg-purple-50 rounded-2xl p-3 border border-purple-200">
            <span className="text-[11px] font-bold text-purple-700 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-600" /> Ready for Review
            </span>
            <p className="text-xl font-black text-purple-900 mt-0.5">{readyForReviewCount}</p>
          </div>
          <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200">
            <span className="text-[11px] font-bold text-amber-700">Open / In Progress</span>
            <p className="text-xl font-black text-amber-900 mt-0.5">{openCount}</p>
          </div>
          <div className="bg-blue-50 rounded-2xl p-3 border border-blue-200">
            <span className="text-[11px] font-bold text-blue-700">Info Requested</span>
            <p className="text-xl font-black text-blue-900 mt-0.5">{infoRequestedCount}</p>
          </div>
          <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200">
            <span className="text-[11px] font-bold text-emerald-700">Formally Closed</span>
            <p className="text-xl font-black text-emerald-900 mt-0.5">{closedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by NC ID, Department, Checkpoint, Action..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-orange-500 bg-slate-50/50 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Zone Selector */}
          {uniqueZones.length > 1 && (
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-white text-slate-700 cursor-pointer focus:ring-2 focus:ring-orange-500 outline-none"
            >
              <option value="ALL">All Zones ({uniqueZones.length})</option>
              {uniqueZones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({scopedNcs.length})
            </button>
            <button
              onClick={() => setStatusFilter('READY_FOR_REVIEW')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'READY_FOR_REVIEW'
                  ? 'bg-purple-600 text-white shadow-2xs'
                  : 'text-purple-700 hover:text-purple-900'
              }`}
            >
              Ready ({readyForReviewCount})
            </button>
            <button
              onClick={() => setStatusFilter('OPEN')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'OPEN' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Pending ({openCount})
            </button>
            <button
              onClick={() => setStatusFilter('CLOSED')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'CLOSED' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-emerald-700 hover:text-emerald-900'
              }`}
            >
              Closed ({closedCount})
            </button>
          </div>
        </div>
      </div>

      {/* NC Review List */}
      {filteredNcs.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-10 text-center">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
          <h3 className="text-sm font-black text-slate-800">No Non-Conformities Found</h3>
          <p className="text-xs text-slate-500 mt-1">
            No audit non-conformities match your current filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredNcs.map((nc) => {
            const isReadyForVerification = nc.status === 'Submitted for Verification';
            const isClosed = nc.status === 'Closed';
            const isInfoRequested = nc.status === 'Info Requested';
            const isReopened = nc.status === 'Reopened';

            return (
              <div
                key={nc.id}
                className={`bg-white rounded-3xl border transition-all shadow-xs overflow-hidden ${
                  isReadyForVerification
                    ? 'border-purple-300 ring-2 ring-purple-100'
                    : isClosed
                    ? 'border-emerald-200 bg-slate-50/30'
                    : isReopened
                    ? 'border-rose-300 bg-rose-50/20'
                    : 'border-slate-200'
                }`}
              >
                {/* NC Top Bar */}
                <div className="px-5 py-3.5 bg-slate-50/80 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-black text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shadow-2xs">
                      {nc.id}
                    </span>
                    <span className="text-xs font-extrabold text-orange-900 bg-orange-100/70 px-2.5 py-0.5 rounded-md border border-orange-200">
                      {nc.unit} • {nc.zone} • {nc.department}
                    </span>
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {nc.section}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Raised: {nc.raisedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border flex items-center gap-1.5 ${
                        isClosed
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : isReadyForVerification
                          ? 'bg-purple-100 text-purple-900 border-purple-300 animate-pulse'
                          : isReopened
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : isInfoRequested
                          ? 'bg-blue-100 text-blue-800 border-blue-300'
                          : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                    >
                      {isClosed && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                      {isReadyForVerification && <Sparkles className="w-3.5 h-3.5 text-purple-600" />}
                      {isReopened && <RotateCcw className="w-3.5 h-3.5 text-rose-600" />}
                      {isInfoRequested && <HelpCircle className="w-3.5 h-3.5 text-blue-600" />}
                      {nc.status}
                    </span>

                    {/* Delete Option for Super Admin */}
                    {onDeleteNc && currentUser.role === 'superadmin' && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete NC ${nc.id}?`)) {
                            onDeleteNc(nc.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete NC"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Status Notice Banners if Reopened or Info Requested */}
                {nc.reopenReason && (
                  <div className="bg-rose-50 border-b border-rose-200 px-5 py-2.5 text-xs text-rose-900 flex items-start gap-2">
                    <RotateCcw className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black">Reopen Reason from Reviewer:</span> {nc.reopenReason}
                    </div>
                  </div>
                )}

                {nc.infoRequestedNotes && (
                  <div className="bg-blue-50 border-b border-blue-200 px-5 py-2.5 text-xs text-blue-900 flex items-start gap-2">
                    <HelpCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-black">Reviewer Clarification / Info Note:</span> {nc.infoRequestedNotes}
                    </div>
                  </div>
                )}

                {nc.requestPhotos && (
                  <div className="bg-amber-50 border-b border-amber-200 px-5 py-2 text-xs text-amber-900 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="font-bold">Reviewer requested photographic / documentary evidence from Department In-Charge.</span>
                  </div>
                )}

                {/* Main Content: Department-wise Before & After Comparison */}
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* LEFT: Before Section (Auditor Finding & Baseline) */}
                  <div className="bg-slate-50/70 rounded-2xl border border-slate-200 p-4 space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                          <Eye className="w-4 h-4 text-orange-600" />
                          <span>Auditor Before Section</span>
                        </div>
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${
                          nc.score === 0 ? 'bg-rose-50 text-rose-800 border-rose-200' : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}>
                          Score: {nc.score} / 3 ({nc.score === 0 ? 'Critical' : 'Major'})
                        </span>
                      </div>

                      {/* Before Photo */}
                      {nc.beforePhoto ? (
                        <div className="relative aspect-16/10 rounded-xl overflow-hidden border border-slate-200 shadow-2xs group">
                          <img
                            src={nc.beforePhoto}
                            alt="Auditor Before"
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            📷 Before Photo
                          </span>
                        </div>
                      ) : (
                        <div className="aspect-16/10 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-xs">
                          <Camera className="w-6 h-6 mb-1 text-slate-300" />
                          <span>No Before Photo Uploaded</span>
                        </div>
                      )}

                      {/* Checkpoint Detail */}
                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                          Checkpoint #{nc.checkpointNumber} • {nc.area}
                        </span>
                        <h4 className="text-xs font-extrabold text-slate-900 mt-0.5">
                          {nc.checkpointText}
                        </h4>
                      </div>

                      {/* Auditor Comment */}
                      <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block mb-0.5">
                          Auditor Finding & Comment
                        </span>
                        <p className="text-slate-700 italic font-medium leading-relaxed">
                          "{nc.auditorComment}"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: After Section (Department In-Charge Remediation & Evidence) */}
                  <div className="bg-emerald-50/30 rounded-2xl border border-emerald-200 p-4 space-y-3.5 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                        <div className="flex items-center gap-1.5 text-xs font-black text-emerald-900 uppercase tracking-wider">
                          <Sparkles className="w-4 h-4 text-emerald-600" />
                          <span>Department In-Charge After Section</span>
                        </div>
                        {nc.afterPhoto ? (
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                            Evidence Attached
                          </span>
                        ) : (
                          <span className="text-[10px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                            Awaiting Evidence
                          </span>
                        )}
                      </div>

                      {/* After Photo Evidence */}
                      {nc.afterPhoto ? (
                        <div className="relative aspect-16/10 rounded-xl overflow-hidden border border-emerald-300 shadow-2xs group">
                          <img
                            src={nc.afterPhoto}
                            alt="After Evidence"
                            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                          />
                          <span className="absolute top-2 left-2 bg-emerald-900/85 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                            📷 Remediation Evidence
                          </span>
                        </div>
                      ) : (
                        <div className="aspect-16/10 rounded-xl border-2 border-dashed border-emerald-200 bg-white/70 flex flex-col items-center justify-center text-slate-400 text-xs text-center p-3">
                          <Camera className="w-6 h-6 mb-1 text-emerald-400" />
                          <span className="font-bold text-slate-700">No After Photo Uploaded Yet</span>
                          <span className="text-[10px] text-slate-400 mt-0.5">Department In-Charge must attach photographic proof</span>
                        </div>
                      )}

                      {/* Supporting Answer */}
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-0.5">
                          Supporting Answer / Clarification
                        </span>
                        <p className="text-slate-800 font-medium">
                          {nc.supportingAnswer || (
                            <span className="text-slate-400 italic">No supporting answer submitted yet.</span>
                          )}
                        </p>
                      </div>

                      {/* Corrective Action */}
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-0.5">
                          Corrective Action (Immediate Remediation)
                        </span>
                        <p className="text-slate-800 font-semibold">
                          {nc.correctiveAction || (
                            <span className="text-slate-400 italic">No corrective action recorded yet.</span>
                          )}
                        </p>
                      </div>

                      {/* Preventive Action */}
                      <div className="bg-white p-3 rounded-xl border border-emerald-200 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 block mb-0.5">
                          Preventive Action (Systemic Recurrence Prevention)
                        </span>
                        <p className="text-slate-800 font-semibold">
                          {nc.preventiveAction || (
                            <span className="text-slate-400 italic">No preventive action recorded yet.</span>
                          )}
                        </p>
                      </div>

                      {/* Formal Closure Record if Closed */}
                      {isClosed && (
                        <div className="bg-emerald-100/60 p-3 rounded-xl border border-emerald-300 text-xs space-y-1">
                          <div className="flex items-center justify-between font-extrabold text-emerald-950">
                            <span>Formally Closed by: {nc.closureReviewedBy || 'Quality Reviewer'}</span>
                            <span>{nc.closedDate}</span>
                          </div>
                          {nc.closureComments && (
                            <p className="text-[11px] text-emerald-800 italic">
                              "{nc.closureComments}"
                            </p>
                          )}
                        </div>
                      )}

                    </div>
                  </div>

                </div>

                {/* Reviewer Action Bar (Options: Close, Reopen, Request Info, Request Photo) */}
                <div className="bg-slate-50 px-5 py-3.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500 font-medium">
                    Review Options for {currentUser.roleLabel}
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Action 1: Close NC */}
                    {!isClosed && (
                      <button
                        onClick={() => {
                          setActiveNcForAction(nc);
                          setActionType('close');
                          setActionNotes('');
                        }}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow-xs cursor-pointer transition-all"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Close NC</span>
                      </button>
                    )}

                    {/* Action 2: Reopen NC */}
                    {isClosed && (
                      <button
                        onClick={() => {
                          setActiveNcForAction(nc);
                          setActionType('reopen');
                          setActionNotes('');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen NC</span>
                      </button>
                    )}

                    {!isClosed && (
                      <button
                        onClick={() => {
                          setActiveNcForAction(nc);
                          setActionType('reopen');
                          setActionNotes('');
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold cursor-pointer transition-all"
                        title="Reject remediation and reopen with feedback"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reopen</span>
                      </button>
                    )}

                    {/* Action 3: Request Additional Info */}
                    <button
                      onClick={() => {
                        setActiveNcForAction(nc);
                        setActionType('request_info');
                        setActionNotes('');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold cursor-pointer transition-all"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                      <span>Request Info</span>
                    </button>

                    {/* Action 4: Request Supporting Photographs / Documents */}
                    <button
                      onClick={() => {
                        setActiveNcForAction(nc);
                        setActionType('request_photo');
                        setActionNotes('');
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 text-xs font-bold cursor-pointer transition-all"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Request Photos</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Action Dialog Modal */}
      {activeNcForAction && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {actionType === 'close' && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                {actionType === 'reopen' && <RotateCcw className="w-5 h-5 text-rose-600" />}
                {actionType === 'request_info' && <HelpCircle className="w-5 h-5 text-blue-600" />}
                {actionType === 'request_photo' && <Camera className="w-5 h-5 text-orange-600" />}
                <h3 className="text-base font-black text-slate-900">
                  {actionType === 'close' && `Formally Close NC — ${activeNcForAction.id}`}
                  {actionType === 'reopen' && `Reopen NC — ${activeNcForAction.id}`}
                  {actionType === 'request_info' && `Request Additional Information — ${activeNcForAction.id}`}
                  {actionType === 'request_photo' && `Request Supporting Photographs — ${activeNcForAction.id}`}
                </h3>
              </div>
              <button
                onClick={() => { setActiveNcForAction(null); setActionType(null); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-500">Department:</span>{' '}
                <span className="font-black text-slate-800">{activeNcForAction.department}</span> •{' '}
                <span className="text-slate-600">{activeNcForAction.checkpointText}</span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  {actionType === 'close' && 'Verification Notes / Confirmation Remarks'}
                  {actionType === 'reopen' && 'Reason for Reopening & Specific Defect in Resolution *'}
                  {actionType === 'request_info' && 'Specific Questions / Clarifications Needed *'}
                  {actionType === 'request_photo' && 'Photographic Evidence Requirements & Focus Areas'}
                </label>
                <textarea
                  rows={4}
                  value={actionNotes}
                  onChange={(e) => setActionNotes(e.target.value)}
                  placeholder={
                    actionType === 'close'
                      ? 'Verified on-site restoration. Standard labels, markings, and preventive protocols confirmed.'
                      : actionType === 'reopen'
                      ? 'Please explain why the remediation is inadequate and what additional actions are necessary...'
                      : actionType === 'request_info'
                      ? 'Specify questions regarding the preventive action, responsible owner, or maintenance frequency...'
                      : 'Specify required camera angles, close-up details of 5S labels, or supporting checklist logs...'
                  }
                  className="w-full p-3 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 outline-none text-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => { setActiveNcForAction(null); setActionType(null); }}
                className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteAction}
                className={`px-5 py-2 rounded-xl text-white text-xs font-black shadow-sm cursor-pointer ${
                  actionType === 'close'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : actionType === 'reopen'
                    ? 'bg-rose-600 hover:bg-rose-700'
                    : actionType === 'request_info'
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {actionType === 'close' && 'Confirm & Close NC'}
                {actionType === 'reopen' && 'Submit Reopen Notice'}
                {actionType === 'request_info' && 'Send Info Request'}
                {actionType === 'request_photo' && 'Request Photo Evidence'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
