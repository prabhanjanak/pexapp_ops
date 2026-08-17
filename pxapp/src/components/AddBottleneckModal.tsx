import React, { useState, useRef } from 'react';
import { Bottleneck, BottleneckCategory, BottleneckStatus, STATUS_PERCENT_MAP } from '../types';
import { CATEGORIES } from '../data/seedData';
import { X, PlusCircle, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';

interface AddBottleneckModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (newBottleneck: Omit<Bottleneck, 'id' | 'lastUpdated'>) => void;
  unitName: string;
}

export const AddBottleneckModal: React.FC<AddBottleneckModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  unitName
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BottleneckCategory>('OPD Wait Time');
  const [status, setStatus] = useState<BottleneckStatus>('Acknowledge');
  const [owner, setOwner] = useState('');
  const [impactLevel, setImpactLevel] = useState<'High' | 'Medium' | 'Low'>('High');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [remarks, setRemarks] = useState('');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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

  const removeBeforePhoto = (idx: number) => {
    setBeforePhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const removeAfterPhoto = (idx: number) => {
    setAfterPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const percent = STATUS_PERCENT_MAP[status] || 0;

    onAdd({
      title: title.trim(),
      category,
      status,
      percentComplete: percent,
      owner: owner.trim() || 'Unit PX Team',
      impactLevel,
      targetDate: targetDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes: notes.trim(),
      remarks: remarks.trim(),
      beforePhotos,
      afterPhotos
    });

    // Reset form
    setTitle('');
    setStatus('Acknowledge');
    setOwner('');
    setNotes('');
    setRemarks('');
    setBeforePhotos([]);
    setAfterPhotos([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Orange Gradient Accent */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-amber-100" />
            <h2 className="text-lg font-black tracking-tight">Log New PX Bottleneck</h2>
          </div>
          <button
            type="button"
            id="close-add-modal"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div className="bg-orange-50/80 p-3 rounded-2xl border border-orange-100 text-xs text-orange-950 font-medium">
            Registering bottleneck for <span className="font-extrabold text-orange-900">{unitName}</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Bottleneck Title / Problem Description *
            </label>
            <input
              type="text"
              required
              id="add-bottleneck-title"
              placeholder="e.g. Dilation waiting time exceeding 45 mins during morning retina clinic"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clinical Category
              </label>
              <select
                id="add-bottleneck-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as BottleneckCategory)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-semibold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Workflow Status
              </label>
              <select
                id="add-bottleneck-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as BottleneckStatus)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none font-bold text-slate-800"
              >
                <option value="Acknowledge">🔵 1. Acknowledge (30%)</option>
                <option value="In progress">🟡 2. In progress (70%)</option>
                <option value="Completed">🟢 3. Completed (100%)</option>
              </select>
            </div>
          </div>

          {/* Before Photos Multi-Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Upload Before Photos (Evidence)
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">{beforePhotos.length} photo(s) selected</span>
            </div>

            <input
              ref={beforeInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoUpload(e, 'before')}
            />

            <div className="p-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/70 hover:border-orange-400 transition-colors">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {beforePhotos.map((photoUrl, idx) => (
                  <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                    <img src={photoUrl} alt={`Before ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeBeforePhoto(idx)}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => beforeInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:border-orange-500 rounded-xl text-xs font-bold text-slate-700 hover:text-orange-600 transition-all cursor-pointer shadow-2xs"
              >
                <Camera className="w-4 h-4 text-orange-600" />
                <span>+ Select Before Photos</span>
              </button>
            </div>
          </div>

          {/* After Photos Multi-Upload */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Upload After Photos (Resolution Evidence)
              </label>
              <span className="text-[10px] text-slate-400 font-semibold">{afterPhotos.length} photo(s) selected</span>
            </div>

            <input
              ref={afterInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handlePhotoUpload(e, 'after')}
            />

            <div className="p-3 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/70 hover:border-emerald-400 transition-colors">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {afterPhotos.map((photoUrl, idx) => (
                  <div key={idx} className="relative group w-14 h-14 rounded-xl overflow-hidden border border-slate-300 shrink-0">
                    <img src={photoUrl} alt={`After ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeAfterPhoto(idx)}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove photo"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => afterInputRef.current?.click()}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:border-emerald-500 rounded-xl text-xs font-bold text-slate-700 hover:text-emerald-700 transition-all cursor-pointer shadow-2xs"
              >
                <Camera className="w-4 h-4 text-emerald-600" />
                <span>+ Select After Photos</span>
              </button>
            </div>
          </div>

          {/* Unit Head Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Unit Head Remarks / Operational Context
            </label>
            <textarea
              rows={2}
              id="add-bottleneck-remarks"
              placeholder="e.g. Dilation room currently has only 8 seats for morning retina rush; overflow spreading to main lobby."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Responsible Lead
              </label>
              <input
                type="text"
                id="add-bottleneck-owner"
                placeholder="e.g. Dr. Neha V. / Front Desk Mgr"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Impact Level
              </label>
              <select
                id="add-bottleneck-impact"
                value={impactLevel}
                onChange={(e) => setImpactLevel(e.target.value as 'High' | 'Medium' | 'Low')}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white font-medium focus:ring-2 focus:ring-orange-500 outline-none"
              >
                <option value="High">High Impact</option>
                <option value="Medium">Medium Impact</option>
                <option value="Low">Low Impact</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Target Resolution Date
            </label>
            <input
              type="date"
              id="add-bottleneck-target-date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Resolution Action Plan / Notes
            </label>
            <textarea
              rows={2}
              id="add-bottleneck-notes"
              placeholder="Outline specific resolution steps e.g. buzzer alert stations, SOP adjustments..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              id="cancel-add-modal"
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-add-bottleneck"
              className="px-5 py-2.5 text-sm font-extrabold btn-orange-gradient rounded-xl shadow-md transition-all cursor-pointer"
            >
              Save to PostgreSQL
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
