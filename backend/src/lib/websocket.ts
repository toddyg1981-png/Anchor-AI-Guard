import { FastifyInstance } from 'fastify';
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';

interface ScanProgressEvent {
  type: 'scan:progress';
  scanId: string;
  projectId: string;
  progress: number;
  status: string;
}

interface ScanCompleteEvent {
  type: 'scan:complete';
  scanId: string;
  projectId: string;
  findingsCount: number;
}

interface ScanFailedEvent {
  type: 'scan:failed';
  scanId: string;
  projectId: string;
  error: string;
}

interface FindingCreatedEvent {
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
  | FindingCreatedEvent;

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<WebSocket, { orgId: string }> = new Map();

  initialize(server: FastifyInstance['server']) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
      // Authenticate WebSocket connections via token query param
      const url = new URL(req.url || '', `http://${req.headers.host}`);
      const token = url.searchParams.get('token');

      if (!token) {
        ws.close(4001, 'Authentication required');
        return;
      }

      let payload: any;
      try {
        payload = jwt.verify(token, env.jwtSecret);
      } catch {
        ws.close(4001, 'Invalid token');
        return;
      }

      const orgId = payload.orgId || '';
      console.log('WebSocket client connected (authenticated)');
      this.clients.set(ws, { orgId });

      ws.on('close', () => {
        console.log('WebSocket client disconnected');
        this.clients.delete(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.clients.delete(ws);
      });

      // Send initial connection confirmation
      ws.send(JSON.stringify({ type: 'connected', timestamp: Date.now() }));
    });

    console.log('WebSocket server initialized on /ws');
  }

  broadcast(event: WebSocketEvent, targetOrgId?: string) {
    const message = JSON.stringify(event);
    this.clients.forEach((meta, client) => {
      if (client.readyState === WebSocket.OPEN) {
        // If targetOrgId is specified, only send to clients in that org
        if (!targetOrgId || meta.orgId === targetOrgId) {
          client.send(message);
        }
      }
    });
  }

  emitScanProgress(scanId: string, projectId: string, progress: number, status: string) {
    this.broadcast({
      type: 'scan:progress',
      scanId,
      projectId,
      progress,
      status,
    });
  }

  emitScanComplete(scanId: string, projectId: string, findingsCount: number) {
    this.broadcast({
      type: 'scan:complete',
      scanId,
      projectId,
      findingsCount,
    });
  }

  emitScanFailed(scanId: string, projectId: string, error: string) {
    this.broadcast({
      type: 'scan:failed',
      scanId,
      projectId,
      error,
    });
  }

  emitFindingCreated(findingId: string, projectId: string, severity: string, title: string) {
    this.broadcast({
      type: 'finding:created',
      findingId,
      projectId,
      severity,
      title,
    });
  }

  getClientCount(): number {
    return this.clients.size;
  }
}

export const wsManager = new WebSocketManager();
