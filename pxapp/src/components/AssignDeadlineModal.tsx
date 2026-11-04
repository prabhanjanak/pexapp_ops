import React, { useState, useEffect } from 'react';
import { Calendar, User, Clock, CheckCircle2, X, AlertCircle, UserCheck, Building2 } from 'lucide-react';
import { Bottleneck, UnitEmployee } from '../types';
import { api } from '../services/api';

interface AssignDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  bottleneck: Bottleneck | null;
  unitId?: string;
  unitName?: string;
  onConfirm: (
    targetDate: string,
    owner: string,
    remarks: string,
    employee?: { id: string; name: string; dept: string; email: string }
  ) => void;
}

export const AssignDeadlineModal: React.FC<AssignDeadlineModalProps> = ({
  isOpen,
  onClose,
  bottleneck,
  unitId,
  unitName,
  onConfirm
}) => {
  if (!isOpen || !bottleneck) return null;

  const defaultDate = bottleneck.targetDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState<string>(defaultDate);
  const [owner, setOwner] = useState<string>(bottleneck.owner || '');
  const [remarks, setRemarks] = useState<string>(bottleneck.remarks || '');
  const [error, setError] = useState<string>('');
  const [unitEmployees, setUnitEmployees] = useState<UnitEmployee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(bottleneck.assignedEmployeeId || '');
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string; dept: string; email: string } | undefined>(
    bottleneck.assignedEmployeeName ? {
      id: bottleneck.assignedEmployeeId || '',
      name: bottleneck.assignedEmployeeName,
      dept: bottleneck.assignedEmployeeDept || '',
      email: bottleneck.assignedEmployeeEmail || ''
    } : undefined
  );

  const effectiveUnitId = unitId || bottleneck.unitId;

  useEffect(() => {
    if (effectiveUnitId) {
      api.getUnitEmployees(effectiveUnitId, true)
        .then((emps) => {
          setUnitEmployees(emps);
        })
        .catch(() => {});
    }
  }, [effectiveUnitId]);

  const setPresetDays = (days: number) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setTargetDate(d.toISOString().split('T')[0]);
  };

  const handleEmployeeSelect = (empId: string) => {
    setSelectedEmpId(empId);
    const emp = unitEmployees.find(e => e.id === empId);
    if (emp) {
      setSelectedEmployee({
        id: emp.id,
        name: emp.name,
        dept: emp.department,
        email: emp.email
      });
      setOwner(`${emp.name} (${emp.designation || emp.department})`);
    } else {
      setSelectedEmployee(undefined);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) {
      setError('Please specify a target completion deadline.');
      return;
    }
    onConfirm(targetDate, owner.trim() || 'Unit Lead', remarks.trim(), selectedEmployee);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <UserCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Assign Bottleneck to Unit Employee</h3>
              <p className="text-[11px] text-amber-100 font-medium">
                {unitName ? `${unitName} • ` : ''}Ownership & Target Timeline
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-amber-50/80 rounded-2xl border border-amber-200">
            <span className="text-[10px] font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
              Bottleneck Item:
            </span>
            <p className="text-xs font-extrabold text-slate-900 line-clamp-2">{bottleneck.title}</p>
            {bottleneck.department && (
              <p className="text-[11px] text-amber-800 font-semibold mt-0.5">Department: {bottleneck.department}</p>
            )}
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Unit Employee Selection Dropdown (Unit Employee Master) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>Select Unit Employee *</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Unit Employee Master</span>
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
            >
              <option value="">-- Choose Active Employee ({unitName || effectiveUnitId}) --</option>
              {unitEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.designation || emp.department} ({emp.department})
                </option>
              ))}
            </select>
            {selectedEmployee ? (
              <div className="mt-1.5 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-bold flex items-center justify-between">
                <span>👤 {selectedEmployee.name} ({selectedEmployee.dept})</span>
                <span className="text-[11px] text-emerald-700 font-medium">{selectedEmployee.email}</span>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Select an employee from the unit master or enter custom owner below.
              </p>
            )}
          </div>

          {/* Deadline Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Completion Deadline Date *</span>
              <span className="text-[10px] text-slate-400 font-medium">Target Date</span>
            </label>
            <div className="relative">
              <input
                type="date"
                required
                id="assign-deadline-date"
                value={targetDate}
                onChange={(e) => {
                  setTargetDate(e.target.value);
                  setError('');
                }}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
              />
            </div>

            {/* Quick preset buttons */}
            <div className="flex items-center gap-1.5 mt-2">
              <span className="text-[10px] text-slate-400 font-semibold">Quick Presets:</span>
              <button
                type="button"
                onClick={() => setPresetDays(7)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-orange-100 hover:text-orange-800 text-slate-600 rounded-md text-[10px] font-bold transition-colors cursor-pointer border border-slate-200"
              >
                +7 Days
              </button>
              <button
                type="button"
                onClick={() => setPresetDays(14)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-orange-100 hover:text-orange-800 text-slate-600 rounded-md text-[10px] font-bold transition-colors cursor-pointer border border-slate-200"
              >
                +14 Days
              </button>
              <button
                type="button"
                onClick={() => setPresetDays(30)}
                className="px-2 py-0.5 bg-slate-100 hover:bg-orange-100 hover:text-orange-800 text-slate-600 rounded-md text-[10px] font-bold transition-colors cursor-pointer border border-slate-200"
              >
                +30 Days
              </button>
            </div>
          </div>

          {/* Action Plan / Instructions */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Action Plan / Instructions for Assignee
            </label>
            <textarea
              rows={2}
              id="assign-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Assigned to Ranjitha to review patient queue flow with OPD nursing staff; trial starting Monday."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            ℹ️ <span className="font-semibold text-slate-700">Assignment Workflow:</span> The assigned employee and their department will be recorded and visible to both Unit Head and MHQ Operations Team.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="confirm-assign-work-btn"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Assignment & Notify
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
