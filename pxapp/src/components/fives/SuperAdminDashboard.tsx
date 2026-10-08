import React, { useState } from 'react';
import { FiveSUser, FiveSUnitConfig, FiveSAudit, FiveSNonConformity, FiveSRole } from './types';
import { FIVE_S_CHECKLIST, FIVE_S_DEFAULT_USERS, UNIT_BASE_SCORES } from './seedData';
import { Record5SAuditModal } from './Record5SAuditModal';
import { NcReviewSection } from './NcReviewSection';
import {
  ShieldAlert,
  Building2,
  Users,
  Settings,
  Layers,
  FileCheck2,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Save,
  X,
  Search,
  Check,
  BarChart2,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Lock,
  ClipboardCheck
} from 'lucide-react';

interface SuperAdminDashboardProps {
  currentUser: FiveSUser;
  units: FiveSUnitConfig[];
  audits: FiveSAudit[];
  ncs: FiveSNonConformity[];
  onUpdateUnits: (units: FiveSUnitConfig[]) => void;
  onGoReports: () => void;
  onAuditSubmitted?: (audit: FiveSAudit, newNcs: FiveSNonConformity[]) => void;
  onUpdateAudit?: (auditId: string, updates: Partial<FiveSAudit>) => void;
  onDeleteAudit?: (auditId: string) => void;
  onUpdateNc?: (ncId: string, updates: Partial<FiveSNonConformity>) => void;
  onDeleteNc?: (ncId: string) => void;
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({
  currentUser,
  units,
  audits,
  ncs,
  onUpdateUnits,
  onGoReports,
  onAuditSubmitted,
  onUpdateAudit,
  onDeleteAudit,
  onUpdateNc,
  onDeleteNc
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'units' | 'zones' | 'checklist' | 'audits' | 'nc_review'>('overview');
  const [editingAudit, setEditingAudit] = useState<FiveSAudit | null>(null);

  // Master Data Local State
  const [unitList, setUnitList] = useState<FiveSUnitConfig[]>(units);
  const [userList, setUserList] = useState<FiveSUser[]>(FIVE_S_DEFAULT_USERS);
  const [checklist, setChecklist] = useState(FIVE_S_CHECKLIST);

  // Selected Unit & Zone for Inspector / Zones editor
  const [selectedUnitCode, setSelectedUnitCode] = useState<string>('CBE');
  const activeUnit = unitList.find((u) => u.code === selectedUnitCode) || unitList[0];
  const [selectedZoneName, setSelectedZoneName] = useState<string>(Object.keys(activeUnit.zones)[0] || 'Zone 1');

  // Create Unit Modal State
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [newUnitCode, setNewUnitCode] = useState('');
  const [newUnitName, setNewUnitName] = useState('');
  const [newUnitCity, setNewUnitCity] = useState('');
  const [newUnitState, setNewUnitState] = useState('');

  // Create Zone / Dept State
  const [newZoneInput, setNewZoneInput] = useState('');
  const [newDeptInput, setNewDeptInput] = useState('');



  // Record 5S Audit & Add Points Modal State
  const [isRecordAuditOpen, setIsRecordAuditOpen] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // Overall statistics across all 14 units
  const totalUnitsCount = unitList.length;
  const totalDeptsCount = unitList.reduce(
    (acc, u) => acc + Object.values(u.zones).reduce((dAcc, dList) => dAcc + dList.length, 0),
    0
  );
  const totalNcsCount = ncs.length;
  const pendingNcsCount = ncs.filter((n) => n.status !== 'Closed').length;

  // Add New Unit Handler
  const handleAddUnit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUnitCode.trim() || !newUnitName.trim()) {
      alert('Please provide unit code and hospital name.');
      return;
    }

    const created: FiveSUnitConfig = {
      code: newUnitCode.trim().toUpperCase(),
      name: newUnitName.trim(),
      city: newUnitCity.trim() || 'Coimbatore',
      state: newUnitState.trim() || 'Tamil Nadu',
      establishedYear: new Date().getFullYear(),
      bedCapacity: 100,
      unitHeadName: 'To be assigned',
      unitHeadEmail: `unithead.${newUnitCode.toLowerCase()}@sankaraeye.com`,
      zones: {
        'Zone 1': ['Registration & OPD Reception', 'Doctor Examination Rooms', 'Pharmacy Counter'],
        'Zone 2': ['Inpatient Ward', 'Nursing Station', 'Housekeeping Store'],
        'Zone 3': ['Operating Theatre Complex', 'Sterilization Room (CSSD)']
      }
    };

    const updated = [...unitList, created];
    setUnitList(updated);
    onUpdateUnits(updated);
    setIsAddUnitOpen(false);
    setNewUnitCode('');
    setNewUnitName('');
    alert(`Hospital Unit ${created.name} (${created.code}) created successfully.`);
  };

  // Add Zone to active unit
  const handleAddZone = () => {
    if (!newZoneInput.trim()) return;
    const zName = newZoneInput.trim();
    if (activeUnit.zones[zName]) {
      alert('This zone name already exists in this hospital unit.');
      return;
    }

    const updatedZones = {
      ...activeUnit.zones,
      [zName]: ['General Department Area']
    };

    const updatedUnits = unitList.map((u) =>
      u.code === activeUnit.code ? { ...u, zones: updatedZones } : u
    );

    setUnitList(updatedUnits);
    onUpdateUnits(updatedUnits);
    setSelectedZoneName(zName);
    setNewZoneInput('');
  };

  // Add Department to selected zone
  const handleAddDept = () => {
    if (!newDeptInput.trim()) return;
    const deptName = newDeptInput.trim();
    const currentDepts = activeUnit.zones[selectedZoneName] || [];

    if (currentDepts.includes(deptName)) {
      alert('This department already exists under this zone.');
      return;
    }

    const updatedZones = {
      ...activeUnit.zones,
      [selectedZoneName]: [...currentDepts, deptName]
    };

    const updatedUnits = unitList.map((u) =>
      u.code === activeUnit.code ? { ...u, zones: updatedZones } : u
    );

    setUnitList(updatedUnits);
    onUpdateUnits(updatedUnits);
    setNewDeptInput('');
  };

  // Delete Department
  const handleDeleteDept = (deptName: string) => {
    if (!window.confirm(`Remove department "${deptName}" from ${selectedZoneName}?`)) return;

    const currentDepts = activeUnit.zones[selectedZoneName] || [];
    const updatedZones = {
      ...activeUnit.zones,
      [selectedZoneName]: currentDepts.filter((d) => d !== deptName)
    };

    const updatedUnits = unitList.map((u) =>
      u.code === activeUnit.code ? { ...u, zones: updatedZones } : u
    );

    setUnitList(updatedUnits);
    onUpdateUnits(updatedUnits);
  };



  const handleAuditSubmitInternal = (newAudit: FiveSAudit, newNcs: FiveSNonConformity[]) => {
    if (onAuditSubmitted) {
      onAuditSubmitted(newAudit, newNcs);
    }
    setSuccessToast(`5S Audit ${newAudit.auditNumber} submitted successfully for ${newAudit.unit} • ${newAudit.department}! Compliance: ${newAudit.compliancePercent}%`);
    setTimeout(() => setSuccessToast(null), 5000);
  };

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-8 py-6 space-y-6">
      
      {/* Toast Notification */}
      {successToast && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-xs sm:text-sm flex items-center justify-between shadow-lg shadow-orange-500/20 animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-amber-200" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)} className="text-white/80 hover:text-white cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Super Admin Control Center Hero with Orange Gradient UI/UX */}
      <div className="bg-gradient-to-r from-slate-900 via-orange-950/80 to-slate-900 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-orange-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black uppercase tracking-wider mb-3">
            <Settings className="w-3.5 h-3.5" />
            Central Operations & Quality Governance Console
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
            5S Master Data & Network Audit Administration
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
            Configure hospital units, define clinical zones and departments, manage auditor role permissions, conduct nationwide audits, and maintain standardized checklist standards across all 14 units.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          <button
            onClick={() => setIsRecordAuditOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xs shadow-md shadow-orange-500/25 transition-all cursor-pointer group"
          >
            <Sparkles className="w-4 h-4 text-amber-200 group-hover:rotate-12 transition-transform" />
            <span>Record 5S Audit & Points</span>
          </button>

          <button
            onClick={() => setIsAddUnitOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Unit</span>
          </button>


        </div>
      </div>

      {/* Admin KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hospital Units</span>
            <span className="p-1.5 rounded-lg bg-orange-50 text-orange-600"><Building2 className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-orange-600 mt-2">{totalUnitsCount} Units</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">14 Network Hospitals Configured</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Departments</span>
            <span className="p-1.5 rounded-lg bg-slate-100 text-slate-600"><Layers className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-slate-900 mt-2">{totalDeptsCount}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Configured Clinical & Admin Areas</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending NCs</span>
            <span className="p-1.5 rounded-lg bg-amber-50 text-amber-600"><AlertTriangle className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-amber-600 mt-2">{pendingNcsCount}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Pending Corrective Actions</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checklist Standards</span>
            <span className="p-1.5 rounded-lg bg-teal-50 text-teal-600"><Settings className="w-4 h-4" /></span>
          </div>
          <div className="text-3xl font-black text-teal-600 mt-2">{checklist.length}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Standardized Audit Checkpoints</div>
        </div>
      </div>

      {/* Admin Module Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-b border-slate-200 pb-3">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200 gap-1">
          {[
            { id: 'overview', label: 'Network Overview', icon: FileCheck2 },
            { id: 'nc_review', label: 'NC Review & Closure', icon: AlertTriangle },
            { id: 'units', label: 'Units Manager', icon: Building2 },
            { id: 'zones', label: 'Zones & Departments', icon: Layers },
            { id: 'checklist', label: 'Checklist Standards', icon: Settings },
            { id: 'audits', label: 'Audit Registry', icon: BarChart2 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isSel = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  isSel
                    ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900">
                  Hospital Units Master Directory ({unitList.length} Network Units)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  High-level configuration, bed capacity, established year, and 5S compliance baseline.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsRecordAuditOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 text-xs font-bold cursor-pointer flex items-center gap-1.5"
                >
                  <ClipboardCheck className="w-4 h-4 text-orange-600" />
                  <span>Audit Any Unit</span>
                </button>
                <button
                  onClick={() => setIsAddUnitOpen(true)}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white text-xs font-bold cursor-pointer flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Hospital Unit</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Code</th>
                    <th className="py-2.5 px-3">Hospital Unit Name</th>
                    <th className="py-2.5 px-3">Location</th>
                    <th className="py-2.5 px-3">Zones</th>
                    <th className="py-2.5 px-3">Unit Head</th>
                    <th className="py-2.5 px-3">5S Baseline</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {unitList.map((u) => {
                    const score = UNIT_BASE_SCORES[u.code] || 75;
                    const badgeCls =
                      score >= 80 ? 'text-orange-700 bg-orange-50 border-orange-200' : score >= 70 ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-rose-700 bg-rose-50 border-rose-200';

                    return (
                      <tr key={u.code} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-3 font-black text-orange-600">{u.code}</td>
                        <td className="py-3 px-3 font-extrabold text-slate-900">{u.name}</td>
                        <td className="py-3 px-3 text-slate-500">{u.city}, {u.state}</td>
                        <td className="py-3 px-3 font-semibold text-slate-700">{Object.keys(u.zones).length} Zones</td>
                        <td className="py-3 px-3 text-slate-800 font-medium">{u.unitHeadName}</td>
                        <td className="py-3 px-3">
                          <span className={`font-black px-2 py-0.5 rounded-full border text-xs ${badgeCls}`}>
                            {score}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => {
                                setSelectedUnitCode(u.code);
                                setIsRecordAuditOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200 hover:bg-orange-100 text-xs font-bold cursor-pointer"
                            >
                              Audit
                            </button>
                            <button
                              onClick={() => {
                                setSelectedUnitCode(u.code);
                                setActiveTab('zones');
                              }}
                              className="px-2.5 py-1 rounded-lg border border-slate-200 text-slate-700 hover:text-orange-700 hover:border-orange-300 hover:bg-orange-50 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                            >
                              Manage Zones
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UNITS MANAGER */}
      {activeTab === 'units' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Hospital Unit Cards & Capacity
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Detailed view of facilities, infrastructure, bed capacities, and zone allocation.
              </p>
            </div>
            <button
              onClick={() => setIsAddUnitOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold cursor-pointer hover:from-orange-700 hover:to-amber-600 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Unit</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {unitList.map((u) => (
              <div
                key={u.code}
                className="p-5 rounded-2xl border border-slate-200 hover:border-orange-500 transition-all bg-white flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 border border-orange-200">
                      {u.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">Est. {u.establishedYear}</span>
                  </div>

                  <h3 className="text-sm font-black text-slate-900 mb-1">{u.name}</h3>
                  <p className="text-xs text-slate-500 mb-3">{u.city}, {u.state} • {u.bedCapacity} Beds</p>

                  <div className="space-y-1 text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-slate-500 font-medium">Unit Head:</span>{' '}
                      <strong>{u.unitHeadName}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Zones:</span>{' '}
                      <strong>{Object.keys(u.zones).length} configured</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-400">
                    {Object.values(u.zones).flat().length} Departments
                  </span>
                  <button
                    onClick={() => {
                      setSelectedUnitCode(u.code);
                      setActiveTab('zones');
                    }}
                    className="text-xs font-extrabold text-orange-600 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>Configure Zones</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ZONES & DEPARTMENTS */}
      {activeTab === 'zones' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Zones & Department Hierarchy: {activeUnit.name} ({activeUnit.code})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Add, organize, or remove departments and clinical work areas within zones.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-500">Switch Unit:</label>
              <select
                value={selectedUnitCode}
                onChange={(e) => {
                  setSelectedUnitCode(e.target.value);
                  const u = unitList.find((x) => x.code === e.target.value);
                  if (u) setSelectedZoneName(Object.keys(u.zones)[0] || 'Zone 1');
                }}
                className="py-1.5 px-3 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
              >
                {unitList.map((u) => (
                  <option key={u.code} value={u.code}>
                    {u.name} ({u.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Zones Column */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Zones in {activeUnit.code} ({Object.keys(activeUnit.zones).length})
                </h3>
              </div>

              <div className="space-y-1.5">
                {Object.keys(activeUnit.zones).map((zName) => {
                  const isSel = selectedZoneName === zName;
                  const deptCount = activeUnit.zones[zName]?.length || 0;

                  return (
                    <button
                      key={zName}
                      onClick={() => setSelectedZoneName(zName)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                        isSel
                          ? 'border-orange-500 bg-orange-50/60 font-black text-orange-950 shadow-xs'
                          : 'border-slate-200 bg-white text-slate-800 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-bold">{zName}</span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        {deptCount} depts
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Add Zone Input */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={newZoneInput}
                  onChange={(e) => setNewZoneInput(e.target.value)}
                  placeholder="New Zone Name (e.g. Zone 5)"
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
                />
                <button
                  onClick={handleAddZone}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold cursor-pointer hover:from-orange-700 hover:to-amber-600 shadow-xs"
                >
                  Add Zone
                </button>
              </div>
            </div>

            {/* Departments in Selected Zone */}
            <div className="lg:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-500">
                  Departments assigned to {selectedZoneName} ({activeUnit.zones[selectedZoneName]?.length || 0})
                </h3>
              </div>

              <div className="divide-y divide-slate-100 border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                {(activeUnit.zones[selectedZoneName] || []).map((dept) => (
                  <div key={dept} className="p-3.5 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                    <span className="text-xs font-bold text-slate-800">{dept}</span>
                    <button
                      onClick={() => handleDeleteDept(dept)}
                      className="text-rose-500 hover:text-rose-700 p-1 rounded-md cursor-pointer hover:bg-rose-50"
                      title="Remove department"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add Department Input */}
              <div className="pt-2 flex items-center gap-2">
                <input
                  type="text"
                  value={newDeptInput}
                  onChange={(e) => setNewDeptInput(e.target.value)}
                  placeholder="New Department / Clinical Area Name..."
                  className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
                />
                <button
                  onClick={handleAddDept}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold cursor-pointer hover:from-orange-700 hover:to-amber-600 shadow-xs"
                >
                  Assign Department to {selectedZoneName}
                </button>
              </div>

            </div>

          </div>

        </div>
      )}



      {/* TAB 5: CHECKLIST STANDARDS */}
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-base font-extrabold text-slate-900">
              Standardized 5S Checklist Configuration (36 Checkpoints)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Mandatory standards across 1S Sort, 2S Set in Order, 3S Shine, 4S Standardize, and 5S Sustain.
            </p>
          </div>

          <div className="divide-y divide-slate-100">
            {checklist.map((cp) => (
              <div key={cp.id} className="py-3 flex items-start gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition-colors">
                <span className="w-7 h-7 rounded-xl bg-orange-50 text-orange-700 border border-orange-200 font-black text-xs flex items-center justify-center shrink-0">
                  {cp.slNo}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200">
                      {cp.section}
                    </span>
                    <span className="text-xs font-bold text-slate-800">{cp.area}</span>
                  </div>
                  <div className="text-xs font-bold text-slate-900 mt-1">{cp.point}</div>
                  <div className="text-[11px] text-slate-500 italic mt-0.5">Evidence Standard: {cp.evidence}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CENTRAL AUDITS & NC REGISTRY */}
      {activeTab === 'audits' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Central 5S Audit & Non-Conformity Registry
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Master database of all audits conducted across 14 hospital units.
              </p>
            </div>
            <button
              onClick={() => setIsRecordAuditOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-black text-xs shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Record New Audit</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">Audit #</th>
                  <th className="py-2.5 px-3">Unit</th>
                  <th className="py-2.5 px-3">Zone</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Auditor</th>
                  <th className="py-2.5 px-3">Audit Date</th>
                  <th className="py-2.5 px-3">Compliance</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {audits.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-black text-slate-900">{a.auditNumber}</td>
                    <td className="py-3 px-3 font-bold text-orange-600">{a.unit}</td>
                    <td className="py-3 px-3 text-slate-600">{a.zone}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{a.department}</td>
                    <td className="py-3 px-3 text-slate-500">{a.auditorName}</td>
                    <td className="py-3 px-3 text-slate-600">{a.auditDate}</td>
                    <td className="py-3 px-3">
                      <span className="font-extrabold text-orange-700 bg-orange-50 border border-orange-200 px-2 py-0.5 rounded-md text-xs">
                        {a.compliancePercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[11px]">
                        <Check className="w-3 h-3" />
                        {a.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setEditingAudit(a)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-[11px] transition-colors cursor-pointer border border-orange-200"
                          title="Edit Audit & Re-score"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete audit ${a.auditNumber} for ${a.unit} (${a.department})?`)) {
                              onDeleteAudit?.(a.id);
                            }
                          }}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors cursor-pointer border border-rose-200"
                          title="Delete Audit"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Unit */}
      {isAddUnitOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 space-y-4 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <Building2 className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Add New Sankara Hospital Unit
                </h3>
              </div>
              <button
                onClick={() => setIsAddUnitOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUnit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Unit Code (e.g. MADURAI)</label>
                <input
                  type="text"
                  required
                  value={newUnitCode}
                  onChange={(e) => setNewUnitCode(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Hospital Full Name</label>
                <input
                  type="text"
                  required
                  value={newUnitName}
                  onChange={(e) => setNewUnitName(e.target.value)}
                  placeholder="e.g. Sankara Eye Hospital Madurai"
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={newUnitCity}
                    onChange={(e) => setNewUnitCity(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={newUnitState}
                    onChange={(e) => setNewUnitState(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-orange-500/30"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddUnitOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white text-xs font-bold cursor-pointer hover:from-orange-700 hover:to-amber-600 shadow-xs"
                >
                  Create Unit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TAB: ENTERPRISE NC REVIEW & CLOSURE */}
      {activeTab === 'nc_review' && (
        <NcReviewSection
          currentUser={currentUser}
          ncs={ncs}
          onUpdateNc={(id, updates) => onUpdateNc?.(id, updates)}
          onDeleteNc={(id) => onDeleteNc?.(id)}
          title="Super Admin 5S Non-Conformity (NC) Review & Closure Portal"
          subtitle="Enterprise-wide review, verification, and closure oversight across all 14 hospital units. Close, reopen, or request clarifications/photographs."
        />
      )}
      <Record5SAuditModal
        isOpen={isRecordAuditOpen}
        onClose={() => setIsRecordAuditOpen(false)}
        currentUser={currentUser}
        units={unitList}
        defaultUnitCode={selectedUnitCode}
        lockUnit={false}
        onAuditSubmitted={handleAuditSubmitInternal}
      />

      {/* Modal: Edit Existing 5S Audit & Re-score */}
      {editingAudit && (
        <Record5SAuditModal
          isOpen={true}
          onClose={() => setEditingAudit(null)}
          currentUser={currentUser}
          units={unitList}
          defaultUnitCode={editingAudit.unit}
          defaultZoneName={editingAudit.zone}
          defaultDeptName={editingAudit.department}
          lockUnit={false}
          initialAudit={editingAudit}
          onAuditSubmitted={() => {}}
          onEditAudit={(id, updates) => {
            onUpdateAudit?.(id, updates);
            setEditingAudit(null);
            setSuccessToast(`Audit #${editingAudit.auditNumber} successfully updated and re-scored!`);
            setTimeout(() => setSuccessToast(null), 3500);
          }}
        />
      )}

    </div>
  );
};
