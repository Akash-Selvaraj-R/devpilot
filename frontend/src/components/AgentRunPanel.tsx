import { Search, Map, Code, FlaskConical, Bug, FileText, Check, Loader2, AlertCircle, Circle } from 'lucide-react';
import clsx from 'clsx';
import type { AgentRun, AgentStatus } from '../types';

interface AgentRunPanelProps {
  agents: AgentRun[];
}

const agentConfig: Record<string, { icon: React.ComponentType<{ className?: string }>; color: string }> = {
  'Repository Analyzer': { icon: Search, color: 'text-blue-400' },
  'Planning Agent': { icon: Map, color: 'text-purple-400' },
  'Implementation Agent': { icon: Code, color: 'text-brand-400' },
  'Test Agent': { icon: FlaskConical, color: 'text-amber-400' },
  'Debugging Agent': { icon: Bug, color: 'text-orange-400' },
  'Evaluation Agent': { icon: FileText, color: 'text-emerald-400' },
};

const statusConfig: Record<AgentStatus, { label: string; icon: React.ComponentType<{ className?: string }>; color: string; bgColor: string }> = {
  queued: { label: 'QUEUED', icon: Circle, color: 'text-surface-500', bgColor: 'bg-surface-800/50' },
  active: { label: 'ACTIVE', icon: Loader2, color: 'text-brand-400', bgColor: 'bg-brand-500/10' },
  completed: { label: 'COMPLETE', icon: Check, color: 'text-emerald-400', bgColor: 'bg-emerald-500/10' },
  failed: { label: 'FAILED', icon: AlertCircle, color: 'text-red-400', bgColor: 'bg-red-500/10' },
};

function StatusIndicator({ status }: { status: AgentStatus }) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <span className={clsx('inline-flex items-center gap-1 text-[10px] font-semibold tracking-wider', config.color)}>
      <Icon className={clsx('w-3 h-3', status === 'active' && 'animate-spin')} />
      {config.label}
    </span>
  );
}

export default function AgentRunPanel({ agents }: AgentRunPanelProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
          AI Agents
        </h3>
        <span className="text-[10px] text-surface-600">
          {agents.filter((a) => a.status === 'completed').length}/{agents.length}
        </span>
      </div>

      {agents.map((agent) => {
        const config = agentConfig[agent.name] || { icon: Circle, color: 'text-surface-400' };
        const Icon = config.icon;
        const isActive = agent.status === 'active';

        return (
          <div
            key={agent.id}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-300',
              isActive && 'bg-brand-500/5 border border-brand-500/20',
              agent.status === 'completed' && 'bg-surface-800/30',
              agent.status === 'failed' && 'bg-red-500/5 border border-red-500/20',
              agent.status === 'queued' && 'bg-surface-800/20'
            )}
          >
            <div
              className={clsx(
                'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300',
                isActive && 'bg-brand-500/20',
                agent.status === 'completed' && 'bg-emerald-500/10',
                agent.status === 'failed' && 'bg-red-500/10',
                agent.status === 'queued' && 'bg-surface-800/50'
              )}
            >
              <Icon
                className={clsx(
                  'w-4 h-4 transition-colors duration-300',
                  isActive && 'text-brand-400',
                  agent.status === 'completed' && 'text-emerald-400',
                  agent.status === 'failed' && 'text-red-400',
                  agent.status === 'queued' && 'text-surface-500',
                  isActive && agent.name === 'Implementation Agent' && 'animate-spin'
                )}
              />
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={clsx(
                  'text-sm font-medium truncate',
                  isActive && 'text-white',
                  agent.status === 'completed' && 'text-surface-300',
                  agent.status === 'failed' && 'text-red-300',
                  agent.status === 'queued' && 'text-surface-500'
                )}
              >
                {agent.name}
              </p>
            </div>

            <StatusIndicator status={agent.status} />
          </div>
        );
      })}
    </div>
  );
}
