import React, { useState, useRef, useEffect } from 'react';
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
  // Default directly to Chatbox directives so communication is immediately accessible
  const [activeTab, setActiveTab] = useState<'directives' | 'tasks'>('directives');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setBottleneck(initialBottleneck);
  }, [initialBottleneck]);

  // Auto-scroll to latest message in chatbox
  useEffect(() => {
    if (activeTab === 'directives' && isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  }, [bottleneck?.comments, activeTab, isOpen]);

  if (!isOpen || !bottleneck) return null;

  const comments = bottleneck.comments || [];
  const tasks = bottleneck.tasks || [];
  const completedTasksCount = tasks.filter((t) => t.isCompleted).length;
  const unitId = bottleneck.unitId || 'unit-coimbatore';

  const handleUpdate = async (targetUnitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => {
    try {
      const updated = await api.updateBottleneck(targetUnitId, bottleneckId, updates);
      setBottleneck(updated);
      onCommentAdded(updated);
      if (onUpdateBottleneck) {
        onUpdateBottleneck(targetUnitId, bottleneckId, updates);
      }
    } catch (err: any) {
      console.error('Failed to update bottleneck tasks:', err);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanMsg = message.trim();
    if (!cleanMsg || isSubmitting) return;

    setError(null);
    setIsSubmitting(true);

    // 1. Optimistic Instant Injection so the chatbox feels instantaneous
    const optimisticComment = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      authorName: currentUser.name,
      authorRole: currentUser.role,
      authorEmail: currentUser.email,
      message: cleanMsg,
      createdAt: new Date().toISOString()
    };

    const optimisticBottleneck: Bottleneck = {
      ...bottleneck,
      comments: [...comments, optimisticComment]
    };

    setBottleneck(optimisticBottleneck);
    onCommentAdded(optimisticBottleneck);
    if (onUpdateBottleneck) {
      onUpdateBottleneck(unitId, bottleneck.id, optimisticBottleneck);
    }
    setMessage('');

    // 2. Persist to PostgreSQL backend
    try {
      const updated = await api.addComment(bottleneck.id, {
        authorName: currentUser.name,
        authorRole: currentUser.role,
        authorEmail: currentUser.email,
        message: cleanMsg
      });
      if (updated && updated.comments) {
        setBottleneck(updated);
        onCommentAdded(updated);
        if (onUpdateBottleneck) {
          onUpdateBottleneck(unitId, bottleneck.id, updated);
        }
      }
    } catch (err: any) {
      console.warn('Backend comment notice (retaining optimistic post):', err.message);
    } finally {
      setIsSubmitting(false);
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const insertQuickTag = (tagText: string) => {
    setMessage((prev) => (prev ? `${prev} [${tagText}] ` : `[${tagText}] `));
    textareaRef.current?.focus();
  };

  const getRoleBadgeStyle = (role: string) => {
    const r = (role || '').toLowerCase();
    if (r.includes('super admin')) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (r.includes('president')) return 'bg-purple-100 text-purple-800 border-purple-200';
    if (r.includes('operations')) return 'bg-amber-100 text-amber-800 border-amber-200';
    if (r.includes('unit head')) return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-slate-100 text-slate-800 border-slate-200';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[88vh] max-h-[720px] overflow-hidden">
        
        {/* Chatbox Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50/90 flex items-start justify-between gap-3 shrink-0">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-100 text-orange-800 border border-orange-200/60">
                {bottleneck.category}
              </span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-bold text-slate-500">ID: {bottleneck.id}</span>
              <span className="text-xs text-slate-300">•</span>
              <span className="text-xs font-extrabold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/50">
                {bottleneck.unitName || bottleneck.unitId}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug truncate">
              {bottleneck.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Real-time Team Discussion & Action Directives
            </p>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center border-b border-slate-200 bg-slate-100/70 px-4 sm:px-6 gap-2 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('directives')}
            className={`pb-2.5 px-3.5 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'directives'
                ? 'border-orange-600 text-orange-700 bg-white/80 rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-orange-600" />
            <span>Discussion Chatbox</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-orange-100 text-orange-800">
              {comments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tasks')}
            className={`pb-2.5 px-3.5 text-xs font-black flex items-center gap-1.5 border-b-2 transition-all cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-orange-600 text-orange-700 bg-white/80 rounded-t-xl shadow-2xs'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ListTodo className="w-3.5 h-3.5 text-orange-600" />
            <span>Action Checklist Tasks</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700">
              {completedTasksCount}/{tasks.length}
            </span>
          </button>
        </div>

        {/* Main Body Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 bg-slate-50/50">
          
          {activeTab === 'tasks' ? (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider mb-1 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Action Items & Checklist</span>
                </h4>
                <p className="text-xs text-slate-500 mb-4">
                  Check off items when completed. All team members can add and execute task checkpoints.
                </p>

                <BottleneckTaskChecklist
                  bottleneck={bottleneck}
                  unitId={unitId}
                  currentUser={currentUser}
                  onUpdateBottleneck={handleUpdate}
                  defaultExpanded={true}
                />
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              {comments.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-14 h-14 rounded-2xl bg-orange-100/70 text-orange-600 mx-auto flex items-center justify-center mb-3 shadow-inner">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-black text-slate-800">No Messages Yet</h4>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 leading-relaxed">
                    Be the first to share an update, post a directive, or coordinate on this bottleneck. Everyone with access can participate!
                  </p>
                </div>
              ) : (
                comments.map((c) => {
                  const isMe =
                    (currentUser.email && c.authorEmail && c.authorEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
                    (c.authorName && c.authorName.toLowerCase() === currentUser.name.toLowerCase());

                  const dateFormatted = c.createdAt
                    ? new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
                    : 'Just now';

                  return (
                    <div
                      key={c.id}
                      className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} transition-all`}
                    >
                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 text-xs ${
                          isMe
                            ? 'bg-gradient-to-r from-orange-600 to-amber-500 text-white rounded-tr-xs shadow-md shadow-orange-600/15'
                            : 'bg-white border border-slate-200 text-slate-800 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        {/* Author Tag */}
                        <div className={`flex items-center gap-2 mb-1.5 ${isMe ? 'justify-end text-orange-100' : 'justify-between'}`}>
                          <div className="flex items-center gap-1.5">
                            {!isMe && (
                              <div className="w-5 h-5 rounded-full bg-slate-900 text-white text-[9px] font-black flex items-center justify-center">
                                {(c.authorName || 'SK').slice(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span className={`font-black ${isMe ? 'text-white' : 'text-slate-900'}`}>
                              {isMe ? 'You' : c.authorName}
                            </span>
                            <span
                              className={`px-1.5 py-0.2 rounded-md text-[9px] font-extrabold border ${
                                isMe
                                  ? 'bg-white/20 text-white border-white/30'
                                  : getRoleBadgeStyle(c.authorRole)
                              }`}
                            >
                              {c.authorRole}
                            </span>
                          </div>

                          <span className={`text-[10px] font-medium ml-2 ${isMe ? 'text-orange-100' : 'text-slate-400'}`}>
                            {dateFormatted}
                          </span>
                        </div>

                        {/* Comment Message */}
                        <p className={`whitespace-pre-wrap leading-relaxed font-medium ${isMe ? 'text-white' : 'text-slate-700'}`}>
                          {c.message}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

        </div>

        {/* Chatbox Input Footer (Always active when in directives chat tab) */}
        {activeTab === 'directives' && (
          <form onSubmit={handleSendMessage} className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0">
            
            {error && (
              <div className="mb-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Quick Directive Action Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 no-scrollbar">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider shrink-0 mr-1">
                Quick Chips:
              </span>
              {[
                '🚨 Critical Action Needed',
                '✅ Approved by Ops',
                '⏳ Status Update Requested',
                '📸 Please Upload Photos',
                '🎯 Target Date Met'
              ].map((tag) => (
                <button
                  type="button"
                  key={tag}
                  onClick={() => insertQuickTag(tag)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-orange-50 hover:text-orange-700 text-[10.5px] font-bold text-slate-600 transition-colors cursor-pointer border border-slate-200/80 whitespace-nowrap shrink-0"
                >
                  {tag}
                </button>
              ))}
            </div>

            {/* Textarea + Send Action */}
            <div className="flex items-end gap-2 bg-slate-50 border border-slate-200 focus-within:border-orange-500 focus-within:bg-white rounded-2xl p-2 transition-all shadow-inner">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={`Type a directive or message as ${currentUser.name}... (Press Enter to send)`}
                rows={2}
                className="w-full bg-transparent text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none resize-none px-2 py-1"
              />

              <button
                type="submit"
                disabled={isSubmitting || !message.trim()}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xs font-black shadow-md shadow-orange-600/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? 'Sending...' : 'Send'}</span>
              </button>
            </div>
            
            <p className="text-[10px] text-slate-400 font-medium mt-1.5 text-right">
              Press <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Enter</kbd> to send • <kbd className="px-1 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-mono">Shift+Enter</kbd> for new line
            </p>

          </form>
        )}

      </div>
    </div>
  );
};
