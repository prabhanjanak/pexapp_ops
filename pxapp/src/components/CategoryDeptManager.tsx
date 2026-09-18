import React, { useState, useEffect } from 'react';
import { CategoryItem, DepartmentItem, User } from '../types';
import { api } from '../services/api';
import {
  Tag,
  Building2,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Layers,
  Sparkles,
  RefreshCw,
  Search
} from 'lucide-react';

interface CategoryDeptManagerProps {
  currentUser: User;
  onToast: (msg: string, type?: 'success' | 'error' | 'info') => void;
}

export const CategoryDeptManager: React.FC<CategoryDeptManagerProps> = ({
  currentUser,
  onToast
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'categories' | 'departments'>('categories');
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName.trim()) return;

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
    if (!deptName.trim()) return;

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
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100 text-orange-800 text-xs font-black uppercase tracking-wider mb-2">
            <Tag className="w-3.5 h-3.5" />
            Operations Taxonomy & Master Data
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            Categories & Departments Management
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Configure dynamic clinical & operational taxonomy across all 14 hospital units.
          </p>
        </div>

        {/* Sub-tab Pill Switcher */}
        <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200 self-start sm:self-auto">
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search category or department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={() => setIsAddingCat(!isAddingCat)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingCat ? 'Cancel' : 'Add New Category'}</span>
            </button>
          </div>

          {/* Add Category Form Box */}
          {isAddingCat && (
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
            {filteredCategories.map((c) => (
              <div
                key={c.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-orange-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                      {c.department || 'General'}
                    </span>
                    <button
                      onClick={() => handleDeleteCategory(c.id, c.name)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                      title="Delete category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">{c.name}</h4>
                  {c.description && (
                    <p className="text-xs text-slate-500 mt-1 font-normal">{c.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Departments View */}
      {activeSubTab === 'departments' && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search department..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <button
              onClick={() => setIsAddingDept(!isAddingDept)}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-2 shadow-md shadow-orange-600/20 cursor-pointer transition-all self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{isAddingDept ? 'Cancel' : 'Add New Department'}</span>
            </button>
          </div>

          {/* Add Department Form Box */}
          {isAddingDept && (
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
            {filteredDepartments.map((d) => (
              <div
                key={d.id}
                className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between hover:border-amber-300 transition-colors"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-200 text-slate-800">
                      CODE: {d.code || 'GEN'}
                    </span>
                    <button
                      onClick={() => handleDeleteDepartment(d.id, d.name)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors cursor-pointer"
                      title="Delete department"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-black text-slate-900">{d.name}</h4>
                  <p className="text-xs text-slate-400 mt-1 font-medium">{d.headContact || 'Hospital Leadership'}</p>
                </div>
              </div>
            ))}
          </div>

        </div>
      )}

    </div>
  );
};
