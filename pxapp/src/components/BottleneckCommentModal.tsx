import React, { useState } from 'react';
import { Bottleneck, User } from '../types';
import { api } from '../services/api';
import { BottleneckTaskChecklist } from './BottleneckTaskChecklist';
import {
  MessageSquare,
  X,
  Send,
  ShieldCheck,
  Building2,
  Clock,
  UserCheck,
  Sparkles,
  AlertCircle,
  ListTodo,
  CheckCircle2
} from 'lucide-react';

interface BottleneckCommentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bottleneck: Bottleneck | null;
  currentUser: User;
  onCommentAdded: (updatedBottleneck: Bottleneck) => void;
  onUpdateBottleneck?: (unitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => void;
}

export const BottleneckCommentModal: React.FC<BottleneckCommentModalProps> = ({
  isOpen,
  onClose,
  bottleneck: initialBottleneck,
  currentUser,
  onCommentAdded,
  onUpdateBottleneck
}) => {
  const [bottleneck, setBottleneck] = useState<Bottleneck | null>(initialBottleneck);
  const [activeTab, setActiveTab] = useState<'directives' | 'tasks'>('tasks');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    setBottleneck(initialBottleneck);
  }, [initialBottleneck]);

  if (!isOpen || !bottleneck) return null;

  const comments = bottleneck.comments || [];
  const tasks = bottleneck.tasks || [];
  const completedTasksCount = tasks.filter(t => t.isCompleted).length;

  const handleUpdate = async (unitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => {
    try {
      const updated = await api.updateBottleneck(unitId, bottleneckId, updates);
      setBottleneck(updated);
      onCommentAdded(updated);
      if (onUpdateBottleneck) {
        onUpdateBottleneck(unitId, bottleneckId, updates);
      }
    } catch (err: any) {
      console.error('Failed to update bottleneck tasks:', err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const updated = await api.addComment(bottleneck.id, {
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorEmail: currentUser.email,
        message: message.trim()
      });
      setMessage('');
      setBottleneck(updated);
      onCommentAdded(updated);
    } catch (err: any) {
      setError(err.message || 'Failed to post directive comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const insertQuickTag = (tagText: string) => {
    setMessage(prev => (prev ? `${prev} [${tagText}] ` : `[${tagText}] `));
  };

  const getRoleBadgeColor = (role: string) => {
    if (role.includes('Super Admin')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (role.includes('Operations')) return 'bg-amber-100 text-amber-800 border-amber-200';
    return 'bg-blue-100 text-blue-800 border-blue-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800">
                {bottleneck.category}
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-600">ID: {bottleneck.id}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-slate-700">{bottleneck.unitName || bottleneck.unitId}</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 leading-snug">
              {bottleneck.title}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Action Points Checklist & Executive Directives
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/60 px-6 gap-2 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-orange-600 text-orange-700 bg-white/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 text-orange-600" />
            <span>Action Checklist Tasks</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800">
              {completedTasksCount}/{tasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('directives')}
            className={`pb-2.5 px-3 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'directives'
                ? 'border-orange-600 text-orange-700 bg-white/70 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
            <span>Directives & Comments</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700">
              {comments.length}
            </span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          
          {activeTab === 'tasks' ? (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Action Items & Checklist for Unit Team</span>
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Check off items when completed. Operations and Unit Heads can add more action points at any time.
                </p>

                <BottleneckTaskChecklist
                  bottleneck={bottleneck}
                  unitId={bottleneck.unitId}
                  currentUser={currentUser}
                  onUpdateBottleneck={handleUpdate}
                  defaultExpanded={true}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {comments.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 mx-auto flex items-center justify-center mb-3">
                    <MessageSquare className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">No directives posted yet</p>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Central Operations and Management can provide instructions or feedback below.
                  </p>
                </div>
              ) : (
                comments.map((c) => (
                  <div
                    key={c.id}
                    className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-bold flex items-center justify-center">
                          {c.authorName.slice(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs font-black text-slate-900">{c.authorName}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold border ${getRoleBadgeColor(c.authorRole)}`}>
                          {c.authorRole}
                        </span>
                      </div>

                      <span className="text-[10px] text-slate-400 font-medium">
                        {c.createdAt ? new Date(c.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Recent'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed pl-8 whitespace-pre-wrap font-medium">
                      {c.message}
                    </p>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

        {/* Comment Input Footer (visible when in directives tab or as quick directive) */}
        {activeTab === 'directives' && (
          <form onSubmit={handleAddComment} className="p-4 sm:p-6 border-t border-slate-200 bg-white">
            
            {error && (
              <div className="mb-3 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Tag Pills */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Quick Directives:</span>
              {['Urgent Action Needed', 'Approved by Operations', 'Provide Photo Evidence', 'Assigned to Unit Lead', 'Review Target Date'].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => insertQuickTag(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-[11px] font-semibold text-slate-600 transition-colors cursor-pointer border border-slate-200/60"
                >
                  + {tag}
                </button>
              ))}
            </div>

            <div className="relative">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder={`Post executive directive or remark as ${currentUser.name} (${currentUser.role})...`}
                rows={3}
                className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
              />

              <div className="mt-2 flex items-center justify-between">
                <p className="text-[11px] text-slate-400 font-medium">
                  Directives are logged in permanent hospital audit history.
                </p>

                <button
                  type="submit"
                  disabled={isSubmitting || !message.trim()}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Posting...' : 'Post Directive'}</span>
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

