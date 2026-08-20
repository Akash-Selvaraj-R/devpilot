import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, Terminal, Brain, Map, Code, FlaskConical, Bug, FileText, Folder, X, Zap, RotateCcw, Scale, HelpCircle } from 'lucide-react';
import clsx from 'clsx';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCommand: (command: string) => void;
  projectStatus?: string;
}

interface Command {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  requiresProject?: boolean;
  disabled?: boolean;
}

const commands: Command[] = [
  { id: 'analyze', label: 'Run Repository Analysis', icon: Brain, shortcut: 'Ctrl+Enter', requiresProject: true },
  { id: 'plan', label: 'Generate Implementation Plan', icon: Map, requiresProject: true },
  { id: 'implement', label: 'Generate Code Changes', icon: Code, requiresProject: true },
  { id: 'test', label: 'Run Tests', icon: FlaskConical, shortcut: 'Ctrl+Shift+T', requiresProject: true },
  { id: 'debug', label: 'Diagnose Failures', icon: Bug, requiresProject: true },
  { id: 'report', label: 'Generate Engineering Report', icon: FileText, requiresProject: true },
  { id: 'start-demo', label: 'Start Demo', icon: Zap },
  { id: 'reset-demo', label: 'Reset Demo', icon: RotateCcw },
  { id: 'open-health', label: 'Open Engineering Health', icon: Folder },
  { id: 'judge-mode', label: 'Open Judge Mode', icon: Scale },
  { id: 'open-about', label: 'About DevPilot', icon: HelpCircle },
  { id: 'dashboard', label: 'Open Dashboard', icon: Folder },
  { id: 'new-project', label: 'New Project', icon: Terminal },
];

export default function CommandPalette({ isOpen, onClose, onCommand, projectStatus: _projectStatus }: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filtered[selectedIndex]) {
          onCommand(filtered[selectedIndex].id);
          onClose();
        }
        break;
      case 'Escape':
        onClose();
        break;
    }
  }, [filtered, selectedIndex, onCommand, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-surface-950/80 backdrop-blur-sm" onClick={onClose} />

      {/* Palette */}
      <div className="relative w-full max-w-lg mx-4 rounded-xl border border-surface-700/50 bg-surface-900 shadow-2xl overflow-hidden animate-scale-in">
        {/* Search */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-surface-800/50">
          <Search className="w-5 h-5 text-surface-500" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a command..."
            className="flex-1 bg-transparent text-sm text-white placeholder-surface-500 focus:outline-none"
          />
          <button onClick={onClose} className="text-surface-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Commands */}
        <div className="max-h-80 overflow-y-auto py-2">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-surface-500">
              No commands found
            </div>
          ) : (
            filtered.map((cmd, index) => {
              const Icon = cmd.icon;
              const isSelected = index === selectedIndex;

              return (
                <button
                  key={cmd.id}
                  onClick={() => {
                    onCommand(cmd.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={clsx(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    isSelected ? 'bg-surface-800/50' : 'hover:bg-surface-800/30'
                  )}
                >
                  <Icon className={clsx(
                    'w-4 h-4',
                    isSelected ? 'text-brand-400' : 'text-surface-500'
                  )} />
                  <span className={clsx(
                    'text-sm flex-1',
                    isSelected ? 'text-white' : 'text-surface-300'
                  )}>
                    {cmd.label}
                  </span>
                  {cmd.shortcut && (
                    <span className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded font-mono">
                      {cmd.shortcut}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
