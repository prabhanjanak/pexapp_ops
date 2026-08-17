import React, { useEffect, useState } from 'react';
import { AuditLog } from '../types';
import { api } from '../services/api';
import { X, History, RefreshCw, Activity, CheckCircle, Edit, Trash2, Sparkles, Database } from 'lucide-react';

interface AuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogModal: React.FC<AuditLogModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getAuditLogs();
      setLogs(data);
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'CREATE_BOTTLENECK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle className="w-3 h-3 text-emerald-600" /> Created
          </span>
        );
      case 'UPDATE_BOTTLENECK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-orange-50 text-orange-800 border border-orange-200">
            <Edit className="w-3 h-3 text-orange-600" /> Updated
          </span>
        );
      case 'DELETE_BOTTLENECK':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-50 text-rose-800 border border-rose-200">
            <Trash2 className="w-3 h-3 text-rose-600" /> Deleted
          </span>
        );
      case 'INITIALIZE_ASSESSMENT':
      case 'SEED_ALL_UNITS':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-50 text-amber-900 border border-amber-200">
            <Sparkles className="w-3 h-3 text-amber-600" /> Initialized
          </span>
        );
      case 'DB_RESET':
      case 'SYSTEM_INIT':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
            <Database className="w-3 h-3 text-slate-600" /> System
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Header with Orange Gradient */}
        <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white px-6 py-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2.5">
            <History className="w-5 h-5 text-amber-100" />
            <div>
              <h2 className="text-lg font-black tracking-tight">Quality Operations & Audit Trail</h2>
              <p className="text-xs text-amber-100 font-medium">Real-time change tracking across 14 hospital units</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="refresh-audit-logs"
              onClick={fetchLogs}
              title="Refresh logs"
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              type="button"
              id="close-audit-modal"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-3">
          {loading && logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto text-orange-500 mb-2" />
              <p className="text-xs">Loading audit trail...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <History className="w-8 h-8 mx-auto text-slate-300 mb-2" />
              <p className="text-sm font-bold text-slate-700">No activity logs found</p>
              <p className="text-xs text-slate-400 mt-1">Actions performed on bottlenecks will appear here live.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {logs.map((log) => (
                <div
                  key={log.id}
                  className="bg-white p-3.5 rounded-xl border border-slate-200 hover:border-orange-200 hover:shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {getActionBadge(log.action)}
                      <span className="text-xs font-black text-slate-800">
                        {log.unitName || 'System'}
                      </span>
                      {log.userRole && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          by {log.userRole}
                        </span>
                      )}
                    </div>

                    {log.bottleneckTitle && (
                      <p className="text-xs font-semibold text-slate-700">
                        {log.bottleneckTitle}
                      </p>
                    )}

                    {log.details && (
                      <div className="text-[11px] text-slate-500 font-mono bg-slate-50 px-2 py-1 rounded-md max-w-xl truncate">
                        {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                      </div>
                    )}
                  </div>

                  <div className="text-[11px] text-slate-400 whitespace-nowrap shrink-0 text-left sm:text-right font-medium">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    <div className="text-[10px] text-slate-400">
                      {new Date(log.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            id="close-audit-footer"
            onClick={onClose}
            className="px-5 py-2 text-sm font-bold text-slate-700 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
