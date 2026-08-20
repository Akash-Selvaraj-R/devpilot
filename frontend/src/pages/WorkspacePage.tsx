import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Search,
  Map,
  Code,
  FlaskConical,
  Bug,
  FileText,
  RefreshCw,
  GitBranch,
  Folder,
  Play,
  Zap,
  RotateCcw,
  Scale,
  Info,
  Check,
  HelpCircle,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';
import StatusBadge from '../components/StatusBadge';
import FileTree from '../components/FileTree';
import WorkflowIndicator from '../components/WorkflowIndicator';
import AgentRunPanel from '../components/AgentRunPanel';
import EventStreamPanel from '../components/EventStreamPanel';
import DiffViewer from '../components/DiffViewer';
import TestExecutionCenter from '../components/TestExecutionCenter';
import DebuggingPanel from '../components/DebuggingPanel';
import EngineeringHealthCard from '../components/EngineeringHealthCard';
import EngineeringImpactCard from '../components/EngineeringImpactCard';
import FinalReport from '../components/FinalReport';
import CommandPalette from '../components/CommandPalette';
import LoadingSpinner from '../components/LoadingSpinner';
import Card from '../components/Card';
import AgentDecisionLog from '../components/AgentDecisionLog';
import JudgeMode from '../components/JudgeMode';
import GuidedDemo from '../components/GuidedDemo';
import DemoProgress from '../components/DemoProgress';
import EngineeringHealthExplanation from '../components/EngineeringHealthExplanation';
import AboutDevPilot from '../components/AboutDevPilot';
import type { Project, Task, CodeChange, TestRun, AgentRun, WorkflowPhase, EventStreamEntry, AgentDecision } from '../types';
import {
  getProject,
  analyzeProject,
  planProject,
  implementProject,
  testProject,
  debugProject,
  generateReport,
  getTask,
} from '../services/api';
import { formatDate } from '../utils/format';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import {
  demoAnalysisResult,
  demoPlanResult,
  demoCodeChanges,
  demoTestRun,
  demoDebugResult,
  demoReportResult,
  demoEventStream,
  demoDecisions,
  demoRunSummary,
  guidedDemoSteps,
} from '../data/demoData';
import clsx from 'clsx';

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [activeAction, setActiveAction] = useState<string | null>(null);
  const [codeChanges, setCodeChanges] = useState<CodeChange[]>([]);
  const [testRuns, setTestRuns] = useState<TestRun[]>([]);
  const [engineeringTask, setEngineeringTask] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [planResult, setPlanResult] = useState<any>(null);
  const [reportResult, setReportResult] = useState<any>(null);
  const [debugResult, setDebugResult] = useState<any>(null);
  const [showCommandPalette, setShowCommandPalette] = useState(false);
  const [eventStream, setEventStream] = useState<EventStreamEntry[]>([]);
  const [workflowPhase, setWorkflowPhase] = useState<WorkflowPhase>('think');
  const [completedPhases, setCompletedPhases] = useState<WorkflowPhase[]>([]);
  const [rightPanel, setRightPanel] = useState<'agents' | 'health' | 'impact'>('agents');
  const [isDemoMode, setIsDemoMode] = useState(false);

  const [decisions, setDecisions] = useState<AgentDecision[]>([]);
  const [showJudgeMode, setShowJudgeMode] = useState(false);
  const [guidedDemoActive, setGuidedDemoActive] = useState(false);
  const [guidedDemoStep, setGuidedDemoStep] = useState(0);
  const [showHealthExplanation, setShowHealthExplanation] = useState(false);
  const [showAboutDevPilot, setShowAboutDevPilot] = useState(false);
  const [copiedSummary, setCopiedSummary] = useState(false);

  const agents: AgentRun[] = [
    { id: 'analyzer', name: 'Repository Analyzer', icon: 'search', status: completedPhases.includes('think') ? 'completed' : workflowPhase === 'think' ? 'active' : 'queued' },
    { id: 'planner', name: 'Planning Agent', icon: 'map', status: completedPhases.includes('plan') ? 'completed' : workflowPhase === 'plan' ? 'active' : 'queued' },
    { id: 'implementer', name: 'Implementation Agent', icon: 'code', status: completedPhases.includes('act') ? 'completed' : workflowPhase === 'act' ? 'active' : 'queued' },
    { id: 'tester', name: 'Test Agent', icon: 'flask', status: completedPhases.includes('verify') ? 'completed' : workflowPhase === 'verify' ? 'active' : 'queued' },
    { id: 'debugger', name: 'Debugging Agent', icon: 'bug', status: completedPhases.includes('recover') ? 'completed' : workflowPhase === 'recover' ? 'active' : 'queued' },
    { id: 'evaluator', name: 'Evaluation Agent', icon: 'file-text', status: completedPhases.includes('ship') ? 'completed' : workflowPhase === 'ship' ? 'active' : 'queued' },
  ];

  const addEvent = useCallback((agent: string, message: string, type: EventStreamEntry['type'] = 'info') => {
    const now = new Date();
    const timestamp = now.toLocaleTimeString('en-US', { hour12: false });
    setEventStream((prev) => [...prev, { timestamp, agent, message, type }]);
  }, []);

  const loadProject = useCallback(async () => {
    if (!id) return;
    try {
      const data = await getProject(id);
      setProject(data);
      const storedTask = sessionStorage.getItem(`project_task_${id}`);
      if (storedTask) {
        setEngineeringTask(storedTask);
      }
    } catch {
      console.error('Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  function resetDemoState() {
    setIsDemoMode(false);
    setAnalysisResult(null);
    setPlanResult(null);
    setCodeChanges([]);
    setTestRuns([]);
    setDebugResult(null);
    setReportResult(null);
    setEventStream([]);
    setCompletedPhases([]);
    setWorkflowPhase('think');
    setEngineeringTask('');
    setDecisions([]);
    setRightPanel('agents');
  }

  function loadDemoData() {
    resetDemoState();
    setIsDemoMode(true);
    setAnalysisResult(demoAnalysisResult);
    setPlanResult(demoPlanResult);
    setCodeChanges(demoCodeChanges.map((c) => ({
      ...c,
      task_id: 'demo',
      created_at: new Date().toISOString(),
    })));
    setTestRuns([{
      ...demoTestRun,
      created_at: new Date().toISOString(),
    }]);
    setDebugResult(demoDebugResult);
    setReportResult(demoReportResult);
    setEventStream(demoEventStream);
    setDecisions(demoDecisions);
    setCompletedPhases(['think', 'plan', 'act', 'verify', 'recover', 'ship']);
    setWorkflowPhase('ship');
    setEngineeringTask('Add JWT authentication to the application');
    setRightPanel('health');
  }

  function handleResetDemo() {
    resetDemoState();
    if (id) {
      loadProject();
    }
  }

  async function handleAction(action: string) {
    if (!project || !id) return;

    setActiveAction(action);
    setCodeChanges([]);
    setTestRuns([]);

    const phaseMap: Record<string, WorkflowPhase> = {
      analyze: 'think',
      plan: 'plan',
      implement: 'act',
      test: 'verify',
      debug: 'recover',
      report: 'ship',
    };

    const agentMap: Record<string, string> = {
      analyze: 'analyzer',
      plan: 'planner',
      implement: 'implementer',
      test: 'tester',
      debug: 'debugger',
      report: 'evaluator',
    };

    setWorkflowPhase(phaseMap[action] || 'think');
    addEvent(agentMap[action] || 'system', `Starting ${action}...`, 'info');

    try {
      let task: Task;
      switch (action) {
        case 'analyze':
          task = await analyzeProject(id);
          setActiveTask(task);
          addEvent('analyzer', 'Scanning repository...', 'info');
          await pollTaskCompletion(task.id);
          addEvent('analyzer', 'Repository analysis complete', 'success');
          break;
        case 'plan':
          if (!engineeringTask) {
            alert('Please enter an engineering task first');
            return;
          }
          task = await planProject(id, engineeringTask);
          setActiveTask(task);
          addEvent('planner', 'Building implementation plan...', 'info');
          await pollTaskCompletion(task.id);
          addEvent('planner', 'Plan generated', 'success');
          break;
        case 'implement': {
          const planTask = activeTask;
          if (!planTask || planTask.status !== 'completed') {
            alert('Please run Plan first');
            return;
          }
          task = await implementProject(id, planTask.id);
          setActiveTask(task);
          addEvent('implementer', 'Generating code changes...', 'info');
          await pollTaskCompletion(task.id);
          addEvent('implementer', 'Code changes generated', 'success');
          break;
        }
        case 'test': {
          const implTask = activeTask;
          if (!implTask || implTask.status !== 'completed') {
            alert('Please run Implement first');
            return;
          }
          task = await testProject(id, implTask.id);
          setActiveTask(task);
          addEvent('tester', 'Running test suite...', 'info');
          await pollTaskCompletion(task.id);
          addEvent('tester', 'Test execution complete', 'success');
          break;
        }
        case 'debug': {
          const testTask = activeTask;
          if (!testTask || testTask.status !== 'completed') {
            alert('Please run Test first');
            return;
          }
          task = await debugProject(id, testTask.id);
          setActiveTask(task);
          addEvent('debugger', 'Analyzing failures...', 'info');
          await pollTaskCompletion(task.id);
          addEvent('debugger', 'Diagnosis complete', 'success');
          break;
        }
        case 'report': {
          const debugTask = activeTask;
          if (!debugTask || debugTask.status !== 'completed') {
            alert('Please run Debug first');
            return;
          }
          task = await generateReport(id, debugTask.id);
          setActiveTask(task);
          addEvent('evaluator', 'Generating report...', 'info');
          await pollTaskCompletion(task.id);
          addEvent('evaluator', 'Report generated', 'success');
          break;
        }
        default:
          return;
      }

      const phase = phaseMap[action];
      if (phase) {
        setCompletedPhases((prev) => [...prev, phase]);
      }
    } catch (err) {
      addEvent('system', `Failed to ${action}: ${err}`, 'error');
      console.error(`Failed to ${action}:`, err);
    } finally {
      setActiveAction(null);
    }
  }

  async function pollTaskCompletion(taskId: string) {
    let attempts = 0;
    const maxAttempts = 120;
    while (attempts < maxAttempts) {
      try {
        const updatedTask = await getTask(taskId);
        setActiveTask(updatedTask);

        if (updatedTask.status === 'completed' || updatedTask.status === 'failed') {
          if (updatedTask.result) {
            try {
              const result = JSON.parse(updatedTask.result);
              if (result.summary && result.score) setReportResult(result);
              if (result.summary && result.frameworks) setAnalysisResult(result);
              if (result.goal) setPlanResult(result);
              if (result.root_cause) setDebugResult(result);
              if (result.changes) {
                setCodeChanges(result.changes.map((c: any) => ({
                  id: c.file || '',
                  task_id: taskId,
                  file_path: c.file || c.file_path,
                  old_content: '',
                  new_content: c.content || '',
                  content: c.content || '',
                  diff: c.diff || '',
                  operation: c.operation || 'modify',
                  created_at: new Date().toISOString(),
                })));
              }
              if (result.command) {
                setTestRuns([{
                  id: taskId,
                  task_id: taskId,
                  command: result.command,
                  exit_code: result.exit_code,
                  stdout: result.stdout || '',
                  stderr: result.stderr || '',
                  duration: result.duration || 0,
                  created_at: new Date().toISOString(),
                }]);
              }
            } catch {}
          }
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
        attempts++;
      } catch {
        break;
      }
    }
  }

  function handleCommandPaletteCommand(command: string) {
    if (command === 'dashboard') {
      window.location.href = '/dashboard';
      return;
    }
    if (command === 'new-project') {
      window.location.href = '/projects/new';
      return;
    }
    if (command === 'start-demo') {
      loadDemoData();
      return;
    }
    if (command === 'reset-demo') {
      handleResetDemo();
      return;
    }
    if (command === 'open-health') {
      setRightPanel('health');
      return;
    }
    if (command === 'open-about') {
      setShowAboutDevPilot(true);
      return;
    }
    if (command === 'judge-mode') {
      setShowJudgeMode(true);
      return;
    }
    handleAction(command);
  }

  function handleGuidedDemoNext() {
    if (guidedDemoStep < guidedDemoSteps.length - 1) {
      setGuidedDemoStep((prev) => prev + 1);
    } else {
      setGuidedDemoActive(false);
      setGuidedDemoStep(0);
    }
  }

  function handleGuidedDemoSkip() {
    setGuidedDemoActive(false);
    setGuidedDemoStep(0);
  }

  function handleStartGuidedDemo() {
    setShowJudgeMode(false);
    loadDemoData();
    setGuidedDemoActive(true);
    setGuidedDemoStep(0);
  }

  function handleCopySummary() {
    navigator.clipboard.writeText(demoRunSummary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  }

  useKeyboardShortcuts({
    onCommandPalette: () => setShowCommandPalette(true),
    onClose: () => {
      setShowCommandPalette(false);
      setShowHealthExplanation(false);
      setShowAboutDevPilot(false);
      setShowJudgeMode(false);
    },
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
          <LoadingSpinner message="Loading workspace..." size="lg" />
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] gap-4">
          <p className="text-surface-400">Project not found</p>
          <Link to="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="h-[calc(100vh-3.5rem)] flex flex-col">
        {/* Top toolbar */}
        <div className="glass border-b border-surface-800/50 px-4 py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-surface-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <div>
                <h1 className="text-sm font-semibold text-white flex items-center gap-2">
                  {project.name}
                  {isDemoMode && (
                    <span className="text-[10px] font-semibold text-brand-400 bg-brand-500/10 px-1.5 py-0.5 rounded">
                      DEMO MODE
                    </span>
                  )}
                  <StatusBadge status={project.status} size="sm" />
                </h1>
                <div className="flex items-center gap-2 text-xs text-surface-500 mt-0.5">
                  <GitBranch className="w-3 h-3" />
                  {project.branch}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAboutDevPilot(true)}
                icon={<HelpCircle className="w-3.5 h-3.5" />}
              >
                About
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowJudgeMode(true)}
                icon={<Scale className="w-3.5 h-3.5" />}
              >
                Judge Mode
              </Button>
              {isDemoMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetDemo}
                  icon={<RotateCcw className="w-3.5 h-3.5" />}
                >
                  Reset Demo
                </Button>
              )}
              {!isDemoMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={loadDemoData}
                  icon={<Zap className="w-3.5 h-3.5" />}
                >
                  Load Demo
                </Button>
              )}
              {[
                { key: 'analyze', label: 'Analyze', icon: Search },
                { key: 'plan', label: 'Plan', icon: Map },
                { key: 'implement', label: 'Implement', icon: Code },
                { key: 'test', label: 'Test', icon: FlaskConical },
                { key: 'debug', label: 'Debug', icon: Bug },
                { key: 'report', label: 'Report', icon: FileText },
              ].map(({ key, label, icon: Icon }) => (
                <Button
                  key={key}
                  variant="ghost"
                  size="sm"
                  loading={activeAction === key}
                  onClick={() => handleAction(key)}
                  icon={<Icon className="w-3.5 h-3.5" />}
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Workflow indicator */}
        <div className="border-b border-surface-800/50 bg-surface-900/30 px-6 py-3">
          <WorkflowIndicator
            currentPhase={workflowPhase}
            completedPhases={completedPhases}
          />
        </div>

        {/* Demo progress bar */}
        {isDemoMode && (
          <div className="border-b border-surface-800/50 bg-surface-900/20 px-6 py-2">
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-semibold text-surface-500 uppercase tracking-wider">
                DevPilot Demo
              </span>
              <div className="flex-1">
                <DemoProgress
                  currentStep={completedPhases.length}
                  totalSteps={8}
                  steps={['Analysis', 'Plan', 'Build', 'Diff', 'Test', 'Debug', 'Verify', 'Report']}
                />
              </div>
            </div>
          </div>
        )}

        {/* Main content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left sidebar - Repository */}
          <div className="w-[240px] border-r border-surface-800/50 bg-surface-950 flex flex-col">
            <div className="px-4 py-3 border-b border-surface-800/50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">
                  Repository
                </span>
                <button
                  onClick={loadProject}
                  className="text-surface-500 hover:text-white transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {analysisResult?.structure ? (
                <FileTree node={analysisResult.structure} />
              ) : (
                <div className="text-center py-8">
                  <Folder className="w-8 h-8 text-surface-700 mx-auto mb-2" />
                  <p className="text-xs text-surface-500">
                    Run Analyze to see file structure
                  </p>
                </div>
              )}
            </div>

            {/* Analysis summary with Repository Intelligence */}
            {analysisResult && (
              <div className="border-t border-surface-800/50 p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-surface-400 uppercase tracking-wider">
                    Repository Intelligence
                  </span>
                  <span className="text-[10px] text-surface-600 bg-surface-800 px-1.5 py-0.5 rounded">
                    {isDemoMode ? 'DEMO' : 'LIVE'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center">
                  <div className="px-2 py-1.5 rounded-lg bg-surface-800/30">
                    <div className="text-sm font-bold text-white">{analysisResult.files_count || 0}</div>
                    <div className="text-[10px] text-surface-500">Files</div>
                  </div>
                  <div className="px-2 py-1.5 rounded-lg bg-surface-800/30">
                    <div className="text-sm font-bold text-white">{analysisResult.frameworks?.length || 0}</div>
                    <div className="text-[10px] text-surface-500">Frameworks</div>
                  </div>
                </div>
                {analysisResult.languageBreakdown && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-surface-500 uppercase">Languages</span>
                    {analysisResult.languageBreakdown.map((lang: any) => (
                      <div key={lang.name} className="flex items-center gap-2 text-[10px]">
                        <span className="text-surface-400 w-16">{lang.name}</span>
                        <div className="flex-1 h-1 bg-surface-800 rounded-full overflow-hidden">
                          <div className="h-full bg-brand-500/60 rounded-full" style={{ width: `${lang.percentage}%` }} />
                        </div>
                        <span className="text-surface-500 w-6 text-right">{lang.percentage}%</span>
                      </div>
                    ))}
                  </div>
                )}
                {analysisResult.keyFindings && (
                  <div className="space-y-1">
                    <span className="text-[10px] font-semibold text-surface-500 uppercase">Key Findings</span>
                    {analysisResult.keyFindings.map((finding: string, i: number) => (
                      <div key={i} className="flex items-center gap-1.5 text-[10px] text-emerald-400">
                        <Check className="w-3 h-3 flex-shrink-0" />
                        {finding}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Center - Main content */}
          <div className="flex-1 flex flex-col overflow-hidden bg-surface-950">
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Engineering task input */}
                {!engineeringTask && (
                  <div className="glass rounded-xl p-4">
                    <label className="block text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">
                      Engineering Task
                    </label>
                    <div className="flex gap-2">
                      <textarea
                        value={engineeringTask}
                        onChange={(e) => {
                          setEngineeringTask(e.target.value);
                          if (id) {
                            sessionStorage.setItem(`project_task_${id}`, e.target.value);
                          }
                        }}
                        placeholder="Describe what you want to build..."
                        rows={2}
                        className="flex-1 px-3 py-2 rounded-lg bg-surface-900 border border-surface-800 text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                      />
                      <Button
                        size="sm"
                        onClick={() => handleAction('analyze')}
                        icon={<Play className="w-3.5 h-3.5" />}
                      >
                        Start
                      </Button>
                    </div>
                  </div>
                )}

                {/* Agent Timeline with decisions */}
                {eventStream.length > 0 && (
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                      AI Engineering Timeline
                    </h3>
                    {eventStream.map((event, index) => (
                      <div key={index}>
                        <div className="flex items-start gap-3 py-1.5 animate-in" style={{ animationDelay: `${index * 30}ms` }}>
                          <span className="text-[10px] text-surface-600 font-mono w-16 flex-shrink-0 mt-0.5">
                            {event.timestamp}
                          </span>
                          <span className={clsx(
                            'text-[10px] font-semibold w-24 text-right flex-shrink-0 mt-0.5',
                            event.agent === 'analyzer' && 'text-blue-400',
                            event.agent === 'planner' && 'text-purple-400',
                            event.agent === 'implementer' && 'text-brand-400',
                            event.agent === 'tester' && 'text-amber-400',
                            event.agent === 'debugger' && 'text-orange-400',
                            event.agent === 'evaluator' && 'text-emerald-400',
                            event.agent === 'system' && 'text-surface-500',
                          )}>
                            {event.agent}
                          </span>
                          <span className={clsx(
                            'text-sm',
                            event.type === 'success' && 'text-emerald-400',
                            event.type === 'error' && 'text-red-400',
                            event.type === 'warning' && 'text-amber-400',
                            event.type === 'info' && 'text-surface-300',
                            event.type === 'decision' && 'text-brand-400 font-medium',
                          )}>
                            {event.type === 'decision' && '🧠 '}
                            {event.message}
                          </span>
                        </div>
                        {/* Show decision card inline if this is a decision event */}
                        {event.type === 'decision' && decisions.length > 0 && (
                          <div className="ml-20 mb-2">
                            {decisions
                              .filter((d) => d.timestamp === event.timestamp)
                              .map((decision) => (
                                <AgentDecisionLog key={decision.id} decision={decision} />
                              ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Analysis result with data label */}
                {analysisResult && (
                  <Card header={
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-surface-200">Repository Analysis</h3>
                      <span className="text-[10px] font-semibold text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
                        {isDemoMode ? 'DEMO DATA' : 'LIVE'}
                      </span>
                    </div>
                  }>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-surface-500">Framework</span>
                        <p className="text-sm text-surface-200">{analysisResult.frameworks?.join(', ') || 'None detected'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-surface-500">Files</span>
                        <p className="text-sm text-surface-200">{analysisResult.files_count || 0}</p>
                      </div>
                      <div>
                        <span className="text-xs text-surface-500">Languages</span>
                        <p className="text-sm text-surface-200">{Object.keys(analysisResult.languages || {}).join(', ') || 'None'}</p>
                      </div>
                      <div>
                        <span className="text-xs text-surface-500">Dependencies</span>
                        <p className="text-sm text-surface-200">{Object.values(analysisResult.dependencies || {}).flat().length || 0}</p>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Plan result with data label */}
                {planResult && (
                  <Card header={
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-semibold text-surface-200">Implementation Plan</h3>
                      <span className="text-[10px] font-semibold text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
                        {isDemoMode ? 'DEMO DATA' : 'AI ASSESSMENT'}
                      </span>
                    </div>
                  }>
                    <p className="text-sm text-surface-200 mb-4">
                      <span className="text-surface-500">Goal:</span> {planResult.goal}
                    </p>
                    <div className="space-y-2">
                      {planResult.steps?.map((step: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 text-sm">
                          <span className="w-6 h-6 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-brand-400">{step.id}</span>
                          </span>
                          <div className="flex-1">
                            <span className="text-surface-300">{step.description}</span>
                            {step.reason && (
                              <p className="text-xs text-surface-500 mt-0.5">{step.reason}</p>
                            )}
                            {step.files_involved && step.files_involved.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {step.files_involved.map((f: string) => (
                                  <span key={f} className="text-[10px] font-mono text-surface-500 bg-surface-800/50 px-1.5 py-0.5 rounded">
                                    {f}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}

                {/* Code changes */}
                {codeChanges.length > 0 && (
                  <DiffViewer changes={codeChanges} />
                )}

                {/* Test execution */}
                {testRuns.length > 0 && (
                  <TestExecutionCenter
                    testRuns={testRuns}
                    onDiagnose={() => handleAction('debug')}
                  />
                )}

                {/* Debugging */}
                {debugResult && (
                  <DebuggingPanel diagnosis={debugResult} />
                )}

                {/* Final report */}
                {reportResult && (
                  <FinalReport
                    report={reportResult}
                    isDemoMode={isDemoMode}
                    onCopySummary={handleCopySummary}
                    copiedSummary={copiedSummary}
                  />
                )}

                {/* Empty state */}
                {!analysisResult && !planResult && codeChanges.length === 0 && testRuns.length === 0 && !reportResult && eventStream.length === 0 && (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-2xl bg-brand-500/10 flex items-center justify-center mx-auto mb-4">
                      <Zap className="w-8 h-8 text-brand-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Ready to engineer
                    </h3>
                    <p className="text-sm text-surface-400 max-w-md mx-auto mb-6">
                      Enter your engineering task above and click Start, or use the action buttons to run each step individually.
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <Button onClick={() => handleAction('analyze')} icon={<Play className="w-4 h-4" />}>
                        Run Full Pipeline
                      </Button>
                      <Button variant="secondary" onClick={() => handleAction('analyze')} icon={<Search className="w-4 h-4" />}>
                        Analyze Only
                      </Button>
                      <Button variant="ghost" onClick={loadDemoData} icon={<Zap className="w-4 h-4" />}>
                        Load Demo Data
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Event stream (collapsible) */}
            <div className="border-t border-surface-800/50 px-6 pb-2">
              <EventStreamPanel events={eventStream} collapsed={true} />
            </div>
          </div>

          {/* Right sidebar - Agents / Health / Impact */}
          <div className="w-[300px] border-l border-surface-800/50 bg-surface-950 flex flex-col">
            {/* Tab bar */}
            <div className="flex border-b border-surface-800/50">
              {[
                { key: 'agents' as const, label: 'Agents' },
                { key: 'health' as const, label: 'Health' },
                { key: 'impact' as const, label: 'Impact' },
              ].map(({ key, label }) => (
                <button
                  key={key}
                  onClick={() => setRightPanel(key)}
                  className={clsx(
                    'flex-1 py-2.5 text-xs font-semibold border-b-2 transition-colors',
                    rightPanel === key
                      ? 'border-brand-500 text-brand-400'
                      : 'border-transparent text-surface-500 hover:text-surface-300'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {rightPanel === 'agents' && (
                <>
                  <AgentRunPanel agents={agents} />

                  {/* Engineering task */}
                  <div className="border-t border-surface-800/50 pt-4">
                    <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                      Engineering Task
                    </h3>
                    <textarea
                      value={engineeringTask}
                      onChange={(e) => {
                        setEngineeringTask(e.target.value);
                        if (id) {
                          sessionStorage.setItem(`project_task_${id}`, e.target.value);
                        }
                      }}
                      placeholder="Enter your engineering task..."
                      rows={4}
                      className="w-full px-3 py-2 rounded-lg bg-surface-900 border border-surface-800 text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm resize-none"
                    />
                  </div>

                  {/* Project info */}
                  <div className="border-t border-surface-800/50 pt-4">
                    <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
                      Project Info
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-500">Status</span>
                        <StatusBadge status={project.status} size="sm" />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-surface-500">Created</span>
                        <span className="text-surface-300">{formatDate(project.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}

              {rightPanel === 'health' && (
                <>
                  {reportResult?.score ? (
                    <>
                      <div className="flex items-center justify-between">
                        <EngineeringHealthCard
                          health={{
                            overall: (reportResult.score.overall || 5) * 10,
                            code_quality: (reportResult.score.code_quality || 5) * 10,
                            architecture: (reportResult.score.architecture || 5) * 10,
                            testing: (reportResult.score.test_coverage || 5) * 10,
                            security: (reportResult.score.security || 7) * 10,
                            documentation: (reportResult.score.documentation || 5) * 10,
                            rating: (reportResult.score.overall || 5) * 10 >= 85 ? 'EXCELLENT' : (reportResult.score.overall || 5) * 10 >= 70 ? 'GOOD' : 'NEEDS WORK',
                          }}
                          onExplain={() => setShowHealthExplanation(true)}
                        />
                      </div>
                      <button
                        onClick={() => setShowHealthExplanation(true)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-surface-800/30 hover:bg-surface-800/50 transition-colors text-xs text-surface-400 hover:text-surface-300"
                      >
                        <Info className="w-3.5 h-3.5" />
                        How is this score calculated?
                      </button>
                      <span className="text-[10px] text-surface-600 text-center block">
                        {isDemoMode ? 'AI ASSESSMENT' : 'AI ASSESSMENT'}
                      </span>
                    </>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 rounded-xl bg-surface-800/50 flex items-center justify-center mx-auto mb-3">
                        <Zap className="w-6 h-6 text-surface-600" />
                      </div>
                      <p className="text-sm text-surface-500">
                        Run the full pipeline to see engineering health
                      </p>
                    </div>
                  )}
                </>
              )}

              {rightPanel === 'impact' && (
                <>
                  <EngineeringImpactCard
                    filesCreated={codeChanges.filter((c) => c.operation === 'create').length}
                    filesModified={codeChanges.filter((c) => c.operation === 'modify').length}
                    filesRemoved={codeChanges.filter((c) => c.operation === 'remove').length}
                    testsAdded={0}
                    testsPassing={testRuns.length > 0 ? (testRuns[testRuns.length - 1].exit_code === 0 ? 1 : 0) : 0}
                    testsTotal={testRuns.length > 0 ? 1 : 0}
                    dataLabel={isDemoMode ? 'DEMO' : 'LIVE'}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        onCommand={handleCommandPaletteCommand}
        projectStatus={project.status}
      />

      <JudgeMode
        isVisible={showJudgeMode}
        onStartDemo={handleStartGuidedDemo}
        onClose={() => setShowJudgeMode(false)}
      />

      <GuidedDemo
        isActive={guidedDemoActive}
        currentStep={guidedDemoStep + 1}
        totalSteps={guidedDemoSteps.length}
        steps={guidedDemoSteps}
        onNext={handleGuidedDemoNext}
        onSkip={handleGuidedDemoSkip}
        onClose={handleGuidedDemoSkip}
      />

      {showHealthExplanation && reportResult?.score && (
        <EngineeringHealthExplanation
          health={{
            overall: (reportResult.score.overall || 5) * 10,
            code_quality: (reportResult.score.code_quality || 5) * 10,
            architecture: (reportResult.score.architecture || 5) * 10,
            testing: (reportResult.score.test_coverage || 5) * 10,
            security: (reportResult.score.security || 7) * 10,
            documentation: (reportResult.score.documentation || 5) * 10,
            rating: '',
          }}
          onClose={() => setShowHealthExplanation(false)}
        />
      )}

      {showAboutDevPilot && (
        <AboutDevPilot onClose={() => setShowAboutDevPilot(false)} />
      )}
    </Layout>
  );
}
