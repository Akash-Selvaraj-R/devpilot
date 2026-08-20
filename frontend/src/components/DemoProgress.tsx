import clsx from 'clsx';

interface DemoProgressProps {
  currentStep: number;
  totalSteps?: number;
  steps: string[];
}

export default function DemoProgress({ currentStep, steps }: DemoProgressProps) {
  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((label, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;
        const isPending = i > currentStep;

        return (
          <div key={label} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={clsx(
                  'w-2 h-2 rounded-full transition-all duration-300',
                  isCompleted && 'bg-emerald-500',
                  isCurrent && 'bg-brand-500 animate-pulse',
                  isPending && 'bg-transparent border border-surface-600'
                )}
              />
              <span
                className={clsx(
                  'text-[10px] font-medium',
                  isCompleted && 'text-emerald-400',
                  isCurrent && 'text-brand-400',
                  isPending && 'text-surface-600'
                )}
              >
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 mx-1">
                <div
                  className={clsx(
                    'h-0.5 w-full rounded-full transition-all duration-500',
                    isCompleted ? 'bg-emerald-500/40' : 'bg-surface-800/50'
                  )}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
