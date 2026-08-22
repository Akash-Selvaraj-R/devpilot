import { useState, useEffect } from 'react';
import { GraduationCap, Zap, Search, Target, ChevronDown, Check } from 'lucide-react';
import { getPersonalities } from '../services/api';
import type { Personality } from '../types';
import clsx from 'clsx';

const iconMap: Record<string, typeof GraduationCap> = {
  teacher: GraduationCap,
  lightning: Zap,
  search: Search,
  target: Target,
};

interface PersonalitySelectorProps {
  selected: string;
  onSelect: (id: string) => void;
  compact?: boolean;
}

export default function PersonalitySelector({ selected, onSelect, compact }: PersonalitySelectorProps) {
  const [personalities, setPersonalities] = useState<Personality[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    getPersonalities().then(setPersonalities).catch(() => {
      setPersonalities([
        { id: 'mentor', name: 'Mentor', icon: 'teacher', description: 'Learn step-by-step', system_instructions: '', verbosity: 'detailed', reveal_solutions: false, teaching_style: 'socratic' },
        { id: 'senior_engineer', name: 'Senior Engineer', icon: 'lightning', description: 'Production-focused', system_instructions: '', verbosity: 'concise', reveal_solutions: true, teaching_style: 'direct' },
        { id: 'strict_reviewer', name: 'Strict Reviewer', icon: 'search', description: 'Zero-compromise code quality', system_instructions: '', verbosity: 'thorough', reveal_solutions: true, teaching_style: 'evaluative' },
        { id: 'interview_coach', name: 'Interview Coach', icon: 'target', description: 'Think before you code', system_instructions: '', verbosity: 'guided', reveal_solutions: false, teaching_style: 'socratic' },
      ]);
    });
  }, []);

  const current = personalities.find(p => p.id === selected) || personalities[0];

  if (compact) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-800/50 border border-surface-700/50 text-sm text-surface-300 hover:text-white hover:bg-surface-800 transition-colors"
        >
          {current && iconMap[current.icon] && (() => {
            const Icon = iconMap[current.icon];
            return <Icon className="w-3.5 h-3.5 text-brand-400" />;
          })()}
          <span className="font-medium">{current?.name || 'Select'}</span>
          <ChevronDown className={clsx('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
        </button>
        {open && (
          <div className="absolute top-full mt-1 right-0 w-64 glass rounded-xl border border-surface-700/50 shadow-xl z-50 py-1">
            {personalities.map(p => {
              const Icon = iconMap[p.icon] || Zap;
              return (
                <button
                  key={p.id}
                  onClick={() => { onSelect(p.id); setOpen(false); }}
                  className={clsx(
                    'w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-800/50 transition-colors',
                    selected === p.id && 'bg-brand-500/10'
                  )}
                >
                  <div className={clsx(
                    'w-8 h-8 rounded-lg flex items-center justify-center',
                    selected === p.id ? 'bg-brand-500/20' : 'bg-surface-800/50'
                  )}>
                    <Icon className={clsx('w-4 h-4', selected === p.id ? 'text-brand-400' : 'text-surface-400')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-surface-200">{p.name}</div>
                    <div className="text-xs text-surface-500 truncate">{p.description}</div>
                  </div>
                  {selected === p.id && <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">AI Persona</h3>
      <div className="space-y-1.5">
        {personalities.map(p => {
          const Icon = iconMap[p.icon] || Zap;
          return (
            <button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all',
                selected === p.id
                  ? 'bg-brand-500/10 border border-brand-500/30 ring-1 ring-brand-500/20'
                  : 'bg-surface-900/30 border border-surface-800/50 hover:border-surface-700/50 hover:bg-surface-800/30'
              )}
            >
              <div className={clsx(
                'w-10 h-10 rounded-lg flex items-center justify-center',
                selected === p.id ? 'bg-brand-500/20' : 'bg-surface-800/50'
              )}>
                <Icon className={clsx('w-5 h-5', selected === p.id ? 'text-brand-400' : 'text-surface-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-surface-200">{p.name}</div>
                <div className="text-xs text-surface-500">{p.description}</div>
              </div>
              {selected === p.id && (
                <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
