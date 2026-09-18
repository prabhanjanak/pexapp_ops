import React, { useState, useMemo } from 'react';
import { HospitalUnit, User } from '../types';
import { calculateOrgStats, calculateUnitStats } from '../utils/calc';
import {
  Building2,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  BarChart3,
  Calendar,
  Layers,
  ArrowUpRight,
  Filter,
  Check,
  Search
} from 'lucide-react';

interface DashboardOverviewProps {
  units: HospitalUnit[];
  currentUser: User;
  onSelectUnit?: (unitId: string) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  units,
  currentUser,
  onSelectUnit
}) => {
  const [searchFilter, setSearchFilter] = useState('');
  const orgStats = calculateOrgStats(units);

  // Filter units
  const filteredUnits = units.filter(u => 
    u.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.city.toLowerCase().includes(searchFilter.toLowerCase()) ||
    u.state.toLowerCase().includes(searchFilter.toLowerCase())
  );

  // Compute Monthly Stats dynamically from all bottlenecks over recent months
  const monthlyData: Record<string, { total: number; pending: number; inProgress: number; completed: number }> = useMemo(() => {
    // Generate the last 5 calendar months dynamically
    const months: Record<string, { total: number; pending: number; inProgress: number; completed: number }> = {};
    const now = new Date();
    
    for (let i = 4; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      months[key] = { total: 0, pending: 0, inProgress: 0, completed: 0 };
    }

    // Tally all actual bottlenecks across units into their respective months
    units.forEach(u => {
      u.bottlenecks.forEach(b => {
        let bDate = new Date();
        if (b.lastUpdated) {
          const parsed = new Date(b.lastUpdated);
          if (!isNaN(parsed.getTime())) {
            bDate = parsed;
          }
        }
        const mKey = bDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        if (!months[mKey]) {
          months[mKey] = { total: 0, pending: 0, inProgress: 0, completed: 0 };
        }
        months[mKey].total += 1;
        if (b.status === 'Completed') {
          months[mKey].completed += 1;
        } else if (b.status === 'In progress') {
          months[mKey].inProgress += 1;
        } else {
          months[mKey].pending += 1;
        }
      });
    });

    return months;
  }, [units]);

  // Top category hotspots
  const categoryCounts: Record<string, number> = {};
  units.forEach(u => {
    u.bottlenecks.forEach(b => {
      categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
    });
  });

  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Welcome & Overview Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 text-xs font-black uppercase tracking-wider mb-3">
            <Activity className="w-3.5 h-3.5" />
            Executive Operational Intelligence
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            Hospital Network Performance Dashboard
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Real-time cross-unit benchmarking, monthly resolution trends, and operational bottlenecks across all 14 Sankara hospital units nationwide.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center min-w-[110px]">
            <p className="text-2xl font-black text-orange-400">{orgStats.totalUnits}</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Hospital Units</p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 text-center min-w-[110px]">
            <p className="text-2xl font-black text-emerald-400">{orgStats.orgAvgPercent}%</p>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Avg Resolution</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Bottlenecks</p>
            <p className="text-3xl font-black text-slate-900 mt-1">{orgStats.totalBottlenecks}</p>
            <p className="text-[11px] font-medium text-slate-500 mt-1 flex items-center gap-1">
              <span>Across all 14 units</span>
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Activity className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending / Not Started</p>
            <p className="text-3xl font-black text-slate-700 mt-1">{orgStats.pending}</p>
            <p className="text-[11px] font-medium text-slate-500 mt-1">Awaiting action</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-700 uppercase tracking-wider">In Progress / Assigned</p>
            <p className="text-3xl font-black text-amber-600 mt-1">{orgStats.inProgress}</p>
            <p className="text-[11px] font-medium text-amber-700 mt-1">Under active resolution</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Resolved & Completed</p>
            <p className="text-3xl font-black text-emerald-600 mt-1">{orgStats.completed}</p>
            <p className="text-[11px] font-medium text-emerald-700 mt-1">100% verified</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

      </div>

      {/* Monthly Statistics & Trends Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-black text-slate-900">Monthly Operational Trends & Stats</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Month-on-Month operational volume and resolution progress across Sankara hospitals
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block" /> Completed
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" /> In Progress
            </span>
            <span className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
              <span className="w-3 h-3 rounded-md bg-slate-400 inline-block" /> Pending
            </span>
          </div>
        </div>

        {/* Monthly Breakdown Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {Object.entries(monthlyData).map(([month, data]) => {
            const compPercent = data.total > 0 ? Math.round((data.completed / data.total) * 100) : 0;
            return (
              <div
                key={month}
                className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl p-4 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black text-slate-800">{month}</span>
                    <span className="text-xs font-extrabold text-emerald-600">{compPercent}%</span>
                  </div>
                  <p className="text-2xl font-black text-slate-900 mb-3">{data.total} <span className="text-xs text-slate-500 font-medium">total</span></p>
                  
                  {/* Stacked Mini Bar */}
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex mb-3">
                    <div style={{ width: `${data.total > 0 ? (data.completed / data.total) * 100 : 0}%` }} className="bg-emerald-500 h-full transition-all" title={`Completed: ${data.completed}`} />
                    <div style={{ width: `${data.total > 0 ? (data.inProgress / data.total) * 100 : 0}%` }} className="bg-amber-500 h-full transition-all" title={`In Progress: ${data.inProgress}`} />
                    <div style={{ width: `${data.total > 0 ? (data.pending / data.total) * 100 : 0}%` }} className="bg-slate-400 h-full transition-all" title={`Pending: ${data.pending}`} />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>✅ {data.completed}</span>
                  <span>⚡ {data.inProgress}</span>
                  <span>⏳ {data.pending}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Unit-Wise Operational Performance Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="p-6 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-black text-slate-900">Unit-Wise Operational Performance (14 Units)</h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Click on any hospital unit to inspect detailed bottlenecks and photo evidence
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search hospital unit..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        {/* Table Grid */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                <th className="py-3.5 px-4 sm:px-6">Hospital Unit</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4 text-center">Total</th>
                <th className="py-3.5 px-4 text-center">Pending</th>
                <th className="py-3.5 px-4 text-center">In Progress</th>
                <th className="py-3.5 px-4 text-center">Completed</th>
                <th className="py-3.5 px-4 w-44">Resolution Progress</th>
                <th className="py-3.5 px-4 sm:px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
              {filteredUnits.map((u) => {
                const stats = calculateUnitStats(u.bottlenecks);
                return (
                  <tr
                    key={u.id}
                    onClick={() => onSelectUnit && onSelectUnit(u.id)}
                    className="hover:bg-orange-50/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-4 px-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-700 font-black flex items-center justify-center text-xs shrink-0 group-hover:scale-105 transition-transform">
                          {u.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors">{u.name}</p>
                          <p className="text-[11px] text-slate-400 font-normal">{u.contactHead || 'Unit Medical Director'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span className="text-slate-600">{u.city}, {u.state}</span>
                    </td>

                    <td className="py-4 px-4 text-center font-bold text-slate-900">
                      {stats.total}
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                        {stats.pending}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[11px]">
                        {stats.inProgress}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[11px]">
                        {stats.completed}
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${stats.avgPercent}%` }}
                            className="h-full bg-gradient-to-r from-orange-500 to-emerald-500 rounded-full"
                          />
                        </div>
                        <span className="text-[11px] font-black text-slate-800 shrink-0 w-8">
                          {stats.avgPercent}%
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-4 sm:px-6 text-right">
                      <span className="inline-flex items-center gap-1 text-orange-600 font-bold group-hover:translate-x-1 transition-transform">
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational Category Hotspots */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Layers className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-black text-slate-900">Top Bottleneck Categories & Hotspots</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {topCategories.map(([cat, count], idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-800 text-xs">{cat}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">High frequency category</p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-orange-100 text-orange-800 font-black text-xs">
                {count} items
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
