import React, { useState, useEffect, useMemo } from 'react';
import { CategoryItem, DepartmentItem, User, HospitalUnit } from '../types';
import { api } from '../services/api';
import {
  Tag,
  Building2,
  Plus,
  Trash2,
  Search,
  ShieldCheck,
  Eye,
  Filter,
  Layers,
  Activity,
  CheckCircle2,
  Info
} from 'lucide-react';

interface CategoryDeptManagerProps {
  currentUser: User;
  units?: HospitalUnit[];
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CategoryDeptManager: React.FC<CategoryDeptManagerProps> = ({
  currentUser,
  units = [],
  onToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'departments'>('categories');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('ALL');

  // President View-Only Mode check
  const isPresident = currentUser.role === 'President' || 
    currentUser.name.toLowerCase().includes('president') || 
    currentUser.email.toLowerCase().includes('president');
  const isReadOnly = isPresident || currentUser.role === 'Super Admin (View Only)';

  // New Category Form State
  const [catName, setCatName] = useState('');
  const [catDept, setCatDept] = useState('Outpatient (OPD)');
  const [catDesc, setCatDesc] = useState('');
  const [isAddingCat, setIsAddingCat] = useState(false);

  // New Department Form State
  const [deptName, setDeptName] = useState('');
  const [deptCode, setDeptCode] = useState('');
  const [deptHead, setDeptHead] = useState('');
  const [isAddingDept, setIsAddingDept] = useState(false);

  const [search, setSearch] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [cats, depts] = await Promise.all([
        api.getCategories(),
        api.getDepartments()
      ]);
      setCategories(cats);
      setDepartments(depts);
      if (depts.length > 0 && !catDept) {
        setCatDept(depts[0].name);
      }
    } catch (err: any) {
      console.warn('Failed to load categories/depts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute unit bottlenecks for selectedUnitId
  const scopedBottlenecks = useMemo(() => {
    if (!units || units.length === 0) return [];
    if (selectedUnitId === 'ALL') {
      return units.flatMap(u => (u.bottlenecks || []).map(b => ({ ...b, unitName: u.name, unitId: u.id })));
    }
    const targetUnit = units.find(u => u.id === selectedUnitId);
    return targetUnit ? (targetUnit.bottlenecks || []).map(b => ({ ...b, unitName: targetUnit.name, unitId: targetUnit.id })) : [];
  }, [units, selectedUnitId]);

  // Bottleneck counts mapped by category name (case-insensitive)
  const categoryStats = useMemo(() => {
    const stats: Record<string, { total: number; active: number; completed: number }> = {};
    scopedBottlenecks.forEach(b => {
      const catKey = (b.category || '').toLowerCase().trim();
      if (!catKey) return;
      if (!stats[catKey]) stats[catKey] = { total: 0, active: 0, completed: 0 };
      stats[catKey].total += 1;
      if (b.status === 'Completed' || b.percentComplete === 100) {
        stats[catKey].completed += 1;
      } else {
        stats[catKey].active += 1;
      }
    });
    return stats;
  }, [scopedBottlenecks]);

  // Bottleneck counts mapped by department name (case-insensitive)
  const departmentStats = useMemo(() => {
    const stats: Record<string, { total: number; active: number; completed: number }> = {};
    scopedBottlenecks.forEach(b => {
      const deptKey = (b.department || '').toLowerCase().trim();
      if (!deptKey) return;
      if (!stats[deptKey]) stats[deptKey] = { total: 0, active: 0, completed: 0 };
      stats[deptKey].total += 1;
      if (b.status === 'Completed' || b.percentComplete === 100) {
        stats[deptKey].completed += 1;
      } else {
        stats[deptKey].active += 1;
      }
    });
    return stats;
  }, [scopedBottlenecks]);

  const selectedUnitName = useMemo(() => {
    if (selectedUnitId === 'ALL') return 'All 14 Hospital Units';
    const found = units.find(u => u.id === selectedUnitId);
    return found ? found.name : 'Selected Hospital Unit';
  }, [units, selectedUnitId]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !catName.trim()) return;

    try {
      const created = await api.createCategory({
        name: catName.trim(),
        department: catDept,
        description: catDesc.trim()
      });
      setCategories(prev => [...prev, created]);
      setCatName('');
      setCatDesc('');
      setIsAddingCat(false);
      onToast(`Category "${created.name}" created successfully!`, 'success');
    } catch (err: any) {
      onToast(`Failed to create category: ${err.message}`, 'error');
    }
  };

  const handleDeleteCategory = async (id: string, name: string) => {
    if (isReadOnly) return;
    if (!window.confirm(`Delete category "${name}"?`)) return;
    try {
      await api.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      onToast(`Category "${name}" deleted`, 'info');
    } catch (err: any) {
      onToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly || !deptName.trim()) return;

    try {
      const created = await api.createDepartment({
        name: deptName.trim(),
        code: deptCode.trim().toUpperCase(),
        headContact: deptHead.trim()
      });
      setDepartments(prev => [...prev, created]);
      setDeptName('');
      setDeptCode('');
      setDeptHead('');
      setIsAddingDept(false);
      onToast(`Department "${created.name}" created!`, 'success');
    } catch (err: any) {
      onToast(`Failed to create department: ${err.message}`, 'error');
    }
  };

  const handleDeleteDepartment = async (id: string, name: string) => {
    if (isReadOnly) return;
    if (!window.confirm(`Delete department "${name}"?`)) return;
    try {
      await api.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
      onToast(`Department "${name}" deleted`, 'info');
    } catch (err: any) {
      onToast(`Delete failed: ${err.message}`, 'error');
    }
  };

  const filteredCategories = categories.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.department && c.department.toLowerCase().includes(search.toLowerCase()))
  );

  const filteredDepartments = departments.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.code && d.code.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider">
              <Tag className="w-3.5 h-3.5" />
              Operations Taxonomy & Master Data
            </div>
            {isReadOnly && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-black uppercase tracking-wider border border-blue-200">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-700" />
                President View-Only Mode
              </div>
            )}
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Categories & Departments
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isReadOnly 
              ? 'Executive view-only mode with multi-unit operational bottleneck filtering across all 14 hospital units.' 
              : 'Configure dynamic clinical & operational taxonomy across all 14 hospital units.'}
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start md:self-auto shrink-0">
          <button
            onClick={() => setActiveSubTab('categories')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'categories'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Bottleneck Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveSubTab('departments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeSubTab === 'departments'
                ? 'bg-white text-orange-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Hospital Departments ({departments.length})
          </button>
        </div>
      </div>

      {/* Categories View */}
      {activeSubTab === 'categories' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search and Unit Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search category or department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Hospital Unit Filter Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Filter Unit:</span>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[240px] truncate"
                >
                  <option value="ALL">🏢 All 14 Hospital Units</option>
                  {(units || []).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUnitId !== 'ALL' && (
                <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg">
                  Filtering for: <strong>{selectedUnitName}</strong>
                </span>
              )}
            </div>

            {/* Actions: Add button (Only for non-view-only) or Read-Only Indicator */}
            {!isReadOnly ? (
              <button
                onClick={() => setIsAddingCat(!isAddingCat)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer transition-all self-start lg:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingCat ? 'Cancel' : 'Add New Category'}</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-2 self-start lg:self-auto shrink-0">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>President View-Only Mode</span>
              </div>
            )}
          </div>

          {/* Add Category Form Box (Only visible if not read-only and toggled) */}
          {!isReadOnly && isAddingCat && (
            <form onSubmit={handleCreateCategory} className="bg-orange-50/50 border border-orange-200 rounded-2xl p-5 animate-in slide-in-from-top-3 duration-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-orange-800 mb-3">Create Operational Category</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Anaesthesia Pre-Assessment Wait"
                    value={catName}
                    onChange={(e) => setCatName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Assigned Department</label>
                  <select
                    value={catDept}
                    onChange={(e) => setCatDept(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500"
                  >
                    {departments.map(d => (
                      <option key={d.id} value={d.name}>{d.name} ({d.code || 'GEN'})</option>
                    ))}
                    {departments.length === 0 && <option value="General Operations">General Operations</option>}
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / SOP Guideline (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Standard benchmark target turnaround is < 15 mins"
                  value={catDesc}
                  onChange={(e) => setCatDesc(e.target.value)}
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingCat(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20"
                >
                  Save Category
                </button>
              </div>
            </form>
          )}

          {/* Categories Grid Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCategories.map((c) => {
              const statKey = c.name.toLowerCase().trim();
              const stats = categoryStats[statKey] || { total: 0, active: 0, completed: 0 };

              return (
                <div
                  key={c.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-300 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                        {c.department || 'General'}
                      </span>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleDeleteCategory(c.id, c.name)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          title="Delete category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-900">{c.name}</h4>
                    {c.description && (
                      <p className="text-xs text-slate-500 mt-1 font-normal">{c.description}</p>
                    )}
                  </div>

                  {/* Bottleneck Utilization Metrics for Selected Unit */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500">
                      {selectedUnitId === 'ALL' ? 'Network Count:' : 'Unit Count:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {stats.active > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-200">
                          {stats.active} Active
                        </span>
                      )}
                      {stats.completed > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-extrabold text-[10px] border border-emerald-200">
                          {stats.completed} Done
                        </span>
                      )}
                      {stats.total === 0 && (
                        <span className="text-slate-400 font-medium text-[10px]">
                          0 logged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Departments View */}
      {activeSubTab === 'departments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            
            {/* Search and Unit Filter Controls */}
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search department..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Hospital Unit Filter Dropdown */}
              <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl">
                <Filter className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                <span className="text-[11px] font-bold text-slate-500 shrink-0">Filter Unit:</span>
                <select
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer max-w-[240px] truncate"
                >
                  <option value="ALL">🏢 All 14 Hospital Units</option>
                  {(units || []).map(u => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedUnitId !== 'ALL' && (
                <span className="text-[11px] font-semibold text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-lg">
                  Filtering for: <strong>{selectedUnitName}</strong>
                </span>
              )}
            </div>

            {/* Actions: Add button (Only for non-view-only) or Read-Only Indicator */}
            {!isReadOnly ? (
              <button
                onClick={() => setIsAddingDept(!isAddingDept)}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer transition-all self-start lg:self-auto shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{isAddingDept ? 'Cancel' : 'Add New Department'}</span>
              </button>
            ) : (
              <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-600 text-xs font-bold flex items-center gap-2 self-start lg:self-auto shrink-0">
                <Eye className="w-4 h-4 text-blue-600" />
                <span>President View-Only Mode</span>
              </div>
            )}
          </div>

          {/* Add Department Form Box (Only visible if not read-only and toggled) */}
          {!isReadOnly && isAddingDept && (
            <form onSubmit={handleCreateDepartment} className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 animate-in slide-in-from-top-3 duration-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-900 mb-3">Create Hospital Department</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Retina Specialty Clinic"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dept Code (Short)</label>
                  <input
                    type="text"
                    placeholder="e.g., RET"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500 uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Head / In-charge Contact</label>
                  <input
                    type="text"
                    placeholder="e.g., Dr. Head Retina"
                    value={deptHead}
                    onChange={(e) => setDeptHead(e.target.value)}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingDept(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20"
                >
                  Save Department
                </button>
              </div>
            </form>
          )}

          {/* Departments Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDepartments.map((d) => {
              const statKey = d.name.toLowerCase().trim();
              const stats = departmentStats[statKey] || { total: 0, active: 0, completed: 0 };

              return (
                <div
                  key={d.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-300 transition-colors"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800">
                        CODE: {d.code || 'GEN'}
                      </span>
                      {!isReadOnly && (
                        <button
                          onClick={() => handleDeleteDepartment(d.id, d.name)}
                          className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                          title="Delete department"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <h4 className="text-sm font-black text-slate-900">{d.name}</h4>
                    <p className="text-xs text-slate-400 mt-1 font-medium">{d.headContact || 'Hospital Leadership'}</p>
                  </div>

                  {/* Bottleneck Utilization Metrics for Selected Unit */}
                  <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="font-bold text-slate-500">
                      {selectedUnitId === 'ALL' ? 'Network Count:' : 'Unit Count:'}
                    </span>
                    <div className="flex items-center gap-1.5">
                      {stats.active > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 font-extrabold text-[10px] border border-amber-200">
                          {stats.active} Active
                        </span>
                      )}
                      {stats.completed > 0 && (
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-900 font-extrabold text-[10px] border border-emerald-200">
                          {stats.completed} Done
                        </span>
                      )}
                      {stats.total === 0 && (
                        <span className="text-slate-400 font-medium text-[10px]">
                          0 logged
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

    </div>
  );
};
