import React, { useState, useMemo } from 'react';
import { HospitalUnit, Bottleneck, BottleneckStatus, BottleneckCategory, UnitHeadTab, User, STATUS_STAGES, STATUS_PERCENT_MAP } from '../types';
import { calculateUnitStats, getStatusBadgeStyle, getImpactBadgeStyle, normalizeStatus } from '../utils/calc';
import { CATEGORIES } from '../data/seedData';
import { AddBottleneckModal } from './AddBottleneckModal';
import { PhotoUploadCell } from './PhotoUploadCell';
import { ImageLightboxModal } from './ImageLightboxModal';
import { AssignDeadlineModal } from './AssignDeadlineModal';
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
  ArrowLeft
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
  onInitializeUnitAssessment,
  allowUnitSwitch = false,
  viewOnly = false,
  onBackToDashboard
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
      const norm = normalizeStatus(b.status);
      if (!catMap.has(b.category)) {
        catMap.set(b.category, { total: 0, resolved: 0, inProgress: 0, pending: 0 });
      }
      const c = catMap.get(b.category)!;
      c.total++;
      if (norm === 'Completed') c.resolved++;
      else if (norm === 'Acknowledge') c.pending++;
      else c.inProgress++;
    }

    return Array.from(catMap.entries()).map(([category, count]) => ({
      category,
      ...count,
      pct: Math.round((count.resolved / (count.total || 1)) * 100)
    })).sort((a, b) => b.total - a.total);
  }, [currentUnit]);

  // Filtered bottlenecks for current unit
  const filteredBottlenecks = useMemo(() => {
    if (!currentUnit || !currentUnit.bottlenecks) return [];

    return currentUnit.bottlenecks.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.title.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.owner.toLowerCase().includes(query) ||
        (item.notes && item.notes.toLowerCase().includes(query)) ||
        (item.remarks && item.remarks.toLowerCase().includes(query));

      const norm = normalizeStatus(item.status);
      const matchesStatus =
        selectedStatusFilter === 'ALL' ||
        norm === selectedStatusFilter ||
        item.status === selectedStatusFilter;

      const matchesCategory =
        selectedCategoryFilter === 'ALL' || item.category === selectedCategoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [currentUnit, searchQuery, selectedStatusFilter, selectedCategoryFilter]);

  // Handle Status Change
  const handleStatusChange = (bottleneck: Bottleneck, targetStatus: BottleneckStatus) => {
    // If transitioning to "In progress", prompt for deadline
    if (targetStatus === 'In progress') {
      setAssignModalState({
        isOpen: true,
        bottleneck: { ...bottleneck, status: 'In progress' }
      });
      return;
    }

    // Direct progression
    const newPercent = STATUS_PERCENT_MAP[targetStatus] ?? bottleneck.percentComplete;
    onUpdateBottleneck(currentUnit.id, bottleneck.id, {
      status: targetStatus,
      percentComplete: newPercent,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  // Confirm Assignment with Deadline from Modal
  const handleConfirmAssignment = (targetDate: string, owner: string, remarks: string) => {
    if (!assignModalState.bottleneck) return;
    const b = assignModalState.bottleneck;

    onUpdateBottleneck(currentUnit.id, b.id, {
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
      onUpdateBottleneck(currentUnit.id, bottleneckId, {
        remarks: localVal.trim(),
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }
  };

  // Handle Photo Updates
  const handleBeforePhotosChange = (bottleneckId: string, newPhotos: string[]) => {
    onUpdateBottleneck(currentUnit.id, bottleneckId, {
      beforePhotos: newPhotos,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  const handleAfterPhotosChange = (bottleneckId: string, newPhotos: string[]) => {
    onUpdateBottleneck(currentUnit.id, bottleneckId, {
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
        <p className="text-sm text-slate-600">Loading unit data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Lightbox Modal */}
      <ImageLightboxModal
        isOpen={lightboxState.isOpen}
        onClose={() => setLightboxState((prev) => ({ ...prev, isOpen: false }))}
        photos={lightboxState.photos}
        initialIndex={lightboxState.index}
        title={lightboxState.title}
        type={lightboxState.type}
      />

      {/* Assign Work & Deadline Modal */}
      <AssignDeadlineModal
        isOpen={assignModalState.isOpen}
        onClose={() => setAssignModalState({ isOpen: false, bottleneck: null })}
        bottleneck={assignModalState.bottleneck}
        onConfirm={handleConfirmAssignment}
      />

      {/* Top View-Only Inspection Banner (When Opened by Ops / Super Admin) */}
      {viewOnly && (
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-950 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-2xl shrink-0">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900 px-2.5 py-0.5 rounded-md">
                  View-Only Mode
                </span>
                <h3 className="font-black text-sm sm:text-base text-slate-900">
                  Inspecting {currentUnit.name} Unit Head Workspace
                </h3>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Displaying all 5 workflow stages, photo evidence, remarks, and deadlines exactly as seen by the Unit Head.
              </p>
            </div>
          </div>
          {onBackToDashboard && (
            <button
              type="button"
              id="back-to-dashboard-btn"
              onClick={onBackToDashboard}
              className="px-4 py-2.5 bg-white hover:bg-amber-100 text-amber-950 border border-amber-300 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-2 shrink-0 hover:scale-[1.01]"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Overview
            </button>
          )}
        </div>
      )}

      {/* Top Unit Banner */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 card-orange-accent flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md shadow-orange-500/20 shrink-0">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-black text-orange-700 uppercase tracking-wider">
                {allowUnitSwitch ? 'Selected Hospital Unit' : 'Your Assigned Hospital Unit'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
                {currentUnit.isAssessed ? 'Active Assessment' : 'Assessment Pending'}
              </span>
            </div>

            {allowUnitSwitch && onSelectUnit ? (
              <div className="flex items-center gap-2 mt-1">
                <select
                  id="unit-select-dropdown"
                  value={currentUnit.id}
                  onChange={(e) => onSelectUnit(e.target.value)}
                  className="bg-slate-50 border border-slate-300 text-slate-900 font-extrabold text-base sm:text-lg rounded-xl px-3.5 py-1.5 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none cursor-pointer"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.city}, {u.state}) {u.bottlenecks.length === 0 ? '— Pending' : `(${u.bottlenecks.length} items)`}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {currentUnit.name} <span className="text-sm font-semibold text-slate-500">({currentUnit.city}, {currentUnit.state})</span>
              </h2>
            )}
          </div>
        </div>

        {/* Unit Metadata Chips & Action */}
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <span className="text-xs text-slate-400 block font-medium">Unit Medical Lead</span>
            <span className="text-sm font-bold text-slate-800">{currentUnit.contactHead || currentUser.name}</span>
            <div className="flex items-center justify-end gap-2 text-[11px] text-slate-500 mt-0.5">
              {currentUnit.bedCapacity && <span>{currentUnit.bedCapacity} Inpatient Beds</span>}
              {currentUnit.establishedYear && <span>• Est. {currentUnit.establishedYear}</span>}
            </div>
          </div>

          {viewOnly ? (
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-xs border border-amber-200">
              <Eye className="w-4 h-4" />
              <span>View-Only Mode</span>
            </div>
          ) : (
            onAddBottleneck && (
              <button
                type="button"
                id="unit-head-add-bottleneck-btn"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 btn-orange-gradient rounded-xl font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                Log Bottleneck
              </button>
            )
          )}
        </div>
      </div>

      {/* Add Bottleneck Modal */}
      <AddBottleneckModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={(newB) => onAddBottleneck(currentUnit.id, newB)}
        unitName={currentUnit.name}
      />

      {/* SUMMARY KPI STRIP FOR UNIT */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 card-orange-accent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-slate-500 uppercase tracking-wider">Total Items</span>
            <span className="p-2.5 rounded-2xl bg-slate-100 text-slate-700 border border-slate-200">
              <Sliders className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-slate-900">{stats.total}</span>
            <span className="text-xs sm:text-sm text-slate-500 block mt-1 font-semibold">Logged for {currentUnit.city}</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 card-orange-accent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-blue-800 uppercase tracking-wider">Acknowledge</span>
            <span className="p-2.5 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <AlertCircle className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-blue-600">{stats.acknowledge}</span>
            <span className="text-xs sm:text-sm text-slate-500 block mt-1 font-semibold">Stage 1: Acknowledged</span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 card-orange-accent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-amber-800 uppercase tracking-wider">In Progress</span>
            <span className="p-2.5 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <Clock className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-amber-600">
              {stats.inProgress}
            </span>
            <span className="text-xs sm:text-sm text-slate-500 block mt-1 font-semibold">
              Stage 2: Work in progress
            </span>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 card-orange-accent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-emerald-800 uppercase tracking-wider">Completed</span>
            <span className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <span className="text-3xl sm:text-4xl font-black text-emerald-600">{stats.completed}</span>
            <span className="text-xs sm:text-sm text-slate-500 block mt-1 font-semibold">Stage 3: Resolved & Verified</span>
          </div>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white rounded-3xl p-5 shadow-sm border border-slate-200 card-orange-accent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-extrabold text-orange-800 uppercase tracking-wider">Unit Progress</span>
            <span className="text-sm font-black px-2.5 py-1 rounded-lg bg-orange-50 text-orange-700 border border-orange-200">
              {stats.avgPercent}%
            </span>
          </div>
          <div className="mt-3">
            <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden mb-1.5">
              <div
                className="bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${stats.avgPercent}%` }}
              />
            </div>
            <span className="text-xs sm:text-sm text-slate-500 block font-semibold">
              {stats.completed} of {stats.total} resolved
            </span>
          </div>
        </div>
      </div>

      {/* UNASSESSED UNIT BANNER */}
      {(!currentUnit.isAssessed || currentUnit.bottlenecks.length === 0) && (
        <div className="bg-orange-50/70 border-2 border-dashed border-orange-300 rounded-3xl p-6 text-orange-950 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-orange-100 text-orange-700 rounded-2xl shrink-0">
              <Info className="w-7 h-7" />
            </div>
            <div>
              <h3 className="font-black text-lg text-slate-900">Baseline Assessment Pending</h3>
              <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed">
                This hospital unit ({currentUnit.name}) has no active PX bottlenecks logged in the central operations registry yet. You can initialize a standard eye-care assessment template or log your first bottleneck.
              </p>
            </div>
          </div>
          {onInitializeUnitAssessment && (
            <button
              type="button"
              id="init-unit-assessment-btn"
              onClick={() => onInitializeUnitAssessment(currentUnit.id)}
              className="flex items-center gap-2 px-6 py-3 btn-orange-gradient font-black text-sm sm:text-base rounded-2xl shadow-md transition-all cursor-pointer shrink-0 hover:scale-[1.01]"
            >
              <Sparkles className="w-5 h-5" />
              Initialize Baseline Assessment
            </button>
          )}
        </div>
      )}

      {/* TAB 1: BOTTLENECK RESOLUTION REGISTRY */}
      {activeTab === 'bottlenecks' && (
        <div className="space-y-5">
          {/* Search & Filters */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-96">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="search-unit-bottlenecks-input"
                placeholder="Search title, remarks, notes, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 text-sm sm:text-base font-medium focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-slate-50/70 hover:bg-slate-50 transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
              <select
                id="status-filter-select"
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer shadow-2xs"
              >
                <option value="ALL">All Statuses</option>
                <option value="Acknowledge">Acknowledge</option>
                <option value="In progress">In progress</option>
                <option value="Completed">Completed</option>
              </select>

              <select
                id="category-filter-select"
                value={selectedCategoryFilter}
                onChange={(e) => setSelectedCategoryFilter(e.target.value)}
                className="px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-800 bg-white focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer max-w-[240px] truncate shadow-2xs"
              >
                <option value="ALL">All Categories</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4.5 border-b border-slate-200 bg-slate-50/90 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide">
                  Unit Bottlenecks & Evidence Registry
                </h2>
                <span className="px-3 py-1 rounded-full text-xs sm:text-sm font-black bg-orange-100 text-orange-900 border border-orange-200">
                  {filteredBottlenecks.length} {filteredBottlenecks.length === 1 ? 'item' : 'items'}
                </span>
              </div>
              <span className="text-xs sm:text-sm text-slate-500 font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-orange-500" />
                Workflow progression • Multi-photo Before & After evidence
              </span>
            </div>

            {filteredBottlenecks.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-3xl bg-orange-50 text-orange-500 flex items-center justify-center mx-auto mb-4 border border-orange-100 shadow-sm">
                  <Sliders className="w-7 h-7" />
                </div>
                <h3 className="font-black text-slate-800 text-lg">No bottlenecks found</h3>
                <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                  {searchQuery || selectedStatusFilter !== 'ALL' || selectedCategoryFilter !== 'ALL'
                    ? 'Try adjusting your search query or filters above.'
                    : 'This unit has no bottlenecks logged yet.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-100/90 border-b border-slate-200 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
                      <th className="py-4.5 px-5 pl-6 min-w-[280px]">Bottleneck Title</th>
                      <th className="py-4.5 px-5 min-w-[210px]">Workflow Status</th>
                      <th className="py-4.5 px-5 min-w-[190px]">Before Photos</th>
                      <th className="py-4.5 px-5 min-w-[190px]">After Photos</th>
                      <th className="py-4.5 px-5 min-w-[250px]">Remarks / Field Notes</th>
                      <th className="py-4.5 px-5 min-w-[140px]">Deadline</th>
                      <th className="py-4.5 px-5 pr-6 min-w-[160px]">Owner / Lead</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm sm:text-base">
                    {filteredBottlenecks.map((item) => {
                      const currentNorm = normalizeStatus(item.status);
                      const statusStyle = getStatusBadgeStyle(item.status);
                      const impactBadge = getImpactBadgeStyle(item.impactLevel);
                      const currentRemarksVal = editingRemarks[item.id] !== undefined ? editingRemarks[item.id] : (item.remarks || '');

                      return (
                        <tr key={item.id} className="hover:bg-orange-50/25 transition-colors group">
                          
                          {/* Column 1: Title & Category */}
                          <td className="py-5 px-5 pl-6 max-w-sm">
                            <div className="font-black text-slate-900 text-base sm:text-lg leading-snug">
                              {item.title}
                            </div>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-bold text-xs">
                                {item.category}
                              </span>
                              <span className={`px-2 py-0.5 rounded-md text-xs font-black border ${impactBadge}`}>
                                {item.impactLevel || 'Medium'} Impact
                              </span>
                            </div>
                          </td>

                          {/* Column 2: Status Dropdown */}
                          <td className="py-5 px-5 whitespace-nowrap">
                            {viewOnly ? (
                              <div className="space-y-1">
                                <div className={`px-4 py-2 rounded-xl text-sm font-black border inline-flex items-center gap-2 shadow-xs ${statusStyle.badge}`}>
                                  <span>{currentNorm}</span>
                                </div>
                                <span className="text-xs text-slate-500 block font-semibold mt-1">
                                  Progress: {STATUS_PERCENT_MAP[currentNorm]}%
                                </span>
                              </div>
                            ) : (
                              <div className="relative">
                                <select
                                  id={`status-dropdown-${item.id}`}
                                  value={currentNorm}
                                  onChange={(e) =>
                                    handleStatusChange(item, e.target.value as BottleneckStatus)
                                  }
                                  className={`w-full px-4 py-2.5 rounded-xl text-sm font-black border transition-all cursor-pointer outline-none shadow-xs ${statusStyle.badge}`}
                                >
                                  <option value="Acknowledge" className="bg-white text-slate-900 font-bold">1. Acknowledge</option>
                                  <option value="In progress" className="bg-white text-slate-900 font-bold">2. In progress</option>
                                  <option value="Completed" className="bg-white text-slate-900 font-bold">3. Completed</option>
                                </select>
                                <span className="text-xs text-slate-500 block mt-1.5 font-semibold">
                                  Progress: {STATUS_PERCENT_MAP[currentNorm]}%
                                </span>
                              </div>
                            )}
                          </td>

                          {/* Column 3: Before Photos */}
                          <td className="py-5 px-5">
                            <PhotoUploadCell
                              photos={item.beforePhotos || []}
                              type="before"
                              readOnly={viewOnly}
                              bottleneckTitle={item.title}
                              onPhotosChange={(photos) => handleBeforePhotosChange(item.id, photos)}
                              onOpenLightbox={openLightbox}
                            />
                          </td>

                          {/* Column 4: After Photos */}
                          <td className="py-5 px-5">
                            <PhotoUploadCell
                              photos={item.afterPhotos || []}
                              type="after"
                              readOnly={viewOnly}
                              bottleneckTitle={item.title}
                              onPhotosChange={(photos) => handleAfterPhotosChange(item.id, photos)}
                              onOpenLightbox={openLightbox}
                            />
                          </td>

                          {/* Column 5: Remarks / Notes */}
                          <td className="py-5 px-5 max-w-sm">
                            {viewOnly ? (
                              item.remarks ? (
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm text-slate-800 font-medium leading-relaxed shadow-2xs">
                                  {item.remarks}
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400 italic font-medium">No remarks logged</span>
                              )
                            ) : (
                              <div className="relative">
                                <input
                                  type="text"
                                  id={`remarks-input-${item.id}`}
                                  placeholder="Add unit remarks..."
                                  value={currentRemarksVal}
                                  onChange={(e) =>
                                    setEditingRemarks((prev) => ({ ...prev, [item.id]: e.target.value }))
                                  }
                                  onBlur={() => handleRemarksBlur(item.id, item.remarks || '')}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      (e.target as HTMLInputElement).blur();
                                    }
                                  }}
                                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 text-sm text-slate-800 bg-slate-50/80 focus:bg-white transition-all outline-none font-medium shadow-inner"
                                />
                                {item.remarks && (
                                  <span className="text-xs text-emerald-600 font-bold block mt-1 flex items-center gap-1">
                                    <Check className="w-3.5 h-3.5" /> Remarks saved
                                  </span>
                                )}
                              </div>
                            )}
                          </td>

                          {/* Column 6: Target Deadline */}
                          <td className="py-5 px-5 whitespace-nowrap text-sm text-slate-700">
                            <div className="flex items-center gap-1.5 font-bold">
                              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                              <span>{item.targetDate || 'Pending Date'}</span>
                            </div>
                          </td>

                          {/* Column 7: Owner */}
                          <td className="py-5 px-5 pr-6 whitespace-nowrap">
                            <div className="flex items-center gap-2 text-slate-800 text-sm font-bold">
                              <UserIcon className="w-4 h-4 text-orange-500 shrink-0" />
                              <span className="truncate max-w-[150px]">{item.owner}</span>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CATEGORY BREAKDOWN & ANALYTICS */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Clinical & Operational Category Distribution
                </h3>
                <p className="text-xs text-slate-500">
                  Bottleneck concentration and resolution status across clinical departments in {currentUnit.name}
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-orange-50 text-orange-800 border border-orange-200">
                {categoryStats.length} Active Categories
              </span>
            </div>

            {categoryStats.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No clinical category data logged yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categoryStats.map((c) => (
                  <div
                    key={c.category}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-orange-300 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-extrabold text-slate-900 text-xs">{c.category}</span>
                        <span className="text-xs font-black text-orange-600">{c.pct}%</span>
                      </div>
                      <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden my-2">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 transition-all duration-300"
                          style={{ width: `${c.pct}%` }}
                        />
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200">
                      <span>{c.total} total items</span>
                      <span className="text-emerald-700 font-bold">{c.resolved} resolved</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: UNIT PROFILE & CONTACT LEADERSHIP */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">Hospital Unit Profile & Governance</h3>
            <p className="text-xs text-slate-500">Center configuration, clinical leadership, and operations contacts</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Hospital Details</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Unit Name</span>
                  <span className="font-bold text-slate-900">{currentUnit.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">City & State</span>
                  <span className="font-bold text-slate-900">{currentUnit.city}, {currentUnit.state}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Bed Capacity</span>
                  <span className="font-bold text-slate-900">{currentUnit.bedCapacity || 100} Beds</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Foundation Year</span>
                  <span className="font-bold text-slate-900">{currentUnit.establishedYear || 'N/A'}</span>
                </div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">Medical Leadership</h4>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Unit Head</span>
                  <span className="font-bold text-slate-900">{currentUnit.contactHead || currentUser.name}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Logged User Role</span>
                  <span className="font-bold text-orange-700">{currentUser.role}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-200">
                  <span className="text-slate-500">Official Email</span>
                  <span className="font-bold text-slate-900">{currentUser.email}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500">Governance Level</span>
                  <span className="font-bold text-emerald-700">Level 1 Unit Head</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
