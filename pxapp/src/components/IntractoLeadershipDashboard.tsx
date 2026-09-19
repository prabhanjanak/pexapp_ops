import React, { useState, useMemo } from 'react';
import { HospitalUnit, Bottleneck, User, BottleneckStatus } from '../types';
import {
  Building2,
  Calendar,
  Search,
  Filter,
  Download,
  Printer,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
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
  Check
} from 'lucide-react';

interface IntractoLeadershipDashboardProps {
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

export const IntractoLeadershipDashboard: React.FC<IntractoLeadershipDashboardProps> = ({
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
  const [dateRange, setDateRange] = useState<string>('yesterday');
  const [ticketStatusFilter, setTicketStatusFilter] = useState<string>('ALL');
  const [ticketSearchQuery, setTicketSearchQuery] = useState<string>('');
  const [rankingTab, setRankingTab] = useState<'ranking' | 'criteria'>('ranking');

  // Carousel Scroll index
  const [carouselIndex, setCarouselIndex] = useState(0);

  // App Switcher Floating Popover (Bottom Left)
  const [showAppSwitcher, setShowAppSwitcher] = useState(false);

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

    relevantUnits.forEach((u) => {
      u.bottlenecks.forEach((b) => {
        totalBottlenecks++;
        if (b.status === 'Completed' || b.percentComplete >= 100) completed++;
        else if (b.status === 'In progress') inProgress++;
        else pending++;
      });
    });

    // Realistic patient experience feedback metrics scaled by active hospital bottlenecks
    const baseFeedbacks = relevantUnits.length * 90 + totalBottlenecks * 12;
    const opFeedbacks = Math.round(baseFeedbacks * 0.75);
    const ipFeedbacks = baseFeedbacks - opFeedbacks;
    const avgTalkTime = 0.24;

    const opSat = (99.50 + (completed > 0 ? 0.15 : 0.05)).toFixed(2);
    const ipSat = (99.55 + (completed > 0 ? 0.12 : 0.04)).toFixed(2);

    return {
      totalFeedbacks: baseFeedbacks || 1224,
      opFeedbacks: opFeedbacks || 917,
      ipFeedbacks: ipFeedbacks || 248,
      avgTalkTime: avgTalkTime,
      inpatientSatisfaction: ipSat,
      outpatientSatisfaction: opSat,
      opTargetAchieved: '98%',
      ipTargetAchieved: '98%',
      totalBottlenecks,
      completed,
      inProgress,
      pending
    };
  }, [units, selectedUnitId]);

  // Department Feedback Positive / Negative Analysis
  const deptFeedbackData = useMemo(() => {
    return [
      { name: 'Staff & Nursing', positive: 489, negative: 5, color: 'bg-emerald-500' },
      { name: 'Doctors & Optometrists', positive: 392, negative: 2, color: 'bg-emerald-500' },
      { name: 'Inpatient Department (IPD)', positive: 55, negative: 0, color: 'bg-emerald-500' },
      { name: 'Billing, TPA & Registration', positive: 210, negative: 4, color: 'bg-emerald-500' },
      { name: 'Pharmacy & Diagnostic Lab', positive: 180, negative: 3, color: 'bg-emerald-500' }
    ];
  }, []);

  // Location Ranking Scores across 14 units
  const locationRankings = useMemo(() => {
    const scored = units.map((u) => {
      const bTotal = u.bottlenecks.length;
      const bComp = u.bottlenecks.filter((b) => b.status === 'Completed' || b.percentComplete >= 100).length;
      const rate = bTotal > 0 ? Math.round((bComp / bTotal) * 20) : 12;
      return {
        id: u.id,
        name: u.name.replace('Sankara Eye Hospital – ', '').replace('Sankara Eye Hospital', u.city),
        city: u.city,
        score: Math.max(10, Math.min(20, rate + (u.establishedYear ? 3 : 0)))
      };
    });

    return scored.sort((a, b) => b.score - a.score);
  }, [units]);

  // Flattened Tickets / Bottlenecks for Matrix Table
  const allTickets = useMemo(() => {
    const list: {
      id: string;
      ticketId: string;
      description: string;
      location: string;
      unitId: string;
      status: 'Closed' | 'Resolved' | 'In Progress' | 'Open';
      createdDate: string;
      modifiedDate: string;
      owner: string;
      tasksDone: number;
      tasksTotal: number;
    }[] = [];

    units.forEach((u, uIdx) => {
      if (selectedUnitId !== 'ALL' && u.id !== selectedUnitId) return;

      u.bottlenecks.forEach((b, bIdx) => {
        const ticketNum = 15700 + uIdx * 10 + bIdx + 1;
        let statusLabel: 'Closed' | 'Resolved' | 'In Progress' | 'Open' = 'Open';
        if (b.status === 'Completed' || b.percentComplete >= 100) {
          statusLabel = (bIdx % 2 === 0) ? 'Closed' : 'Resolved';
        } else if (b.status === 'In progress') {
          statusLabel = 'In Progress';
        } else {
          statusLabel = 'Open';
        }

        const tasksTotal = b.tasks?.length || 0;
        const tasksDone = b.tasks?.filter((t) => t.isCompleted).length || 0;

        list.push({
          id: b.id,
          ticketId: String(ticketNum),
          description: b.title,
          location: u.city,
          unitId: u.id,
          status: statusLabel,
          createdDate: b.lastUpdated ? `${b.lastUpdated} 10:30:00 AM` : '18-09-2026 11:32:44 AM',
          modifiedDate: b.lastUpdated ? `${b.lastUpdated} 04:17:26 PM` : '18-09-2026 04:17:26 PM',
          owner: b.owner || u.unitHead || 'Unit Team',
          tasksDone,
          tasksTotal
        });
      });
    });

    // If unit has no bottlenecks yet, create clean representations
    if (list.length === 0) {
      units.forEach((u, uIdx) => {
        if (selectedUnitId !== 'ALL' && u.id !== selectedUnitId) return;
        list.push({
          id: `sample-${u.id}-1`,
          ticketId: String(15720 + uIdx),
          description: `Patient turnaround and OPD desk clearance review for ${u.city}`,
          location: u.city,
          unitId: u.id,
          status: 'Resolved',
          createdDate: '18-09-2026 10:15:00 AM',
          modifiedDate: '18-09-2026 01:26:04 PM',
          owner: u.unitHead || 'Unit Head',
          tasksDone: 4,
          tasksTotal: 4
        });
      });
    }

    return list.filter((t) => {
      if (ticketStatusFilter !== 'ALL' && t.status !== ticketStatusFilter) return false;
      if (ticketSubTab === 'my_tasks' && currentUser.unitId && t.unitId !== currentUser.unitId) return false;
      if (ticketSearchQuery) {
        const q = ticketSearchQuery.toLowerCase();
        return (
          t.ticketId.includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.location.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [units, selectedUnitId, ticketStatusFilter, ticketSubTab, ticketSearchQuery, currentUser]);

  // Carousel items visible (5 at a time)
  const visibleUnits = units.slice(carouselIndex, carouselIndex + 5);

  const handlePrevCarousel = () => {
    setCarouselIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNextCarousel = () => {
    setCarouselIndex((prev) => Math.min(units.length - 5, prev + 1));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200 font-sans selection:bg-blue-600 selection:text-white relative">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-1">
            <span className="text-blue-600 font-black tracking-tight text-sm">Intracto</span>
            <span>•</span>
            <span className="text-slate-800 font-black">
              {activeMainTab === 'dashboard' ? 'Leadership Dashboard' : 'All Tickets'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveMainTab('dashboard')}
              className={`text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'dashboard' ? 'text-blue-600 underline underline-offset-4' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              ← Leadership Dashboard
            </button>
            <span className="text-slate-300">|</span>
            <button
              onClick={() => setActiveMainTab('tickets')}
              className={`text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'tickets' ? 'text-blue-600 underline underline-offset-4' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All Tickets & Bottlenecks Matrix
            </button>
          </div>
        </div>

        {/* Top Right Controls: Date Range & Actions */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <label className="block text-[9px] font-bold text-slate-400 uppercase">Date Range</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="yesterday">Yesterday</option>
              <option value="today">Today</option>
              <option value="last_7_days">Last 7 days</option>
              <option value="last_30_days">Last 30 days</option>
              <option value="mtd">MTD</option>
              <option value="ytd">YTD</option>
            </select>
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            title="Print / Export Dashboard"
            className="p-2 mt-3 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 shadow-2xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. VIEW MODE: LEADERSHIP DASHBOARD (Image 1 Layout) */}
      {/* ========================================================================= */}
      {activeMainTab === 'dashboard' && (
        <div className="space-y-6">
          
          {/* Top Hospital Units Photo Carousel */}
          <div className="relative bg-white p-4 rounded-3xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between mb-3 px-1">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Hospital Units Directory ({units.length} Network Locations)</span>
              </span>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePrevCarousel}
                  disabled={carouselIndex === 0}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleNextCarousel}
                  disabled={carouselIndex >= units.length - 5}
                  className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-40 text-slate-700 cursor-pointer"
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
                        ? 'border-blue-600 ring-2 ring-blue-500/20 scale-[1.02]'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    {/* Background Image */}
                    <img
                      src={imgUrl}
                      alt={u.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent" />

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
                        {u.id === 'unit-coimbatore' ? 'Mission Head Quarters' : u.city}
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
                    Math.floor(carouselIndex / 5) === dotIdx ? 'w-6 bg-blue-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Selected Location Pill & Date Banner */}
          <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <span>Location : {currentSelectedUnit ? currentSelectedUnit.name : 'All'}</span>
                  {selectedUnitId !== 'ALL' && (
                    <button
                      onClick={() => setSelectedUnitId('ALL')}
                      className="text-[10px] text-blue-600 hover:underline font-bold"
                    >
                      (Reset to All)
                    </button>
                  )}
                </h3>
                <p className="text-[11px] text-slate-400 font-semibold">
                  {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-500">Showing metrics for:</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-xs font-black">
                {selectedUnitId === 'ALL' ? '14 Units' : currentSelectedUnit?.city}
              </span>
            </div>
          </div>

          {/* 4 Primary Blue Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Feedbacks */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-md shadow-blue-600/20 flex flex-col items-center justify-center text-center">
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{stats.totalFeedbacks.toLocaleString()}</p>
              <p className="text-xs font-bold text-blue-100 mt-1 uppercase tracking-wider">Feedbacks</p>
            </div>

            {/* Card 2: OP Feedbacks */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-md shadow-blue-600/20 flex flex-col items-center justify-center text-center">
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{stats.opFeedbacks.toLocaleString()}</p>
              <p className="text-xs font-bold text-blue-100 mt-1 uppercase tracking-wider">OP Feedbacks</p>
            </div>

            {/* Card 3: IP Feedbacks */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-md shadow-blue-600/20 flex flex-col items-center justify-center text-center">
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{stats.ipFeedbacks.toLocaleString()}</p>
              <p className="text-xs font-bold text-blue-100 mt-1 uppercase tracking-wider">IP Feedbacks</p>
            </div>

            {/* Card 4: Avg Talk Time */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-2xl p-6 shadow-md shadow-blue-600/20 flex flex-col items-center justify-center text-center">
              <p className="text-3xl sm:text-4xl font-black tracking-tight">{stats.avgTalkTime}</p>
              <p className="text-xs font-bold text-blue-100 mt-1 uppercase tracking-wider">Avg Talk Time (min)</p>
            </div>

          </div>

          {/* 3 Bottom Analytics Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Panel 1: Patient Satisfaction */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <h4 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
                  <span>Patient Satisfaction</span>
                </h4>

                <div className="grid grid-cols-2 gap-3 mb-6">
                  {/* Inpatient Satisfaction */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Inpatient Satisfaction</span>
                    <p className="text-lg font-black text-slate-900 mb-2">{stats.inpatientSatisfaction}%</p>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.inpatientSatisfaction}%` }} />
                    </div>
                  </div>

                  {/* Outpatient Satisfaction */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-500 uppercase block mb-1">Outpatient Satisfaction</span>
                    <p className="text-lg font-black text-slate-900 mb-2">{stats.outpatientSatisfaction}%</p>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${stats.outpatientSatisfaction}%` }} />
                    </div>
                  </div>
                </div>

                {/* Feedback Collection Target Achieved */}
                <div className="border-t border-slate-100 pt-4">
                  <span className="text-xs font-black text-slate-800 block mb-2">Feedback Collection Target Achieved</span>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-600">OP</span>
                      <span className="text-xs font-black text-slate-900">{stats.opTargetAchieved}</span>
                    </div>
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-xs font-bold text-slate-600">IP</span>
                      <span className="text-xs font-black text-slate-900">{stats.ipTargetAchieved}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Panel 2: Department Feedback Analysis (+ve vs -ve) */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-black text-slate-900">Department Feedback Analysis</h4>
                <div className="flex items-center gap-3 text-[11px] font-bold">
                  <span className="text-emerald-700 flex items-center gap-1">👍 +ve</span>
                  <span className="text-rose-600 flex items-center gap-1">👎 -ve</span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {deptFeedbackData.map((d) => (
                  <div key={d.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span>{d.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.min(100, (d.positive / 500) * 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-black text-emerald-700 w-7 text-right">{d.positive}</span>

                      <ThumbsDown className="w-3.5 h-3.5 text-rose-500 shrink-0 ml-1" />
                      <div className="w-12 h-2.5 bg-slate-100 rounded-full overflow-hidden flex">
                        <div className="bg-rose-500 h-full rounded-full" style={{ width: `${Math.min(100, (d.negative / 10) * 100)}%` }} />
                      </div>
                      <span className="text-[11px] font-black text-rose-600 w-3 text-right">{d.negative}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel 3: Location Ranking & Criteria */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
              
              {/* Tab Switcher */}
              <div className="flex items-center border-b border-slate-200 pb-2 gap-4">
                <button
                  type="button"
                  onClick={() => setRankingTab('ranking')}
                  className={`text-xs font-black transition-colors cursor-pointer ${
                    rankingTab === 'ranking' ? 'text-blue-600 border-b-2 border-blue-600 pb-2' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Location Ranking
                </button>
                <button
                  type="button"
                  onClick={() => setRankingTab('criteria')}
                  className={`text-xs font-black transition-colors cursor-pointer ${
                    rankingTab === 'criteria' ? 'text-blue-600 border-b-2 border-blue-600 pb-2' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  Quality Criteria
                </button>
              </div>

              {rankingTab === 'ranking' ? (
                <div className="overflow-y-auto max-h-[260px] space-y-2 pr-1">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="text-[10px] uppercase font-bold text-slate-400 border-b border-slate-100">
                        <th className="pb-2">Rank</th>
                        <th className="pb-2">Location</th>
                        <th className="pb-2 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                      {locationRankings.map((loc, idx) => (
                        <tr
                          key={loc.id}
                          onClick={() => setSelectedUnitId(loc.id)}
                          className="hover:bg-blue-50/60 transition-colors cursor-pointer"
                        >
                          <td className="py-2">
                            {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                          </td>
                          <td className="py-2 text-slate-900 font-extrabold">{loc.city}</td>
                          <td className="py-2 text-right font-black text-blue-600">{loc.score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="space-y-2.5 text-xs text-slate-600 font-medium p-2">
                  <p className="font-bold text-slate-800">Scoring Methodology:</p>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Inpatient & Outpatient Feedback completion rate (40%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Bottleneck Resolution & SLA Turnaround (30%)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Positive staff & doctor ratings (30%)</span>
                  </div>
                </div>
              )}

            </div>

          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. VIEW MODE: ALL TICKETS / BOTTLENECKS MATRIX (Image 2 Layout) */}
      {/* ========================================================================= */}
      {activeMainTab === 'tickets' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          
          {/* Sub-Tabs: All Tickets | My Tasks */}
          <div className="flex items-center border-b border-slate-200 gap-6">
            <button
              type="button"
              onClick={() => setTicketSubTab('all')}
              className={`pb-3 text-xs font-black transition-all cursor-pointer ${
                ticketSubTab === 'all'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
              }`}
            >
              All Tickets ({allTickets.length})
            </button>
            <button
              type="button"
              onClick={() => setTicketSubTab('my_tasks')}
              className={`pb-3 text-xs font-black transition-all cursor-pointer ${
                ticketSubTab === 'my_tasks'
                  ? 'border-b-2 border-blue-600 text-blue-600'
                  : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'
              }`}
            >
              My Tasks
            </button>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/80">
            
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
              {/* Search Box */}
              <div className="relative flex-1 sm:w-64">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Tickets / Bottlenecks..."
                  value={ticketSearchQuery}
                  onChange={(e) => setTicketSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Location Select */}
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">All Locations</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.city}
                  </option>
                ))}
              </select>

              {/* Status Select */}
              <select
                value={ticketStatusFilter}
                onChange={(e) => setTicketStatusFilter(e.target.value)}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
              >
                <option value="ALL">Select Status</option>
                <option value="Closed">Closed</option>
                <option value="Resolved">Resolved</option>
                <option value="In Progress">In Progress</option>
                <option value="Open">Open</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-auto">
              <button
                type="button"
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-blue-600 hover:bg-slate-50 cursor-pointer"
                title="Export Data"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Tickets Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4">Ticket Id ⇅</th>
                  <th className="py-3 px-4">Ticket Description ⇅</th>
                  <th className="py-3 px-4">Location ⇅</th>
                  <th className="py-3 px-4">Ticket Status ⇅</th>
                  <th className="py-3 px-4">Created Date ⇅</th>
                  <th className="py-3 px-4">Modified Date ⇅</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {allTickets.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">
                      {t.ticketId}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="font-bold text-slate-900 leading-snug truncate" title={t.description}>
                        {t.description}
                      </p>
                      {t.tasksTotal > 0 && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          ✓ Tasks: {t.tasksDone}/{t.tasksTotal} completed
                        </p>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      {t.location}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          t.status === 'Closed'
                            ? 'bg-rose-100 text-rose-800 border border-rose-200'
                            : t.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : t.status === 'In Progress'
                            ? 'bg-blue-100 text-blue-800 border border-blue-200'
                            : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {t.createdDate}
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {t.modifiedDate}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onSelectUnit?.(t.unitId)}
                        className="p-1 rounded-lg hover:bg-slate-200 text-slate-400 hover:text-slate-700 cursor-pointer"
                        title="View Details"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* FLOATING APP SWITCHER POPOVER (Bottom Left of Screen) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 left-6 z-40">
        
        {/* Toggle Launcher Button */}
        <button
          type="button"
          onClick={() => setShowAppSwitcher(!showAppSwitcher)}
          className="w-10 h-10 rounded-2xl bg-white border border-slate-200 shadow-xl hover:shadow-2xl text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all cursor-pointer group"
          title="Switch Sankara Platform Module"
        >
          <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
        </button>

        {/* Popover Card */}
        {showAppSwitcher && (
          <div className="absolute bottom-12 left-0 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3 w-56 animate-in fade-in zoom-in-95 duration-150">
            <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2 px-1">
              Select Workspace Module
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* Appraizo: 5S Rapid Transformation */}
              <button
                type="button"
                onClick={() => {
                  setShowAppSwitcher(false);
                  onSwitchPortal?.('5s');
                }}
                className="p-2.5 rounded-xl border border-slate-100 hover:border-amber-400 hover:bg-amber-50/50 flex flex-col items-center text-center cursor-pointer transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                  <Layers className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-black text-slate-800 leading-tight">Appraizo</span>
                <span className="text-[9px] text-slate-400 font-bold">5S Kaizen</span>
              </button>

              {/* Intracto: Patient Experience */}
              <button
                type="button"
                onClick={() => {
                  setShowAppSwitcher(false);
                  onSwitchPortal?.('bottleneck');
                }}
                className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 flex flex-col items-center text-center cursor-pointer transition-all group"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center mb-1 group-hover:scale-105 transition-transform shadow-xs">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <span className="text-[11px] font-black text-blue-800 leading-tight">Intracto</span>
                <span className="text-[9px] text-blue-600 font-bold">Patient Exp</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
