import { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Lightbulb, Code, Bug, Wrench, GraduationCap, Zap, Search, Target } from 'lucide-react';
import { sendCodingRequest } from '../services/api';
import type { ChatMessage, CodingResponse } from '../types';
import clsx from 'clsx';

interface ChatPanelProps {
  personalityId: string;
  language?: string;
  repoContext?: string;
  currentFile?: string;
  currentCode?: string;
  sessionId?: string;
  onContextUpdate?: (ctx: {
    current_code: boolean;
    repo_context: boolean;
    language: string | null;
    personality: string;
    developer_memory: number;
    previous_session: boolean;
    memory_categories: string[];
  }) => void;
}

const personalityIcons: Record<string, typeof GraduationCap> = {
  mentor: GraduationCap,
  senior_engineer: Zap,
  strict_reviewer: Search,
  interview_coach: Target,
};

const actionButtons = [
  { action: 'explain', label: 'Explain', icon: Lightbulb, color: 'text-blue-400' },
  { action: 'review', label: 'Review', icon: Code, color: 'text-purple-400' },
  { action: 'debug', label: 'Debug', icon: Bug, color: 'text-orange-400' },
  { action: 'improve', label: 'Improve', icon: Wrench, color: 'text-emerald-400' },
];

function renderMarkdown(text: string) {
  let html = text
    .replace(/```(\w*)\n([\s\S]*?)```/g, '<pre class="bg-surface-900 rounded-lg p-3 my-2 text-xs font-mono text-surface-300 overflow-x-auto"><code>$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-surface-800 px-1.5 py-0.5 rounded text-xs text-brand-300">$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-surface-200 font-semibold">$1</strong>')
    .replace(/\n/g, '<br />');
  return html;
}

export default function ChatPanel({ personalityId, language, repoContext, currentFile, currentCode, sessionId, onContextUpdate }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const PersonalityIcon = personalityIcons[personalityId] || Zap;

  async function handleSend(action: string = 'ask') {
    const questionText = action === 'ask' ? input.trim() : '';
    const codeToSend = currentCode || input.trim();

    if (!questionText && !codeToSend) return;
    if (loading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: questionText || `[${action.toUpperCase()}] ${currentFile || 'current code'}`,
      timestamp: new Date().toLocaleTimeString(),
      action,
      personality_id: personalityId,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response: CodingResponse = await sendCodingRequest({
        action,
        code: codeToSend,
        question: questionText,
        personality_id: personalityId,
        language: language || '',
        repo_context: repoContext || '',
        current_file: currentFile || '',
        session_id: sessionId || '',
      });

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toLocaleTimeString(),
        action,
        personality_id: personalityId,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (response.context_used && onContextUpdate) {
        onContextUpdate(response.context_used as any);
      }
    } catch {
      const fallback: ChatMessage = {
        role: 'assistant',
        content: 'Unable to process the request. Please try again.',
        timestamp: new Date().toLocaleTimeString(),
        action,
      };
      setMessages(prev => [...prev, fallback]);
    } finally {
      setLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend('ask');
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-3">
              <PersonalityIcon className="w-6 h-6 text-brand-400" />
            </div>
            <p className="text-sm text-surface-400 mb-1">Coding Assistant</p>
            <p className="text-xs text-surface-600 max-w-xs">
              Select code and choose an action, or ask a question below
            </p>
            <div className="flex flex-wrap gap-2 mt-4 justify-center">
              {actionButtons.map(btn => {
                const Icon = btn.icon;
                return (
                  <button
                    key={btn.action}
                    onClick={() => handleSend(btn.action)}
                    disabled={!currentCode}
                    className={clsx(
                      'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      currentCode
                        ? 'bg-surface-800/50 border border-surface-700/50 text-surface-300 hover:bg-surface-800 hover:text-white'
                        : 'bg-surface-900/30 border border-surface-800/30 text-surface-600 cursor-not-allowed'
                    )}
                  >
                    <Icon className={clsx('w-3.5 h-3.5', btn.color)} />
                    {btn.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className={clsx('flex gap-3', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
              {msg.role === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <PersonalityIcon className="w-3.5 h-3.5 text-brand-400" />
                </div>
              )}
              <div className={clsx(
                'max-w-[85%] rounded-xl px-4 py-3 text-sm',
                msg.role === 'user'
                  ? 'bg-brand-500/10 border border-brand-500/20 text-surface-200'
                  : 'bg-surface-800/50 border border-surface-700/50 text-surface-300'
              )}>
                {msg.action && msg.action !== 'ask' && (
                  <div className="text-[10px] font-semibold text-brand-400 uppercase tracking-wider mb-2">
                    {msg.action}
                  </div>
                )}
                {msg.role === 'assistant' ? (
                  <div dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }} />
                ) : (
                  <p>{msg.content}</p>
                )}
                {msg.timestamp && (
                  <div className="text-[10px] text-surface-600 mt-2">{msg.timestamp}</div>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="w-7 h-7 rounded-full bg-surface-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs text-surface-300 font-medium">U</span>
                </div>
              )}
            </div>
          ))
        )}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center flex-shrink-0">
              <PersonalityIcon className="w-3.5 h-3.5 text-brand-400" />
            </div>
            <div className="bg-surface-800/50 border border-surface-700/50 rounded-xl px-4 py-3">
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full bg-brand-400/60 animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-brand-400/60 animate-pulse" style={{ animationDelay: '0.2s' }} />
                <div className="w-2 h-2 rounded-full bg-brand-400/60 animate-pulse" style={{ animationDelay: '0.4s' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="border-t border-surface-800/50 p-4">
        <div className="flex gap-2">
          {actionButtons.map(btn => {
            const Icon = btn.icon;
            return (
              <button
                key={btn.action}
                onClick={() => handleSend(btn.action)}
                disabled={!currentCode && !input.trim()}
                className={clsx(
                  'flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
                  (currentCode || input.trim())
                    ? 'bg-surface-800/50 border border-surface-700/50 text-surface-400 hover:text-white hover:bg-surface-800'
                    : 'bg-surface-900/30 border border-surface-800/30 text-surface-600 cursor-not-allowed'
                )}
              >
                <Icon className={clsx('w-3 h-3', btn.color)} />
                {btn.label}
              </button>
            );
          })}
        </div>
        <div className="flex gap-2 mt-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question about the code..."
            rows={1}
            className="flex-1 px-3 py-2 rounded-lg bg-surface-900 border border-surface-800 text-sm text-white placeholder-surface-600 focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
          />
          <button
            onClick={() => handleSend('ask')}
            disabled={!input.trim() || loading}
            className={clsx(
              'px-3 py-2 rounded-lg transition-colors',
              input.trim() && !loading
                ? 'bg-brand-500 hover:bg-brand-600 text-white'
                : 'bg-surface-800 text-surface-600 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
