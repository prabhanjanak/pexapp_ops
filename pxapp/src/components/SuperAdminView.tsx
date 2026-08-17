import React, { useState, useEffect } from 'react';
import { HospitalUnit, SuperAdminTab, User, Bottleneck, DbHealthStatus, UserRole } from '../types';
import { LeadershipView } from './LeadershipView';
import { UnitHeadView } from './UnitHeadView';
import { EvidenceApprovalGrid } from './EvidenceApprovalGrid';
import { api } from '../services/api';
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
  X
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
  onOpenAuditLogs
}) => {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);
  const [inspectedUnitId, setInspectedUnitId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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
    setTimeout(() => setNotification(null), 5000);
  };

  const openAddModal = () => {
    setEditingUser(null);
    setFormName('');
    setFormEmail('');
    setFormEmpId('');
    setFormRole('Unit Head');
    setFormUnitId(units[0]?.id || '');
    setFormDesignation('');
    setShowAddUserModal(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormEmpId(user.empId || '');
    setFormRole(user.role);
    setFormUnitId(user.unitId || units[0]?.id || '');
    setFormDesignation(user.designation || '');
    setShowAddUserModal(true);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formRole) {
      showNotify('error', 'Name, Org Email, and Role are required');
      return;
    }

    try {
      if (editingUser) {
        await api.updateUser(editingUser.id, {
          name: formName.trim(),
          email: formEmail.trim(),
          empId: formEmpId.trim() || undefined,
          role: formRole,
          unitId: formRole === 'Unit Head' ? formUnitId : undefined,
          designation: formDesignation.trim() || undefined
        });
        showNotify('success', `Staff member ${formName} updated successfully!`);
      } else {
        await api.createUser({
          name: formName.trim(),
          email: formEmail.trim(),
          empId: formEmpId.trim() || undefined,
          role: formRole,
          unitId: formRole === 'Unit Head' ? formUnitId : undefined,
          designation: formDesignation.trim() || undefined
        });
        showNotify('success', `New staff account created! Default password: Sankara@123`);
      }

      setShowAddUserModal(false);
      fetchUsers();
    } catch (err: any) {
      showNotify('error', err.message || 'Failed to save staff member');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    try {
      await api.deleteUser(deleteTargetUser.id);
      showNotify('success', `Staff member ${deleteTargetUser.name} deleted.`);
      setDeleteTargetUser(null);
      fetchUsers();
    } catch (err: any) {
      showNotify('error', err.message || 'Failed to delete user');
    }
  };

  const handleResetPassword = async (user: User) => {
    if (!confirm(`Reset password for ${user.name} to default (Sankara@123)?`)) return;
    try {
      const res = await api.resetUserPassword(user.id);
      showNotify('success', res.message || `Password reset to Sankara@123 for ${user.name}`);
    } catch (err: any) {
      showNotify('error', err.message || 'Failed to reset password');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Global Notification Banner */}
      {notification && (
        <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 shadow-md animate-in slide-in-from-top duration-200 ${
          notification.type === 'success' ? 'bg-emerald-50 border-emerald-300 text-emerald-900' : 'bg-rose-50 border-rose-300 text-rose-900'
        }`}>
          <div className="flex items-center gap-2.5">
            {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertCircle className="w-5 h-5 text-rose-600" />}
            <span className="font-bold text-sm">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-slate-500 hover:text-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* TAB 1: EXECUTIVE DASHBOARD OR LIVE UNIT HEAD WORKSPACE */}
      {activeTab === 'dashboard' && (
        inspectedUnitId ? (
          <UnitHeadView
            units={units}
            selectedUnitId={inspectedUnitId}
            onSelectUnit={setInspectedUnitId}
            currentUser={currentUser}
            activeTab="bottlenecks"
            viewOnly={currentUser.role === 'Super Admin (View Only)'}
            onUpdateBottleneck={onUpdateBottleneck}
            onAddBottleneck={onAddBottleneck}
            onDeleteBottleneck={onDeleteBottleneck}
            onInitializeUnitAssessment={onInitializeUnitAssessment}
            allowUnitSwitch={true}
            onBackToDashboard={() => setInspectedUnitId(null)}
          />
        ) : (
          <LeadershipView
            units={units}
            onSelectUnitHead={(unitId) => setInspectedUnitId(unitId)}
            onInitializeUnitAssessment={onInitializeUnitAssessment}
          />
        )
      )}

      {/* TAB: EVIDENCE & PHOTO APPROVALS */}
      {activeTab === 'evidence' && (
        <EvidenceApprovalGrid
          units={units}
          selectedUnitId={selectedUnitId}
          onUpdateBottleneck={onUpdateBottleneck}
        />
      )}

      {/* TAB 2: UNIVERSAL UNIT OPERATIONS (Super Admin Full Write/Edit for ANY unit) */}
      {activeTab === 'operations' && (
        <UnitHeadView
          units={units}
          selectedUnitId={selectedUnitId}
          onSelectUnit={onSelectUnit}
          currentUser={currentUser}
          activeTab="bottlenecks"
          onUpdateBottleneck={onUpdateBottleneck}
          onAddBottleneck={onAddBottleneck}
          onDeleteBottleneck={onDeleteBottleneck}
          onInitializeUnitAssessment={onInitializeUnitAssessment}
          allowUnitSwitch={true}
          viewOnly={currentUser.role === 'Super Admin (View Only)'}
        />
      )}

      {/* TAB 3: NETWORK HEATMAP & STATS */}
      {activeTab === 'analytics' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-5 h-5 text-orange-600" />
                Network Cross-Unit Performance Matrix
              </h3>
              <p className="text-xs text-slate-500">
                Detailed comparison across all 14 units
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {units.map((u) => {
              const total = u.bottlenecks.length;
              const resolved = u.bottlenecks.filter((b) => b.status === 'Completed').length;
              const pct = total > 0 ? Math.round((resolved / total) * 100) : 0;
              return (
                <div key={u.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-extrabold text-sm text-slate-900">{u.name}</span>
                    <span className="text-xs font-bold text-orange-600">{pct}%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-emerald-500 h-full"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>{total} Bottlenecks</span>
                    <span>{resolved} Resolved</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: USER DIRECTORY & FULL CRUD (SUPER ADMIN ONLY) */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-orange-600" />
                  Hospital Staff & Access Directory
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-orange-100 text-orange-900 border border-orange-200">
                  Super Admin Exclusive CRUD
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Create, edit, and manage staff accounts, roles, EMP IDs, and default passwords across all 14 hospital units.
              </p>
            </div>

            <button
              type="button"
              id="add-user-btn"
              onClick={openAddModal}
              className="flex items-center gap-2 px-5 py-2.5 btn-orange-gradient rounded-xl font-black text-xs sm:text-sm shadow-md cursor-pointer shrink-0 hover:scale-[1.01]"
            >
              <UserPlus className="w-4 h-4" />
              + Add New Staff Member
            </button>
          </div>

          {usersLoading ? (
            <div className="py-12 text-center text-slate-400 text-sm font-semibold">
              Loading staff accounts from PostgreSQL...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100/90 border-b border-slate-200 text-xs sm:text-sm font-black uppercase tracking-wider text-slate-700">
                    <th className="py-4 px-5 pl-6 min-w-[220px]">Staff Name & Designation</th>
                    <th className="py-4 px-5 min-w-[130px]">EMP ID</th>
                    <th className="py-4 px-5 min-w-[220px]">Org Email</th>
                    <th className="py-4 px-5 min-w-[160px]">Access Role</th>
                    <th className="py-4 px-5 min-w-[200px]">Assigned Hospital Scope</th>
                    <th className="py-4 px-5 pr-6 text-right min-w-[200px]">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {usersList.map((u) => (
                    <tr key={u.id} className="hover:bg-orange-50/20 transition-colors">
                      <td className="py-4 px-5 pl-6 font-black text-slate-900 text-base">
                        {u.name}
                        {u.designation && (
                          <span className="text-xs font-semibold text-slate-500 block mt-0.5">{u.designation}</span>
                        )}
                      </td>

                      <td className="py-4 px-5 font-mono text-xs sm:text-sm font-bold text-slate-800">
                        {u.empId || <span className="text-slate-400 font-normal italic">—</span>}
                      </td>

                      <td className="py-4 px-5 text-slate-700 font-medium text-xs sm:text-sm">
                        {u.email}
                      </td>

                      <td className="py-4 px-5">
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-black border ${
                            u.role === 'Super Admin'
                              ? 'bg-orange-100 text-orange-900 border-orange-300'
                              : u.role === 'Super Admin (View Only)'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : u.role === 'Operations Team'
                              ? 'bg-amber-100 text-amber-900 border-amber-300'
                              : 'bg-blue-50 text-blue-900 border-blue-200'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-800">
                        {u.role === 'Unit Head' ? u.unitName || u.unitId || 'Assigned Unit' : 'Central Network (14 Units)'}
                      </td>

                      {/* Super Admin CRUD Actions */}
                      <td className="py-4 px-5 pr-6 text-right whitespace-nowrap space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditModal(u)}
                          className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Edit Staff Member"
                        >
                          <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => handleResetPassword(u)}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                          title="Reset Password to Sankara@123"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                          Reset Pwd
                        </button>

                        {u.email !== 'prabhanjan@sankaraeye.com' && u.email !== 'admin@sankara.org' && u.id !== currentUser.id && (
                          <button
                            type="button"
                            onClick={() => setDeleteTargetUser(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs inline-flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                            title="Delete User"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
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

      {/* TAB 5: SYSTEM GOVERNANCE & AUDIT LOGS */}
      {activeTab === 'database' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              Central System Status & Metrics
            </h3>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">System Status</span>
                <p className="text-sm font-black text-emerald-600 mt-0.5">Online & Syncing</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Active Units</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{units.length} Units</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Hospital Units Logged</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{dbHealth?.unitsCount || 14} Units</p>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Total Active Items</span>
                <p className="text-sm font-black text-slate-900 mt-0.5">{dbHealth?.bottlenecksCount || 0} Records</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                type="button"
                id="superadmin-open-audit-btn"
                onClick={onOpenAuditLogs}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 border border-orange-200 text-orange-900 font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Activity className="w-4 h-4 text-orange-600" />
                View Full Audit Logs ({dbHealth?.auditLogsCount || 0} Events)
              </button>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Sliders className="w-5 h-5 text-orange-600" />
              Administrative Governance
            </h3>
            <p className="text-xs text-slate-500">
              System initialization and maintenance operations for Sankara Eye Hospital Network.
            </p>

            <div className="space-y-3 pt-2">
              <button
                type="button"
                id="admin-seed-all-btn"
                onClick={onSeedAllUnits}
                className="w-full py-3 px-4 rounded-2xl btn-orange-gradient font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-md transition-all"
              >
                <Sparkles className="w-4 h-4" />
                Populate Baseline Operational Data Across 14 Units
              </button>

              <button
                type="button"
                id="admin-reset-db-btn"
                onClick={onResetData}
                className="w-full py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <RotateCcw className="w-4 h-4 text-rose-600" />
                Reset System Records to Initial State
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit User Modal (Super Admin Only) */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden">
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 text-white px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="font-black text-base">
                  {editingUser ? 'Edit Staff Member Account' : 'Add New Staff Member'}
                </h3>
                <p className="text-xs text-white/80 font-medium">
                  {editingUser ? `Editing ${editingUser.name}` : 'Default Initial Password: Sankara@123'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="p-6 space-y-4">
              
              {/* 1. Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* 2. EMP ID & Org Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Employee ID (EMP ID) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 010177"
                    value={formEmpId}
                    onChange={(e) => setFormEmpId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono font-bold focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Org Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. doctor@sankaraeye.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium focus:ring-2 focus:ring-orange-500 outline-none"
                  />
                </div>
              </div>

              {/* 3. Role & Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Role <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold"
                  >
                    <option value="Unit Head">Unit Head (Assigned Unit)</option>
                    <option value="Operations Team">Operations Team (Management)</option>
                    <option value="Super Admin">Super Admin (Full Master Access)</option>
                    <option value="Super Admin (View Only)">Super Admin (View Only)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                    Hospital Unit <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={formUnitId}
                    onChange={(e) => setFormUnitId(e.target.value)}
                    disabled={formRole !== 'Unit Head'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:ring-2 focus:ring-orange-500 outline-none font-bold disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.city})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Designation */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1">
                  Designation / Department (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Chief Medical Officer / Quality Lead"
                  value={formDesignation}
                  onChange={(e) => setFormDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              {/* Default Password Notice */}
              <div className="p-3 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 text-xs flex items-start gap-2">
                <Lock className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                <p className="leading-snug">
                  Initial password is set to <strong>Sankara@123</strong>. Staff members can change their password from their profile; other profile details remain locked to Central Super Admin governance.
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 btn-orange-gradient rounded-xl text-xs font-black shadow-md cursor-pointer hover:scale-[1.01]"
                >
                  {editingUser ? 'Save Changes' : 'Create Staff Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteTargetUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-3 bg-rose-100 rounded-2xl">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-slate-900">Delete Staff Account</h3>
                <p className="text-xs text-slate-500">This action will remove account access immediately.</p>
              </div>
            </div>

            <p className="text-sm text-slate-700">
              Are you sure you want to delete staff account for <strong>{deleteTargetUser.name}</strong> ({deleteTargetUser.email})?
            </p>

            <div className="pt-2 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow-md cursor-pointer transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
