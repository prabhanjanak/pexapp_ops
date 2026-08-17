import React, { useState } from 'react';
import { HospitalUnit } from '../types';
import { calculateUnitStats, getStatusBadgeStyle, getImpactBadgeStyle } from '../utils/calc';
import { X, Building2, Calendar, User, Sliders, MapPin, Bed, ChevronRight, Camera, MessageSquare, Maximize2 } from 'lucide-react';
import { ImageLightboxModal } from './ImageLightboxModal';

interface UnitDrilldownModalProps {
  unit: HospitalUnit | null;
  onClose: () => void;
  onSwitchToUnitHeadView?: (unitId: string) => void;
}

export const UnitDrilldownModal: React.FC<UnitDrilldownModalProps> = ({
  unit,
  onClose,
  onSwitchToUnitHeadView
}) => {
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

  if (!unit) return null;

  const stats = calculateUnitStats(unit.bottlenecks);

  const openLightbox = (photos: string[], index: number, title: string, type: 'before' | 'after') => {
    setLightboxState({
      isOpen: true,
      photos,
      index,
      title,
      type
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Lightbox */}
      <ImageLightboxModal
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
        photos={lightboxState.photos}
        initialIndex={lightboxState.index}
        title={lightboxState.title}
        type={lightboxState.type}
      />

      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header with Orange Gradient */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-2xl text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-black flex items-center gap-2">
                {unit.name} <span className="text-xs text-orange-100 font-medium">({unit.city}, {unit.state})</span>
              </h2>
              <p className="text-xs text-amber-100 font-medium">
                Leadership Inspection • Comprehensive Unit Bottlenecks & Photo Evidence
              </p>
            </div>
          </div>
          
          <button
            type="button"
            id="close-drilldown-modal"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Unit Summary KPI Strip */}
        <div className="bg-slate-50 border-b border-slate-200 p-5 grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-extrabold text-slate-500 uppercase">Total Items</span>
            <div className="text-xl font-black text-slate-900 mt-0.5">{stats.total}</div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-extrabold text-blue-600 uppercase">Acknowledge</span>
            <div className="text-xl font-black text-blue-600 mt-0.5">{stats.acknowledge}</div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-extrabold text-amber-600 uppercase">In Progress</span>
            <div className="text-xl font-black text-amber-600 mt-0.5">
              {stats.inProgress}
            </div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200">
            <span className="text-[10px] font-extrabold text-emerald-600 uppercase">Resolved</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{stats.completed}</div>
          </div>

          <div className="bg-white p-3 rounded-2xl border border-slate-200 col-span-2 sm:col-span-1">
            <span className="text-[10px] font-extrabold text-orange-700 uppercase">Resolution Rate</span>
            <div className="text-xl font-black text-orange-600 mt-0.5">{stats.avgPercent}%</div>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto space-y-4">
          
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Unit Bottlenecks Registry ({unit.bottlenecks.length})
            </h3>
            
            {onSwitchToUnitHeadView && (
              <button
                type="button"
                id="switch-to-head-from-drilldown"
                onClick={() => {
                  onSwitchToUnitHeadView(unit.id);
                  onClose();
                }}
                className="text-xs font-bold text-orange-600 hover:text-orange-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                👁️ Open as Unit Head (View Only) →
              </button>
            )}
          </div>

          {unit.bottlenecks.length === 0 ? (
            <div className="p-8 text-center bg-orange-50/50 rounded-2xl border border-dashed border-orange-200">
              <p className="text-sm text-slate-700 font-bold">
                Assessment not yet started for this unit.
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Zero bottlenecks logged. Switch to Unit Head View to initialize baseline assessment.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 border border-slate-200 rounded-3xl overflow-hidden">
              {unit.bottlenecks.map((item) => {
                const style = getStatusBadgeStyle(item.status);
                const impactBadge = getImpactBadgeStyle(item.impactLevel);
                const beforePhotos = item.beforePhotos || [];
                const afterPhotos = item.afterPhotos || [];

                return (
                  <div key={item.id} className="p-5 hover:bg-orange-50/20 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${style.badge}`}>
                            {item.status}
                          </span>
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[10px] font-bold">
                            {item.category}
                          </span>
                          {item.impactLevel && (
                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${impactBadge}`}>
                              {item.impactLevel} Impact
                            </span>
                          )}
                        </div>
                        <h4 className="font-extrabold text-slate-900 text-sm">
                          {item.title}
                        </h4>
                        {item.notes && (
                          <p className="text-xs text-slate-500 mt-1">{item.notes}</p>
                        )}
                        {item.remarks && (
                          <div className="mt-2 p-2.5 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2">
                            <MessageSquare className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-amber-900">Unit Remarks:</span> {item.remarks}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Progress & Owner */}
                      <div className="w-full sm:w-48 shrink-0 flex flex-col gap-1 mt-2 sm:mt-0">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-medium">Progress</span>
                          <span className="font-black text-slate-900">{item.percentComplete}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${style.bar}`}
                            style={{ width: `${item.percentComplete}%` }}
                          />
                        </div>
                        <div className="flex justify-between items-center text-[10px] text-slate-400 mt-0.5 font-medium">
                          <span>Owner: {item.owner}</span>
                          <span>{item.targetDate || item.lastUpdated}</span>
                        </div>
                      </div>
                    </div>

                    {/* Photo Evidence Preview if present */}
                    {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
                        {/* Before */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-amber-800 uppercase shrink-0">
                            📷 Before ({beforePhotos.length}):
                          </span>
                          <div className="flex items-center gap-1.5 overflow-x-auto">
                            {beforePhotos.map((p, idx) => (
                              <div
                                key={idx}
                                onClick={() => openLightbox(beforePhotos, idx, item.title, 'before')}
                                className="w-8 h-8 rounded-lg overflow-hidden border border-amber-200 cursor-pointer shrink-0 hover:scale-105 transition-transform"
                              >
                                <img src={p} alt={`Before ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* After */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-emerald-800 uppercase shrink-0">
                            ✨ After ({afterPhotos.length}):
                          </span>
                          <div className="flex items-center gap-1.5 overflow-x-auto">
                            {afterPhotos.map((p, idx) => (
                              <div
                                key={idx}
                                onClick={() => openLightbox(afterPhotos, idx, item.title, 'after')}
                                className="w-8 h-8 rounded-lg overflow-hidden border border-emerald-200 cursor-pointer shrink-0 hover:scale-105 transition-transform"
                              >
                                <img src={p} alt={`After ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            type="button"
            id="close-drilldown-footer"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Close Inspection
          </button>
        </div>

      </div>
    </div>
  );
};
