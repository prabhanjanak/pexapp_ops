import React, { useState, useRef, useEffect } from 'react';
import { Bottleneck, BottleneckCategory, BottleneckStatus, STATUS_PERCENT_MAP } from '../types';
import { CATEGORIES } from '../data/seedData';
import { api } from '../services/api';
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
  const [status, setStatus] = useState<BottleneckStatus>('Pending');
  const [owner, setOwner] = useState('');
  const [impactLevel, setImpactLevel] = useState<'High' | 'Medium' | 'Low'>('High');
  const [targetDate, setTargetDate] = useState('');
  const [notes, setNotes] = useState('');
  const [remarks, setRemarks] = useState('');
  const [beforePhotos, setBeforePhotos] = useState<string[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<string[]>([]);
  const [isProcessingPhotos, setIsProcessingPhotos] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([...CATEGORIES]);

  const beforeInputRef = useRef<HTMLInputElement>(null);
  const afterInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      api.getCategories()
        .then((cats) => {
          if (cats && cats.length > 0) {
            setAvailableCategories(cats.map(c => c.name));
            if (!category) setCategory(cats[0].name);
          }
        })
        .catch(() => {});
    }
  }, [isOpen]);

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
    setStatus('Pending');
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
            <h2 className="text-lg font-black tracking-tight">Log New Operational Bottleneck</h2>
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
                {availableCategories.map((cat) => (
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
                <option value="Pending">🟡 1. Pending / Not Started (0%)</option>
                <option value="In progress">🔵 2. In progress (50-70%)</option>
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
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
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
                <Camera className="w-3.5 h-3.5 text-orange-500" />
                <span>{isProcessingPhotos ? 'Processing Photos...' : 'Add Before Photos'}</span>
              </button>
            </div>
          </div>

          {/* Target Date & Owner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Resolution Date
              </label>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Owner / Role
              </label>
              <input
                type="text"
                placeholder="e.g. Dr. Head OPD / Front Desk Mgr"
                value={owner}
                onChange={(e) => setOwner(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>
          </div>

          {/* Action Notes / Remarks */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Action Plan / Operational Notes
            </label>
            <textarea
              rows={2}
              placeholder="Outline steps to resolve this bottleneck..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none resize-none"
            />
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              id="submit-bottleneck-btn"
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-extrabold shadow-md shadow-orange-600/20 hover:scale-[1.02] transition-all cursor-pointer"
            >
              Log Bottleneck
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
