import { useState, useEffect } from 'react';
import { Brain, Trash2, AlertCircle, Lightbulb, Wrench, Plus, X } from 'lucide-react';
import { getMemory, deleteMemory, clearAllMemory, createMemory } from '../services/api';
import type { DeveloperMemory } from '../types';
import Button from './Button';
import clsx from 'clsx';

const categoryConfig: Record<string, { icon: typeof Brain; color: string; label: string }> = {
  preference: { icon: Lightbulb, color: 'text-amber-400', label: 'Preferences' },
  recurring_issue: { icon: AlertCircle, color: 'text-red-400', label: 'Recurring Issues' },
  technology: { icon: Wrench, color: 'text-blue-400', label: 'Technologies' },
  pattern: { icon: Brain, color: 'text-purple-400', label: 'Patterns' },
};

interface DeveloperMemoryPanelProps {
  compact?: boolean;
}

export default function DeveloperMemoryPanel({ compact }: DeveloperMemoryPanelProps) {
  const [memories, setMemories] = useState<DeveloperMemory[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [newCategory, setNewCategory] = useState<string>('preference');
  const [newContent, setNewContent] = useState('');
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    loadMemory();
  }, []);

  async function loadMemory() {
    try {
      const data = await getMemory();
      setMemories(data);
      setLoadError(null);
    } catch (err) {
      setLoadError('Failed to load memories from server');
      setMemories([]);
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch {
      setMemories(prev => prev.filter(m => m.id !== id));
    }
  }

  async function handleClearAll() {
    try {
      await clearAllMemory();
      setMemories([]);
    } catch {
      setMemories([]);
    }
  }

  async function handleAdd() {
    if (!newContent.trim()) return;
    try {
      const created = await createMemory({ category: newCategory, content: newContent.trim(), source: 'manual' });
      setMemories(prev => [created, ...prev]);
      setNewContent('');
      setShowAdd(false);
    } catch {
      setLoadError('Failed to save memory to server');
    }
  }

  const grouped = memories.reduce<Record<string, DeveloperMemory[]>>((acc, m) => {
    if (!acc[m.category]) acc[m.category] = [];
    acc[m.category].push(m);
    return acc;
  }, {});

  if (compact) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Developer Memory</h3>
          <span className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded">{memories.length} items</span>
        </div>
        {loadError && (
          <div className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-1.5 rounded">
            {loadError}
          </div>
        )}
        {memories.length === 0 && !loadError ? (
          <p className="text-xs text-surface-500 text-center py-4">No memories stored yet</p>
        ) : (
          <div className="space-y-2">
            {Object.entries(grouped).map(([cat, items]) => {
              const config = categoryConfig[cat] || categoryConfig.preference;
              const Icon = config.icon;
              return (
                <div key={cat}>
                  <div className="flex items-center gap-1.5 mb-1">
                    <Icon className={clsx('w-3 h-3', config.color)} />
                    <span className="text-[10px] font-semibold text-surface-500 uppercase">{config.label}</span>
                  </div>
                  {items.map(m => (
                    <div key={m.id} className="flex items-center gap-2 py-1 group">
                      <span className="text-xs text-surface-400 flex-1 truncate">{m.content}</span>
                      <button onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3 text-surface-600 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-brand-400" />
          <h3 className="text-sm font-semibold text-surface-200">What DevPilot Knows</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => setShowAdd(!showAdd)} icon={<Plus className="w-3 h-3" />}>
            Add
          </Button>
          {memories.length > 0 && (
            <Button variant="ghost" size="sm" onClick={handleClearAll} icon={<Trash2 className="w-3 h-3" />}>
              Clear All
            </Button>
          )}
        </div>
      </div>

      {loadError && (
        <div className="mb-3 text-xs text-amber-400 bg-amber-500/10 px-3 py-2 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {loadError}
        </div>
      )}

      {showAdd && (
        <div className="mb-4 p-3 rounded-lg bg-surface-800/30 border border-surface-700/50 space-y-2">
          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              className="px-2 py-1 rounded bg-surface-900 border border-surface-700 text-xs text-surface-300"
            >
              <option value="preference">Preference</option>
              <option value="recurring_issue">Recurring Issue</option>
              <option value="technology">Technology</option>
              <option value="pattern">Pattern</option>
            </select>
            <input
              type="text"
              value={newContent}
              onChange={e => setNewContent(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
              placeholder="Enter memory content..."
              className="flex-1 px-2 py-1 rounded bg-surface-900 border border-surface-700 text-xs text-surface-300 placeholder-surface-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={() => setShowAdd(false)} icon={<X className="w-3 h-3" />}>Cancel</Button>
            <Button size="sm" onClick={handleAdd}>Save</Button>
          </div>
        </div>
      )}

      {memories.length === 0 && !loadError ? (
        <div className="text-center py-8">
          <Brain className="w-8 h-8 text-surface-700 mx-auto mb-2" />
          <p className="text-sm text-surface-500">No memories stored yet</p>
          <p className="text-xs text-surface-600 mt-1">DevPilot will learn your preferences over time</p>
        </div>
      ) : (
        <div className="space-y-4">
          {Object.entries(grouped).map(([cat, items]) => {
            const config = categoryConfig[cat] || categoryConfig.preference;
            const Icon = config.icon;
            return (
              <div key={cat}>
                <div className="flex items-center gap-1.5 mb-2">
                  <Icon className={clsx('w-3.5 h-3.5', config.color)} />
                  <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">{config.label}</span>
                  <span className="text-[10px] text-surface-600">({items.length})</span>
                </div>
                <div className="space-y-1">
                  {items.map(m => (
                    <div key={m.id} className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-surface-800/30 group transition-colors">
                      <span className="text-xs text-surface-400 flex-1">{m.content}</span>
                      {m.source === 'auto_extract' && (
                        <span className="text-[9px] text-brand-400/60 bg-brand-500/10 px-1 py-0.5 rounded">AUTO</span>
                      )}
                      <button onClick={() => handleDelete(m.id)} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3 h-3 text-surface-600 hover:text-red-400" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
