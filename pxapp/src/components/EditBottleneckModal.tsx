import React, { useState, useRef, useEffect } from 'react';
import { Bottleneck, BottleneckCategory, BottleneckStatus, STATUS_PERCENT_MAP, UnitEmployee } from '../types';
import { CATEGORIES } from '../data/seedData';
import { api } from '../services/api';
import {
  X,
  Camera,
  Trash2,
  Save,
  AlertTriangle,
  Calendar,
  Layers,
  Sparkles,
  ListTodo,
  CheckCircle2,
  Check,
  Plus,
  History,
  UserCheck,
  ShieldAlert,
  Clock
} from 'lucide-react';

interface EditBottleneckModalProps {
  isOpen: boolean;
  onClose: () => void;
  bottleneck: Bottleneck;
  unitId: string;
  unitName?: string;
  onUpdate: (unitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => void;
  onDelete?: (unitId: string, bottleneckId: string) => void;
  currentUserRole?: string;
}

export const EditBottleneckModal: React.FC<EditBottleneckModalProps> = ({
  isOpen,
  onClose,
  bottleneck,
  unitId,
  unitName,
  onUpdate,
  onDelete,
  currentUserRole = 'Unit Head'
}) => {
  const [title, setTitle] = useState(bottleneck.title || '');
  const [category, setCategory] = useState<BottleneckCategory>(bottleneck.category || 'OPD Wait Time');
  const [department, setDepartment] = useState(bottleneck.department || '');
  const [status, setStatus] = useState<BottleneckStatus>(bottleneck.status === 'Pending' ? 'Not Started' : (bottleneck.status || 'Not Started'));
  const [percentComplete, setPercentComplete] = useState<number>(bottleneck.percentComplete || 0);
  const [owner, setOwner] = useState(bottleneck.owner || '');
  const [impactLevel, setImpactLevel] = useState<'High' | 'Medium' | 'Low'>(bottleneck.impactLevel || 'Medium');
  const [targetDate, setTargetDate] = useState(bottleneck.targetDate || '');
  const [notes, setNotes] = useState(bottleneck.notes || '');
  const [remarks, setRemarks] = useState(bottleneck.remarks || '');
  const [beforePhotos, setBeforePhotos] = useState<string[]>(bottleneck.beforePhotos || []);
  const [afterPhotos, setAfterPhotos] = useState<string[]>(bottleneck.afterPhotos || []);
  const [tasks, setTasks] = useState<{ id: string; text: string; isCompleted: boolean }[]>(bottleneck.tasks || []);
  const [newPointText, setNewPointText] = useState('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([...CATEGORIES]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [unitEmployees, setUnitEmployees] = useState<UnitEmployee[]>([]);
  const [assignedEmployeeId, setAssignedEmployeeId] = useState(bottleneck.assignedEmployeeId || '');
  const [assignedEmployeeName, setAssignedEmployeeName] = useState(bottleneck.assignedEmployeeName || '');
  const [assignedEmployeeDept, setAssignedEmployeeDept] = useState(bottleneck.assignedEmployeeDept || '');
  const [assignedEmployeeEmail, setAssignedEmployeeEmail] = useState(bottleneck.assignedEmployeeEmail || '');
  const [requiresMhqIntervention, setRequiresMhqIntervention] = useState(Boolean(bottleneck.requiresMhqIntervention));

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (bottleneck) {
      setTitle(bottleneck.title || '');
      setCategory(bottleneck.category || 'OPD Wait Time');
      setDepartment(bottleneck.department || '');
      setStatus(bottleneck.status === 'Pending' ? 'Pending Acknowledgement' : (bottleneck.status || 'Not Started'));
      setPercentComplete(bottleneck.percentComplete || 0);
      setOwner(bottleneck.owner || '');
      setImpactLevel(bottleneck.impactLevel || 'Medium');
      setTargetDate(bottleneck.targetDate || '');
      setNotes(bottleneck.notes || '');
      setRemarks(bottleneck.remarks || '');
      setBeforePhotos(bottleneck.beforePhotos || []);
      setAfterPhotos(bottleneck.afterPhotos || []);
      setTasks(bottleneck.tasks || []);
      setAssignedEmployeeId(bottleneck.assignedEmployeeId || '');
      setAssignedEmployeeName(bottleneck.assignedEmployeeName || '');
      setAssignedEmployeeDept(bottleneck.assignedEmployeeDept || '');
      setAssignedEmployeeEmail(bottleneck.assignedEmployeeEmail || '');
      setRequiresMhqIntervention(Boolean(bottleneck.requiresMhqIntervention));
    }
  }, [bottleneck]);

  useEffect(() => {
    if (isOpen) {
      api.getCategories()
        .then((cats) => {
          if (cats && cats.length > 0) {
            setAvailableCategories(cats.map(c => c.name));
          }
        })
        .catch(() => {});

      if (unitId) {
        api.getUnitEmployees(unitId, true)
          .then((emps) => setUnitEmployees(emps))
          .catch(() => {});
      }
    }
  }, [isOpen, unitId]);

  if (!isOpen) return null;

  const handleStatusChange = (newStatus: BottleneckStatus) => {
    setStatus(newStatus);
    if (newStatus === 'Completed') setPercentComplete(100);
    else if (newStatus === 'Not Started') setPercentComplete(0);
    else if (percentComplete === 0 || percentComplete === 100) setPercentComplete(50);
  };

  const handlePercentChange = (pct: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(pct)));
    setPercentComplete(clamped);
    if (clamped >= 100) setStatus('Completed');
    else if (clamped <= 0) setStatus('Not Started');
    else setStatus('In progress');
  };

  const handleAddTask = () => {
    if (!newPointText.trim()) return;
    const newTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newPointText.trim(),
      isCompleted: false
    };
    setTasks(prev => [...prev, newTask]);
    setNewPointText('');
  };

  const handleToggleTask = (idx: number) => {
    setTasks(prev => prev.map((t, i) => i === idx ? { ...t, isCompleted: !t.isCompleted } : t));
  };

  const handleRemoveTask = (idx: number) => {
    setTasks(prev => prev.filter((_, i) => i !== idx));
  };

  const compressSingleFile = (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const maxDim = 1200;
          let { width, height } = img;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => resolve(event.target?.result as string);
        img.src = event.target?.result as string;
      };
      reader.onerror = () => resolve('');
      reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, target: 'before' | 'after') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessingPhotos(true);
    try {
      const urls = await Promise.all(Array.from(files).map(compressSingleFile));
      const valid = urls.filter(Boolean);
      if (target === 'before') {
        setBeforePhotos((prev) => [...prev, ...valid]);
      } else {
        setAfterPhotos((prev) => [...prev, ...valid]);
      }
    } finally {
      setIsProcessingPhotos(false);
      e.target.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    onUpdate(unitId, bottleneck.id, {
      title: title.trim(),
      category,
      department: department.trim() || undefined,
      status,
      percentComplete,
      owner: owner.trim() || 'Unit PX Team',
      impactLevel,
      targetDate: targetDate || bottleneck.targetDate,
      notes: notes.trim(),
      remarks: remarks.trim(),
      beforePhotos,
      afterPhotos,
      tasks,
      assignedEmployeeId: assignedEmployeeId || undefined,
      assignedEmployeeName: assignedEmployeeName || undefined,
      assignedEmployeeDept: assignedEmployeeDept || undefined,
      assignedEmployeeEmail: assignedEmployeeEmail || undefined,
      requiresMhqIntervention,
      lastUpdated: new Date().toISOString().split('T')[0]
    });

    onClose();
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(unitId, bottleneck.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header Bar */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-400 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center font-bold">
              <Layers className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">Edit Operational Bottleneck</h3>
              <p className="text-xs text-orange-100 font-medium">
                {unitName ? `${unitName} • ` : ''}ID: {bottleneck.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Delete Confirmation Banner */}
        {showDeleteConfirm && (
          <div className="bg-rose-50 border-b border-rose-200 p-4 text-rose-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-in fade-in">
            <div className="flex items-center gap-2 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Are you sure you want to permanently delete this bottleneck? This action cannot be undone.</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-black hover:bg-rose-700 shadow-xs cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Title */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Bottleneck Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Extended waiting time at dilation counter"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Category & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as BottleneckCategory)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                {availableCategories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Department / Specific Area
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="e.g., OPD Wing B, Pharmacy, Lab"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Owner & Impact Level */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Designated Owner / Champion
              </label>
              <input
                type="text"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g., Dr. Ramesh / Sister In-Charge"
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Impact Level
              </label>
              <select
                value={impactLevel}
                onChange={(e) => setImpactLevel(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="High">High Impact (Critical)</option>
                <option value="Medium">Medium Impact (Significant)</option>
                <option value="Low">Low Impact (Minor)</option>
              </select>
            </div>
          </div>

          {/* Workflow Status & Target Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Resolution Status
              </label>
              <select
                value={status}
                onChange={(e) => handleStatusChange(e.target.value as BottleneckStatus)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="Raised by MHQ">📢 Raised by MHQ</option>
                <option value="Pending Acknowledgement">⏳ Pending Acknowledgement</option>
                <option value="Acknowledged">👁️ Acknowledged</option>
                <option value="Assigned to Employee">👤 Assigned to Employee</option>
                <option value="In progress">⚡ In Progress</option>
                <option value="Requires MHQ Intervention">🚨 Requires MHQ Intervention</option>
                <option value="Resolved by Unit">🏥 Resolved by Unit</option>
                <option value="Resolved by MHQ">🏢 Resolved by MHQ</option>
                <option value="Completed">✅ Completed / Closed</option>
                <option value="Not Started">🟡 Not Started</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Target Resolution Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Assigned Unit Employee (Unit Employee Master) */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-orange-600" />
                <span>Assign to Unit Employee</span>
              </label>
              <span className="text-[10px] text-slate-500 font-medium">Unit Employee Master</span>
            </div>
            <select
              value={assignedEmployeeId}
              onChange={(e) => {
                const empId = e.target.value;
                setAssignedEmployeeId(empId);
                const emp = unitEmployees.find(u => u.id === empId);
                if (emp) {
                  setAssignedEmployeeName(emp.name);
                  setAssignedEmployeeDept(emp.department);
                  setAssignedEmployeeEmail(emp.email);
                  if (status === 'Pending Acknowledgement' || status === 'Raised by MHQ' || status === 'Acknowledged' || status === 'Not Started') {
                    setStatus('Assigned to Employee');
                  }
                } else {
                  setAssignedEmployeeName('');
                  setAssignedEmployeeDept('');
                  setAssignedEmployeeEmail('');
                }
              }}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
            >
              <option value="">-- Select Active Employee for {unitName || 'this Unit'} --</option>
              {unitEmployees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.name} — {emp.designation || emp.department} ({emp.department})
                </option>
              ))}
            </select>
            {assignedEmployeeName && (
              <div className="text-[11px] text-emerald-800 font-semibold flex items-center gap-2 pt-0.5">
                <span>✓ Assigned: <strong>{assignedEmployeeName}</strong> ({assignedEmployeeDept})</span>
                {assignedEmployeeEmail && <span className="text-slate-500">• {assignedEmployeeEmail}</span>}
              </div>
            )}
          </div>

          {/* MHQ Intervention Action Flag */}
          <div className="p-3.5 rounded-2xl border border-purple-200 bg-purple-50/70 flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-purple-600" />
                <span>Requires MHQ Central Intervention</span>
              </p>
              <p className="text-[11px] text-purple-700 mt-0.5">
                Flag this bottleneck if local unit resolution requires intervention from MHQ Operations Directorate.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                const next = !requiresMhqIntervention;
                setRequiresMhqIntervention(next);
                if (next) {
                  setStatus('Requires MHQ Intervention');
                } else if (status === 'Requires MHQ Intervention') {
                  setStatus('In progress');
                }
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer shrink-0 ${
                requiresMhqIntervention
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-purple-700 border border-purple-300 hover:bg-purple-100'
              }`}
            >
              {requiresMhqIntervention ? '✓ Flagged for MHQ' : 'Flag for MHQ'}
            </button>
          </div>

          {/* Percentage Complete Slider */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Completion Percentage:</span>
              <span className="font-black text-orange-600 text-sm">{percentComplete}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={percentComplete}
              onChange={(e) => handlePercentChange(Number(e.target.value))}
              className="w-full accent-orange-600 cursor-pointer"
            />
            <div className="flex items-center justify-between gap-1 pt-1">
              {[0, 25, 50, 75, 100].map((pct) => (
                <button
                  key={pct}
                  type="button"
                  onClick={() => handlePercentChange(pct)}
                  className={`px-2 py-0.5 text-[10px] font-black rounded-lg transition-all cursor-pointer ${
                    percentComplete === pct
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-orange-50'
                  }`}
                >
                  {pct}%
                </button>
              ))}
            </div>
          </div>

          {/* Problem Statement & Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Root Cause & Problem Statement
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Describe the operational breakdown, root cause, and patient impact..."
              className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Action Tasks Checklist */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <ListTodo className="w-4 h-4 text-orange-600" />
                <span>Action Checklist Tasks ({tasks.length})</span>
              </label>
            </div>

            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={newPointText}
                onChange={(e) => setNewPointText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTask();
                  }
                }}
                placeholder="Add sub-task or milestone..."
                className="flex-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="button"
                onClick={handleAddTask}
                className="px-3 py-1.5 rounded-xl bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 cursor-pointer flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            {tasks.length > 0 && (
              <div className="space-y-1.5 max-h-36 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200/80">
                {tasks.map((task, idx) => (
                  <div key={task.id || idx} className="flex items-center justify-between gap-2 p-1.5 bg-white rounded-lg border border-slate-100 text-xs">
                    <button
                      type="button"
                      onClick={() => handleToggleTask(idx)}
                      className="flex items-center gap-2 flex-1 text-left cursor-pointer"
                    >
                      <span className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        task.isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300'
                      }`}>
                        {task.isCompleted && <Check className="w-3 h-3" />}
                      </span>
                      <span className={task.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 font-medium'}>
                        {task.text}
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Photo Evidence Management */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            {/* Before Photos */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">Before Evidence</label>
                <button
                  type="button"
                  onClick={() => beforeInputRef.current?.click()}
                  className="text-[11px] font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>Add Photo</span>
                </button>
              </div>
              <input
                ref={beforeInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'before')}
                className="hidden"
              />
              <div className="flex items-center gap-2 overflow-x-auto p-2 bg-slate-50 rounded-xl border border-slate-200 min-h-[58px]">
                {beforePhotos.map((url, i) => (
                  <div key={i} className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden border border-slate-300 group">
                    <img src={url} alt="Before" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setBeforePhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {beforePhotos.length === 0 && (
                  <span className="text-[11px] text-slate-400 italic">No before photos</span>
                )}
              </div>
            </div>

            {/* After Photos */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700">After Evidence</label>
                <button
                  type="button"
                  onClick={() => afterInputRef.current?.click()}
                  className="text-[11px] font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                >
                  <Camera className="w-3 h-3" />
                  <span>Add Photo</span>
                </button>
              </div>
              <input
                ref={afterInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => handlePhotoUpload(e, 'after')}
                className="hidden"
              />
              <div className="flex items-center gap-2 overflow-x-auto p-2 bg-slate-50 rounded-xl border border-slate-200 min-h-[58px]">
                {afterPhotos.map((url, i) => (
                  <div key={i} className="relative w-11 h-11 shrink-0 rounded-lg overflow-hidden border border-slate-300 group">
                    <img src={url} alt="After" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAfterPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                {afterPhotos.length === 0 && (
                  <span className="text-[11px] text-slate-400 italic">No after photos</span>
                )}
              </div>
            </div>
          </div>

          {/* Update History Audit Trail */}
          {bottleneck.history && bottleneck.history.length > 0 && (
            <div className="pt-4 border-t border-slate-200">
              <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <History className="w-4 h-4 text-orange-600" />
                  <span>Update History & Audit Trail ({bottleneck.history.length})</span>
                </span>
                <span className="text-[10px] text-slate-400 font-medium">Automatic Field Auditing</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {bottleneck.history.slice().reverse().map((h, i) => (
                  <div key={h.id || i} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-1">
                      <span className="text-slate-800 font-black">{h.updatedBy} <span className="text-slate-500 font-semibold">({h.updatedRole || 'User'})</span></span>
                      <span className="text-slate-400 font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(h.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-700">
                      <span className="font-extrabold text-orange-800">{h.field || 'Field'}: </span>
                      <span className="line-through text-slate-400 mr-1.5">{h.previousValue}</span>
                      <span className="font-bold text-slate-900">→ {h.updatedValue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            {onDelete ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-3.5 py-2.5 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Bottleneck</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isProcessingPhotos}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black text-xs shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Changes</span>
              </button>
            </div>
          </div>

        </form>

      </div>
    </div>
  );
};
