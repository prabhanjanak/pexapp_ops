import React, { useState } from 'react';
import { Calendar, User, Clock, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { Bottleneck } from '../types';

interface AssignDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  bottleneck: Bottleneck | null;
  onConfirm: (targetDate: string, owner: string, remarks: string) => void;
}

export const AssignDeadlineModal: React.FC<AssignDeadlineModalProps> = ({
  isOpen,
  onClose,
  bottleneck,
  onConfirm
}) => {
  if (!isOpen || !bottleneck) return null;

  const defaultDate = bottleneck.targetDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [targetDate, setTargetDate] = useState<string>(defaultDate);
  const [owner, setOwner] = useState<string>(bottleneck.owner || 'Unit Lead');
  const [remarks, setRemarks] = useState<string>(bottleneck.remarks || '');
  const [error, setError] = useState<string>('');

  const setPresetDays = (days: number) => {
    const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    setTargetDate(d.toISOString().split('T')[0]);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetDate) {
      setError('Please specify a target completion deadline.');
      return;
    }
    onConfirm(targetDate, owner, remarks);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/20 rounded-xl">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Assign Work & Set Deadline</h3>
              <p className="text-[11px] text-amber-100 font-medium">Status Transition: 🟡 Assigned work</p>
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
            <span className="text-[11px] font-bold text-amber-900 uppercase tracking-wider block mb-0.5">
              Target Bottleneck:
            </span>
            <p className="text-xs font-extrabold text-slate-900 line-clamp-2">{bottleneck.title}</p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 text-rose-800 text-xs rounded-xl border border-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

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
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none cursor-pointer"
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

          {/* Owner / Assignee */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Assigned Lead / Action Owner
            </label>
            <div className="relative">
              <input
                type="text"
                id="assign-owner-name"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                placeholder="e.g. Ramesh K. (Front Desk Mgr)"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Action Plan / Remarks
            </label>
            <textarea
              rows={2}
              id="assign-remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Assigned to engineering for buzzer installation; trial starting Monday."
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
            />
          </div>

          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-500">
            ℹ️ <span className="font-semibold text-slate-700">Irreversible Workflow:</span> Once assigned, this task progresses forward and cannot be reverted back to Pending.
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
              className="flex items-center gap-1.5 px-5 py-2.5 btn-orange-gradient font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Confirm Assignment & Deadline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
