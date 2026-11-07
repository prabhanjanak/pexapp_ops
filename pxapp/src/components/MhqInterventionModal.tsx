import React, { useState, useEffect } from 'react';
import { Zap, X, AlertCircle, Building2, ShieldAlert, FileText } from 'lucide-react';
import { Bottleneck, DepartmentItem } from '../types';
import { api } from '../services/api';

const DEFAULT_DEPARTMENTS: string[] = [
  'Central Operations Directorate (MHQ)',
  'Biomedical Engineering',
  'Procurement & Supply Chain',
  'IT & Digital Infrastructure',
  'Quality Assurance & Audit',
  'Outpatient (OPD)',
  'Inpatient & Daycare',
  'Operating Theatre (OT)',
  'Diagnostic & Laboratory',
  'Pharmacy & Dispensary',
  'Billing & TPA Insurance',
  'Patient Counselling',
  'Facility & Housekeeping'
];

interface MhqInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  bottleneck: Bottleneck | null;
  unitName?: string;
  onConfirm: (mhqDept: string, notes: string) => void;
  onClearFlag?: () => void;
}

export const MhqInterventionModal: React.FC<MhqInterventionModalProps> = ({
  isOpen,
  onClose,
  bottleneck,
  unitName,
  onConfirm,
  onClearFlag
}) => {
  if (!isOpen || !bottleneck) return null;

  const [departmentList, setDepartmentList] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [selectedDept, setSelectedDept] = useState<string>(
    bottleneck.mhqDepartment || 'Central Operations Directorate (MHQ)'
  );
  const [notes, setNotes] = useState<string>(bottleneck.mhqInterventionNotes || '');
  const [error, setError] = useState<string>('');
  const [loadingDepts, setLoadingDepts] = useState<boolean>(false);

  useEffect(() => {
    setSelectedDept(bottleneck.mhqDepartment || 'Central Operations Directorate (MHQ)');
    setNotes(bottleneck.mhqInterventionNotes || '');
    setError('');

    let isMounted = true;
    setLoadingDepts(true);
    api.getDepartments()
      .then((depts: DepartmentItem[]) => {
        if (!isMounted) return;
        if (depts && depts.length > 0) {
          const names = Array.from(new Set([
            ...DEFAULT_DEPARTMENTS,
            ...depts.map((d) => d.name).filter(Boolean)
          ]));
          setDepartmentList(names);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoadingDepts(false);
      });

    return () => {
      isMounted = false;
    };
  }, [bottleneck]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDept.trim()) {
      setError('Please select one MHQ Department for this intervention.');
      return;
    }
    setError('');
    onConfirm(selectedDept.trim(), notes.trim());
    onClose();
  };

  const isAlreadyFlagged = Boolean(bottleneck.requiresMhqIntervention);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-purple-200 animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/15 rounded-2xl backdrop-blur-md">
              <Zap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                <span>Resolved by MHQ</span>
                <span className="text-[10px] uppercase font-bold bg-purple-500/40 px-2 py-0.5 rounded-full border border-purple-300/30">
                  Intervention
                </span>
              </h3>
              <p className="text-xs text-purple-100 font-medium">
                Route to a central MHQ Department for resolution
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          {/* Target Bottleneck Summary */}
          <div className="p-3.5 bg-purple-50/60 rounded-2xl border border-purple-200">
            <div className="flex items-center justify-between text-[11px] font-bold text-purple-800 mb-1">
              <span>{unitName ? `Unit: ${unitName}` : 'Local Unit'}</span>
              <span className="px-2 py-0.5 rounded-md bg-purple-200/80 text-purple-900 font-extrabold text-[10px]">
                {bottleneck.category}
              </span>
            </div>
            <h4 className="text-sm font-black text-slate-900">
              {bottleneck.title}
            </h4>
            {bottleneck.department && (
              <p className="text-[11px] text-slate-500 mt-0.5">
                Local Dept: <span className="font-semibold text-slate-700">{bottleneck.department}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Department Dropdown Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>MHQ Central Department <span className="text-rose-500">*</span></span>
              </span>
              {loadingDepts && (
                <span className="text-[10px] text-slate-400 font-normal">Loading departments...</span>
              )}
            </label>
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors cursor-pointer"
              required
            >
              <option value="" disabled>-- Select one MHQ Department --</option>
              {departmentList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-500">
              Select the central department that needs to take action or provide resources to resolve this.
            </p>
          </div>

          {/* Intervention Requirement Notes */}
          <div className="space-y-1.5">
            <label className="block text-xs font-black text-slate-800 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>Intervention Requirement / Notes</span>
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Requires approval for new bio-medical equipment replacement / central procurement needed from vendor..."
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-colors"
            />
          </div>

          {/* Existing Flag Info */}
          {isAlreadyFlagged && (
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Currently Flagged for MHQ Intervention</p>
                <p className="text-amber-700">
                  Assigned Dept: <strong>{bottleneck.mhqDepartment || 'Not set'}</strong>
                  {bottleneck.mhqInterventionBy ? ` by ${bottleneck.mhqInterventionBy}` : ''}
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100">
            {isAlreadyFlagged && onClearFlag ? (
              <button
                type="button"
                onClick={() => {
                  onClearFlag();
                  onClose();
                }}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Clear MHQ Flag
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-800 active:scale-95 rounded-xl shadow-xs transition-all cursor-pointer"
            >
              <Zap className="w-4 h-4 text-amber-300" />
              <span>{isAlreadyFlagged ? 'Update MHQ Department' : 'Route to MHQ Department'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

