import { Scale, Clock, Play, X, ArrowRight } from 'lucide-react';
import Button from './Button';

interface JudgeModeProps {
  onStartDemo: () => void;
  isVisible: boolean;
  onClose: () => void;
}

export default function JudgeMode({ onStartDemo, isVisible, onClose }: JudgeModeProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface-950/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md mx-4 rounded-xl border border-surface-800/50 bg-surface-950 p-6 gradient-border">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-surface-500 hover:text-white transition-colors"
          aria-label="Close judge mode"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
            <Scale className="w-5 h-5 text-brand-400" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-brand-400">Judge Mode</h2>
            <p className="text-xs text-surface-500">Guided walkthrough</p>
          </div>
        </div>

        <p className="text-sm text-surface-300 mb-5 leading-relaxed">
          Explore DevPilot's complete AI workflow. See how it understands repositories,
          plans implementation, writes code, tests, debugs, and evaluates engineering quality.
        </p>

        <div className="space-y-3 mb-5">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-800/30">
            <ArrowRight className="w-4 h-4 text-brand-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-surface-500">Recommended demo</p>
              <p className="text-sm text-white font-medium">"Add JWT authentication"</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-800/30">
            <Clock className="w-4 h-4 text-surface-400 flex-shrink-0" />
            <div>
              <p className="text-xs text-surface-500">Estimated walkthrough</p>
              <p className="text-sm text-surface-300">3 minutes</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-5 text-[10px] text-surface-600">
          <span className="bg-surface-800 px-1.5 py-0.5 rounded font-mono">Ctrl+K</span>
          <span>→ Start Demo</span>
        </div>

        <div className="flex gap-3">
          <Button onClick={onStartDemo} icon={<Play className="w-4 h-4" />} className="flex-1">
            Start Guided Demo
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
