import React, { useState, useEffect } from 'react';
import { User, HospitalUnit, UserRole } from '../types';
import { api } from '../services/api';
import {
  Users,
  UserPlus,
  Search,
  KeyRound,
  Edit2,
  Trash2,
  ArrowLeft,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertTriangle,
  X,
  Lock,
  Mail,
  UserCheck,
  Sparkles,
  RefreshCw
} from 'lucide-react';

interface StaffDirectoryViewProps {
  currentUser: User;
  units: HospitalUnit[];
  onBackToPortal: () => void;
  onRefreshData?: () => void;
}

export const StaffDirectoryView: React.FC<StaffDirectoryViewProps> = ({
  currentUser,
  units,
  onBackToPortal,
  onRefreshData
}) => {
  const isSuperAdmin = currentUser.role === 'Super Admin' || currentUser.email?.toLowerCase().includes('prabhanjan') || currentUser.name?.toLowerCase().includes('prabhanjan');

  const [usersList, setUsersList] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('ALL');

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteTargetUser, setDeleteTargetUser] = useState<User | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formEmpId, setFormEmpId] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('Unit Head');
  const [formUnitId, setFormUnitId] = useState(units[0]?.id || 'unit-coimbatore');

  // Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.getUsers();
      setUsersList(data);
    } catch (err: any) {
      console.error('Failed to load users:', err);
      showToast('Failed to load staff list from database', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const resetForm = () => {
    setFormName('');
    setFormEmail('');
    setFormEmpId('');
    setFormRole('Unit Head');
    setFormUnitId(units[0]?.id || 'unit-coimbatore');
    setEditingUser(null);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanName = formName.trim();
    const cleanEmpId = formEmpId.trim();

    if (!cleanEmail || !cleanName) {
      showToast('Name and Email ID are mandatory.', 'error');
      return;
    }

    const assignedUnit = formRole === 'Unit Head' ? units.find(u => u.id === formUnitId) : undefined;

    try {
      const newUser = await api.createUser({
        name: cleanName,
        email: cleanEmail,
        empId: cleanEmpId || undefined,
        role: formRole,
        unitId: formRole === 'Unit Head' ? formUnitId : undefined,
        unitName: assignedUnit ? assignedUnit.name : undefined,
        designation: formRole === 'Unit Head'
          ? `${assignedUnit?.name || 'Unit'} Head`
          : formRole === 'President'
          ? 'President of Hospital Operations'
          : formRole
      });

      setUsersList(prev => {
        const filtered = prev.filter(u => u.id !== newUser.id);
        return [newUser, ...filtered];
      });

      setShowAddModal(false);
      resetForm();
      showToast(`Staff account successfully created for ${newUser.name}! Default login password is Sankara@123.`);
    } catch (err: any) {
      showToast(err.message || 'Failed to create staff account', 'error');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanName = formName.trim();
    const cleanEmpId = formEmpId.trim();
    const assignedUnit = formRole === 'Unit Head' ? units.find(u => u.id === formUnitId) : undefined;

    try {
      const updated = await api.updateUser(editingUser.id, {
        name: cleanName,
        email: cleanEmail,
        empId: cleanEmpId,
        role: formRole,
        unitId: formRole === 'Unit Head' ? formUnitId : undefined,
        unitName: assignedUnit ? assignedUnit.name : undefined,
        designation: formRole === 'Unit Head'
          ? `${assignedUnit?.name || 'Unit'} Head`
          : formRole === 'President'
          ? 'President of Hospital Operations'
          : formRole
      });

      setUsersList(prev => prev.map(u => (u.id === updated.id ? updated : u)));
      setEditingUser(null);
      setShowAddModal(false);
      resetForm();
      showToast(`Account details updated for ${updated.name}!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update staff account', 'error');
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    try {
      await api.deleteUser(deleteTargetUser.id, deleteTargetUser.email);
      setUsersList(prev => prev.filter(u => u.id !== deleteTargetUser.id && u.email !== deleteTargetUser.email));
      showToast(`Staff account for ${deleteTargetUser.name} deleted successfully.`);
      setDeleteTargetUser(null);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete staff account', 'error');
    }
  };

  const handleResetPassword = async (targetUser: User) => {
    if (!window.confirm(`Reset password to "Sankara@123" for ${targetUser.name} (${targetUser.email})?`)) {
      return;
    }
    try {
      const res = await api.resetUserPassword(targetUser.id);
      showToast(res.message || `Password reset to Sankara@123 for ${targetUser.name}!`);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset password', 'error');
    }
  };

  const startEditUser = (u: User) => {
    setEditingUser(u);
    setFormName(u.name);
    setFormEmail(u.email);
    setFormEmpId(u.empId || '');
    setFormRole(u.role as UserRole);
    setFormUnitId(u.unitId || units[0]?.id || '');
    setShowAddModal(true);
  };

  // Filtered users list
  const filteredUsers = usersList.filter(u => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.empId && u.empId.toLowerCase().includes(q)) ||
      (u.unitName && u.unitName.toLowerCase().includes(q));

    const matchesRole = selectedRoleFilter === 'ALL' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  // Role Counts
  const totalUsers = usersList.length;
  const unitHeadsCount = usersList.filter(u => u.role === 'Unit Head').length;
  const opsTeamCount = usersList.filter(u => u.role === 'Operations Team').length;
  const superAdminCount = usersList.filter(u => u.role === 'Super Admin' || u.role === 'IT Admin').length;

  // Security Check: Only Super Admin can view Staff Directory
  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            The Hospital Staff Directory & User Access Control is restricted to authorized <strong className="text-slate-800">Super Administrators</strong> only.
          </p>
          <button
            onClick={onBackToPortal}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            Return to Portal Hub
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans flex flex-col justify-between selection:bg-orange-500 selection:text-white">
      
      {/* Top Global Navigation Bar */}
      <header className="bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          
          <div className="flex items-center space-x-3.5">
            <button
              onClick={onBackToPortal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Portal Hub</span>
            </button>

            <div className="h-5 w-px bg-slate-200 hidden sm:block" />

            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-xs">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Hospital Staff Directory & Access Control
                </h1>
                <p className="text-[10px] text-slate-500 font-semibold">
                  Centralized User Administration • 14 Units Network
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              Super Admin Console
            </span>

            <button
              onClick={() => { resetForm(); setShowAddModal(true); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-black shadow-md shadow-orange-500/20 cursor-pointer transition-all hover:scale-[1.01]"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Staff Account</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-8 flex-1 w-full space-y-6">
        
        {/* Toast Notification Banner */}
        {toast && (
          <div
            className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between shadow-md transition-all animate-in fade-in duration-200 ${
              toast.type === 'error'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {toast.type === 'error' ? (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              )}
              <span>{toast.message}</span>
            </div>
            <button onClick={() => setToast(null)} className="p-1 hover:bg-black/5 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Metrics Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Staff Accounts</span>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalUsers}</p>
            <span className="text-[10px] text-slate-500 font-medium">Across all operations</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Unit Heads</span>
            <p className="text-2xl font-black text-orange-600 mt-1">{unitHeadsCount}</p>
            <span className="text-[10px] text-slate-500 font-medium">Assigned to hospital units</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Operations Directorate</span>
            <p className="text-2xl font-black text-blue-600 mt-1">{opsTeamCount}</p>
            <span className="text-[10px] text-slate-500 font-medium">Central network management</span>
          </div>

          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Super Administrators</span>
            <p className="text-2xl font-black text-purple-600 mt-1">{superAdminCount}</p>
            <span className="text-[10px] text-slate-500 font-medium">Full master data CRUD</span>
          </div>
        </div>

        {/* Directory Controls Card: Search & Role Filters */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            
            {/* Live Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, employee ID, or unit..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white text-xs font-semibold text-slate-800 placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Reload Data Button */}
            <button
              onClick={loadUsers}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-700 cursor-pointer transition-colors"
              title="Refresh Directory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-600' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

          </div>

          {/* Role Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">Filter Role:</span>
            {['ALL', 'Super Admin', 'Operations Team', 'Unit Head', 'President'].map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRoleFilter(role)}
                className={`px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedRoleFilter === role
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/60'
                }`}
              >
                {role === 'ALL' ? 'All Roles' : role}
              </button>
            ))}
          </div>

        </div>

        {/* Staff Table Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900">
              Staff Members ({filteredUsers.length})
            </h3>
            <span className="text-xs text-slate-400">
              Default Password for all accounts: <strong className="text-slate-700">Sankara@123</strong>
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-orange-600" />
              Loading verified staff directory records...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
              <p className="font-bold">No staff accounts match your search filter</p>
              <p className="text-slate-400 mt-0.5">Try searching with a different keyword or reset filters.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="py-3 px-5">Staff Member</th>
                    <th className="py-3 px-4">EMP ID</th>
                    <th className="py-3 px-4">Role Permission</th>
                    <th className="py-3 px-4">Assigned Unit Scope</th>
                    <th className="py-3 px-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                  {filteredUsers.map((u) => {
                    const isProtected =
                      u.email === 'prabhanjan@sankaraeye.com' ||
                      u.email === 'admin@sankara.org' ||
                      u.email === currentUser.email;

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        {/* Member Details */}
                        <td className="py-3.5 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-900 text-white font-black flex items-center justify-center text-xs shadow-2xs shrink-0">
                              {u.avatarInitials}
                            </div>
                            <div>
                              <p className="font-black text-slate-900 text-xs sm:text-sm">{u.name}</p>
                              <p className="text-[11px] text-slate-400 font-normal">{u.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* EMP ID */}
                        <td className="py-3.5 px-4">
                          <span className="font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]">
                            {u.empId || '—'}
                          </span>
                        </td>

                        {/* Role Badge */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              u.role === 'Super Admin'
                                ? 'bg-purple-50 text-purple-800 border-purple-200'
                                : u.role === 'Operations Team'
                                ? 'bg-blue-50 text-blue-800 border-blue-200'
                                : u.role === 'Unit Head'
                                ? 'bg-orange-50 text-orange-800 border-orange-200'
                                : 'bg-slate-100 text-slate-800 border-slate-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>

                        {/* Assigned Unit */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-700 font-bold flex items-center gap-1.5">
                            <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span>{u.unitName || (u.unitId ? units.find(x => x.id === u.unitId)?.name : 'All 14 Units Network')}</span>
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleResetPassword(u)}
                              title="Reset Password to Sankara@123"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-700 hover:bg-amber-50 border border-transparent hover:border-amber-200 transition-colors cursor-pointer"
                            >
                              <KeyRound className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => startEditUser(u)}
                              title="Edit Staff Member"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-orange-700 hover:bg-orange-50 border border-transparent hover:border-orange-200 transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>

                            {!isProtected && (
                              <button
                                onClick={() => setDeleteTargetUser(u)}
                                title="Delete Account"
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
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

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200/80 py-3.5 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <img src="/sankara-emblem.png" alt="Sankara Emblem" className="w-4 h-4 object-contain" />
            <span className="font-bold text-slate-800">Sankara Eye Foundation, India</span>
            <span>•</span>
            <span>Sri Kanchi Kamakoti Medical Trust</span>
          </div>
          <span className="font-medium text-slate-600">Staff Access & Role Management Directory © 2026</span>
        </div>
      </footer>

      {/* Create / Edit Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-md p-6 space-y-4">
            
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <UserPlus className="w-4 h-4" />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  {editingUser ? 'Edit Staff Account' : 'Add New Staff Account'}
                </h3>
              </div>
              <button
                onClick={() => { setShowAddModal(false); resetForm(); }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dr. Rajesh Kumar"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email ID (Login Username) *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. rajesh.kumar@sankaraeye.com"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Employee ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. EMP-01045"
                  value={formEmpId}
                  onChange={(e) => setFormEmpId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-semibold focus:ring-2 focus:ring-orange-500 outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Access Role Permission *</label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value as UserRole)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
                >
                  <option value="Unit Head">Unit Head (Scoped to Assigned Unit)</option>
                  <option value="Operations Team">Operations Team (14 Units Access)</option>
                  <option value="Super Admin">Super Admin (All Access + Master Data CRUD)</option>
                  <option value="President">President of Hospital Operations</option>
                </select>
              </div>

              {formRole === 'Unit Head' && (
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Assigned Hospital Unit *</label>
                  <select
                    value={formUnitId}
                    onChange={(e) => setFormUnitId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-800 bg-white focus:ring-2 focus:ring-orange-500 outline-none cursor-pointer"
                  >
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.city}, {u.state})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] font-medium">
                Default password for new staff is set to <strong className="font-bold text-slate-900">Sankara@123</strong>. They can change their password at any time via profile settings.
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => { setShowAddModal(false); resetForm(); }}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white font-black shadow-md shadow-orange-500/20 transition-all cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900">Delete Staff Member</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Are you sure you want to permanently delete <strong className="text-slate-800">{deleteTargetUser.name}</strong> ({deleteTargetUser.email})?
              </p>
            </div>
            <div className="flex items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="flex-1 py-2 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteUser}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/25 transition-colors cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
