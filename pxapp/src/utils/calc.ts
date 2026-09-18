import { HospitalUnit, Bottleneck, UnitStats, OrgStats, BottleneckStatus, STATUS_PERCENT_MAP } from '../types';

export function normalizeStatus(status: string): BottleneckStatus {
  if (!status) return 'Pending';
  const s = status.trim().toLowerCase();
  if (s.includes('complete') || s.includes('resolved') || s.includes('done')) {
    return 'Completed';
  }
  if (s.includes('progress') || s.includes('assigned') || s.includes('verifying') || s.includes('working')) {
    return 'In progress';
  }
  return 'Pending';
}

export function calculateUnitStats(bottlenecks: Bottleneck[]): UnitStats {
  if (!bottlenecks || bottlenecks.length === 0) {
    return {
      total: 0,
      pending: 0,
      inProgress: 0,
      completed: 0,
      acknowledge: 0,
      acknowledged: 0,
      assignedWork: 0,
      verifying: 0,
      notStarted: 0,
      avgPercent: 0
    };
  }

  let pending = 0;
  let inProgress = 0;
  let completed = 0;
  let totalPercentSum = 0;

  for (const b of bottlenecks) {
    const normStatus = normalizeStatus(b.status);
    if (normStatus === 'Pending') pending++;
    else if (normStatus === 'In progress') inProgress++;
    else if (normStatus === 'Completed') completed++;

    const percent = b.percentComplete !== undefined && b.percentComplete >= 0 
      ? b.percentComplete 
      : (STATUS_PERCENT_MAP[normStatus] ?? 0);

    totalPercentSum += Math.min(100, Math.max(0, percent));
  }

  const avgPercent = Math.round(totalPercentSum / bottlenecks.length);

  return {
    total: bottlenecks.length,
    pending,
    inProgress,
    completed,
    acknowledge: pending,
    acknowledged: pending,
    assignedWork: inProgress,
    verifying: 0,
    notStarted: pending,
    avgPercent
  };
}

export function calculateOrgStats(units: HospitalUnit[]): OrgStats {
  let assessedUnits = 0;
  let totalBottlenecks = 0;
  let pending = 0;
  let inProgress = 0;
  let completed = 0;
  let unitAvgSum = 0;

  for (const unit of units) {
    const isUnitAssessed = unit.isAssessed || (unit.bottlenecks && unit.bottlenecks.length > 0);
    if (isUnitAssessed && unit.bottlenecks && unit.bottlenecks.length > 0) {
      assessedUnits++;
      const stats = calculateUnitStats(unit.bottlenecks);
      totalBottlenecks += stats.total;
      pending += stats.pending;
      inProgress += stats.inProgress;
      completed += stats.completed;
      unitAvgSum += stats.avgPercent;
    }
  }

  const pendingUnits = units.length - assessedUnits;
  const orgAvgPercent = assessedUnits > 0 ? Math.round(unitAvgSum / assessedUnits) : 0;

  return {
    totalUnits: units.length,
    assessedUnits,
    pendingUnits,
    totalBottlenecks,
    pending,
    inProgress,
    completed,
    acknowledge: pending,
    acknowledged: pending,
    assignedWork: inProgress,
    verifying: 0,
    notStarted: pending,
    orgAvgPercent
  };
}

export function getStatusBadgeStyle(status: string) {
  const norm = normalizeStatus(status);
  switch (norm) {
    case 'Completed':
      return {
        badge: 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100/90',
        dot: 'bg-emerald-500',
        bar: 'bg-gradient-to-r from-emerald-500 to-teal-500',
        label: 'Completed'
      };
    case 'In progress':
      return {
        badge: 'bg-amber-50 text-amber-950 border-amber-300 hover:bg-amber-100/90',
        dot: 'bg-amber-500',
        bar: 'bg-gradient-to-r from-orange-500 via-amber-500 to-amber-400',
        label: 'In Progress'
      };
    case 'Pending':
    default:
      return {
        badge: 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200/90',
        dot: 'bg-slate-500',
        bar: 'bg-gradient-to-r from-slate-400 to-slate-500',
        label: 'Pending / Not Started'
      };
  }
}

export function getImpactBadgeStyle(impact: string = 'Medium') {
  switch (impact) {
    case 'High':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'Medium':
      return 'bg-amber-50 text-amber-800 border-amber-200';
    case 'Low':
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
