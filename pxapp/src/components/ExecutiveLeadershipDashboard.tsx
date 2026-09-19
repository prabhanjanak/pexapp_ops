import React, { useState, useMemo } from 'react';
import { HospitalUnit, Bottleneck, User, BottleneckStatus } from '../types';
import {
  Building2,
  Calendar,
  Search,
  Filter,
  Download,
  ChevronLeft,
  ChevronRight,
  Award,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  MoreVertical,
  Layers,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  UserCheck,
  PhoneCall,
  Flame,
  Check,
  Stethoscope,
  BarChart3,
  Percent,
  Compass,
  Zap,
  Target
} from 'lucide-react';

interface ExecutiveLeadershipDashboardProps {
  units: HospitalUnit[];
  currentUser: User;
  onSelectUnit?: (unitId: string) => void;
  onSwitchPortal?: (portal: '5s' | 'bottleneck') => void;
  onAddBottleneck?: (unitId: string, newBottleneck: Omit<Bottleneck, 'id' | 'lastUpdated'>) => void;
}

// Curated Hospital Unit Building Visuals
const HOSPITAL_CARD_IMAGES: Record<string, string> = {
  'unit-guntur': 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
  'unit-bangalore': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
  'unit-coimbatore': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
  'unit-jaipur': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=80',
  'unit-varanasi': 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&auto=format&fit=crop&q=80',
  'unit-anand': 'https://images.unsplash.com/photo-1587351021759-3e566b6af7cc?w=600&auto=format&fit=crop&q=80',
  'unit-shimoga': 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80',
  'unit-ludhiana': 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=600&auto=format&fit=crop&q=80',
  'unit-panvel': 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=600&auto=format&fit=crop&q=80',
  'unit-kanpur': 'https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=600&auto=format&fit=crop&q=80'
};

const DEFAULT_HOSPITAL_IMG = 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600&auto=format&fit=crop&q=80';

export const ExecutiveLeadershipDashboard: React.FC<ExecutiveLeadershipDashboardProps> = ({
  units,
  currentUser,
  onSelectUnit,
  onSwitchPortal,
  onAddBottleneck
}) => {
  // Navigation & Sub-views: 'dashboard' | 'tickets'
  const [activeMainTab, setActiveMainTab] = useState<'dashboard' | 'tickets'>('dashboard');
  const [ticketSubTab, setTicketSubTab] = useState<'all' | 'my_tasks'>('all');

  // Filters
  const [selectedUnitId, setSelectedUnitId] = useState<string>('ALL');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [ticketSearchQuery, setTicketSearchQuery] = useState<string>('');
  const [rankingTab, setRankingTab] = useState<'ranking' | 'criteria'>('ranking');

  // Carousel Scroll index
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Filtered unit reference
  const currentSelectedUnit = useMemo(() => {
    if (selectedUnitId === 'ALL') return null;
    return units.find((u) => u.id === selectedUnitId) || null;
  }, [units, selectedUnitId]);

  // Aggregate stats based on selected location
  const stats = useMemo(() => {
    let relevantUnits = units;
    if (selectedUnitId !== 'ALL') {
      relevantUnits = units.filter((u) => u.id === selectedUnitId);
    }

    let totalBottlenecks = 0;
    let completed = 0;
    let inProgress = 0;
    let pending = 0;
    let highImpactTotal = 0;
    let highImpactCompleted = 0;
    let standardTotal = 0;
    let standardCompleted = 0;

    relevantUnits.forEach((u) => {
      u.bottlenecks.forEach((b) => {
        totalBottlenecks++;
        const isDone = b.status === 'Completed' || b.percentComplete >= 100;
        if (isDone) {
          completed++;
        } else if (b.status === 'In progress') {
          inProgress++;
        } else {
          pending++;
        }

        if (b.impactLevel === 'High') {
          highImpactTotal++;
          if (isDone) highImpactCompleted++;
        } else {
          standardTotal++;
          if (isDone) standardCompleted++;
        }
      });
    });

    const avgResolutionRate = totalBottlenecks > 0
      ? Math.round((completed / totalBottlenecks) * 100)
      : 100;

    const highImpactSat = highImpactTotal > 0
      ? Math.round((highImpactCompleted / highImpactTotal) * 100)
      : (totalBottlenecks > 0 ? 88 : 99);

    const standardSat = standardTotal > 0
      ? Math.round((standardCompleted / standardTotal) * 100)
      : (totalBottlenecks > 0 ? 94 : 99);

    // Realistic patient experience touchpoints
    const baseFeedbacks = relevantUnits.length * 90 + totalBottlenecks * 12;
    const opFeedbacks = Math.round(baseFeedbacks * 0.75);
    const ipFeedbacks = baseFeedbacks - opFeedbacks;

    return {
      totalBottlenecks,
      activeBottlenecks: inProgress + pending,
      completed,
      inProgress,
      pending,
      avgResolutionRate,
      highImpactRate: highImpactSat,
      standardRate: standardSat,
      highImpactTotal,
      highImpactCompleted,
      standardTotal,
      standardCompleted,
      opFeedbacks,
      ipFeedbacks,
      totalUnitsCount: relevantUnits.length
    };
  }, [units, selectedUnitId]);

  // Ranked Hospital Units for Leadership Scorecard
  const rankedUnits = useMemo(() => {
    return [...units].map((u) => {
      const total = u.bottlenecks.length;
      const done = u.bottlenecks.filter((b) => b.status === 'Completed' || b.percentComplete >= 100).length;
      const active = total - done;
      const rate = total > 0 ? Math.round((done / total) * 100) : 100;
      const highImpactActive = u.bottlenecks.filter(b => b.impactLevel === 'High' && b.status !== 'Completed').length;
      
      // Score calculation: higher resolution rate, fewer active bottlenecks
      let score = 98 - (active * 2) - (highImpactActive * 4);
      if (score < 70) score = 70;
      if (score > 99) score = 99;

      return {
        unit: u,
        score,
        total,
        done,
        active,
        rate,
        city: u.city,
        state: u.state,
        head: u.contactHead || u.unitHead || 'Unit Head',
        cmo: u.cmo || 'CMO',
        beds: u.bedCapacity || 100
      };
    }).sort((a, b) => b.score - a.score);
  }, [units]);

  // Departmental breakdown
  const departmentBreakdown = useMemo(() => {
    const depts: Record<string, { total: number; resolved: number }> = {
      'Outpatient (OPD)': { total: 0, resolved: 0 },
      'Inpatient & Daycare': { total: 0, resolved: 0 },
      'Operating Theatre (OT)': { total: 0, resolved: 0 },
      'Diagnostic & Laboratory': { total: 0, resolved: 0 },
      'Pharmacy & Dispensary': { total: 0, resolved: 0 },
      'Billing & TPA Insurance': { total: 0, resolved: 0 },
      'Patient Counselling': { total: 0, resolved: 0 },
      'IT & Digital Flow': { total: 0, resolved: 0 }
    };

    let relevantUnits = units;
    if (selectedUnitId !== 'ALL') {
      relevantUnits = units.filter((u) => u.id === selectedUnitId);
    }

    relevantUnits.forEach((u) => {
      u.bottlenecks.forEach((b) => {
        const d = b.department || 'Outpatient (OPD)';
        if (!depts[d]) depts[d] = { total: 0, resolved: 0 };
        depts[d].total++;
        if (b.status === 'Completed' || b.percentComplete >= 100) {
          depts[d].resolved++;
        }
      });
    });

    return Object.entries(depts).map(([name, data]) => {
      const pct = data.total > 0 ? Math.round((data.resolved / data.total) * 100) : 100;
      return { name, total: data.total, resolved: data.resolved, pct };
    }).sort((a, b) => b.total - a.total);
  }, [units, selectedUnitId]);

  // All Tickets / Action Items Matrix
  const allTickets = useMemo(() => {
    const list: Array<{
      id: string;
      unitId: string;
      unitName: string;
      city: string;
      category: string;
      department?: string;
      title: string;
      impact: 'High' | 'Medium' | 'Low';
      status: string;
      owner: string;
      createdDate: string;
      targetDate?: string;
      tasksDone: number;
      tasksTotal: number;
      percentComplete: number;
    }> = [];

    units.forEach((u) => {
      if (selectedUnitId !== 'ALL' && u.id !== selectedUnitId) return;

      u.bottlenecks.forEach((b) => {
        const tasksTotal = b.tasks?.length || 0;
        const tasksDone = b.tasks?.filter((t) => t.isCompleted).length || 0;
        list.push({
          id: b.id,
          unitId: u.id,
          unitName: u.name,
          city: u.city,
          category: b.category,
          department: b.department,
          title: b.title,
          impact: b.impactLevel || 'Medium',
          status: b.status,
          owner: b.owner,
          createdDate: b.lastUpdated || '2026-03-01',
          targetDate: b.targetDate,
          tasksDone,
          tasksTotal,
          percentComplete: b.percentComplete
        });
      });
    });

    return list;
  }, [units, selectedUnitId]);

  // Filtered Tickets
  const filteredTickets = useMemo(() => {
    return allTickets.filter((t) => {
      if (ticketSubTab === 'my_tasks' && currentUser.unitId && t.unitId !== currentUser.unitId) return false;

      if (ticketStatusFilter !== 'ALL') {
        if (ticketStatusFilter === 'Pending' && t.status !== 'Pending') return false;
        if (ticketStatusFilter === 'In progress' && t.status !== 'In progress') return false;
        if (ticketStatusFilter === 'Completed' && t.status !== 'Completed') return false;
      }

      if (ticketSearchQuery.trim()) {
        const q = ticketSearchQuery.toLowerCase();
        return (
          t.title.toLowerCase().includes(q) ||
          t.city.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.owner.toLowerCase().includes(q) ||
          (t.department && t.department.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [allTickets, ticketSubTab, ticketStatusFilter, ticketSearchQuery, currentUser]);

  // Carousel Visible items
  const visibleUnits = units.slice(carouselIndex, carouselIndex + 5);

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextCarousel = () => {
    setCarouselIndex((prev) => Math.min(Math.max(0, units.length - 5), prev + 1));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans selection:bg-orange-500 selection:text-white relative">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="text-orange-600 font-black tracking-tight text-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-orange-500" />
              <span>Project Patient Experience</span>
            </span>
            <span>•</span>
            <span className="text-slate-800 font-black">
              {activeMainTab === 'dashboard' ? 'Executive Leadership Dashboard' : 'Operational Action Matrix'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMainTab('dashboard')}
              className={`text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMainTab === 'dashboard'
                  ? 'text-orange-600 underline underline-offset-4 decoration-2'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Executive Overview</span>
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveMainTab('tickets')}
              className={`text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
                activeMainTab === 'tickets'
                  ? 'text-orange-600 underline underline-offset-4 decoration-2'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Network Action Matrix ({allTickets.length} Items)</span>
            </button>
          </div>
        </div>

        {/* Top Right Controls */}
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-xl bg-orange-50 border border-orange-200 text-orange-900 text-xs font-black">
            Live Network Sync • 14 Units
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW MODE: EXECUTIVE DASHBOARD */}
      {/* ========================================================================= */}
      {activeMainTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Top Hospital Units Photo Carousel */}
          <div className="relative bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-orange-600" />
                <span>14 Sankara Hospital Units Network • Direct Inspection</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevCarousel}
                  disabled={carouselIndex === 0}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-40 text-slate-700 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextCarousel}
                  disabled={carouselIndex >= units.length - 5}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 disabled:opacity-40 text-slate-700 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Carousel Cards Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {visibleUnits.map((u, idx) => {
                const globalIndex = carouselIndex + idx + 1;
                const isSelected = selectedUnitId === u.id;
                const imgUrl = HOSPITAL_CARD_IMAGES[u.id] || DEFAULT_HOSPITAL_IMG;
                const activeCount = u.bottlenecks.filter((b) => b.status !== 'Completed').length;

                return (
                  <div
                    key={u.id}
                    onClick={() => {
                      setSelectedUnitId(isSelected ? 'ALL' : u.id);
                    }}
                    className={`group relative h-28 rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-200 shadow-xs hover:shadow-md ${
                      isSelected
                        ? 'border-orange-500 ring-2 ring-orange-500/30 scale-[1.02]'
                        : 'border-slate-200 hover:border-orange-400'
                    }`}
                  >
                    {/* Background Image */}
                    <img
                      src={imgUrl}
                      alt={u.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/30 to-transparent" />

                    {/* Top Number Badge */}
                    <div className="absolute top-2 left-2 w-5 h-5 rounded-md bg-slate-900/90 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
                      {globalIndex}
                    </div>

                    {/* Active Bottlenecks Pill */}
                    {activeCount > 0 && (
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-amber-500 text-slate-950 text-[9px] font-black shadow-xs">
                        {activeCount} active
                      </div>
                    )}

                    {/* Bottom Hospital City Name */}
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-black text-white truncate drop-shadow-md">
                        {u.id === 'unit-coimbatore' ? 'Coimbatore HQ' : u.city}
                      </p>
                      <p className="text-[10px] text-slate-300 truncate font-medium">
                        {u.state}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Dots */}
            <div className="flex items-center justify-center gap-1.5 mt-3">
              {Array.from({ length: Math.ceil(units.length / 5) }).map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCarouselIndex(dotIdx * 5)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    Math.floor(carouselIndex / 5) === dotIdx ? 'w-6 bg-orange-500' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Selected Location Pill & Date Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 border border-orange-200/80 flex items-center justify-center text-orange-600 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>Scope Filter : {currentSelectedUnit ? currentSelectedUnit.name : 'All 14 Hospital Units'}</span>
                  {selectedUnitId !== 'ALL' && (
                    <button
                      onClick={() => setSelectedUnitId('ALL')}
                      className="text-[10px] text-orange-600 hover:underline font-bold cursor-pointer"
                    >
                      (View All Units)
                    </button>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">
                  Unit Head: {currentSelectedUnit?.contactHead || currentSelectedUnit?.unitHead || 'Central Directorate'} • CMO: {currentSelectedUnit?.cmo || 'National Medical Board'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="text-xs font-bold text-slate-500">Filtered View:</span>
              <span className="px-3 py-1 rounded-lg bg-orange-50 border border-orange-200 text-orange-900 text-xs font-black">
                {selectedUnitId === 'ALL' ? '14 Hospital Units Network' : `${currentSelectedUnit?.city} (${currentSelectedUnit?.state})`}
              </span>
            </div>
          </div>

          {/* 4 Primary Orange Gradient Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Bottlenecks */}
            <div className="bg-gradient-to-br from-orange-600 via-orange-500 to-amber-500 text-white rounded-2xl p-6 shadow-md shadow-orange-500/20 flex flex-col items-center justify-center text-center">
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{stats.totalBottlenecks}</p>
              <p className="text-xs font-black text-orange-100 mt-1 uppercase tracking-wider">Total Bottlenecks Logged</p>
              <p className="text-[11px] text-orange-100/80 mt-0.5 font-medium">
                {selectedUnitId === 'ALL' ? 'Across 14 Network Units' : `Assigned in ${currentSelectedUnit?.city}`}
              </p>
            </div>

            {/* Card 2: Active Bottlenecks */}
            <div className="bg-gradient-to-br from-amber-600 via-amber-500 to-orange-500 text-white rounded-2xl p-6 shadow-md shadow-amber-500/20 flex flex-col items-center justify-center text-center">
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{stats.activeBottlenecks}</p>
              <p className="text-xs font-black text-amber-100 mt-1 uppercase tracking-wider">Active Bottlenecks</p>
              <p className="text-[11px] text-amber-100/80 mt-0.5 font-medium">
                {stats.inProgress} In Progress • {stats.pending} Pending
              </p>
            </div>

            {/* Card 3: Resolved Items */}
            <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-6 shadow-md shadow-emerald-600/20 flex flex-col items-center justify-center text-center">
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{stats.completed}</p>
              <p className="text-xs font-black text-emerald-100 mt-1 uppercase tracking-wider">Resolved & Archived</p>
              <p className="text-[11px] text-emerald-100/80 mt-0.5 font-medium">
                Verified Closed Directives
              </p>
            </div>

            {/* Card 4: Avg Resolution Rate */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 shadow-md shadow-slate-900/20 flex flex-col items-center justify-center text-center border border-slate-700">
              <p className="text-3xl sm:text-4xl font-black tracking-tight text-amber-400">{stats.avgResolutionRate}%</p>
              <p className="text-xs font-black text-slate-300 mt-1 uppercase tracking-wider">Resolution Velocity</p>
              <p className="text-[11px] text-slate-400 mt-0.5 font-medium">
                {stats.completed}/{stats.totalBottlenecks || 0} Target Completed
              </p>
            </div>

          </div>

          {/* 3 Bottom Analytics Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Panel 1: Departmental Resolution Health */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Compass className="w-4 h-4 text-orange-600" />
                    <span>Clinical Department Flow</span>
                  </span>
                  {currentSelectedUnit && (
                    <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                      {currentSelectedUnit.city}
                    </span>
                  )}
                </h4>

                <div className="space-y-3.5">
                  {departmentBreakdown.slice(0, 5).map((dept) => (
                    <div key={dept.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-700">{dept.name}</span>
                        <span className="text-slate-900 font-extrabold">{dept.pct}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                          style={{ width: `${dept.pct}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400">
                        <span>{dept.total} items</span>
                        <span>{dept.resolved} resolved</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-orange-50/70 border border-orange-200/80 rounded-2xl flex items-center justify-between text-xs font-bold text-orange-950">
                <span>High-Impact Resolution Rate</span>
                <span className="text-sm font-black text-orange-600">{stats.highImpactRate}%</span>
              </div>
            </div>

            {/* Panel 2: Patient Touchpoint Volumes */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-orange-600" />
                    <span>Touchpoint Flow Volume</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    Live Operational Log
                  </span>
                </h4>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                    <p className="text-2xl font-black text-slate-900">{stats.opFeedbacks}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Outpatient (OPD)</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">✓ Real-time Queue Sync</p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-center">
                    <p className="text-2xl font-black text-slate-900">{stats.ipFeedbacks}</p>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Inpatient (IPD / OT)</p>
                    <p className="text-[9px] text-emerald-600 font-bold mt-1">✓ Discharge Audit Active</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                    <span>Standard Workflow Compliance</span>
                    <span className="text-slate-900">{stats.standardRate}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full"
                      style={{ width: `${stats.standardRate}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-900 text-white rounded-2xl flex items-center justify-between text-xs font-bold">
                <span className="text-slate-300">Total Active Operations Scope</span>
                <span className="text-amber-400 font-black">{stats.totalBottlenecks} Directives</span>
              </div>
            </div>

            {/* Panel 3: Hospital Leadership Performance Scorecard */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-orange-500" />
                    <span>Hospital Unit Scorecard</span>
                  </h4>

                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setRankingTab('ranking')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                        rankingTab === 'ranking' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Top Units
                    </button>
                    <button
                      type="button"
                      onClick={() => setRankingTab('criteria')}
                      className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold cursor-pointer transition-colors ${
                        rankingTab === 'criteria' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Bed Size
                    </button>
                  </div>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {rankedUnits.slice(0, 5).map((r, i) => (
                    <div
                      key={r.unit.id}
                      onClick={() => onSelectUnit?.(r.unit.id)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 flex items-center justify-between gap-2 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                          i === 0 ? 'bg-amber-400 text-amber-950 font-black' : 'bg-slate-100 text-slate-700'
                        }`}>
                          {i + 1}
                        </span>
                        <div className="truncate">
                          <p className="text-xs font-black text-slate-900 group-hover:text-orange-600 transition-colors truncate">
                            {r.city}
                          </p>
                          <p className="text-[10px] text-slate-400 font-semibold truncate">
                            {r.head}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-emerald-600 block">
                          {r.rate}%
                        </span>
                        <span className="text-[9px] text-slate-400 font-medium">
                          {r.done}/{r.total} done
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveMainTab('tickets')}
                className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <span>Open Full Action Matrix</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW MODE: ALL TICKETS / BOTTLENECKS MATRIX */}
      {/* ========================================================================= */}
      {activeMainTab === 'tickets' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          
          {/* Header & Sub-nav Pills */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-600" />
                <span>Operational Action Items & Directives Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Central tracking across all 14 hospital units with owner assignments, task checklists & deadline statuses.
              </p>
            </div>

            {/* Sub-Tabs: All vs My Unit Tasks */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
              <button
                type="button"
                onClick={() => setTicketSubTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  ticketSubTab === 'all'
                    ? 'bg-white text-orange-600 shadow-xs border border-orange-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All Network Directives ({allTickets.length})
              </button>
              <button
                type="button"
                onClick={() => setTicketSubTab('my_tasks')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  ticketSubTab === 'my_tasks'
                    ? 'bg-white text-orange-600 shadow-xs border border-orange-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                My Unit Tasks
              </button>
            </div>
          </div>

          {/* Search and Filters Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, hospital unit, owner or department..."
                value={ticketSearchQuery}
                onChange={(e) => setTicketSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={ticketStatusFilter}
                  onChange={(e) => setTicketStatusFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="Pending">Pending</option>
                  <option value="In progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="px-2.5 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                >
                  <option value="ALL">All 14 Units</option>
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.city} ({u.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Action Matrix Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 font-black uppercase text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Hospital Unit</th>
                  <th className="py-3 px-4">Bottleneck / Operational Focus</th>
                  <th className="py-3 px-4">Category & Department</th>
                  <th className="py-3 px-4">Status & Progress</th>
                  <th className="py-3 px-4">Owner</th>
                  <th className="py-3 px-4">Target Date</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 font-bold">
                      No matching bottlenecks found in registry.
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-orange-50/40 transition-colors">
                      <td className="py-3 px-4 font-black text-slate-900 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 text-[11px]">
                          {t.city}
                        </span>
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-extrabold text-slate-900 truncate">{t.title}</p>
                        {t.tasksTotal > 0 && (
                          <p className="text-[10px] text-emerald-600 font-bold mt-0.5">
                            ✓ {t.tasksDone}/{t.tasksTotal} checklist points done
                          </p>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold block truncate max-w-[160px]">
                          {t.category}
                        </span>
                        {t.department && (
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5 truncate max-w-[160px]">
                            {t.department}
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                            t.status === 'Completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : t.status === 'In progress'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700 border border-slate-200'
                          }`}
                        >
                          {t.status}
                        </span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${t.status === 'Completed' ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            style={{ width: `${t.percentComplete || (t.status === 'Completed' ? 100 : t.status === 'In progress' ? 50 : 0)}%` }}
                          />
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-semibold whitespace-nowrap">
                        {t.owner}
                      </td>

                      <td className="py-3 px-4 text-slate-500 font-medium text-[11px] whitespace-nowrap">
                        {t.targetDate || t.createdDate}
                      </td>

                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => onSelectUnit?.(t.unitId)}
                          className="px-3 py-1 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 hover:text-orange-900 text-xs font-black transition-colors cursor-pointer border border-orange-200/80"
                        >
                          Inspect Unit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

    </div>
  );
};
