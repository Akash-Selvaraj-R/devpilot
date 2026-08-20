import { useMemo } from 'react';
import { Award, Shield, TestTube, Layers, Code, FileText, Info } from 'lucide-react';
import clsx from 'clsx';
import type { EngineeringHealth } from '../types';
import { getScoreColor } from '../utils/format';

interface EngineeringHealthCardProps {
  health: EngineeringHealth;
  showLabel?: boolean;
  onExplain?: () => void;
}

const categories = [
  { key: 'security' as const, label: 'Security', icon: Shield },
  { key: 'testing' as const, label: 'Testing', icon: TestTube },
  { key: 'code_quality' as const, label: 'Quality', icon: Code },
  { key: 'architecture' as const, label: 'Architecture', icon: Layers },
  { key: 'documentation' as const, label: 'Docs', icon: FileText },
];

export default function EngineeringHealthCard({ health, showLabel = true, onExplain }: EngineeringHealthCardProps) {
  const radarPoints = useMemo(() => {
    const cx = 100;
    const cy = 100;
    const maxR = 70;
    const angleStep = (2 * Math.PI) / categories.length;

    return categories.map((cat, i) => {
      const value = health[cat.key] || 0;
      const angle = angleStep * i - Math.PI / 2;
      const r = (value / 100) * maxR;
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    });
  }, [health]);

  const radarPath = radarPoints.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

  const gridLevels = [20, 40, 60, 80, 100];

  return (
    <div className="rounded-xl glass p-5">
      {showLabel && (
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-brand-400" />
            <h3 className="text-sm font-semibold text-surface-200">Engineering Health</h3>
          </div>
          {onExplain && (
            <button
              onClick={onExplain}
              className="flex items-center gap-1 text-[10px] text-surface-500 hover:text-surface-300 transition-colors"
            >
              <Info className="w-3 h-3" />
              How calculated?
            </button>
          )}
        </div>
      )}

      <div className="flex items-center gap-6">
        {/* Radar Chart */}
        <div className="relative w-48 h-48 flex-shrink-0">
          <svg viewBox="0 0 200 200" className="w-full h-full">
            {/* Grid */}
            {gridLevels.map((level) => {
              const r = (level / 100) * 70;
              const points = categories.map((_, i) => {
                const angle = ((2 * Math.PI) / categories.length) * i - Math.PI / 2;
                return `${100 + r * Math.cos(angle)},${100 + r * Math.sin(angle)}`;
              }).join(' ');
              return (
                <polygon
                  key={level}
                  points={points}
                  fill="none"
                  stroke="rgba(51, 65, 85, 0.3)"
                  strokeWidth="0.5"
                />
              );
            })}

            {/* Axis lines */}
            {categories.map((_, i) => {
              const angle = ((2 * Math.PI) / categories.length) * i - Math.PI / 2;
              const x = 100 + 70 * Math.cos(angle);
              const y = 100 + 70 * Math.sin(angle);
              return (
                <line
                  key={i}
                  x1="100"
                  y1="100"
                  x2={x}
                  y2={y}
                  stroke="rgba(51, 65, 85, 0.2)"
                  strokeWidth="0.5"
                />
              );
            })}

            {/* Data polygon */}
            <path
              d={radarPath}
              fill="rgba(99, 102, 241, 0.15)"
              stroke="rgba(99, 102, 241, 0.8)"
              strokeWidth="1.5"
            />

            {/* Data points */}
            {radarPoints.map((p, i) => (
              <circle
                key={i}
                cx={p.x}
                cy={p.y}
                r="3"
                fill="#6366f1"
                stroke="rgba(99, 102, 241, 0.5)"
                strokeWidth="1"
              />
            ))}

            {/* Labels */}
            {categories.map((cat, i) => {
              const angle = ((2 * Math.PI) / categories.length) * i - Math.PI / 2;
              const x = 100 + 85 * Math.cos(angle);
              const y = 100 + 85 * Math.sin(angle);
              const value = health[cat.key] || 0;
              return (
                <g key={cat.key}>
                  <text
                    x={x}
                    y={y - 6}
                    textAnchor="middle"
                    className="fill-surface-400 text-[9px] font-medium"
                  >
                    {cat.label}
                  </text>
                  <text
                    x={x}
                    y={y + 6}
                    textAnchor="middle"
                    className={clsx('text-[10px] font-bold', getScoreColor(value).replace('text-', 'fill-'))}
                  >
                    {value}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Score summary */}
        <div className="flex-1">
          <div className="text-center mb-4">
            <div className={clsx('text-4xl font-bold', getScoreColor(health.overall))}>
              {health.overall}
            </div>
            <div className="text-xs text-surface-500 mt-1">/ 100</div>
            {health.rating && (
              <div className={clsx(
                'text-xs font-semibold mt-2 px-3 py-1 rounded-full inline-block',
                health.overall >= 85 ? 'bg-emerald-500/10 text-emerald-400' :
                health.overall >= 70 ? 'bg-brand-500/10 text-brand-400' :
                'bg-amber-500/10 text-amber-400'
              )}>
                {health.rating}
              </div>
            )}
          </div>

          <div className="space-y-2">
            {categories.map(({ key, label, icon: Icon }) => {
              const value = health[key] || 0;
              return (
                <div key={key} className="flex items-center gap-2">
                  <Icon className="w-3 h-3 text-surface-500" />
                  <span className="text-xs text-surface-400 w-20">{label}</span>
                  <div className="flex-1 h-1.5 bg-surface-800 rounded-full overflow-hidden">
                    <div
                      className={clsx(
                        'h-full rounded-full transition-all duration-700',
                        value >= 90 ? 'bg-emerald-500' :
                        value >= 80 ? 'bg-brand-500' :
                        value >= 70 ? 'bg-amber-500' :
                        'bg-red-500'
                      )}
                      style={{ width: `${value}%` }}
                    />
                  </div>
                  <span className={clsx('text-xs font-medium w-8 text-right', getScoreColor(value))}>
                    {value}
                  </span>
                </div>
              );
            })}
          </div>

          <p className="text-[10px] text-surface-600 mt-3 text-center">
            DevPilot Engineering Health — AI-assisted assessment
          </p>
        </div>
      </div>
    </div>
  );
}
