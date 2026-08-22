import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Zap,
  Code,
  TestTube,
  Shield,
  GitBranch,
  Terminal,
  ChevronRight,
  Sparkles,
  Brain,
  Rocket,
  Bug,
  FileText,
  Map,
  Check,
  ArrowDown,
  Scale,
  MessageSquare,
} from 'lucide-react';
import Layout from '../components/Layout';
import Button from '../components/Button';

const workflowSteps = [
  { label: 'Task', icon: Terminal, color: 'text-surface-400' },
  { label: 'Analyze', icon: Brain, color: 'text-blue-400' },
  { label: 'Plan', icon: Map, color: 'text-purple-400' },
  { label: 'Build', icon: Code, color: 'text-brand-400' },
  { label: 'Test', icon: TestTube, color: 'text-amber-400' },
  { label: 'Debug', icon: Bug, color: 'text-orange-400' },
  { label: 'Ship', icon: Rocket, color: 'text-emerald-400' },
];

const features = [
  {
    icon: Brain,
    title: 'Knows Your Code',
    description:
      'Understands current files and repository context to provide relevant, informed assistance.',
  },
  {
    icon: Code,
    title: 'Adapts to You',
    description:
      'Choose how your AI coding companion communicates — from patient mentor to strict reviewer.',
  },
  {
    icon: TestTube,
    title: 'Remembers Your Patterns',
    description:
      'Keeps useful coding preferences and recurring issues to personalize future assistance.',
  },
  {
    icon: Shield,
    title: 'Actually Builds',
    description:
      'Analyze, plan, implement, test, debug, and evaluate — the full engineering workflow.',
  },
];

const heroWorkflow = [
  { label: 'Add JWT authentication', icon: Terminal, color: 'text-surface-400', isInput: true },
  { label: 'Analyze', detail: '42 files', icon: Brain, color: 'text-blue-400' },
  { label: 'Plan', detail: '7 changes', icon: Map, color: 'text-purple-400' },
  { label: 'Build', detail: '2 files', icon: Code, color: 'text-brand-400' },
  { label: 'Test', detail: '10 passed / 2 failed', icon: TestTube, color: 'text-amber-400' },
  { label: 'Debug', detail: 'Root cause found', icon: Bug, color: 'text-orange-400' },
  { label: 'Ship', detail: '12 / 12 passing', icon: Rocket, color: 'text-emerald-400' },
  { label: '89/100', detail: 'Engineering Health', icon: Shield, color: 'text-emerald-400', isFinal: true },
];

const safetyFeatures = [
  'Explicit code diffs',
  'No silent modifications',
  'Test verification',
  'Command allowlist',
  'Sandboxed execution',
  'Controlled repository access',
];

const chatbotSteps = ['Prompt', 'Response', 'Developer decides what happens next'];
const devpilotSteps = ['Code Context', 'Personality', 'Developer Memory', 'Plan', 'Implement', 'Test', 'Debug', 'Ship'];

export default function LandingPage() {
  return (
    <Layout>
      <div className="relative">
        {/* Hero background */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.15),transparent)]" />

        {/* Hero Section */}
        <section className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-8 animate-fade-in">
                <Sparkles className="w-4 h-4" />
                AI Coding Buddy with Personality
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 animate-slide-up text-balance">
                Your AI Coding Companion.
                <br />
                <span className="gradient-text">Understands Your Code. Learns Your Style.</span>
              </h1>

              <p className="text-lg text-surface-400 mb-10 max-w-xl animate-slide-up text-balance">
                DevPilot reviews, explains, debugs and improves your code while adapting to the way you learn and work. Choose a personality, build memory, and get personalized assistance.
              </p>

              <div className="flex flex-col sm:flex-row items-start gap-4 animate-slide-up">
                <Link to="/projects/new">
                  <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                    Launch Demo
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button variant="secondary" size="lg">
                    Explore Workflow
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero workflow visualization */}
            <div className="hidden lg:block">
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <div className="space-y-3">
                  {heroWorkflow.map((step, index) => {
                    const Icon = step.icon;
                    return (
                      <div key={index}>
                        <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg ${step.isInput ? 'bg-surface-800/50 border border-surface-700/50' : step.isFinal ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-surface-800/30'}`}>
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${step.isInput ? 'bg-surface-700/50' : 'bg-surface-800/80'}`}>
                            <Icon className={`w-4 h-4 ${step.color}`} />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-white">{step.label}</p>
                            {step.detail && (
                              <p className="text-xs text-surface-400">{step.detail}</p>
                            )}
                          </div>
                          {step.isFinal && (
                            <span className="text-lg font-bold text-emerald-400">89</span>
                          )}
                        </div>
                        {index < heroWorkflow.length - 1 && (
                          <div className="flex justify-center py-0.5">
                            <ArrowDown className="w-3 h-3 text-surface-700" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="glass rounded-2xl p-8 sm:p-12 animate-fade-in">
            <h2 className="text-center text-sm font-semibold text-surface-500 uppercase tracking-wider mb-10">
              How it works
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2">
              {workflowSteps.map((step, index) => {
                const Icon = step.icon;
                return (
                  <div key={step.label} className="flex items-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-xl bg-surface-800/80 border border-surface-700/50 flex items-center justify-center">
                        <Icon className={`w-6 h-6 ${step.color}`} />
                      </div>
                      <span className="text-sm font-medium text-surface-300">
                        {step.label}
                      </span>
                    </div>
                    {index < workflowSteps.length - 1 && (
                      <ChevronRight className="w-5 h-5 text-surface-600 mx-2 hidden sm:block" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Why DevPilot - Differentiation */}
        <section className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Most coding assistants understand the code.
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              DevPilot understands the developer too. Personality, memory, and code context combine to create assistance that adapts to how you work.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Generic Chatbot */}
            <div className="glass rounded-xl p-6">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-surface-400" />
                <h3 className="text-sm font-semibold text-surface-400 uppercase tracking-wider">
                  Generic Chatbot
                </h3>
              </div>
              <div className="space-y-4">
                {chatbotSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-surface-800/50 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs text-surface-500">{i + 1}</span>
                    </div>
                    <span className="text-sm text-surface-400">{step}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-surface-600 mt-6 border-t border-surface-800/50 pt-4">
                No memory, no personality, no code context
              </p>
            </div>

            {/* DevPilot */}
            <div className="glass rounded-xl p-6 gradient-border">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-5 h-5 text-brand-400" />
                <h3 className="text-sm font-semibold text-brand-400 uppercase tracking-wider">
                  DevPilot
                </h3>
              </div>
              <div className="space-y-2.5">
                {devpilotSteps.map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-brand-400" />
                    </div>
                    <span className="text-sm text-surface-200">{step}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-surface-500 mt-6 border-t border-surface-800/50 pt-4">
                Code context + Personality + Memory + Agentic execution
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Everything you need to ship faster
            </h2>
            <p className="text-surface-400 max-w-2xl mx-auto">
              DevPilot handles the entire software engineering lifecycle so you can focus on what matters.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="glass rounded-xl p-6 glass-hover animate-slide-up"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-5 h-5 text-brand-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-surface-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Architecture */}
        <section className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="glass rounded-2xl p-8 sm:p-12">
            <h2 className="text-center text-sm font-semibold text-surface-500 uppercase tracking-wider mb-10">
              Architecture
            </h2>
            <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
              {[
                { label: 'User', icon: Terminal },
                { label: 'React Frontend', icon: Code },
                { label: 'FastAPI API', icon: Zap },
                { label: 'Agent Orchestrator', icon: Brain },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="w-full">
                    <div className="flex items-center justify-center">
                      <div className="glass rounded-lg px-4 py-2.5 flex items-center gap-2 w-full max-w-xs">
                        <Icon className="w-4 h-4 text-brand-400" />
                        <span className="text-sm text-surface-200">{item.label}</span>
                      </div>
                    </div>
                    {i < 3 && (
                      <div className="flex justify-center py-1">
                        <div className="w-px h-4 bg-surface-700" />
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="w-full max-w-xs">
                <div className="grid grid-cols-3 gap-2">
                  {['Analyzer', 'Planner', 'Implementer'].map((agent) => (
                    <div key={agent} className="glass rounded-lg px-2 py-2 text-center">
                      <span className="text-[10px] text-surface-400">{agent}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full max-w-xs space-y-2">
                {['Test Agent', 'Debug Agent', 'Evaluation Agent'].map((agent) => (
                  <div key={agent} className="glass rounded-lg px-4 py-2 text-center">
                    <span className="text-xs text-surface-400">{agent}</span>
                  </div>
                ))}
              </div>

              <div className="w-full max-w-xs">
                <div className="glass rounded-lg px-4 py-2.5 flex items-center justify-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-surface-200">Engineering Report</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="glass rounded-xl p-8">
            <h2 className="text-center text-sm font-semibold text-surface-500 uppercase tracking-wider mb-8">
              Safety
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
              {safetyFeatures.map((feature) => (
                <div key={feature} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-800/30">
                  <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-surface-300">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="relative max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
              Ready to build with AI?
            </h2>
            <p className="text-surface-400 mb-8 max-w-xl mx-auto">
              Start your first project and see DevPilot in action.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Link to="/projects/new">
                <Button size="lg" icon={<ArrowRight className="w-5 h-5" />}>
                  Create Your First Project
                </Button>
              </Link>
              <Link to="/dashboard">
                <Button variant="secondary" size="lg" icon={<Scale className="w-5 h-5" />}>
                  Try Judge Mode
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-surface-800/50 py-8">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-surface-500 text-sm">
              <Zap className="w-4 h-4" />
              <span>DevPilot</span>
            </div>
            <div className="flex items-center gap-6">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-surface-500 hover:text-white transition-colors"
              >
                <GitBranch className="w-5 h-5" />
              </a>
              <span className="text-surface-600 text-sm">
                Built with AI. Shipped by humans.
              </span>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
}
