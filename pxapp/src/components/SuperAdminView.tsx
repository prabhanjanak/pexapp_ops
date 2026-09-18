import React, { useState, useEffect, useMemo } from 'react';
import { HospitalUnit, SuperAdminTab, User, Bottleneck, DbHealthStatus, UserRole } from '../types';
import { DashboardOverview } from './DashboardOverview';
import { UnitsManagementView } from './UnitsManagementView';
import { UnitHeadView } from './UnitHeadView';
import { EvidenceApprovalGrid } from './EvidenceApprovalGrid';
import { CategoryDeptManager } from './CategoryDeptManager';
import { BottleneckCommentModal } from './BottleneckCommentModal';
import { api } from '../services/api';
import { calculateUnitStats, getStatusBadgeStyle, getImpactBadgeStyle, normalizeStatus } from '../utils/calc';
import {
  TrendingUp,
  Sliders,
  Layers,
  UserCheck,
  ShieldCheck,
  Plus,
  RotateCcw,
  Sparkles,
  Database,
  Search,
  UserPlus,
  Building2,
  Mail,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  Camera,
  Edit2,
  Trash2,
  KeyRound,
  Lock,
  Eye,
  Check,
  X,
  ArrowLeft,
  ArrowUpRight,
  MessageSquare,
  Tag
} from 'lucide-react';

interface SuperAdminViewProps {
  units: HospitalUnit[];
  activeTab: SuperAdminTab;
  currentUser: User;
  dbHealth: DbHealthStatus | null;
  selectedUnitId: string;
  onSelectUnit: (unitId: string) => void;
  onUpdateBottleneck: (unitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => void;
  onAddBottleneck: (unitId: string, newBottleneck: Omit<Bottleneck, 'id' | 'lastUpdated'>) => void;
  onDeleteBottleneck: (unitId: string, bottleneckId: string) => void;
  onInitializeUnitAssessment: (unitId: string) => void;
  onResetData: () => void;
  onSeedAllUnits: () => void;
  onOpenAuditLogs: () => void;
  onRefreshUnits?: () => void;
}

export const SuperAdminView: React.FC<SuperAdminViewProps> = ({
  units,
  activeTab,
  currentUser,
  dbHealth,
  selectedUnitId,
  onSelectUnit,
  onUpdateBottleneck,
  onAddBottleneck,
  onDeleteBottleneck,
  onInitializeUnitAssessment,
  onResetData,
  onSeedAllUnits,
  onOpenAuditLogs,
  onRefreshUnits
}) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);
  const [inspectedUnitId, setInspectedUnitId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Active / Completed Bottleneck state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'targetDate' | 'impact'>('newest');
  const [activeCommentBottleneck, setActiveCommentBottleneck] = useState<{ unitId: string; bottleneck: Bottleneck } | null>(null);

  // User form state
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Unit Head');
  const [formUnitId, setFormUnitId] = useState(units[0]?.id || '');
  const [formDesignation, setFormDesignation] = useState('');

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const data = await api.getUsers();
      setUsersList(data);
    } catch (e) {
      console.error('Failed to fetch users:', e);
    } finally {
      setUsersLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab]);

  const showNotify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    try {
      await api.createUser({
        name: formName.trim(),
        email: formEmail.trim(),
        empId: formEmpId.trim(),
        role: formRole,
        unitId: formRole === 'Unit Head' ? formUnitId : undefined,
        designation: formDesignation.trim()
      });
      showNotify('success', `Account created for ${formName} with default password Sankara@123!`);
      setShowAddUserModal(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      showNotify('error', err.message || 'Failed to create user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      await api.updateUser(editingUser.id, {
        name: formName.trim(),
        email: formEmail.trim(),
        empId: formEmpId.trim(),
        role: formRole,
        unitId: formRole === 'Unit Head' ? formUnitId : undefined,
        designation: formDesignation.trim()
      });
      showNotify('success', `Account updated for ${formName}!`);
      setEditingUser(null);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      showNotify('error', err.message || 'Failed to update user');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    try {
      await api.deleteUser(deleteTargetUser.id);
      showNotify('success', `Account deleted for ${deleteTargetUser.name}.`);
      setDeleteTargetUser(null);
      fetchUsers();
    } catch (err: any) {
      showNotify('error', err.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!window.confirm(`Reset password to default (Sankara@123) for ${user.name}?`)) return;
    try {
      const res = await api.resetUserPassword(user.id);
      showNotify('success', res.message || `Password reset to Sankara@123 for ${user.name}!`);
    } catch (err: any) {
      showNotify('error', err.message || 'Failed to reset password');
    }
  };

  const startEditUser = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormEmpId(user.empId || '');
    setFormRole(user.role);
    setFormUnitId(user.unitId || units[0]?.id || '');
    setFormDesignation(user.designation || '');
  };

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormEmpId('');
    setFormRole('Unit Head');
    setFormUnitId(units[0]?.id || '');
    setFormDesignation('');
  };

  // Flattened Bottlenecks for Network Active or Completed Tab
  const allBottlenecks = useMemo(() => {
    const list: { unit: HospitalUnit; bottleneck: Bottleneck }[] = [];
    for (const u of units) {
      for (const b of u.bottlenecks) {
        const norm = normalizeStatus(b.status);
        if (activeTab === 'bottlenecks' && norm === 'Completed') continue;
        if (activeTab === 'completed' && norm !== 'Completed') continue;
        if (selectedUnitFilter !== 'ALL' && u.id !== selectedUnitFilter) continue;

        const q = searchQuery.toLowerCase();
        if (
          q &&
          !b.title.toLowerCase().includes(q) &&
          !b.category.toLowerCase().includes(q) &&
          !u.name.toLowerCase().includes(q) &&
          !b.owner.toLowerCase().includes(q)
        ) {
          continue;
        }

        list.push({ unit: u, bottleneck: b });
      }
    }

    return list.sort((a, b) => {
      if (sortBy === 'newest') return (b.bottleneck.id || '').localeCompare(a.bottleneck.id || '');
      if (sortBy === 'targetDate') return (a.bottleneck.targetDate || '9999').localeCompare(b.bottleneck.targetDate || '9999');
      const imp: Record<string, number> = { High: 3, Medium: 2, Low: 1 };
      return (imp[b.bottleneck.impactLevel || 'Medium'] || 2) - (imp[a.bottleneck.impactLevel || 'Medium'] || 2);
    });
  }, [units, activeTab, selectedUnitFilter, searchQuery, sortBy]);

  // Inspection Drilldown view
  if (inspectedUnitId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setInspectedUnitId(null)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-orange-50 text-slate-700 hover:text-orange-700 font-bold text-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-orange-600" />
            <span>← Back to Super Admin Overview</span>
          </button>

          <span className="text-xs font-semibold text-slate-500">
            Unit Master Management Mode • Super Admin
          </span>
        </div>

        <UnitHeadView
          units={units}
          selectedUnitId={inspectedUnitId}
          currentUser={currentUser}
          activeTab="bottlenecks"
          onUpdateBottleneck={onUpdateBottleneck}
          onAddBottleneck={onAddBottleneck}
          onDeleteBottleneck={onDeleteBottleneck}
          allowUnitSwitch={true}
          viewOnly={false}
          onBackToDashboard={() => setInspectedUnitId(null)}
        />
      </div>
    );
  }

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
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-white/60 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. EXECUTIVE DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <DashboardOverview
          units={units}
          currentUser={currentUser}
          onSelectUnit={(id) => setInspectedUnitId(id)}
        />
      )}

      {/* 1b. 14 UNITS & UNIT HEADS DIRECTORY */}
      {activeTab === 'units' && (
        <UnitsManagementView
          units={units}
          currentUser={currentUser}
          onRefreshUnits={onRefreshUnits || (() => {})}
          onInspectUnit={(id) => setInspectedUnitId(id)}
        />
      )}

      {/* 2. ACTIVE BOTTLENECKS OR COMPLETED ARCHIVE */}
      {(activeTab === 'bottlenecks' || activeTab === 'completed') && (
        <div className="space-y-4 animate-in fade-in duration-200">
          
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                  {activeTab === 'completed' ? 'Resolved Archive' : 'Master Operational Registry'}
                </span>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs font-bold text-slate-500">14 Hospital Units</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900">
                {activeTab === 'completed' ? 'Completed Bottlenecks Archive' : 'Network Active Bottlenecks'}
              </h2>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search title, category, owner..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <select
                value={selectedUnitFilter}
                onChange={(e) => setSelectedUnitFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500"
              >
                <option value="ALL">All Hospital Units (14)</option>
                {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="targetDate">Sort: Target Date</option>
                <option value="impact">Sort: Impact Level</option>
              </select>
            </div>
          </div>

          {/* Bottlenecks List */}
          {allBottlenecks.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
              <h3 className="text-base font-black text-slate-900">
                {activeTab === 'completed' ? 'No Completed Bottlenecks in Archive' : 'No Active Bottlenecks Matching Filter'}
              </h3>
            </div>
          ) : (
            <div className="space-y-3">
              {allBottlenecks.map(({ unit, bottleneck }) => {
                const badge = getStatusBadgeStyle(bottleneck.status);
                const impactBadge = getImpactBadgeStyle(bottleneck.impactLevel);
                const commentsCount = (bottleneck.comments || []).length;

                return (
                  <div
                    key={bottleneck.id}
                    className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-slate-300 transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-900 text-white">
                          {unit.name}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-50 text-orange-800 border border-orange-200">
                          {bottleneck.category}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${impactBadge}`}>
                          {bottleneck.impactLevel || 'Medium'} Impact
                        </span>
                        {bottleneck.targetDate && (
                          <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                            🎯 Deadline: {bottleneck.targetDate}
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-black text-slate-900">{bottleneck.title}</h4>
                      {bottleneck.notes && <p className="text-xs text-slate-600">{bottleneck.notes}</p>}

                      <div className="flex items-center gap-3 pt-1">
                        <button
                          onClick={() => setActiveCommentBottleneck({ unitId: unit.id, bottleneck })}
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

                        <button
                          onClick={() => setInspectedUnitId(unit.id)}
                          className="inline-flex items-center gap-1 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
                        >
                          <span>Inspect Unit Workspace</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="min-w-[170px] space-y-1.5">
                      <span className={`inline-block px-3 py-1 rounded-xl text-xs font-black border ${badge.badge}`}>
                        {badge.label} ({bottleneck.percentComplete}%)
                      </span>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div style={{ width: `${bottleneck.percentComplete}%` }} className={`h-full ${badge.bar}`} />
                      </div>
                      <p className="text-[11px] text-slate-400 font-medium">Owner: {bottleneck.owner}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* 3. EVIDENCE APPROVALS TAB */}
      {activeTab === 'evidence' && (
        <EvidenceApprovalGrid
          units={units}
          onUpdateBottleneck={onUpdateBottleneck}
          currentUserRole={currentUser.role}
        />
      )}

      {/* 4. CATEGORIES & DEPARTMENTS MANAGEMENT TAB */}
      {activeTab === 'categories' && (
        <CategoryDeptManager
          currentUser={currentUser}
          onToast={(msg, type) => showNotify(type === 'error' ? 'error' : 'success', msg)}
        />
      )}

      {/* 5. USER MANAGEMENT (CRUD) TAB */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <UserCheck className="w-5 h-5 text-orange-600" />
                <h3 className="text-xl font-black text-slate-900">Hospital Staff Directory & Access Control</h3>
              </div>
              <p className="text-xs text-slate-500">
                Manage roles, assignments, and password resets across all 14 hospital units. Default password: <strong className="text-slate-800">Sankara@123</strong>.
              </p>
            </div>

            <button
              onClick={() => { resetForm(); setShowAddUserModal(true); }}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Account</span>
            </button>
          </div>

          {/* Users Table */}
          {usersLoading ? (
            <p className="text-xs text-slate-400 py-8 text-center">Loading user records...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-400 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">EMP ID</th>
                    <th className="py-3 px-4">Role</th>
                    <th className="py-3 px-4">Assigned Unit</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl bg-slate-900 text-white font-bold flex items-center justify-center text-xs shrink-0">
                            {u.avatarInitials}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900">{u.name}</p>
                            <p className="text-[11px] text-slate-400 font-normal">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-mono text-slate-600">{u.empId || '—'}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800">
                          {u.role}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="text-slate-600">{u.unitName || 'All Network Units'}</span>
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleResetPassword(u)}
                          title="Reset Password to Sankara@123"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => startEditUser(u)}
                          title="Edit User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-orange-600 hover:bg-orange-50 transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        {u.email !== 'prabhanjan@sankaraeye.com' && u.email !== 'admin@sankara.org' && (
                          <button
                            onClick={() => setDeleteTargetUser(u)}
                            title="Delete User"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* 6. MASTER DATABASE CONTROLS TAB */}
      {activeTab === 'database' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-black text-slate-900">Master Database Controls & PostgreSQL Health</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">PostgreSQL Status</span>
              <p className="text-lg font-black text-emerald-600 mt-0.5">{dbHealth?.status === 'healthy' ? 'Connected & Synced' : 'Syncing'}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">DB Latency</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{dbHealth?.latencyMs || 2}ms</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Total Logged Units</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{units.length}</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Registered Users</span>
              <p className="text-lg font-black text-slate-900 mt-0.5">{usersList.length || 18}</p>
            </div>
          </div>

          {/* Danger Zone & Seeding */}
          <div className="pt-6 border-t border-slate-100 flex flex-wrap gap-4">
            <button
              onClick={onSeedAllUnits}
              className="px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 text-xs font-bold border border-orange-200 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              <span>Populate All 14 Hospital Units with Baseline Data</span>
            </button>

            <button
              onClick={onResetData}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 flex items-center gap-2 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Full Database Reset to Initial State</span>
            </button>
          </div>
        </div>
      )}

      {/* User Create / Edit Modal */}
      {(showAddUserModal || editingUser) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6">
            <h3 className="text-lg font-black text-slate-900 mb-4">
              {editingUser ? 'Edit Staff Account' : 'Add New Staff Account'}
            </h3>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Hospital Email *</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Employee ID</label>
                  <input
                    type="text"
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    placeholder="e.g. 010188"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Access Role</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    <option value="Unit Head">Unit Head</option>
                    <option value="Operations Team">Operations Team</option>
                    <option value="Super Admin (View Only)">Super Admin (View Only)</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>
              </div>

              {formRole === 'Unit Head' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Hospital Unit</label>
                  <select
                    value={formUnitId}
                    onChange={(e) => setFormUnitId(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => { setShowAddUserModal(false); setEditingUser(null); }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md shadow-orange-600/20 cursor-pointer"
                >
                  {editingUser ? 'Save Changes' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-slate-900">Delete Account?</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Are you sure you want to remove <strong className="text-slate-900">{deleteTargetUser.name}</strong> from the staff directory?
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteUser}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20 cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {activeCommentBottleneck && (
        <BottleneckCommentModal
          isOpen={Boolean(activeCommentBottleneck)}
          onClose={() => setActiveCommentBottleneck(null)}
          bottleneck={activeCommentBottleneck.bottleneck}
          currentUser={currentUser}
          onCommentAdded={(updated) => {
            onUpdateBottleneck(activeCommentBottleneck.unitId, updated.id, updated);
            setActiveCommentBottleneck({ unitId: activeCommentBottleneck.unitId, bottleneck: updated });
          }}
        />
      )}

    </div>
  );
};
