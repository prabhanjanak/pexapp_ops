import React, { useState } from 'react';
import { HospitalUnit, User } from '../types';
import { api } from '../services/api';
import {
  Building2,
  MapPin,
  UserCheck,
  UserPlus,
  Mail,
  BadgeCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Edit2,
  Eye,
  KeyRound,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

interface UnitsManagementViewProps {
  units: HospitalUnit[];
  currentUser: User;
  onRefreshUnits: () => void;
  onInspectUnit: (unitId: string) => void;
}

export const UnitsManagementView: React.FC<UnitsManagementViewProps> = ({
  units,
  currentUser,
  onRefreshUnits,
  onInspectUnit
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitForHead, setSelectedUnitForHead] = useState<HospitalUnit | null>(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Form State for Assigning / Editing Unit Head
  const [headName, setHeadName] = useState('');
  const [headEmail, setHeadEmail] = useState('');
  const [headEmpId, setHeadEmpId] = useState('');
  const [headDesignation, setHeadDesignation] = useState('');
  const [headPassword, setHeadPassword] = useState('');

  const showToast = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenAssignModal = (unit: HospitalUnit) => {
    setSelectedUnitForHead(unit);
    setHeadName(unit.contactHead || '');
    // Generate default suggested email if none exists
    const citySlug = unit.city.toLowerCase().replace(/[^a-z]/g, '');
    setHeadEmail(`unithead.${citySlug}@sankara.com`);
    setHeadEmpId(`UH-${unit.id.replace('unit-', '').toUpperCase().slice(0, 4)}-01`);
    setHeadDesignation(`${unit.name} • Unit Head / Medical Director`);
    setHeadPassword('unit123');
  };

  const handleSaveUnitHead = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnitForHead) return;
    if (!headName.trim() || !headEmail.trim()) {
      showToast('error', 'Please enter Unit Head name and official email address.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.assignUnitHead(selectedUnitForHead.id, {
        name: headName.trim(),
        email: headEmail.trim().toLowerCase(),
        empId: headEmpId.trim(),
        designation: headDesignation.trim(),
        password: headPassword.trim() || 'unit123'
      });

      showToast('success', res.message || `Unit Head ${headName} updated successfully for ${selectedUnitForHead.name}!`);
      setSelectedUnitForHead(null);
      onRefreshUnits();
    } catch (err: any) {
      showToast('error', err.message || 'Failed to assign Unit Head.');
    } finally {
      setLoading(false);
    }
  };

  // Filter units
  const filteredUnits = units.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.city.toLowerCase().includes(q) ||
      u.state.toLowerCase().includes(q) ||
      (u.contactHead || '').toLowerCase().includes(q)
    );
  });

  const assignedCount = units.filter((u) => u.contactHead && u.contactHead.trim()).length;

  return (
    <div className="space-y-6">
      
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between border shadow-lg animate-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-white border-emerald-700'
              : 'bg-rose-900 text-white border-rose-700'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Banner & Statistics */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2.5 text-orange-400 font-bold text-xs uppercase tracking-wider mb-2">
            <Building2 className="w-4 h-4" />
            <span>Central Hospital Network Directorate</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            14 Sankara Eye Hospital Units & Leadership Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-2xl mt-1">
            Super Admin master directory to view, assign, and manage Unit Heads, login credentials, and contact heads across all 14 hospital locations in India.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="block text-xl font-black text-orange-400">{units.length}</span>
            <span className="text-[10px] text-slate-300 uppercase font-bold">Total Units</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="block text-xl font-black text-emerald-400">{assignedCount}</span>
            <span className="text-[10px] text-slate-300 uppercase font-bold">Heads Assigned</span>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-2xl border border-white/10 text-center">
            <span className="block text-xl font-black text-amber-400">{units.length - assignedCount}</span>
            <span className="text-[10px] text-slate-300 uppercase font-bold">Pending</span>
          </div>
        </div>
      </div>

      {/* Search & Actions Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search unit name, city, state, or unit head..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500 font-bold">
          Showing <span className="text-orange-600 font-black">{filteredUnits.length}</span> of {units.length} Hospital Units
        </div>
      </div>

      {/* 14 Units Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {filteredUnits.map((unit, idx) => {
          const isAssigned = Boolean(unit.contactHead && unit.contactHead.trim());
          const activeBottlenecks = unit.bottlenecks?.filter(b => b.status !== 'Completed').length || 0;
          const completedBottlenecks = unit.bottlenecks?.filter(b => b.status === 'Completed').length || 0;

          return (
            <div
              key={unit.id}
              className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
            >
              {/* Card Header */}
              <div className="p-5 border-b border-slate-100 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-800 text-xs font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <h3 className="text-sm font-black text-slate-900 leading-tight">
                        {unit.name}
                      </h3>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                        <span>{unit.city}, {unit.state}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase shrink-0 ${
                      isAssigned
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {isAssigned ? 'Head Assigned' : 'Unassigned'}
                  </span>
                </div>

                {/* Unit Details & Capacity */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Bed Capacity</span>
                    <span className="font-bold text-slate-800">{unit.bedCapacity || 100} Beds</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-semibold block text-[10px]">Established</span>
                    <span className="font-bold text-slate-800">{unit.establishedYear || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Unit Head Information Box */}
              <div className="p-5 space-y-3 bg-white flex-1 flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-1.5">
                    Unit Head & Medical Leadership
                  </span>

                  {isAssigned ? (
                    <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-3.5 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 font-black text-xs text-orange-950">
                          <UserCheck className="w-4 h-4 text-orange-600 shrink-0" />
                          <span>{unit.contactHead}</span>
                        </div>
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-100/80 px-2 py-0.5 rounded-full">
                          Unit Head
                        </span>
                      </div>

                      <div className="space-y-1 text-[11px] text-slate-600 pt-1 border-t border-orange-100">
                        <div className="flex items-center gap-1.5 font-medium">
                          <Mail className="w-3 h-3 text-orange-500 shrink-0" />
                          <span className="truncate">unithead.{unit.city.toLowerCase().replace(/[^a-z]/g, '')}@sankara.com</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-medium text-slate-500 text-[10px]">
                          <BadgeCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>Official Login Role: Unit Head</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-300 rounded-2xl p-3.5 text-center space-y-1">
                      <UserPlus className="w-5 h-5 text-slate-400 mx-auto" />
                      <span className="text-xs font-bold text-slate-600 block">No Unit Head Assigned</span>
                      <span className="text-[10px] text-slate-400 block">Click below to assign leadership credentials</span>
                    </div>
                  )}
                </div>

                {/* Card Action Buttons */}
                <div className="pt-3 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleOpenAssignModal(unit)}
                    className="py-2.5 px-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer hover:shadow-orange-500/30"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>{isAssigned ? 'Edit Head' : 'Assign Head'}</span>
                  </button>

                  <button
                    onClick={() => onInspectUnit(unit.id)}
                    className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-slate-600" />
                    <span>Inspect ({activeBottlenecks})</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Assign / Edit Unit Head Modal */}
      {selectedUnitForHead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="p-6 bg-gradient-to-r from-orange-600 to-amber-500 text-white flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-orange-100 uppercase tracking-wider block">
                  Super Admin Management
                </span>
                <h3 className="text-lg font-black tracking-tight">
                  Assign Unit Head Details
                </h3>
                <span className="text-xs text-orange-100 font-medium">
                  {selectedUnitForHead.name} ({selectedUnitForHead.city})
                </span>
              </div>
              <button
                onClick={() => setSelectedUnitForHead(null)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveUnitHead} className="p-6 space-y-4">
              
              {/* Unit Head Full Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Unit Head Full Name *
                </label>
                <div className="relative">
                  <UserCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. M. Swaminathan"
                    value={headName}
                    onChange={(e) => setHeadName(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Official Email */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Official Hospital Email *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. unithead.bangalore@sankara.com"
                    value={headEmail}
                    onChange={(e) => setHeadEmail(e.target.value)}
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  The Unit Head will use this email address to log in to the portal.
                </span>
              </div>

              {/* Employee ID (Emp ID) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Employee ID (Emp ID)
                  </label>
                  <div className="relative">
                    <BadgeCheck className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. UH-BLR-01"
                      value={headEmpId}
                      onChange={(e) => setHeadEmpId(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Default Password
                  </label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="unit123"
                      value={headPassword}
                      onChange={(e) => setHeadPassword(e.target.value)}
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Designation */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Official Designation / Role Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Unit Head / Chief Medical Director"
                  value={headDesignation}
                  onChange={(e) => setHeadDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Security Banner */}
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl flex items-center gap-2 text-[11px] text-orange-950 font-medium">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Assigning this Unit Head creates/updates their login credentials scoped exclusively to <strong>{selectedUnitForHead.name}</strong>.</span>
              </div>

              {/* Submit & Cancel Buttons */}
              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedUnitForHead(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-black shadow-md shadow-orange-500/30 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <span>{loading ? 'Saving...' : 'Save Unit Head Details'}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};
