import React, { useState } from 'react';
import { Bottleneck, HospitalUnit, BottleneckStatus } from '../types';
import { getStatusBadgeStyle, getImpactBadgeStyle } from '../utils/calc';
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Camera,
  Image as ImageIcon,
  MessageSquare,
  Building2,
  ShieldCheck,
  Maximize2,
  AlertCircle,
  ChevronRight,
  ArrowRight,
  Filter
} from 'lucide-react';
import { ImageLightboxModal } from './ImageLightboxModal';

interface EvidenceApprovalGridProps {
  units: HospitalUnit[];
  selectedUnitId?: string;
  onUpdateBottleneck?: (unitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => void;
}

export const EvidenceApprovalGrid: React.FC<EvidenceApprovalGridProps> = ({
  units,
  selectedUnitId,
  onUpdateBottleneck
}) => {
  const [filterUnitId, setFilterUnitId] = useState<string>(selectedUnitId || 'ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [lightboxState, setLightboxState] = useState<{
    isOpen: boolean;
    photos: string[];
    index: number;
    title: string;
    type: 'before' | 'after' | 'evidence';
  }>({
    isOpen: false,
    photos: [],
    index: 0,
    title: '',
    type: 'evidence'
  });

  // Extract all bottlenecks with their unit metadata
  const allBottlenecksWithUnit = units.flatMap((u) =>
    u.bottlenecks.map((b) => ({
      ...b,
      unitName: u.name,
      unitCity: u.city,
      unitActualId: u.id
    }))
  );

  // Filter items that have photos or remarks, or match filters
  const filteredItems = allBottlenecksWithUnit.filter((item) => {
    const matchesUnit = filterUnitId === 'ALL' || item.unitActualId === filterUnitId;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;
    const hasEvidence =
      (item.beforePhotos && item.beforePhotos.length > 0) ||
      (item.afterPhotos && item.afterPhotos.length > 0) ||
      Boolean(item.remarks);

    return matchesUnit && matchesStatus && hasEvidence;
  });

  const openLightbox = (photos: string[], index: number, title: string, type: 'before' | 'after') => {
    setLightboxState({
      isOpen: true,
      photos,
      index,
      title,
      type
    });
  };

  const handleApprove = (unitId: string, bottleneckId: string) => {
    if (onUpdateBottleneck) {
      onUpdateBottleneck(unitId, bottleneckId, {
        status: 'Completed',
        percentComplete: 100,
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Lightbox */}
      <ImageLightboxModal
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
        photos={lightboxState.photos}
        initialIndex={lightboxState.index}
        title={lightboxState.title}
        type={lightboxState.type}
      />

      {/* Control Header & Filters */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-orange-100 text-orange-700 rounded-xl">
              <Camera className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-lg font-black text-slate-900 tracking-tight">
                Management Evidence & Before/After Photo Review
              </h2>
              <p className="text-xs text-slate-500 font-medium">
                Review on-ground visual evidence uploaded by Unit Heads and grant management sign-off
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={filterUnitId}
            onChange={(e) => setFilterUnitId(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="ALL">All Hospital Units</option>
            {units.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name} ({u.city})
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 font-bold text-xs text-slate-700 outline-none focus:ring-2 focus:ring-orange-500 cursor-pointer"
          >
            <option value="ALL">All Statuses</option>
            <option value="Verifying the progress">Verifying Progress</option>
            <option value="Assigned work">Assigned Work</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Comparison Grid Cards */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-3 border border-orange-100">
            <Camera className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No Evidence Records Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Unit Heads can upload Before and After photos in their workspace to submit photographic proof for management review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const statusStyle = getStatusBadgeStyle(item.status);
            const beforePhotos = item.beforePhotos || [];
            const afterPhotos = item.afterPhotos || [];

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 card-orange-accent transition-all hover:shadow-md"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-orange-50 text-orange-800 border border-orange-200">
                        {item.unitName} ({item.unitCity})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${statusStyle.badge}`}>
                        {item.status}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        {item.category}
                      </span>
                      {item.targetDate && (
                        <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Target: {item.targetDate}
                        </span>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900">{item.title}</h3>
                  </div>

                  {/* Approve action if not already completed */}
                  {onUpdateBottleneck && item.status !== 'Completed' && (
                    <button
                      type="button"
                      onClick={() => handleApprove(item.unitActualId, item.id)}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-sm transition-all cursor-pointer shrink-0 self-start sm:self-auto"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Approve & Complete
                    </button>
                  )}
                </div>

                {/* Remarks Strip */}
                {item.remarks && (
                  <div className="mt-3 p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-start gap-2.5">
                    <MessageSquare className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[11px] font-black text-slate-700 uppercase tracking-wider block">
                        Unit Head Operational Remarks:
                      </span>
                      <p className="text-xs text-slate-800 font-medium mt-0.5">{item.remarks}</p>
                    </div>
                  </div>
                )}

                {/* 2-Column Side-by-Side Comparison: Before Photos (Left) vs After Photos (Right) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  
                  {/* Column 1: Before Photos */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider">
                          Before Photos ({beforePhotos.length})
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-md">
                        Initial Bottleneck State
                      </span>
                    </div>

                    {beforePhotos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {beforePhotos.map((photo, idx) => (
                          <div
                            key={idx}
                            onClick={() => openLightbox(beforePhotos, idx, item.title, 'before')}
                            className="relative group rounded-xl overflow-hidden aspect-video bg-slate-200 border border-amber-200 cursor-pointer shadow-2xs hover:border-amber-500 transition-all"
                          >
                            <img
                              src={photo}
                              alt={`Before photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-amber-700/70 italic border border-dashed border-amber-200 rounded-xl bg-white/50">
                        No before photos uploaded yet
                      </div>
                    )}
                  </div>

                  {/* Column 2: After Photos */}
                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wider">
                          After Photos ({afterPhotos.length})
                        </h4>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                        Resolved State Proof
                      </span>
                    </div>

                    {afterPhotos.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                        {afterPhotos.map((photo, idx) => (
                          <div
                            key={idx}
                            onClick={() => openLightbox(afterPhotos, idx, item.title, 'after')}
                            className="relative group rounded-xl overflow-hidden aspect-video bg-slate-200 border border-emerald-200 cursor-pointer shadow-2xs hover:border-emerald-500 transition-all"
                          >
                            <img
                              src={photo}
                              alt={`After photo ${idx + 1}`}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                              <Maximize2 className="w-4 h-4" />
                            </div>
                            <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                              #{idx + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-6 text-center text-xs text-emerald-700/70 italic border border-dashed border-emerald-200 rounded-xl bg-white/50">
                        {item.status === 'Completed'
                          ? 'Resolved without after photos'
                          : 'Awaiting resolution photos from Unit Head'}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
