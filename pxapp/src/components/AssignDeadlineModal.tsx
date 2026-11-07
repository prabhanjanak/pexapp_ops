import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, User, Clock, CheckCircle2, X, AlertCircle, UserCheck, Building2, Sparkles, Check, ChevronRight } from 'lucide-react';
import { Bottleneck, UnitEmployee, User as UserModel } from '../types';
import { api } from '../services/api';

const DEFAULT_DEPARTMENTS: string[] = [
  'Facility & Maintenance',
  'Patient Care',
  'Operations',
  'Administration',
  'Outpatient (OPD)',
  'Inpatient & Daycare',
  'Operating Theatre (OT)',
  'Diagnostic & Laboratory',
  'Pharmacy & Dispensary',
  'Billing & TPA Insurance',
  'Patient Counselling',
  'Housekeeping & Sanitation',
  'Biomedical Engineering',
  'Quality Assurance & Audit',
  'IT & Digital Infrastructure'
];

interface AssignDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  bottleneck: Bottleneck | null;
  unitId?: string;
  unitName?: string;
  isAcceptMode?: boolean;
  currentUser?: UserModel;
  onConfirm: (
    targetDate: string,
    owner: string,
    remarks: string,
    employee?: { id: string; name: string; dept: string; email: string },
    department?: string,
    isAccepted?: boolean,
    markAsStarted?: boolean
  ) => void;
}

export const AssignDeadlineModal: React.FC<AssignDeadlineModalProps> = ({
  isOpen,
  onClose,
  bottleneck,
  unitId,
  unitName,
  isAcceptMode = false,
  currentUser,
  onConfirm
}) => {
  if (!isOpen || !bottleneck) return null;

  const defaultDate = bottleneck.targetDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState<string>(defaultDate);
  const [owner, setOwner] = useState<string>(bottleneck.owner || '');
  const [remarks, setRemarks] = useState<string>(bottleneck.remarks || '');
  const [department, setDepartment] = useState<string>(bottleneck.department || '');
  const [departmentList, setDepartmentList] = useState<string[]>(DEFAULT_DEPARTMENTS);
  const [error, setError] = useState<string>('');
  const [unitEmployees, setUnitEmployees] = useState<UnitEmployee[]>([]);
  const [selectedEmpId, setSelectedEmpId] = useState<string>(bottleneck.assignedEmployeeId || '');
  const [selectedEmployee, setSelectedEmployee] = useState<{ id: string; name: string; dept: string; email: string } | undefined>(
    bottleneck.assignedEmployeeName ? {
      id: bottleneck.assignedEmployeeId || '',
      name: bottleneck.assignedEmployeeName,
      dept: bottleneck.assignedEmployeeDept || bottleneck.department || '',
      email: bottleneck.assignedEmployeeEmail || ''
    } : undefined
  );
  // In accept mode, default to marking as started (In Progress • 25%)
  const [markAsStarted, setMarkAsStarted] = useState<boolean>(true);

  const effectiveUnitId = unitId || bottleneck.unitId;

  // Load Unit Employees & Departments
  useEffect(() => {
    if (effectiveUnitId) {
      api.getUnitEmployees(effectiveUnitId, true)
        .then((emps) => {
          setUnitEmployees(emps);
        })
        .catch(() => {});
    }

    api.getDepartments()
      .then((depts) => {
        if (depts && depts.length > 0) {
          const names = Array.from(new Set([
            ...DEFAULT_DEPARTMENTS,
            ...depts.map(d => d.name).filter(Boolean)
          ]));
          setDepartmentList(names);
        }
      })
      .catch(() => {});
  }, [effectiveUnitId]);

  // When bottleneck changes, reset states
  useEffect(() => {
    setTargetDate(bottleneck.targetDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
    setOwner(bottleneck.owner || '');
    setRemarks(bottleneck.remarks || '');
    setDepartment(bottleneck.department || '');
    setSelectedEmpId(bottleneck.assignedEmployeeId || '');
    setSelectedEmployee(
      bottleneck.assignedEmployeeName ? {
        id: bottleneck.assignedEmployeeId || '',
        name: bottleneck.assignedEmployeeName,
        dept: bottleneck.assignedEmployeeDept || bottleneck.department || '',
        email: bottleneck.assignedEmployeeEmail || ''
      } : undefined
    );
    setError('');
  }, [bottleneck]);

  // Quick preset days
  const setPresetDays = (days: number) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setTargetDate(d.toISOString().split('T')[0]);
  };

  // When Department is changed
  const handleDepartmentChange = (deptName: string) => {
    setDepartment(deptName);
    setError('');

    // If there is an employee matching this department, recommend or auto-select if unassigned
    if (deptName) {
      const match = unitEmployees.find(
        (e) => e.department.toLowerCase().includes(deptName.toLowerCase()) || deptName.toLowerCase().includes(e.department.toLowerCase())
      );
      if (match && (!selectedEmpId || !selectedEmployee)) {
        handleEmployeeSelect(match.id, deptName);
      }
    }
  };

  // When Employee is selected
  const handleEmployeeSelect = (empId: string, overrideDept?: string) => {
    setSelectedEmpId(empId);
    setError('');
    const emp = unitEmployees.find((e) => e.id === empId);
    if (emp) {
      setSelectedEmployee({
        id: emp.id,
        name: emp.name,
        dept: emp.department,
        email: emp.email
      });
      // Synchronize department to employee's department
      if (!department || overrideDept || !department.toLowerCase().includes(emp.department.toLowerCase())) {
        setDepartment(emp.department);
      }
      setOwner(`${emp.name} (${emp.designation || emp.department})`);
    } else {
      setSelectedEmployee(undefined);
    }
  };

  // Separate matching employees for easy 1-click selection
  const { matchingEmployees, otherEmployees } = useMemo(() => {
    if (!department) {
      return { matchingEmployees: unitEmployees, otherEmployees: [] };
    }
    const cleanDept = department.toLowerCase();
    const matches: UnitEmployee[] = [];
    const others: UnitEmployee[] = [];

    for (const emp of unitEmployees) {
      const empDept = (emp.department || '').toLowerCase();
      if (empDept.includes(cleanDept) || cleanDept.includes(empDept) ||
          (cleanDept.includes('maintenance') && empDept.includes('facility')) ||
          (cleanDept.includes('facility') && empDept.includes('maintenance'))) {
        matches.push(emp);
      } else {
        others.push(emp);
      }
    }
    return { matchingEmployees: matches, otherEmployees: others };
  }, [unitEmployees, department]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) {
      setError('Please specify a target completion deadline.');
      return;
    }
    onConfirm(
      targetDate,
      owner.trim() || 'Unit Lead',
      remarks.trim(),
      selectedEmployee,
      department.trim(),
      isAcceptMode,
      markAsStarted
    );
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className={`text-white px-6 py-4 flex items-center justify-between shrink-0 shadow-sm ${
          isAcceptMode
            ? 'bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800'
            : 'bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600'
        }`}>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              {isAcceptMode ? <Sparkles className="w-5 h-5 text-amber-300" /> : <UserCheck className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight flex items-center gap-2">
                <span>{isAcceptMode ? 'Accept & Acknowledge Bottleneck' : 'Assign Bottleneck & Set Ownership'}</span>
              </h3>
              <p className="text-xs text-white/90 font-medium">
                {unitName ? `${unitName} • ` : ''}
                {isAcceptMode ? 'Select Department & Assign Unit In-Charge to Begin Resolution' : 'Ownership & Target Timeline'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-4">
          
          {/* Bottleneck Summary Context */}
          <div className={`p-3.5 rounded-2xl border ${
            isAcceptMode ? 'bg-blue-50/70 border-blue-200' : 'bg-amber-50/80 border-amber-200'
          }`}>
            <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider mb-1 text-slate-500">
              <span>{isAcceptMode ? 'Logged Bottleneck by MHQ Operations' : 'Target Bottleneck Item'}</span>
              <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-black text-slate-800">
                {bottleneck.category}
              </span>
            </div>
            <p className="text-xs font-black text-slate-900 line-clamp-2">{bottleneck.title}</p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-600 mt-1.5">
              {bottleneck.raisedBy && (
                <span>Raised by: <strong className="text-slate-800">{bottleneck.raisedBy}</strong> {bottleneck.raisedByRole ? `(${bottleneck.raisedByRole})` : ''}</span>
              )}
              {currentUser?.name && isAcceptMode && (
                <span>• Unit Head: <strong className="text-slate-800">{currentUser.name}</strong></span>
              )}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Resolution / Action Status Choice in Accept Mode */}
          {isAcceptMode && (
            <div className="p-3.5 rounded-2xl border border-indigo-200 bg-indigo-50/60 space-y-2">
              <span className="text-xs font-black text-indigo-950 block">
                Bottleneck Acceptance & Resolution Status:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  markAsStarted ? 'bg-white border-indigo-500 shadow-xs ring-1 ring-indigo-500 text-indigo-950' : 'bg-white/60 border-indigo-200 text-slate-600 hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="statusChoice"
                    checked={markAsStarted}
                    onChange={() => setMarkAsStarted(true)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <strong className="block text-xs font-bold text-indigo-900">⚡ Start Resolving Immediately</strong>
                    <span className="text-[10px] text-slate-500">Status: In Progress • 25% initial progress</span>
                  </div>
                </label>

                <label className={`flex items-start gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                  !markAsStarted ? 'bg-white border-indigo-500 shadow-xs ring-1 ring-indigo-500 text-indigo-950' : 'bg-white/60 border-indigo-200 text-slate-600 hover:bg-white'
                }`}>
                  <input
                    type="radio"
                    name="statusChoice"
                    checked={!markAsStarted}
                    onChange={() => setMarkAsStarted(false)}
                    className="mt-0.5 accent-indigo-600"
                  />
                  <div>
                    <strong className="block text-xs font-bold text-slate-900">👁️ Acknowledge Only</strong>
                    <span className="text-[10px] text-slate-500">Status: Acknowledged • Queued for local action</span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* 1. Department Selection Dropdown */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select Department *</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Hospital Department List</span>
            </label>
            <select
              value={department}
              onChange={(e) => handleDepartmentChange(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer"
              required
            >
              <option value="">-- Choose Department (e.g. Facility & Maintenance, OPD, IPD...) --</option>
              {departmentList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 mt-1">
              Select the department responsible for resolving this bottleneck.
            </p>
          </div>

          {/* 2. Unit Employee Selection Dropdown (Linked to Department) */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UserCheck className="w-3.5 h-3.5 text-orange-600" />
                <span>Assign to Department Employee / In-Charge</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium">Unit Employee Master</span>
            </label>
            <select
              value={selectedEmpId}
              onChange={(e) => handleEmployeeSelect(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
            >
              <option value="">-- Choose Employee for {unitName || effectiveUnitId} --</option>
              
              {matchingEmployees.length > 0 && (
                <optgroup label={department ? `Recommended for ${department}` : 'Active Unit Employees'}>
                  {matchingEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      ★ {emp.name} — {emp.designation || emp.department} ({emp.department})
                    </option>
                  ))}
                </optgroup>
              )}

              {otherEmployees.length > 0 && (
                <optgroup label="Other Unit Employees">
                  {otherEmployees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} — {emp.designation || emp.department} ({emp.department})
                    </option>
                  ))}
                </optgroup>
              )}
            </select>

            {/* Quick 1-Click Suggestion Pill when department matches an employee */}
            {matchingEmployees.length > 0 && !selectedEmpId && (
              <div className="mt-2 flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-bold text-slate-500">Suggested In-Charge:</span>
                {matchingEmployees.map((emp) => (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleEmployeeSelect(emp.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold cursor-pointer transition-colors"
                  >
                    <span>👤 {emp.name} ({emp.designation || emp.department})</span>
                    <ChevronRight className="w-3 h-3 text-orange-600" />
                  </button>
                ))}
              </div>
            )}

            {/* Verified Selected Employee Card */}
            {selectedEmployee ? (
              <div className="mt-2 p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 font-bold flex flex-col gap-1 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-black text-emerald-950">
                    <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{selectedEmployee.name}</span>
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-200 text-emerald-900 text-[10px] font-black">
                    {selectedEmployee.dept}
                  </span>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium pl-5">
                  {selectedEmployee.email}
                </div>
              </div>
            ) : (
              <p className="text-[11px] text-slate-400 mt-1">
                Select an employee from the list or leave unassigned to set ownership to the general department team.
              </p>
            )}
          </div>

          {/* 3. Deadline Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Target Completion Deadline *</span>
              <span className="text-[10px] text-slate-400 font-medium">Target Date</span>
            </label>
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

          {/* 4. Action Plan / Instructions for Assignee */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Action Plan / Instructions for Assignee
            </label>
            <textarea
              rows={2}
              id="assign-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder={department ? `e.g. Assigned to ${selectedEmployee ? selectedEmployee.name : 'department lead'} to inspect ${department} requirements and rectify...` : 'e.g. Assigned to review queue flow with staff...'}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          {/* Workflow Info */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            ℹ️ <span className="font-semibold text-slate-700">Assignment Workflow:</span> The selected department and assigned employee will be synchronized across both Unit and MHQ Operations dashboards with full audit tracking.
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
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
              className={`flex items-center gap-1.5 px-5 py-2.5 text-white font-black text-xs rounded-xl shadow-md transition-all cursor-pointer ${
                isAcceptMode
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-500'
                  : 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isAcceptMode ? (markAsStarted ? 'Accept & Start Resolving' : 'Accept & Acknowledge') : 'Confirm Assignment & Notify'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
