import { useEffect, useRef, useState, useCallback } from 'react';
import { env } from '../config/env';

export interface ScanProgressEvent {
  type: 'scan:progress';
  scanId: string;
  projectId: string;
  progress: number;
  status: string;
}

export interface ScanCompleteEvent {
  type: 'scan:complete';
  scanId: string;
  projectId: string;
  findingsCount: number;
}

export interface ScanFailedEvent {
  type: 'scan:failed';
  scanId: string;
  projectId: string;
  error: string;
}

export interface FindingCreatedEvent {
  type: 'finding:created';
  findingId: string;
  projectId: string;
  severity: string;
  title: string;
}

export type WebSocketEvent =
  | ScanProgressEvent
  | ScanCompleteEvent
  | ScanFailedEvent
  | FindingCreatedEvent
  | { type: 'connected'; timestamp: number };

interface UseWebSocketOptions {
  onScanProgress?: (event: ScanProgressEvent) => void;
  onScanComplete?: (event: ScanCompleteEvent) => void;
  onScanFailed?: (event: ScanFailedEvent) => void;
  onFindingCreated?: (event: FindingCreatedEvent) => void;
  onConnected?: () => void;
  onDisconnected?: () => void;
}

export function useWebSocket(options: UseWebSocketOptions = {}) {
  const [isConnected, setIsConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<WebSocketEvent | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;

  const connect = useCallback(() => {
    // Stop if we've exceeded max reconnect attempts
    if (reconnectAttempts.current >= maxReconnectAttempts) {
      console.warn(`WebSocket: max reconnect attempts (${maxReconnectAttempts}) reached, stopping`);
      return;
    }

    // Build WebSocket URL from API base URL
    const wsUrl = env.apiBaseUrl
      .replace(/^http/, 'ws')
      .replace(/\/api$/, '/ws');

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        reconnectAttempts.current = 0;
        options.onConnected?.();
      };

      ws.onclose = () => {
        setIsConnected(false);
        options.onDisconnected?.();

        // Attempt to reconnect with exponential backoff, up to max attempts
        if (reconnectAttempts.current < maxReconnectAttempts) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current++;

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        }
      };

      ws.onerror = () => {
        // Suppress noisy WebSocket error logging in production
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data) as WebSocketEvent;
          setLastEvent(data);

          switch (data.type) {
            case 'scan:progress':
              options.onScanProgress?.(data);
              break;
            case 'scan:complete':
              options.onScanComplete?.(data);
              break;
            case 'scan:failed':
              options.onScanFailed?.(data);
              break;
            case 'finding:created':
              options.onFindingCreated?.(data);
              break;
            case 'connected':
              // Connection confirmed
              break;
          }
        } catch (err) {
          console.error('Failed to parse WebSocket message:', err);
        }
      };
    } catch (err) {
      console.error('Failed to create WebSocket connection:', err);
    }
  }, [options]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    lastEvent,
    disconnect,
    reconnect: connect,
  };
}
