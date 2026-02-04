import { FastifyInstance } from 'fastify';
import { WebSocket, WebSocketServer } from 'ws';

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
  private clients: Set<WebSocket> = new Set();

  initialize(server: FastifyInstance['server']) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('WebSocket client connected');
      this.clients.add(ws);

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

  broadcast(event: WebSocketEvent) {
    const message = JSON.stringify(event);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
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
