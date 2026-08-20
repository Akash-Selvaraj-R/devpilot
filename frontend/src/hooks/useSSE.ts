import { useState, useEffect, useCallback, useRef } from 'react';
import type { AgentEvent } from '../types';
import { getTaskEvents } from '../services/api';

interface UseSSEReturn {
  events: AgentEvent[];
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  error: string | null;
  connect: () => void;
  disconnect: () => void;
}

export function useSSE(taskId: string | null): UseSSEReturn {
  const [events, setEvents] = useState<AgentEvent[]>([]);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const [error, setError] = useState<string | null>(null);
  const eventSourceRef = useRef<EventSource | null>(null);

  const connect = useCallback(() => {
    if (!taskId) return;

    if (eventSourceRef.current) {
      eventSourceRef.current.close();
    }

    setStatus('connecting');
    setError(null);

    const eventSource = getTaskEvents(taskId);
    eventSourceRef.current = eventSource;

    eventSource.onopen = () => {
      setStatus('connected');
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as AgentEvent;
        setEvents((prev) => {
          const exists = prev.some((e) => e.id === data.id);
          if (exists) {
            return prev.map((e) => (e.id === data.id ? data : e));
          }
          return [...prev, data];
        });
      } catch {
        console.error('Failed to parse SSE event:', event.data);
      }
    };

    eventSource.addEventListener('event', (event) => {
      try {
        const data = JSON.parse((event as MessageEvent).data) as AgentEvent;
        setEvents((prev) => {
          const exists = prev.some((e) => e.id === data.id);
          if (exists) {
            return prev.map((e) => (e.id === data.id ? data : e));
          }
          return [...prev, data];
        });
      } catch {
        console.error('Failed to parse SSE event data');
      }
    });

    eventSource.onerror = () => {
      setStatus('error');
      setError('Connection lost. Attempting to reconnect...');
      eventSource.close();
      eventSourceRef.current = null;
    };
  }, [taskId]);

  const disconnect = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setStatus('disconnected');
    }
  }, []);

  useEffect(() => {
    if (taskId) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [taskId, connect, disconnect]);

  return { events, status, error, connect, disconnect };
}
