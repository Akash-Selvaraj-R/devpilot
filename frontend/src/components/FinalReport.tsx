import { FileText, CheckCircle, AlertTriangle, Shield, Copy, Check } from 'lucide-react';
import clsx from 'clsx';
import type { Report } from '../types';
import { getScoreColor } from '../utils/format';

interface FinalReportProps {
  report: Report;
  isDemoMode?: boolean;
  onCopySummary?: () => void;
  copiedSummary?: boolean;
}

export default function FinalReport({ report, isDemoMode, onCopySummary, copiedSummary }: FinalReportProps) {
  let score: any;
  try {
    score = typeof report.score === 'string' ? JSON.parse(report.score) : report.score;
  } catch {
    score = {};
  }

  let features: string[] = [];
  let issues: string[] = [];
  let securityNotes: string[] = [];
  try {
    features = typeof report.features === 'string' ? JSON.parse(report.features) : report.features || [];
    issues = typeof report.issues === 'string' ? JSON.parse(report.issues) : report.issues || [];
    securityNotes = typeof report.security_notes === 'string' ? JSON.parse(report.security_notes) : report.security_notes || [];
  } catch {}

  const totalFiles = (report.files_changed || []).length;

  return (
    <div className="rounded-xl border border-surface-800/50 bg-surface-950 overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-r from-brand-500/10 to-emerald-500/10 border-b border-surface-800/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
              <FileText className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white">DevPilot Engineering Report</h3>
              <p className="text-xs text-surface-400">Final assessment</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold text-surface-500 bg-surface-800 px-2 py-0.5 rounded">
              {isDemoMode ? 'DEMO DATA' : 'AI ASSESSMENT'}
            </span>
            {onCopySummary && (
              <button
                onClick={onCopySummary}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-surface-800/50 text-surface-400 hover:text-white hover:bg-surface-800 transition-colors"
              >
                {copiedSummary ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
                {copiedSummary ? 'Copied' : 'Copy Summary'}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="p-5 border-b border-surface-800/50">
        <p className="text-sm text-surface-300 leading-relaxed">
          {report.summary || 'No summary available'}
        </p>
      </div>

      {/* Key metrics row */}
      <div className="grid grid-cols-4 gap-px bg-surface-800/50">
        <div className="bg-surface-950 p-3 text-center">
          <div className="text-lg font-bold text-white">{totalFiles}</div>
          <div className="text-[10px] text-surface-500 mt-0.5">Files Changed</div>
        </div>
        <div className="bg-surface-950 p-3 text-center">
          <div className="text-lg font-bold text-emerald-400">{report.tests_passed}</div>
          <div className="text-[10px] text-surface-500 mt-0.5">Tests Passed</div>
        </div>
        <div className="bg-surface-950 p-3 text-center">
          <div className={clsx('text-lg font-bold', report.tests_failed > 0 ? 'text-red-400' : 'text-surface-500')}>
            {report.tests_failed}
          </div>
          <div className="text-[10px] text-surface-500 mt-0.5">Tests Failed</div>
        </div>
        <div className="bg-surface-950 p-3 text-center">
          <div className={clsx('text-lg font-bold', getScoreColor((score?.overall || 5) * 10))}>
            {(score?.overall || 5) * 10}
          </div>
          <div className="text-[10px] text-surface-500 mt-0.5">Health Score</div>
        </div>
      </div>

      {/* Verification status */}
      <div className="px-5 py-3 border-b border-surface-800/50 bg-emerald-500/5">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">
            Verification
          </span>
        </div>
        <div className="flex items-center gap-4 mt-1.5 text-xs text-surface-400">
          <span>✓ Tests executed</span>
          {report.tests_failed > 0 && <span>✓ Failures diagnosed</span>}
          {report.tests_failed === 0 && <span>✓ Fix verified</span>}
        </div>
      </div>

      {features.length > 0 && (
        <div className="p-5 border-b border-surface-800/50">
          <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
            Features Implemented
          </h4>
          <div className="space-y-2">
            {features.map((feature, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-surface-300">{feature}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {issues.length > 0 && (
        <div className="p-5 border-b border-surface-800/50">
          <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
            Known Issues
          </h4>
          <div className="space-y-2">
            {issues.map((issue, i) => (
              <div key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-surface-300">{issue}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {securityNotes.length > 0 && (
        <div className="p-5 border-b border-surface-800/50">
          <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
            Security Notes
          </h4>
          <div className="space-y-2">
            {securityNotes.map((note, i) => (
              <div key={i} className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-blue-400 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-surface-300">{note}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {score && (
        <div className="p-5">
          <h4 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-3">
            Score Breakdown
          </h4>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(score).map(([key, value]) => (
              <div key={key} className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-800/30">
                <span className="text-xs text-surface-400 capitalize">
                  {key.replace(/_/g, ' ')}
                </span>
                <span className={clsx('text-xs font-semibold', getScoreColor((value as number) * 10))}>
                  {value as number}/10
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Final status */}
      <div className="px-5 py-4 border-t border-surface-800/50 bg-surface-800/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-semibold text-emerald-400">READY TO REVIEW</span>
          </div>
          <span className="text-xs text-surface-500">
            {report.tests_failed === 0 ? 'All tests passing' : `${report.tests_failed} test failures`}
          </span>
        </div>
      </div>
    </div>
  );
}
