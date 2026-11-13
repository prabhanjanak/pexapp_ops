import React, { useState, useEffect } from 'react';
import {
  Mail,
  Send,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  Award,
  AlertTriangle,
  Image as ImageIcon,
  ShieldCheck,
  UserCheck,
  RefreshCw,
  Plus,
  Trash2
} from 'lucide-react';
import { FiveSAudit, FiveSNonConformity } from './types';
import { resolveFiveSRecipients, getStoredFiveSContacts } from './fiveSContactDirectory';
import { api } from '../../services/api';

interface Send5SAuditEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  audit: FiveSAudit | null;
  ncs?: FiveSNonConformity[];
  onEmailSent?: () => void;
}

export const Send5SAuditEmailModal: React.FC<Send5SAuditEmailModalProps> = ({
  isOpen,
  onClose,
  audit,
  ncs = [],
  onEmailSent
}) => {
  const [toEmails, setToEmails] = useState<string[]>([]);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [toInput, setToInput] = useState('');
  const [ccInput, setCcInput] = useState('');
  const [subject, setSubject] = useState('');
  const [customNotes, setCustomNotes] = useState('');
  const [includePhotos, setIncludePhotos] = useState(true);

  const [isSending, setIsSending] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ messageId: string; recipients: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Pre-populate recipients and subject whenever the modal opens or audit changes
  useEffect(() => {
    if (!isOpen || !audit) return;

    const contacts = getStoredFiveSContacts();
    const resolved = resolveFiveSRecipients(
      audit.unit,
      audit.zone,
      audit.department,
      contacts
    );

    // Initial TO: Department In-Charge
    const initialTo: string[] = [];
    if (resolved.deptInchargeEmail && !initialTo.includes(resolved.deptInchargeEmail)) {
      initialTo.push(resolved.deptInchargeEmail);
    }

    // Initial CC: Unit Head and Zone In-Charge
    const initialCc: string[] = [];
    if (resolved.unitHeadEmail && !initialCc.includes(resolved.unitHeadEmail) && !initialTo.includes(resolved.unitHeadEmail)) {
      initialCc.push(resolved.unitHeadEmail);
    }
    if (resolved.zoneInchargeEmail && !initialCc.includes(resolved.zoneInchargeEmail) && !initialTo.includes(resolved.zoneInchargeEmail)) {
      initialCc.push(resolved.zoneInchargeEmail);
    }

    setToEmails(initialTo);
    setCcEmails(initialCc);

    const defaultSubject = `[5S Audit Report] ${audit.unit || 'Hospital Unit'} - ${audit.department || 'Department'} (${audit.auditNumber || 'AUD'}) - Score: ${audit.compliancePercent}%`;
    setSubject(defaultSubject);
    setCustomNotes('');
    setSuccessInfo(null);
    setErrorMsg(null);
  }, [isOpen, audit]);

  if (!isOpen || !audit) return null;

  // Extract photos count
  const photoKeys = audit.beforePhotos ? Object.keys(audit.beforePhotos).filter(k => audit.beforePhotos[k]?.length > 20) : [];
  const photosCount = photoKeys.length;

  const handleAddToEmail = () => {
    const trimmed = toInput.trim().toLowerCase();
    if (trimmed && trimmed.includes('@') && !toEmails.includes(trimmed)) {
      setToEmails([...toEmails, trimmed]);
      setToInput('');
    }
  };

  const handleRemoveToEmail = (email: string) => {
    setToEmails(toEmails.filter(e => e !== email));
  };

  const handleAddCcEmail = () => {
    const trimmed = ccInput.trim().toLowerCase();
    if (trimmed && trimmed.includes('@') && !ccEmails.includes(trimmed)) {
      setCcEmails([...ccEmails, trimmed]);
      setCcInput('');
    }
  };

  const handleRemoveCcEmail = (email: string) => {
    setCcEmails(ccEmails.filter(e => e !== email));
  };

  const handleSendEmail = async () => {
    if (toEmails.length === 0) {
      setErrorMsg('Please specify at least one primary recipient (TO)');
      return;
    }

    setIsSending(true);
    setErrorMsg(null);

    try {
      // Collect photo attachments
      const photosPayload = includePhotos && audit.beforePhotos
        ? Object.entries(audit.beforePhotos)
            .filter(([_, url]) => typeof url === 'string' && (url as string).length > 20)
            .map(([chkId, url]) => ({
              checkpointId: chkId,
              photoUrl: String(url),
              label: `Checkpoint ${chkId.toUpperCase()} Evidence`
            }))
        : [];

      const result = await api.send5SAuditEmail({
        audit,
        ncs,
        to: toEmails,
        cc: ccEmails,
        subject,
        customNotes: customNotes.trim() || undefined,
        photos: photosPayload
      });

      if (result.success) {
        setSuccessInfo({
          messageId: result.messageId,
          recipients: [...toEmails, ...ccEmails].join(', ')
        });
        if (onEmailSent) {
          onEmailSent();
        }
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        throw new Error('Server returned unsuccessful email response');
      }
    } catch (err: any) {
      console.error('[Send Email Error]:', err);
      setErrorMsg(err.message || 'Failed to dispatch email through Zoho SMTP server');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Signature Sankara Orange Gradient */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xs">
              <Mail className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  Send 5S Audit Report via Email
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/25 text-white border border-white/30">
                  Zoho SMTP (SSL)
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium mt-0.5">
                Dispatch official audit findings, compliance scores & photo evidence to Department In-Charge & Unit Leadership
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSending}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          
          {/* Audit Metrics Banner */}
          <div className="bg-orange-50/70 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-orange-950 uppercase tracking-wide">
                <Building2 className="w-4 h-4 text-orange-600 shrink-0" />
                <span>{audit.unit} • {audit.zone} • {audit.department}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Audit #{audit.auditNumber} ({audit.auditDate})
                </span>
                <span className="text-slate-300">•</span>
                <span className="flex items-center gap-1 font-semibold text-slate-700">
                  <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                  Auditor: {audit.auditorName}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase text-slate-500">5S Compliance</div>
                <div className={`text-xl font-black ${
                  audit.compliancePercent >= 85 ? 'text-emerald-600' :
                  audit.compliancePercent >= 70 ? 'text-amber-600' : 'text-rose-600'
                }`}>
                  {audit.compliancePercent}%
                </div>
              </div>
              <div className="h-9 w-px bg-orange-200/80" />
              <div className="text-right">
                <div className="text-[10px] font-bold uppercase text-slate-500">Action Items</div>
                <div className="text-xl font-black text-slate-800">
                  {ncs.length} <span className="text-xs font-medium text-slate-500">NCs</span>
                </div>
              </div>
            </div>
          </div>

          {/* Success Banner */}
          {successInfo && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-start gap-3 text-emerald-900 animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-1">
                <div className="font-bold text-sm text-emerald-950">5S Audit Email Dispatched Successfully!</div>
                <div>Sent to: <strong>{successInfo.recipients}</strong></div>
                <div className="text-emerald-700 font-mono text-[11px]">Message ID: {successInfo.messageId}</div>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMsg && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 flex items-start gap-3 text-rose-900 animate-in fade-in">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <div className="font-bold text-sm text-rose-950">Email Dispatch Failed</div>
                <div>{errorMsg}</div>
              </div>
            </div>
          )}

          {/* Recipients Section */}
          <div className="space-y-4">
            
            {/* Primary Recipients (TO): Department In-Charge */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                  Primary Recipient (TO: Department In-Charge)
                </label>
                <span className="text-[11px] text-slate-400">Responsible for resolving NCs</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex flex-wrap gap-2">
                  {toEmails.map(email => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100/90 text-orange-950 text-xs font-semibold border border-orange-200"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveToEmail(email)}
                        className="hover:text-rose-600 p-0.5 rounded-full cursor-pointer"
                        title="Remove recipient"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {toEmails.length === 0 && (
                    <span className="text-xs text-rose-600 font-medium italic py-1">
                      No primary recipient specified. Please add an email address below.
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/70">
                  <input
                    type="email"
                    value={toInput}
                    onChange={(e) => setToInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddToEmail();
                      }
                    }}
                    placeholder="Add Department In-Charge email and press Enter..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddToEmail}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* CC Recipients: Unit Head & Zone In-Charge */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  Copies (CC: Unit Head & Zone In-Charge)
                </label>
                <span className="text-[11px] text-slate-400">Executive & leadership oversight</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <div className="flex flex-wrap gap-2">
                  {ccEmails.map(email => (
                    <span
                      key={email}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/90 text-slate-800 text-xs font-semibold border border-slate-300"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => handleRemoveCcEmail(email)}
                        className="hover:text-rose-600 p-0.5 rounded-full cursor-pointer"
                        title="Remove CC"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                  {ccEmails.length === 0 && (
                    <span className="text-xs text-slate-400 italic py-1">
                      No CC recipients. You may add Unit Head or Zone In-Charge below.
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-1 border-t border-slate-200/70">
                  <input
                    type="email"
                    value={ccInput}
                    onChange={(e) => setCcInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCcEmail();
                      }
                    }}
                    placeholder="Add Unit Head or Zone In-Charge email and press Enter..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={handleAddCcEmail}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>
            </div>

            {/* Subject Line */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Email Subject Line
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-2xl px-4 py-2 text-xs font-medium text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            {/* Custom Directives / Remarks */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Auditor Directives & Notes for In-Charge (Optional)
                </label>
                <span className="text-[11px] text-slate-400">Highlighted in the email body</span>
              </div>
              <textarea
                rows={3}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Please address critical sorting issues in the sterile pack corridor within 48 hours. Ensure standardized labels are replaced..."
                className="w-full bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 resize-none"
              />
            </div>

            {/* Attachments & Non-Conformities Summary Box */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includePhotos}
                    onChange={(e) => setIncludePhotos(e.target.checked)}
                    className="w-4 h-4 text-orange-600 rounded-sm border-slate-300 focus:ring-orange-500"
                  />
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <ImageIcon className="w-4 h-4 text-orange-600" />
                    Attach Audit Evidence Photographs ({photosCount} Photo{photosCount === 1 ? '' : 's'})
                  </span>
                </label>
              </div>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span>Includes {ncs.length} Action Items with target days & SOP directives</span>
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Sender: <strong>is.support@sankaraeye.com</strong> via Zoho SMTP SSL</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSending}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel / Close
            </button>
            <button
              type="button"
              onClick={handleSendEmail}
              disabled={isSending || toEmails.length === 0}
              className="px-5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSending ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Sending via Zoho SMTP...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Official Audit Report</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
