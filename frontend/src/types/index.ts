export interface Project {
  id: string;
  name: string;
  repo_url: string;
  branch: string;
  status: 'created' | 'analyzing' | 'planning' | 'implementing' | 'testing' | 'debugging' | 'complete' | 'failed';
  created_at: string;
  updated_at: string;
  task_count: number;
  tasks?: Task[];
}

export interface Task {
  id: string;
  project_id: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  result: string;
  created_at: string;
}

export interface AgentEvent {
  id: string;
  task_id: string;
  event_type: string;
  data: string;
  created_at: string;
  type?: string;
  content?: string;
  metadata?: Record<string, unknown>;
  message?: string;
  timestamp?: string;
}

export interface CodeChange {
  id: string;
  task_id: string;
  file_path: string;
  operation: string;
  content: string;
  diff: string;
  created_at: string;
  language?: string;
  why?: string;
  impact?: string;
}

export interface TestRun {
  id: string;
  task_id: string;
  command: string;
  exit_code: number;
  stdout: string;
  stderr: string;
  duration: number;
  duration_ms?: number;
  created_at: string;
}

export interface Report {
  id: string;
  task_id: string;
  summary: string;
  files_changed: string;
  features: string;
  tests_passed: number;
  tests_failed: number;
  issues: string;
  security_notes: string;
  score: string;
  created_at: string;
}

export interface RepositoryAnalysis {
  name: string;
  languages: Record<string, number>;
  frameworks: string[];
  files_count: number;
  dependencies: Record<string, string[]>;
  entry_points: string[];
  test_files: string[];
  structure: FileNode;
  summary: string;
}

export interface FileNode {
  [key: string]: FileNode | null;
}

export interface Plan {
  goal: string;
  steps: PlanStep[];
  files_to_modify: string[];
  files_to_create: string[];
  dependencies: string[];
  testing_strategy: string;
}

export interface PlanStep {
  id: number;
  description: string;
  files_involved: string[];
  reason?: string;
}

export interface EngineeringScore {
  completeness: number;
  code_quality: number;
  test_coverage: number;
  documentation: number;
  overall: number;
  architecture?: number;
  testing?: number;
  security?: number;
  maintainability?: number;
}

export type AgentStatus = 'queued' | 'active' | 'completed' | 'failed';

export interface AgentRun {
  id: string;
  name: string;
  icon: string;
  status: AgentStatus;
  startedAt?: string;
  completedAt?: string;
  result?: any;
  error?: string;
}

export type WorkflowPhase = 'think' | 'plan' | 'act' | 'verify' | 'recover' | 'ship';

export interface WorkflowState {
  currentPhase: WorkflowPhase;
  phases: {
    key: WorkflowPhase;
    label: string;
    status: 'pending' | 'active' | 'completed' | 'failed';
  }[];
}

export interface EngineeringHealth {
  overall: number;
  code_quality: number;
  architecture: number;
  testing: number;
  security: number;
  documentation: number;
  rating: string;
}

export interface EngineeringImpact {
  files_created: number;
  files_modified: number;
  files_removed: number;
  tests_added: number;
  tests_passing: number;
  tests_total: number;
  security_before: number;
  security_after: number;
  testing_before: number;
  testing_after: number;
  quality_before: number;
  quality_after: number;
  overall_before: number;
  overall_after: number;
  improvement: number;
}

export interface RunRecord {
  id: string;
  project_id: string;
  project_name: string;
  task_description: string;
  status: 'completed' | 'failed' | 'running';
  health_score: number;
  duration: number;
  created_at: string;
  agent_events: AgentEvent[];
  code_changes: CodeChange[];
  test_runs: TestRun[];
  report?: Report;
  before_score?: EngineeringHealth;
  after_score?: EngineeringHealth;
}

export interface EventStreamEntry {
  timestamp: string;
  agent: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'decision';
}

export interface AgentDecision {
  id: string;
  timestamp: string;
  agent: string;
  title: string;
  reasoning: string;
  evidence: string[];
  affectedFiles: string[];
  outcome: string;
  diffLink?: string;
}

export type DataLabel = 'LIVE' | 'DEMO' | 'AI ASSESSMENT' | 'ESTIMATED';

export interface DemoProgress {
  currentStep: number;
  totalSteps: number;
  steps: string[];
  labels: string[];
}

export interface Personality {
  id: string;
  name: string;
  icon: string;
  description: string;
  system_instructions: string;
  verbosity: string;
  reveal_solutions: boolean;
  teaching_style: string;
}

export interface DeveloperMemory {
  id: string;
  category: 'preference' | 'recurring_issue' | 'technology' | 'pattern';
  content: string;
  source: string;
  created_at: string;
  updated_at: string;
}

export interface CodingSession {
  id: string;
  title: string;
  personality_id: string;
  language: string;
  summary: string;
  messages_json: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  action?: string;
  personality_id?: string;
}

export interface CodingRequest {
  action: string;
  code?: string;
  question?: string;
  personality_id?: string;
  language?: string;
  repo_context?: string;
  current_file?: string;
  session_id?: string;
}

export interface CodingResponse {
  response: string;
  personality_id: string;
  action: string;
  context_used: {
    current_code: boolean;
    repo_context: boolean;
    language: string | null;
    personality: string;
    personality_id?: string;
    developer_memory: number;
    previous_session: boolean;
    memory_categories?: string[];
    relevant_memory_ids?: string[];
    session_message_count?: number;
  };
  session_id: string;
}
