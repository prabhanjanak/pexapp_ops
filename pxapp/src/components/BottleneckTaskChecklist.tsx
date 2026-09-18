import React, { useState } from 'react';
import { Bottleneck, BottleneckTask, User } from '../types';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  ListTodo,
  Sparkles,
  UserCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface BottleneckTaskChecklistProps {
  bottleneck: Bottleneck;
  unitId: string;
  currentUser: User;
  onUpdateBottleneck?: (unitId: string, bottleneckId: string, updates: Partial<Bottleneck>) => void;
  compact?: boolean;
  defaultExpanded?: boolean;
}

export const BottleneckTaskChecklist: React.FC<BottleneckTaskChecklistProps> = ({
  bottleneck,
  unitId,
  currentUser,
  onUpdateBottleneck,
  compact = false,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [newTaskText, setNewTaskText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const tasks: BottleneckTask[] = bottleneck.tasks || [];
  const completedCount = tasks.filter((t) => t.isCompleted).length;
  const totalCount = tasks.length;
  const allCompleted = totalCount > 0 && completedCount === totalCount;

  // Toggle single task completion
  const handleToggleTask = (taskId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!onUpdateBottleneck) return;

    const updatedTasks = tasks.map((t) => {
      if (t.id !== taskId) return t;
      const nextCompleted = !t.isCompleted;
      return {
        ...t,
        isCompleted: nextCompleted,
        completedAt: nextCompleted ? new Date().toISOString() : undefined,
        completedBy: nextCompleted ? currentUser.name : undefined,
        completedRole: nextCompleted ? currentUser.role : undefined
      };
    });

    const newCompletedCount = updatedTasks.filter((t) => t.isCompleted).length;
    let newPercent = bottleneck.percentComplete;
    let newStatus = bottleneck.status;

    // Proportional progress suggestion
    if (updatedTasks.length > 0) {
      newPercent = Math.round((newCompletedCount / updatedTasks.length) * 100);
      if (newPercent >= 100) newStatus = 'Completed';
      else if (newPercent > 0) newStatus = 'In progress';
      else newStatus = 'Pending';
    }

    onUpdateBottleneck(unitId, bottleneck.id, {
      tasks: updatedTasks,
      percentComplete: newPercent,
      status: newStatus,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  // Add a new task point
  const handleAddTask = (e?: React.FormEvent) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (!newTaskText.trim() || !onUpdateBottleneck) return;

    const newTask: BottleneckTask = {
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      text: newTaskText.trim(),
      isCompleted: false,
      createdBy: currentUser.name,
      createdRole: currentUser.role
    };

    const updatedTasks = [...tasks, newTask];
    setNewTaskText('');
    setIsAdding(false);
    setIsExpanded(true);

    onUpdateBottleneck(unitId, bottleneck.id, {
      tasks: updatedTasks,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  // Delete a task point
  const handleDeleteTask = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!onUpdateBottleneck) return;

    const updatedTasks = tasks.filter((t) => t.id !== taskId);
    onUpdateBottleneck(unitId, bottleneck.id, {
      tasks: updatedTasks,
      lastUpdated: new Date().toISOString().split('T')[0]
    });
  };

  return (
    <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
      
      {/* Header Pill / Toggle Bar */}
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black transition-all cursor-pointer border ${
            allCompleted
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : totalCount > 0
              ? 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
          }`}
          title="Click to view/manage action points checklist"
        >
          <ListTodo className="w-3.5 h-3.5 text-orange-600" />
          <span>Action Tasks</span>
          <span
            className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
              allCompleted
                ? 'bg-emerald-600 text-white'
                : totalCount > 0
                ? 'bg-amber-600 text-white'
                : 'bg-slate-300 text-slate-700'
            }`}
          >
            {completedCount}/{totalCount}
          </span>
          {isExpanded ? <ChevronUp className="w-3 h-3 text-slate-500 ml-0.5" /> : <ChevronDown className="w-3 h-3 text-slate-500 ml-0.5" />}
        </button>

        {!isExpanded && totalCount > 0 && (
          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                className={`h-full ${allCompleted ? 'bg-emerald-500' : 'bg-orange-500'}`}
              />
            </div>
            <span className="font-extrabold text-[10px] text-slate-700">
              {Math.round((completedCount / totalCount) * 100)}%
            </span>
          </div>
        )}

        {!isAdding && isExpanded && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-[11px] font-bold text-orange-600 hover:text-orange-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Point</span>
          </button>
        )}
      </div>

      {/* Expanded Checklist Container */}
      {isExpanded && (
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-3 space-y-2 animate-in fade-in duration-150">
          
          {/* Tasks List */}
          {tasks.length === 0 ? (
            <p className="text-[11px] text-slate-400 py-1 text-center font-medium">
              No action points yet. Add checklist items for the unit team below.
            </p>
          ) : (
            <div className="space-y-1.5 divide-y divide-slate-100/80">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className={`pt-1.5 first:pt-0 flex items-start justify-between gap-2.5 group/item transition-colors ${
                    task.isCompleted ? 'opacity-70' : ''
                  }`}
                >
                  <button
                    type="button"
                    onClick={(e) => handleToggleTask(task.id, e)}
                    className="flex items-start gap-2 text-left cursor-pointer flex-1 group/btn"
                  >
                    {task.isCompleted ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5 group-hover/btn:scale-110 transition-transform" />
                    ) : (
                      <Circle className="w-4 h-4 text-slate-400 group-hover/btn:text-orange-500 shrink-0 mt-0.5 group-hover/btn:scale-110 transition-transform" />
                    )}

                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-xs font-bold leading-snug break-words ${
                          task.isCompleted
                            ? 'line-through text-slate-400'
                            : 'text-slate-800 group-hover/btn:text-orange-700'
                        }`}
                      >
                        {task.text}
                      </p>

                      <div className="flex items-center gap-2 mt-0.5 text-[9px] text-slate-400 flex-wrap">
                        {task.createdRole && (
                          <span>By {task.createdRole}</span>
                        )}
                        {task.isCompleted && task.completedBy && (
                          <span className="text-emerald-700 font-bold">
                            ✓ Done by {task.completedBy}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => handleDeleteTask(task.id, e)}
                    className="opacity-0 group-hover/item:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all cursor-pointer rounded"
                    title="Delete task point"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quick Add Inline Form */}
          {isAdding ? (
            <form onSubmit={handleAddTask} className="pt-2 border-t border-slate-200/80 flex items-center gap-2">
              <input
                type="text"
                autoFocus
                placeholder="e.g. Verify morning OPD counter staffing, DBCS clearance..."
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-white border border-orange-300 rounded-xl text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                type="submit"
                disabled={!newTaskText.trim()}
                className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsAdding(false);
                  setNewTaskText('');
                }}
                className="px-2 py-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
              >
                Cancel
              </button>
            </form>
          ) : (
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsAdding(true)}
                className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 hover:text-orange-700 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add action checklist point</span>
              </button>

              <span className="text-[10px] text-slate-400 font-medium">
                Click circle to mark task as done
              </span>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
