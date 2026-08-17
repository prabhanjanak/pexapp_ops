import React, { useState, useMemo } from 'react';
import { HospitalUnit } from '../types';
import { calculateOrgStats, calculateUnitStats } from '../utils/calc';
import { UnitDrilldownModal } from './UnitDrilldownModal';
import {
  Shield,
  Building2,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Filter,
  Search,
  Grid,
  List,
  ChevronRight,
  Sparkles,
  Sliders,
  Award,
  AlertTriangle,
  ArrowUpRight,
  MapPin,
  Bed,
  Calendar,
  User
} from 'lucide-react';

interface LeadershipViewProps {
  units: HospitalUnit[];
  onSelectUnitHead: (unitId: string) => void;
  onInitializeUnitAssessment: (unitId: string) => void;
}

export const LeadershipView: React.FC<LeadershipViewProps> = ({
  units,
  onSelectUnitHead,
  onInitializeUnitAssessment
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState('ALL');
  const [assessmentFilter, setAssessmentFilter] = useState<'ALL' | 'ASSESSED' | 'PENDING'>('ALL');
  const [completionThreshold, setCompletionThreshold] = useState<number>(100);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [inspectUnit, setInspectUnit] = useState<HospitalUnit | null>(null);

  // Org level metrics
  const orgStats = useMemo(() => {
    return calculateOrgStats(units);
  }, [units]);

  // Unique list of states
  const uniqueStates = useMemo(() => {
    const states = new Set(units.map((u) => u.state));
    return Array.from(states).sort();
  }, [units]);

  // Ranked units by completion
  const rankedUnits = useMemo(() => {
    return [...units].map((unit) => {
      const stats = calculateUnitStats(unit.bottlenecks);
      return {
        unit,
        stats
      };
    });
  }, [units]);

  // Assessed units only for benchmarks
  const assessedUnitsOnly = useMemo(() => {
    return rankedUnits.filter((r) => r.unit.isAssessed || r.stats.total > 0);
  }, [rankedUnits]);

  const topUnit = useMemo(() => {
    if (assessedUnitsOnly.length === 0) return null;
    return [...assessedUnitsOnly].sort((a, b) => b.stats.avgPercent - a.stats.avgPercent)[0];
  }, [assessedUnitsOnly]);

  const laggingUnit = useMemo(() => {
    if (assessedUnitsOnly.length === 0) return null;
    return [...assessedUnitsOnly].sort((a, b) => a.stats.avgPercent - b.stats.avgPercent)[0];
  }, [assessedUnitsOnly]);

  // Filtered units list
  const filteredUnitCards = useMemo(() => {
    return rankedUnits.filter(({ unit, stats }) => {
      // Search
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        unit.name.toLowerCase().includes(query) ||
        unit.city.toLowerCase().includes(query) ||
        unit.state.toLowerCase().includes(query);

      // State
      const matchesState = selectedState === 'ALL' || unit.state === selectedState;

      // Assessment Filter
      const isAssessed = unit.isAssessed || unit.bottlenecks.length > 0;
      const matchesAssessment =
        assessmentFilter === 'ALL' ||
        (assessmentFilter === 'ASSESSED' && isAssessed) ||
        (assessmentFilter === 'PENDING' && !isAssessed);

      // Completion Threshold Filter
      const matchesThreshold =
        completionThreshold === 100 || (isAssessed && stats.avgPercent <= completionThreshold);

      return matchesSearch && matchesState && matchesAssessment && matchesThreshold;
    });
  }, [rankedUnits, searchQuery, selectedState, assessmentFilter, completionThreshold]);

  return (
    <div className="space-y-6">
      
      {/* EXECUTIVE TOP SUMMARY CARDS (White Theme with Orange/Amber Highlights) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Org Units Active vs Pending */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 card-orange-accent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Hospital Units</span>
            <span className="p-2 rounded-xl bg-orange-50 text-orange-600 border border-orange-100">
              <Building2 className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-slate-900">{orgStats.assessedUnits}</span>
              <span className="text-xs font-bold text-slate-500">/ {orgStats.totalUnits} Assessed</span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2.5">
              <div
                className="bg-gradient-to-r from-orange-500 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${(orgStats.assessedUnits / (orgStats.totalUnits || 1)) * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              {orgStats.pendingUnits} units pending baseline assessment
            </p>
          </div>
        </div>

        {/* Card 2: Org-Wide Avg % Complete */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 card-orange-accent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-orange-800 uppercase tracking-wider">Org Resolution Rate</span>
            <span className="p-2 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-white shadow-sm shadow-orange-500/20">
              <TrendingUp className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-orange-600 flex items-baseline gap-2">
              {orgStats.orgAvgPercent}%
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                <ArrowUpRight className="w-3.5 h-3.5" /> Network Avg
              </span>
            </div>
            <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-2.5">
              <div
                className="bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${orgStats.orgAvgPercent}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-2 font-medium">
              Across all {orgStats.assessedUnits} active hospital units
            </p>
          </div>
        </div>

        {/* Card 3: Total Bottlenecks Breakdown */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 card-orange-accent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Total Bottlenecks</span>
            <span className="p-2 rounded-xl bg-slate-100 text-slate-700 border border-slate-200">
              <Sliders className="w-5 h-5" />
            </span>
          </div>
          <div className="mt-2">
            <div className="text-2xl font-black text-slate-900 mb-1">
              {orgStats.totalBottlenecks} <span className="text-xs font-semibold text-slate-500">logged across network</span>
            </div>
            
            {/* 3 Status pill counts */}
            <div className="grid grid-cols-3 gap-1.5 mt-2">
              <div className="p-1.5 rounded-xl bg-blue-50 text-blue-900 text-center border border-blue-100">
                <span className="block text-[10px] font-bold uppercase">Acknowledge</span>
                <span className="text-xs font-black">{orgStats.acknowledge}</span>
              </div>
              <div className="p-1.5 rounded-xl bg-amber-50 text-amber-900 text-center border border-amber-100">
                <span className="block text-[10px] font-bold uppercase">In Progress</span>
                <span className="text-xs font-black">{orgStats.inProgress}</span>
              </div>
              <div className="p-1.5 rounded-xl bg-emerald-50 text-emerald-900 text-center border border-emerald-100">
                <span className="block text-[10px] font-bold uppercase">Completed</span>
                <span className="text-xs font-black">{orgStats.completed}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Card 4: Top vs Lagging Unit Insights */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 card-orange-accent flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Unit Benchmarks</span>
            <span className="p-2 rounded-xl bg-orange-50 text-orange-700 border border-orange-100">
              <Award className="w-5 h-5" />
            </span>
          </div>
          
          <div className="space-y-2 mt-2">
            {topUnit ? (
              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-emerald-50 text-emerald-950 border border-emerald-200">
                <div className="flex items-center gap-1.5 truncate">
                  <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="font-bold truncate">{topUnit.unit.name}</span>
                </div>
                <span className="font-black text-emerald-700 shrink-0">{topUnit.stats.avgPercent}%</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400">No benchmark available</p>
            )}

            {laggingUnit ? (
              <div className="flex items-center justify-between text-xs p-2 rounded-xl bg-amber-50 text-amber-950 border border-amber-200">
                <div className="flex items-center gap-1.5 truncate">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="font-bold truncate">{laggingUnit.unit.name}</span>
                </div>
                <span className="font-black text-amber-700 shrink-0">{laggingUnit.stats.avgPercent}%</span>
              </div>
            ) : null}
          </div>
        </div>

      </div>

      {/* FILTER & THRESHOLD CONTROLS TOOLBAR */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 space-y-4">
        
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          
          {/* Search & State Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                id="leadership-search-input"
                placeholder="Search unit name, city, state..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none bg-slate-50/50"
              />
            </div>

            {/* State dropdown */}
            <select
              id="leadership-state-filter"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
            >
              <option value="ALL">All States ({uniqueStates.length})</option>
              {uniqueStates.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Assessment Filter */}
            <select
              id="leadership-assessment-filter"
              value={assessmentFilter}
              onChange={(e) => setAssessmentFilter(e.target.value as any)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm bg-white font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
            >
              <option value="ALL">All Units ({units.length})</option>
              <option value="ASSESSED">Assessed Only ({orgStats.assessedUnits})</option>
              <option value="PENDING">Pending Assessment ({orgStats.pendingUnits})</option>
            </select>
          </div>

          {/* View Toggle (Grid / Table) */}
          <div className="flex items-center gap-2 justify-between sm:justify-end">
            <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider hidden sm:inline">View Mode</span>
            <div className="bg-slate-100 p-1 rounded-xl flex items-center border border-slate-200">
              <button
                type="button"
                id="view-grid-btn"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="view-table-btn"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white text-orange-600 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* COMPLETION THRESHOLD FILTER SLIDER */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-orange-50/40 p-3.5 rounded-xl border border-orange-100/60">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-orange-600" />
            <label htmlFor="threshold-slider" className="text-xs font-bold text-slate-800">
              Lagging Unit Filter Threshold:
            </label>
            <span className="text-xs font-black text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-md border border-orange-200">
              {completionThreshold < 100 ? `Show units ≤ ${completionThreshold}% completion` : 'Showing all units'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-72">
            <input
              type="range"
              min="20"
              max="100"
              step="5"
              id="threshold-slider"
              value={completionThreshold}
              onChange={(e) => setCompletionThreshold(Number(e.target.value))}
              className="w-full accent-orange-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            {completionThreshold < 100 && (
              <button
                type="button"
                id="reset-threshold-btn"
                onClick={() => setCompletionThreshold(100)}
                className="text-[11px] font-bold text-orange-600 hover:text-orange-800 underline shrink-0 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

      </div>

      {/* UNITS CONTAINER (GRID OR TABLE) */}
      {filteredUnitCards.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Building2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="font-bold text-slate-800 text-base">No units match criteria</h3>
          <p className="text-xs text-slate-500 mt-1">
            Try resetting search filters or moving the completion threshold slider to 100%.
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        
        /* GRID VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredUnitCards.map(({ unit, stats }) => {
            const isAssessed = unit.isAssessed || stats.total > 0;
            
            const notStartedPct = stats.total > 0 ? (stats.notStarted / stats.total) * 100 : 0;
            const inProgressPct = stats.total > 0 ? (stats.inProgress / stats.total) * 100 : 0;
            const completedPct = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;

            return (
              <div
                key={unit.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group card-orange-accent"
              >
                {/* Unit Card Header */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-black text-slate-900 text-base group-hover:text-orange-600 transition-colors">
                        {unit.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span>{unit.city}, {unit.state}</span>
                      </div>
                    </div>

                    {isAssessed ? (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200 shrink-0">
                        Assessed
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 shrink-0">
                        Pending
                      </span>
                    )}
                  </div>

                  {/* Metadata Chips */}
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-2.5 pt-2 border-t border-slate-200/60">
                    {unit.bedCapacity && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-3 h-3 text-slate-400" />
                        <span>{unit.bedCapacity} Beds</span>
                      </div>
                    )}
                    {unit.establishedYear && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>Est. {unit.establishedYear}</span>
                      </div>
                    )}
                    {unit.contactHead && (
                      <div className="flex items-center gap-1 truncate" title={unit.contactHead}>
                        <User className="w-3 h-3 text-slate-400" />
                        <span className="truncate max-w-[110px]">{unit.contactHead}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Unit Card Body */}
                <div className="p-5 space-y-4 flex-1">
                  
                  {!isAssessed ? (
                    <div className="py-4 text-center space-y-3">
                      <p className="text-xs text-slate-500 italic">
                        Assessment not yet started for this hospital unit.
                      </p>
                      <button
                        type="button"
                        id={`init-btn-${unit.id}`}
                        onClick={() => onInitializeUnitAssessment(unit.id)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold btn-orange-gradient rounded-xl transition-all cursor-pointer"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-white" />
                        Initialize Baseline Assessment
                      </button>
                    </div>
                  ) : (
                    <>
                      {/* Overall Progress Bar */}
                      <div>
                        <div className="flex justify-between items-center text-xs mb-1.5">
                          <span className="font-bold text-slate-600">Unit Resolution Progress</span>
                          <span className="font-black text-orange-600 text-sm">{stats.avgPercent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-300"
                            style={{ width: `${stats.avgPercent}%` }}
                          />
                        </div>
                      </div>

                      {/* Stacked Status Bar */}
                      <div>
                        <div className="flex justify-between items-center text-[11px] text-slate-500 mb-1 font-medium">
                          <span>Bottleneck Status Distribution</span>
                          <span className="font-bold text-slate-700">{stats.total} Bottlenecks</span>
                        </div>
                        <div className="w-full h-3 bg-slate-100 rounded-lg overflow-hidden flex">
                          <div
                            className="bg-rose-500 h-full transition-all"
                            style={{ width: `${notStartedPct}%` }}
                            title={`Not Started: ${stats.notStarted}`}
                          />
                          <div
                            className="bg-amber-500 h-full transition-all"
                            style={{ width: `${inProgressPct}%` }}
                            title={`In Progress: ${stats.inProgress}`}
                          />
                          <div
                            className="bg-emerald-500 h-full transition-all"
                            style={{ width: `${completedPct}%` }}
                            title={`Completed: ${stats.completed}`}
                          />
                        </div>

                        {/* Status Counts Grid */}
                        <div className="grid grid-cols-3 gap-2 mt-2.5 text-[11px]">
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                            <span className="font-bold">{stats.acknowledge} Ack</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                            <span className="font-bold">{stats.inProgress} In Prog</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-slate-700">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                            <span className="font-bold">{stats.completed} Done</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                </div>

                {/* Unit Card Footer */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    id={`drilldown-btn-${unit.id}`}
                    onClick={() => setInspectUnit(unit)}
                    className="text-xs font-bold text-slate-700 hover:text-orange-600 flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    Drill Down Detail
                    <ChevronRight className="w-4 h-4 text-orange-500" />
                  </button>

                  <button
                    type="button"
                    id={`switch-head-btn-${unit.id}`}
                    onClick={() => onSelectUnitHead(unit.id)}
                    className="text-[11px] font-bold text-orange-700 hover:text-white bg-orange-50 hover:bg-orange-600 px-3 py-1.5 rounded-xl border border-orange-200 hover:border-orange-600 transition-all cursor-pointer shadow-xs"
                  >
                    Open as Unit Head
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      ) : (

        /* TABLE VIEW */
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/90 border-b border-slate-200 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
                  <th className="py-4.5 px-5 pl-6 min-w-[240px]">Unit Name</th>
                  <th className="py-4.5 px-5 min-w-[160px]">Location</th>
                  <th className="py-4.5 px-5 min-w-[160px]">Assessment Status</th>
                  <th className="py-4.5 px-5 text-center min-w-[120px]">Bottlenecks</th>
                  <th className="py-4.5 px-5 min-w-[200px]">Status Breakdown</th>
                  <th className="py-4.5 px-5 min-w-[180px]">Completion %</th>
                  <th className="py-4.5 px-5 pr-6 text-right min-w-[220px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm sm:text-base font-medium">
                {filteredUnitCards.map(({ unit, stats }) => {
                  const isAssessed = unit.isAssessed || stats.total > 0;
                  return (
                    <tr key={unit.id} className="hover:bg-orange-50/25 transition-colors">
                      <td className="py-4.5 px-5 pl-6 font-black text-slate-900 text-base">
                        {unit.name}
                        {unit.contactHead && (
                          <span className="block text-xs font-semibold text-slate-500 mt-0.5">
                            Lead: {unit.contactHead}
                          </span>
                        )}
                      </td>

                      <td className="py-4.5 px-5 text-slate-700 whitespace-nowrap font-semibold">
                        {unit.city}, {unit.state}
                      </td>

                      <td className="py-4.5 px-5 whitespace-nowrap">
                        {isAssessed ? (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-2xs">
                            Active Assessed
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-50 text-amber-800 border border-amber-200 shadow-2xs">
                            Pending Assessment
                          </span>
                        )}
                      </td>

                      <td className="py-4.5 px-5 text-center font-black text-slate-900 text-base">
                        {stats.total}
                      </td>

                      {/* Status breakdown counts */}
                      <td className="py-4.5 px-5">
                        {isAssessed ? (
                          <div className="flex items-center gap-2 text-xs font-extrabold flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                              {stats.acknowledge} Ack
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-800">
                              {stats.inProgress} In Prog
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                              {stats.completed} Done
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">No items logged</span>
                        )}
                      </td>

                      {/* Completion % */}
                      <td className="py-4.5 px-5">
                        {isAssessed ? (
                          <div className="flex items-center gap-2.5">
                            <div className="w-28 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                              <div
                                className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full rounded-full"
                                style={{ width: `${stats.avgPercent}%` }}
                              />
                            </div>
                            <span className="font-black text-orange-600 text-sm">
                              {stats.avgPercent}%
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm font-semibold text-slate-400">0%</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-5 pr-6 text-right whitespace-nowrap space-x-2">
                        <button
                          type="button"
                          id={`table-drill-${unit.id}`}
                          onClick={() => setInspectUnit(unit)}
                          className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer shadow-2xs"
                        >
                          Quick Detail
                        </button>

                        <button
                          type="button"
                          id={`table-switch-head-${unit.id}`}
                          onClick={() => onSelectUnitHead(unit.id)}
                          className="px-3.5 py-2 text-xs font-black text-orange-700 hover:text-white bg-orange-50 hover:bg-orange-600 rounded-xl border border-orange-200 hover:border-orange-600 transition-all cursor-pointer shadow-2xs"
                        >
                          Open as Unit Head
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      )}

      {/* DRILLDOWN INSPECTION MODAL */}
      <UnitDrilldownModal
        unit={inspectUnit}
        onClose={() => setInspectUnit(null)}
        onSwitchToUnitHeadView={onSelectUnitHead}
      />

    </div>
  );
};
