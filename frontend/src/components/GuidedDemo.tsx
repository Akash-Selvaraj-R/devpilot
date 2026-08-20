import { ArrowRight, SkipForward, X, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

interface Step {
  label: string;
  description: string;
  detail?: string;
}

interface GuidedDemoProps {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  steps: Step[];
  onNext: () => void;
  onSkip: () => void;
  onClose: () => void;
}

export default function GuidedDemo({
  isActive,
  currentStep,
  totalSteps,
  steps,
  onNext,
  onSkip,
  onClose,
}: GuidedDemoProps) {
  if (!isActive) return null;

  const step = steps[currentStep - 1];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 glass border-t border-surface-800/50 animate-slide-up">
      <div className="px-6 py-4 max-w-4xl mx-auto">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-surface-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2 mb-3">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={clsx(
                'w-2 h-2 rounded-full transition-colors',
                i < currentStep ? 'bg-emerald-500' : i === currentStep - 1 ? 'bg-brand-500' : 'bg-surface-600'
              )}
            />
          ))}
          <span className="ml-2 text-xs font-mono text-surface-400">
            STEP {currentStep} / {totalSteps}
          </span>
        </div>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-xs font-medium text-brand-400 flex items-center gap-1">
            <ChevronRight className="w-3 h-3" />
            {step?.label}
          </span>
        </div>

        <p className="text-sm text-surface-300 mb-1">{step?.description}</p>
        {step?.detail && (
          <p className="text-xs text-surface-500 mb-3">{step.detail}</p>
        )}

        <div className="flex items-center gap-4 mt-3">
          <button
            onClick={onNext}
            className="inline-flex items-center gap-2 bg-brand-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-brand-400 transition-colors"
          >
            Continue
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onSkip}
            className="inline-flex items-center gap-1.5 text-surface-400 hover:text-white text-sm transition-colors"
          >
            Skip Demo
            <SkipForward className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
