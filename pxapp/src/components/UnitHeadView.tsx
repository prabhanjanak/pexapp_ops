import React, { useState, useMemo, useEffect } from 'react';
import { HospitalUnit, Bottleneck, BottleneckStatus, BottleneckCategory, UnitHeadTab, User, STATUS_STAGES, STATUS_PERCENT_MAP } from '../types';
import { calculateUnitStats, getStatusBadgeStyle, getImpactBadgeStyle, normalizeStatus } from '../utils/calc';
import { CATEGORIES } from '../data/seedData';
import { AddBottleneckModal } from './AddBottleneckModal';
import { PhotoUploadCell } from './PhotoUploadCell';
import { ImageLightboxModal } from './ImageLightboxModal';
import { AssignDeadlineModal } from './AssignDeadlineModal';
import { BottleneckCommentModal } from './BottleneckCommentModal';
import { BottleneckTaskChecklist } from './BottleneckTaskChecklist';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Sliders,
  Calendar,
  User as UserIcon,
  Sparkles,
  Info,
  MapPin,
  Bed,
  Check,
  Zap,
  PieChart,
  ShieldCheck,
  TrendingUp,
  Award,
  Layers,
  Phone,
  Mail,
  FileText,
  Camera,
  MessageSquare,
  Filter,
  ArrowRight,
  Activity,
  ChevronDown,
  Tag,
  Lock,
  Eye,
  ArrowLeft,
  ArrowUpDown
} from 'lucide-react';

interface UnitHeadViewProps {
  units: HospitalUnit[];
  selectedUnitId: string;
  onSelectUnit?: (unitId: string) => void;
  currentUser: User;
  activeTab: UnitHeadTab;
  onUpdateBottleneck?: (unitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => void;
  onAddBottleneck?: (unitId: string, newBottleneck: Omit<Bottleneck, 'id' | 'lastUpdated'>) => void;
  onDeleteBottleneck?: (unitId: string, bottleneckId: string) => void;
  onInitializeUnitAssessment?: (unitId: string) => void;
  allowUnitSwitch?: boolean;
  viewOnly?: boolean;
  onBackToDashboard?: () => void;
}

export const UnitHeadView: React.FC<UnitHeadViewProps> = ({
  units,
  selectedUnitId,
  onSelectUnit,
  currentUser,
  activeTab,
  onUpdateBottleneck,
  onAddBottleneck,
  onDeleteBottleneck,
  onInitializeUnitAssessment,
  allowUnitSwitch = false,
  viewOnly = false,
  onBackToDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'targetDate' | 'impact' | 'updated'>('newest');
  const [viewScope, setViewScope] = useState<'active' | 'completed' | 'all'>(
    activeTab === 'completed' ? 'completed' : 'active'
  );
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (activeTab === 'completed') {
      setViewScope('completed');
    } else if (activeTab === 'bottlenecks') {
      setViewScope('active');
    }
  }, [activeTab]);

  // Comments Modal state
  const [activeCommentBottleneck, setActiveCommentBottleneck] = useState<Bottleneck | null>(null);

  // Lightbox Modal state
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
    type: 'before'
  });

  // Assign Deadline Modal state
  const [assignModalState, setAssignModalState] = useState<{
    isOpen: boolean;
    bottleneck: Bottleneck | null;
  }>({
    isOpen: false,
    bottleneck: null
  });

  // Local active remarks tracking for fast typing before onBlur
  const [editingRemarks, setEditingRemarks] = useState<Record<string, string>>({});

  // Active unit
  const currentUnit = useMemo(() => {
    return units.find((u) => u.id === selectedUnitId) || units[0];
  }, [units, selectedUnitId]);

  // Unit Statistics
  const stats = useMemo(() => {
    return calculateUnitStats(currentUnit ? currentUnit.bottlenecks : []);
  }, [currentUnit]);

  // Category distribution calculation for Tab 2
  const categoryStats = useMemo(() => {
    if (!currentUnit || !currentUnit.bottlenecks) return [];
    const catMap = new Map<string, { total: number; resolved: number; inProgress: number; pending: number }>();
    
    for (const b of currentUnit.bottlenecks) {
      const norm = normalizeStatus(b.status, b.percentComplete);
      if (!catMap.has(b.category)) {
        catMap.set(b.category, { total: 0, resolved: 0, inProgress: 0, pending: 0 });
      }
      const c = catMap.get(b.category)!;
      c.total++;
      if (norm === 'Completed') c.resolved++;
      else if (norm === 'Pending') c.pending++;
      else c.inProgress++;
    }

    return Array.from(catMap.entries()).map(([category, count]) => ({
      category,
      ...count,
      pct: Math.round((count.resolved / (count.total || 1)) * 100)
    })).sort((a, b) => b.total - a.total);
  }, [currentUnit]);

  // Filtered and Sorted bottlenecks for current unit
  const displayedBottlenecks = useMemo(() => {
    if (!currentUnit || !currentUnit.bottlenecks) return [];

    let list = currentUnit.bottlenecks.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.owner.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query)) ||
        (item.remarks && item.remarks.toLowerCase().includes(query));

      const norm = normalizeStatus(item.status, item.percentComplete);
      
      // Filter based on viewScope
      if (viewScope === 'active' && norm === 'Completed') return false;
      if (viewScope === 'completed' && norm !== 'Completed') return false;

      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        norm === selectedStatusFilter ||
        item.status === selectedStatusFilter;

      const matchesCategory =
        selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });

    // Chronological & Priority Sorting
    list = [...list].sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.id || '').localeCompare(a.id || '');
      }
      if (sortBy === 'targetDate') {
        return (a.targetDate || '9999').localeCompare(b.targetDate || '9999');
      }
      if (sortBy === 'impact') {
        const impactMap: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
        return (impactMap[b.impactLevel || 'Medium'] || 2) - (impactMap[a.impactLevel || 'Medium'] || 2);
      }
      if (sortBy === 'updated') {
        return (b.lastUpdated || '').localeCompare(a.lastUpdated || '');
      }
      return 0;
    });

    return list;
  }, [currentUnit, searchQuery, selectedStatusFilter, selectedCategoryFilter, viewScope, sortBy]);

  // Handle Status Change directly
  const handleStatusChange = (bottleneck: Bottleneck, targetStatus: BottleneckStatus) => {
    let newPercent = 0;
    if (targetStatus === 'Completed') newPercent = 100;
    else if (targetStatus === 'In progress') {
      newPercent = bottleneck.percentComplete > 0 && bottleneck.percentComplete < 100 ? bottleneck.percentComplete : 50;
    } else {
      newPercent = 0;
    }

    onUpdateBottleneck?.(currentUnit.id, bottleneck.id, {
      status: targetStatus,
      percentComplete: newPercent,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  // Handle direct percentage updates
  const handlePercentChange = (bottleneck: Bottleneck, percent: number) => {
    const clamped = Math.max(0, Math.min(100, Math.round(percent)));
    let targetStatus: BottleneckStatus = 'In progress';
    if (clamped >= 100) targetStatus = 'Completed';
    else if (clamped <= 0) targetStatus = 'Pending';

    onUpdateBottleneck?.(currentUnit.id, bottleneck.id, {
      status: targetStatus,
      percentComplete: clamped,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  // Confirm Assignment with Deadline from Modal
  const handleConfirmAssignment = (targetDate: string, owner: string, remarks: string) => {
    if (!assignModalState.bottleneck) return;
    const b = assignModalState.bottleneck;

    onUpdateBottleneck?.(currentUnit.id, b.id, {
      status: 'In progress',
      percentComplete: 70,
      targetDate,
      owner: owner || b.owner,
      remarks: remarks || b.remarks,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  // Handle Remarks Blur Save
  const handleRemarksBlur = (bottleneckId: string, currentRemarks: string) => {
    const localVal = editingRemarks[bottleneckId];
    if (localVal !== undefined && localVal !== currentRemarks) {
      onUpdateBottleneck?.(currentUnit.id, bottleneckId, {
        remarks: localVal.trim(),
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }
  };

  const handleBeforePhotosChange = (bottleneckId: string, newPhotos: string[]) => {
    onUpdateBottleneck?.(currentUnit.id, bottleneckId, {
      beforePhotos: newPhotos,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  const handleAfterPhotosChange = (bottleneckId: string, newPhotos: string[]) => {
    onUpdateBottleneck?.(currentUnit.id, bottleneckId, {
      afterPhotos: newPhotos,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  const openLightbox = (photos: string[], initialIndex: number, title: string, type: 'before' | 'after') => {
    setLightboxState({
      isOpen: true,
      photos,
      index: initialIndex,
      title,
      type
    });
  };

  if (!currentUnit) {
    return (
      <div className="p-8 bg-white rounded-2xl border border-slate-200 text-center">
        <p className="text-sm text-slate-600">Loading hospital unit data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Unit Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
              {currentUnit.city}, {currentUnit.state}
            </span>
            <span className="text-xs text-slate-400">•</span>
            <span className="text-xs font-semibold text-slate-500">Established {currentUnit.establishedYear || 2010}</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-orange-600 shrink-0" />
            {currentUnit.name}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Unit Head: <strong className="text-slate-800">{currentUnit.contactHead || 'Medical Director'}</strong> • Capacity: <strong>{currentUnit.bedCapacity || 120} beds</strong>
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Dashboard</span>
            </button>
          )}

          {!viewOnly && onAddBottleneck && (
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-600/20 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Log New Bottleneck</span>
            </button>
          )}
        </div>
      </div>

      {/* DASHBOARD TAB */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Unit Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bottlenecks</p>
              <p className="text-3xl font-black text-slate-900 mt-1">{stats.total}</p>
              <p className="text-[11px] text-slate-400 mt-1">Logged for this unit</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending / Not Started</p>
              <p className="text-3xl font-black text-slate-700 mt-1">{stats.pending}</p>
              <p className="text-[11px] text-slate-400 mt-1">Awaiting initiation</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">In Progress</p>
              <p className="text-3xl font-black text-amber-600 mt-1">{stats.inProgress}</p>
              <p className="text-[11px] text-amber-700 mt-1">Active resolution</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Completed / Resolved</p>
              <p className="text-3xl font-black text-emerald-600 mt-1">{stats.completed}</p>
              <p className="text-[11px] text-emerald-700 mt-1">Resolution: {stats.avgPercent}%</p>
            </div>
          </div>

          {/* Quick Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
            <h3 className="text-base font-black text-slate-900 mb-4">Category Resolution Progress</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryStats.map((c, i) => (
                <div key={i} className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-800">{c.category}</span>
                    <span className="text-xs font-extrabold text-emerald-600">{c.pct}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
                    <div style={{ width: `${c.pct}%` }} className="h-full bg-emerald-500" />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>{c.total} total</span>
                    <span>✅ {c.resolved} resolved</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ACTIVE BOTTLENECKS OR COMPLETED ARCHIVE TAB */}
      {(activeTab === 'bottlenecks' || activeTab === 'completed') && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          {/* Filter & Sort Toolbar */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Left: Search Input & Scope Toggle */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full md:w-auto">
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder={viewScope === 'completed' ? "Search completed archive..." : "Search active bottlenecks..."}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* View Scope Toggle: Active vs Completed vs All */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                <button
                  type="button"
                  onClick={() => setViewScope('active')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    viewScope === 'active'
                      ? 'bg-white text-orange-800 shadow-xs border border-orange-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ⚡ Active ({Math.max(0, stats.total - stats.completed)})
                </button>
                <button
                  type="button"
                  onClick={() => setViewScope('completed')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    viewScope === 'completed'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ✅ Completed ({stats.completed})
                </button>
                <button
                  type="button"
                  onClick={() => setViewScope('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    viewScope === 'all'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  📋 All ({stats.total})
                </button>
              </div>
            </div>

            {/* Category Filter & Chronological Sorting */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedCategoryFilter}
                  onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="ALL">All Categories</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="newest">Sort: Newest First (Date/Time)</option>
                  <option value="targetDate">Sort: Target Deadline (Soonest)</option>
                  <option value="impact">Sort: Impact Level (High-Low)</option>
                  <option value="updated">Sort: Last Updated</option>
                </select>
              </div>
            </div>

          </div>

          {/* Bottlenecks List / Table */}
          {displayedBottlenecks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
              <div className="w-14 h-14 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center mb-3">
                {viewScope === 'completed' ? <CheckCircle2 className="w-7 h-7 text-emerald-600" /> : <Activity className="w-7 h-7 text-orange-600" />}
              </div>
              <h3 className="text-base font-black text-slate-900">
                {viewScope === 'completed' ? 'No Completed Bottlenecks Found' : 'No Active Bottlenecks Matching Filter'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {viewScope === 'completed'
                  ? 'Resolved bottlenecks will automatically be archived and displayed here.'
                  : 'All operational items in this unit are either resolved or match another filter.'}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {displayedBottlenecks.map((item) => {
                const badge = getStatusBadgeStyle(item.status);
                const impactBadge = getImpactBadgeStyle(item.impactLevel);
                const commentsCount = (item.comments || []).length;

                return (
                  <div
                    key={item.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    {/* Left: Title, Category, Owner & Meta */}
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-800 border border-orange-200">
                          {item.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${impactBadge}`}>
                          {item.impactLevel || 'Medium'} Impact
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Updated: {item.lastUpdated}
                        </span>
                        {item.targetDate && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            🎯 Target: {item.targetDate}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-900">
                        {item.title}
                      </h4>

                      {item.notes && (
                        <p className="text-xs text-slate-600 font-normal">
                          {item.notes}
                        </p>
                      )}

                      {/* Action Checklist Tasks */}
                      <div className="pt-1">
                        <BottleneckTaskChecklist
                          bottleneck={item}
                          unitId={currentUnit.id}
                          currentUser={currentUser}
                          onUpdateBottleneck={onUpdateBottleneck}
                          defaultExpanded={(item.tasks || []).length > 0}
                        />
                      </div>

                      {/* Directives & Assignment Buttons */}
                      <div className="flex items-center gap-3 pt-1 flex-wrap">
                        <button
                          onClick={() => setActiveCommentBottleneck(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-50 hover:bg-orange-50 border border-slate-200 hover:border-orange-300 text-xs font-bold text-slate-700 hover:text-orange-700 transition-colors cursor-pointer"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-orange-500" />
                          <span>Management Directives</span>
                          {commentsCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-orange-600 text-white text-[10px] font-black">
                              {commentsCount}
                            </span>
                          )}
                        </button>

                        {!viewOnly && (
                          <button
                            type="button"
                            onClick={() => setAssignModalState({ isOpen: true, bottleneck: item })}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600 cursor-pointer"
                          >
                            <span>🎯 {item.targetDate ? `Due ${item.targetDate}` : 'Assign Deadline'}</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Right: Status Progression & Photos */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 border-t lg:border-t-0 pt-3 lg:pt-0">
                      
                      {/* Photo Evidence Thumbnails */}
                      <div className="flex items-center gap-3">
                        <PhotoUploadCell
                          label="Before Evidence"
                          type="before"
                          bottleneckTitle={item.title}
                          photos={item.beforePhotos || []}
                          onPhotosChange={(photos) => handleBeforePhotosChange(item.id, photos)}
                          onOpenLightbox={(photos, idx, title, type) => openLightbox(photos, idx, title, type)}
                          onViewPhoto={(idx) => openLightbox(item.beforePhotos || [], idx, item.title, 'before')}
                          readOnly={viewOnly || (currentUser.role !== 'Super Admin' && currentUser.role !== 'Unit Head')}
                        />
                        <PhotoUploadCell
                          label="After Evidence"
                          type="after"
                          bottleneckTitle={item.title}
                          photos={item.afterPhotos || []}
                          onPhotosChange={(photos) => handleAfterPhotosChange(item.id, photos)}
                          onOpenLightbox={(photos, idx, title, type) => openLightbox(photos, idx, title, type)}
                          onViewPhoto={(idx) => openLightbox(item.afterPhotos || [], idx, item.title, 'after')}
                          readOnly={viewOnly || (currentUser.role !== 'Super Admin' && currentUser.role !== 'Unit Head')}
                        />
                      </div>

                      {/* Status Stage Switcher & Quick Progress Buttons */}
                      <div className="min-w-[210px] space-y-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-200">
                        <div className="flex items-center justify-between">
                          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Workflow Progress
                          </label>
                          <span className="text-xs font-black text-slate-900">
                            {item.percentComplete || 0}%
                          </span>
                        </div>

                        {!viewOnly ? (
                          <select
                            value={normalizeStatus(item.status, item.percentComplete)}
                            onChange={(e) => handleStatusChange(item, e.target.value as BottleneckStatus)}
                            className={`w-full px-3 py-1.5 rounded-xl text-xs font-black border cursor-pointer ${badge.badge}`}
                          >
                            <option value="Pending">🟡 1. Pending / Not Started (0%)</option>
                            <option value="In progress">🔵 2. In Progress (50%)</option>
                            <option value="Completed">🟢 3. Completed (100%)</option>
                          </select>
                        ) : (
                          <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black border ${badge.badge}`}>
                            {badge.label}
                          </span>
                        )}

                        {/* Quick Progress Buttons (0%, 25%, 50%, 75%, 100%) */}
                        {!viewOnly && (
                          <div className="flex items-center justify-between gap-1 pt-0.5">
                            {[0, 25, 50, 75, 100].map((pct) => (
                              <button
                                key={pct}
                                type="button"
                                onClick={() => handlePercentChange(item, pct)}
                                className={`flex-1 py-1 rounded-lg text-[10px] font-black transition-all cursor-pointer text-center ${
                                  (item.percentComplete || 0) === pct
                                    ? pct === 100
                                      ? 'bg-emerald-600 text-white shadow-xs'
                                      : pct > 0
                                      ? 'bg-amber-500 text-white shadow-xs'
                                      : 'bg-slate-700 text-white shadow-xs'
                                    : 'bg-white hover:bg-slate-200 text-slate-700 border border-slate-200'
                                }`}
                                title={`Set progress to ${pct}%`}
                              >
                                {pct}%
                              </button>
                            ))}
                          </div>
                        )}

                        {/* Progress Bar */}
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${item.percentComplete || 0}%` }}
                            className={`h-full transition-all duration-300 ${badge.bar}`}
                          />
                        </div>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <h3 className="text-lg font-black text-slate-900">Category Distribution & Resolution Rates</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {categoryStats.map((c, i) => (
              <div key={i} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-xs text-slate-800">{c.category}</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">Total: {c.total} • Resolved: {c.resolved} • Pending: {c.pending}</p>
                </div>
                <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-black">
                  {c.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PROFILE TAB */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 animate-in fade-in duration-200">
          <h3 className="text-lg font-black text-slate-900">Hospital Unit Profile & Directory</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Unit Name</span>
              <span className="font-black text-slate-900 text-sm mt-0.5 block">{currentUnit.name}</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Location</span>
              <span className="font-black text-slate-900 text-sm mt-0.5 block">{currentUnit.city}, {currentUnit.state}</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Contact Medical Director</span>
              <span className="font-black text-slate-900 text-sm mt-0.5 block">{currentUnit.contactHead || 'Medical Director'}</span>
            </div>
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
              <span className="font-bold text-slate-400 uppercase text-[10px] block">Bed Capacity</span>
              <span className="font-black text-slate-900 text-sm mt-0.5 block">{currentUnit.bedCapacity || 120} Beds</span>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {isAddModalOpen && (
        <AddBottleneckModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={(newB) => {
            if (onAddBottleneck) onAddBottleneck(currentUnit.id, newB);
            setIsAddModalOpen(false);
          }}
          unitName={currentUnit.name}
        />
      )}

      {assignModalState.isOpen && (
        <AssignDeadlineModal
          isOpen={assignModalState.isOpen}
          onClose={() => setAssignModalState({ isOpen: false, bottleneck: null })}
          bottleneck={assignModalState.bottleneck}
          onConfirm={handleConfirmAssignment}
        />
      )}

      {activeCommentBottleneck && (
        <BottleneckCommentModal
          isOpen={Boolean(activeCommentBottleneck)}
          onClose={() => setActiveCommentBottleneck(null)}
          bottleneck={activeCommentBottleneck}
          currentUser={currentUser}
          onCommentAdded={(updated) => {
            onUpdateBottleneck?.(currentUnit.id, updated.id, updated);
            setActiveCommentBottleneck(updated);
          }}
        />
      )}

      {lightboxState.isOpen && (
        <ImageLightboxModal
          isOpen={lightboxState.isOpen}
          onClose={() => setLightboxState(prev => ({ ...prev, isOpen: false }))}
          photos={lightboxState.photos}
          initialIndex={lightboxState.index}
          title={lightboxState.title}
          type={lightboxState.type}
        />
      )}

    </div>
  );
};
