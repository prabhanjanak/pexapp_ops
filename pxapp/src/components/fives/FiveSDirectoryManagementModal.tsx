import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  CheckCircle2,
  AlertCircle,
  Building2,
  Mail,
  ShieldCheck,
  Send,
  RefreshCw,
  SlidersHorizontal,
  Save
} from 'lucide-react';
import {
  FiveSContact,
  getStoredFiveSContacts,
  saveStoredFiveSContacts,
  FIVE_S_UNIT_HEAD_DIRECTORY
} from './fiveSContactDirectory';
import { api } from '../../services/api';

interface FiveSDirectoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  canEdit?: boolean;
}

export const FiveSDirectoryManagementModal: React.FC<FiveSDirectoryManagementModalProps> = ({
  isOpen,
  onClose,
  canEdit = true
}) => {
  const [contacts, setContacts] = useState<FiveSContact[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUnitFilter, setSelectedUnitFilter] = useState('ALL');
  
  // Edit / Add Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingContact, setEditingContact] = useState<FiveSContact | null>(null);

  // SMTP Test State
  const [isTestingSmtp, setIsTestingSmtp] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Load contacts
  useEffect(() => {
    if (!isOpen) return;

    // Load from local storage first
    const local = getStoredFiveSContacts();
    setContacts(local);

    // Then try to fetch latest from server
    api.get5SContacts().then((remote) => {
      if (Array.isArray(remote) && remote.length > 0) {
        // Map server snake_case to camelCase if needed
        const mapped: FiveSContact[] = remote.map((r: any) => ({
          id: r.id,
          unitCode: r.unit_code || r.unitCode,
          unitName: r.unit_name || r.unitName,
          zoneName: r.zone_name || r.zoneName || '',
          zoneInchargeName: r.zone_incharge_name || r.zoneInchargeName || '',
          zoneInchargeEmail: r.zone_incharge_email || r.zoneInchargeEmail || '',
          zoneInchargeDesignation: r.zone_incharge_designation || r.zoneInchargeDesignation || '',
          departmentName: r.department_name || r.departmentName,
          deptInchargeName: r.dept_incharge_name || r.deptInchargeName || '',
          deptInchargeEmail: r.dept_incharge_email || r.deptInchargeEmail || '',
          deptInchargeDesignation: r.dept_incharge_designation || r.deptInchargeDesignation || ''
        }));
        setContacts(mapped);
        saveStoredFiveSContacts(mapped);
      }
    }).catch(() => {});
  }, [isOpen]);

  if (!isOpen) return null;

  // Available unique units
  const availableUnits = Array.from(new Set(contacts.map(c => c.unitCode.toUpperCase()))).sort();

  // Filter contacts
  const filteredContacts = contacts.filter((c) => {
    const matchesUnit = selectedUnitFilter === 'ALL' || c.unitCode.toUpperCase() === selectedUnitFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !q ||
      c.unitName.toLowerCase().includes(q) ||
      c.unitCode.toLowerCase().includes(q) ||
      c.departmentName.toLowerCase().includes(q) ||
      c.deptInchargeName.toLowerCase().includes(q) ||
      c.deptInchargeEmail.toLowerCase().includes(q) ||
      c.zoneName.toLowerCase().includes(q) ||
      c.zoneInchargeName.toLowerCase().includes(q) ||
      c.zoneInchargeEmail.toLowerCase().includes(q);

    return matchesUnit && matchesSearch;
  });

  const handleStartAdd = () => {
    setEditingContact({
      id: `f5c-${Date.now()}`,
      unitCode: selectedUnitFilter !== 'ALL' ? selectedUnitFilter : 'CBE',
      unitName: 'Sankara Eye Hospital',
      zoneName: 'Zone 1',
      zoneInchargeName: '',
      zoneInchargeEmail: '',
      zoneInchargeDesignation: 'Zone In-Charge',
      departmentName: '',
      deptInchargeName: '',
      deptInchargeEmail: '',
      deptInchargeDesignation: 'Department In-Charge'
    });
    setIsEditing(true);
  };

  const handleStartEdit = (contact: FiveSContact) => {
    setEditingContact({ ...contact });
    setIsEditing(true);
  };

  const handleSaveContact = async () => {
    if (!editingContact) return;
    if (!editingContact.departmentName.trim()) {
      alert('Department name is required');
      return;
    }

    const exists = contacts.some(c => c.id === editingContact.id);
    let updatedList: FiveSContact[];

    if (exists) {
      updatedList = contacts.map(c => c.id === editingContact.id ? editingContact : c);
      api.update5SContact(editingContact.id, editingContact).catch(() => {});
    } else {
      updatedList = [editingContact, ...contacts];
      api.create5SContact(editingContact).catch(() => {});
    }

    setContacts(updatedList);
    saveStoredFiveSContacts(updatedList);
    setIsEditing(false);
    setEditingContact(null);
  };

  const handleDeleteContact = (id: string) => {
    if (!confirm('Are you sure you want to remove this department contact record?')) return;

    const updatedList = contacts.filter(c => c.id !== id);
    setContacts(updatedList);
    saveStoredFiveSContacts(updatedList);
    api.delete5SContact(id).catch(() => {});
  };

  const handleTestSmtp = async () => {
    setIsTestingSmtp(true);
    setTestResult(null);
    try {
      const res = await api.test5SSmtp('is.support@sankaraeye.com');
      if (res.success) {
        setTestResult(`✓ SMTP verified successfully! Test email delivered to ${res.recipient} (MsgID: ${res.messageId.slice(0, 16)}...)`);
      } else {
        setTestResult('SMTP test failed');
      }
    } catch (err: any) {
      setTestResult(`✕ SMTP Error: ${err.message || 'Connection failed'}`);
    } finally {
      setIsTestingSmtp(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-5xl overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header with Signature Sankara Orange Gradient */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-xs">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-white">
                  5S Organizational Email Directory & Contact Master
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-white/25 text-white border border-white/30">
                  {contacts.length} Contacts
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium mt-0.5">
                Manage Department In-Charges, Unit Heads, and Zone Leads for automated 5S audit email dispatch
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Controls Strip */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
          
          {/* Unit Filter Tabs & Search */}
          <div className="flex flex-wrap items-center gap-2 flex-1">
            <div className="relative min-w-[200px] flex-1 max-w-xs">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search department, name, or email..."
                className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto max-w-md py-0.5">
              <button
                type="button"
                onClick={() => setSelectedUnitFilter('ALL')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedUnitFilter === 'ALL'
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                }`}
              >
                All Units ({contacts.length})
              </button>
              {availableUnits.map(unitCode => (
                <button
                  key={unitCode}
                  type="button"
                  onClick={() => setSelectedUnitFilter(unitCode)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedUnitFilter === unitCode
                      ? 'bg-orange-600 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200/70 border border-slate-200'
                  }`}
                >
                  {unitCode}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleTestSmtp}
              disabled={isTestingSmtp}
              className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              title="Test connection to smtp.zoho.com"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-orange-600 ${isTestingSmtp ? 'animate-spin' : ''}`} />
              <span>{isTestingSmtp ? 'Testing...' : 'Test SMTP'}</span>
            </button>

            {canEdit && (
              <button
                type="button"
                onClick={handleStartAdd}
                className="px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white text-xs font-black rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            )}
          </div>
        </div>

        {/* Test Result Banner */}
        {testResult && (
          <div className={`px-6 py-2.5 text-xs font-semibold flex items-center justify-between border-b ${
            testResult.startsWith('✓') ? 'bg-emerald-50 text-emerald-900 border-emerald-200' : 'bg-rose-50 text-rose-900 border-rose-200'
          }`}>
            <span>{testResult}</span>
            <button onClick={() => setTestResult(null)} className="text-slate-500 hover:text-slate-800 cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Unit Head Info Box for Selected Unit */}
        {selectedUnitFilter !== 'ALL' && FIVE_S_UNIT_HEAD_DIRECTORY[selectedUnitFilter] && (
          <div className="px-6 py-2.5 bg-orange-50/60 border-b border-orange-200/80 flex items-center justify-between text-xs text-orange-950">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-orange-600" />
              <span>
                <strong>{selectedUnitFilter} Unit Head (Default CC):</strong> {FIVE_S_UNIT_HEAD_DIRECTORY[selectedUnitFilter].name} ({FIVE_S_UNIT_HEAD_DIRECTORY[selectedUnitFilter].email})
              </span>
            </div>
            <span className="text-[11px] text-orange-800 font-medium">Automatic CC on all 5S audit reports</span>
          </div>
        )}

        {/* Modal Body / Table View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Unit</th>
                  <th className="py-3 px-4">Zone</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Dept In-Charge (TO)</th>
                  <th className="py-3 px-4">Zone In-Charge (CC)</th>
                  {canEdit && <th className="py-3 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={canEdit ? 6 : 5} className="py-12 text-center text-slate-400">
                      No contacts found matching your criteria.
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((c) => (
                    <tr key={c.id} className="hover:bg-orange-50/30 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-800 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-900 font-black text-[11px]">
                          {c.unitCode}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 font-medium whitespace-nowrap">
                        {c.zoneName}
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900">
                        {c.departmentName}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{c.deptInchargeName || '—'}</div>
                        <div className="text-[11px] text-orange-700 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-orange-500" />
                          <span>{c.deptInchargeEmail || 'No email registered'}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{c.zoneInchargeName || '—'}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" />
                          <span>{c.zoneInchargeEmail || 'No email registered'}</span>
                        </div>
                      </td>
                      {canEdit && (
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleStartEdit(c)}
                              className="p-1.5 text-slate-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                              title="Edit Contact"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteContact(c.id)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                              title="Delete Contact"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Showing <strong>{filteredContacts.length}</strong> of {contacts.length} registered 5S contacts
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

      {/* Edit / Add Modal Subdialog */}
      {isEditing && editingContact && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in zoom-in-95">
            <div className="bg-gradient-to-r from-orange-600 to-amber-600 px-5 py-3.5 text-white flex items-center justify-between">
              <h3 className="text-sm font-black tracking-tight">
                {contacts.some(c => c.id === editingContact.id) ? 'Edit 5S Contact Details' : 'Add New Department Contact'}
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-white/80 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Unit Code</label>
                  <input
                    type="text"
                    value={editingContact.unitCode}
                    onChange={(e) => setEditingContact({ ...editingContact, unitCode: e.target.value.toUpperCase() })}
                    placeholder="e.g. CBE, BLR, SMG, IND..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Zone Name</label>
                  <input
                    type="text"
                    value={editingContact.zoneName}
                    onChange={(e) => setEditingContact({ ...editingContact, zoneName: e.target.value })}
                    placeholder="e.g. Zone 1, Zone 2..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Department / Location Name *</label>
                <input
                  type="text"
                  value={editingContact.departmentName}
                  onChange={(e) => setEditingContact({ ...editingContact, departmentName: e.target.value })}
                  placeholder="e.g. Outpatient Pharmacy & Store"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold"
                />
              </div>

              <div className="p-3 bg-orange-50/60 rounded-xl border border-orange-200/70 space-y-3">
                <div className="font-bold text-orange-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-orange-600" />
                  <span>Department In-Charge (Primary Recipient TO)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Lead Name</label>
                    <input
                      type="text"
                      value={editingContact.deptInchargeName}
                      onChange={(e) => setEditingContact({ ...editingContact, deptInchargeName: e.target.value })}
                      placeholder="e.g. Dr. Rajesh Kumar"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email ID</label>
                    <input
                      type="email"
                      value={editingContact.deptInchargeEmail}
                      onChange={(e) => setEditingContact({ ...editingContact, deptInchargeEmail: e.target.value })}
                      placeholder="e.g. rajesh@sankaraeye.com"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-600" />
                  <span>Zone In-Charge (Default CC)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Zone Lead Name</label>
                    <input
                      type="text"
                      value={editingContact.zoneInchargeName}
                      onChange={(e) => setEditingContact({ ...editingContact, zoneInchargeName: e.target.value })}
                      placeholder="e.g. Ms. Saranya S"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">Zone Lead Email</label>
                    <input
                      type="email"
                      value={editingContact.zoneInchargeEmail}
                      onChange={(e) => setEditingContact({ ...editingContact, zoneInchargeEmail: e.target.value })}
                      placeholder="e.g. saranya@sankaraeye.com"
                      className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-5 py-3 border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 border border-slate-300 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveContact}
                className="px-4 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Contact</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
