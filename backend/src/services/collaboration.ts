/**
 * Real-Time Collaboration Service - WORLD FIRST
 * Google Docs-style collaboration for security findings
 */

import { WebSocket } from 'ws';

// Collaboration event types
export type CollaborationEventType = 
  | 'user:join'
  | 'user:leave'
  | 'user:cursor'
  | 'user:selection'
  | 'finding:lock'
  | 'finding:unlock'
  | 'finding:update'
  | 'finding:assign'
  | 'finding:status'
  | 'comment:add'
  | 'comment:edit'
  | 'comment:delete'
  | 'comment:resolve'
  | 'sync:request'
  | 'sync:response';

export interface CollaborationUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  color: string;
  cursor?: CursorPosition;
  selection?: SelectionRange;
  lastActive: number;
}

export interface CursorPosition {
  findingId: string;
  field?: string;
  position?: number;
}

export interface SelectionRange {
  findingId: string;
  field: string;
  start: number;
  end: number;
}

export interface FindingLock {
  findingId: string;
  userId: string;
  userName: string;
  lockedAt: number;
  expiresAt: number;
}

export interface Comment {
  id: string;
  findingId: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  content: string;
  createdAt: number;
  updatedAt?: number;
  resolved: boolean;
  resolvedBy?: string;
  replies: CommentReply[];
}

export interface CommentReply {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}

export interface CollaborationEvent {
  type: CollaborationEventType;
  userId: string;
  userName: string;
  timestamp: number;
  payload: any;
}

export interface CollaborationRoom {
  id: string;
  projectId: string;
  scanId: string;
  users: Map<string, CollaborationUser>;
  locks: Map<string, FindingLock>;
  comments: Map<string, Comment[]>;
  cursors: Map<string, CursorPosition>;
  selections: Map<string, SelectionRange>;
}

// Generate random user colors
const USER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FF4500',
];

export class CollaborationService {
  private rooms: Map<string, CollaborationRoom> = new Map();
  private userSockets: Map<string, WebSocket> = new Map();
  private socketUsers: Map<WebSocket, string> = new Map();
  private lockTimeout = 60000; // 1 minute lock timeout

  /**
   * Handle new WebSocket connection
   */
  handleConnection(ws: WebSocket, userId: string, userName: string, roomId: string): void {
    // Get or create room
    let room = this.rooms.get(roomId);
    if (!room) {
      room = this.createRoom(roomId);
    }

    // Add user to room
    const user: CollaborationUser = {
      id: userId,
      name: userName,
      email: `${userName.toLowerCase().replace(' ', '.')}@example.com`,
      color: USER_COLORS[room.users.size % USER_COLORS.length],
      lastActive: Date.now(),
    };

    room.users.set(userId, user);
    this.userSockets.set(userId, ws);
    this.socketUsers.set(ws, userId);

    // Send current state to new user
    this.sendToUser(userId, {
      type: 'sync:response',
      userId: 'system',
      userName: 'System',
      timestamp: Date.now(),
      payload: {
        users: Array.from(room.users.values()),
        locks: Array.from(room.locks.values()),
        comments: this.getAllComments(room),
        cursors: Array.from(room.cursors.entries()),
        selections: Array.from(room.selections.entries()),
      },
    });

    // Notify others
    this.broadcastToRoom(roomId, {
      type: 'user:join',
      userId,
      userName,
      timestamp: Date.now(),
      payload: { user },
    }, userId);

    // Handle incoming messages
    ws.on('message', (data) => {
      try {
        const event = JSON.parse(data.toString()) as CollaborationEvent;
        this.handleEvent(roomId, userId, event);
      } catch (error) {
        console.error('Failed to parse collaboration event:', error);
      }
    });

    // Handle disconnect
    ws.on('close', () => {
      this.handleDisconnect(roomId, userId);
    });
  }

  /**
   * Handle collaboration events
   */
  private handleEvent(roomId: string, userId: string, event: CollaborationEvent): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    // Update user activity
    const user = room.users.get(userId);
    if (user) {
      user.lastActive = Date.now();
    }

    switch (event.type) {
      case 'user:cursor':
        this.handleCursorUpdate(room, userId, event.payload);
        break;

      case 'user:selection':
        this.handleSelectionUpdate(room, userId, event.payload);
        break;

      case 'finding:lock':
        this.handleFindingLock(room, userId, event);
        break;

      case 'finding:unlock':
        this.handleFindingUnlock(room, userId, event.payload.findingId);
        break;

      case 'finding:update':
        this.handleFindingUpdate(room, userId, event);
        break;

      case 'finding:assign':
        this.handleFindingAssign(room, userId, event);
        break;

      case 'finding:status':
        this.handleFindingStatus(room, userId, event);
        break;

      case 'comment:add':
        this.handleCommentAdd(room, userId, event);
        break;

      case 'comment:edit':
        this.handleCommentEdit(room, userId, event);
        break;

      case 'comment:delete':
        this.handleCommentDelete(room, userId, event);
        break;

      case 'comment:resolve':
        this.handleCommentResolve(room, userId, event);
        break;

      case 'sync:request':
        this.handleSyncRequest(room, userId);
        break;
    }
  }

  /**
   * Handle cursor position updates
   */
  private handleCursorUpdate(room: CollaborationRoom, userId: string, cursor: CursorPosition): void {
    room.cursors.set(userId, cursor);
    
    const user = room.users.get(userId);
    if (user) {
      user.cursor = cursor;
    }

    this.broadcastToRoom(room.id, {
      type: 'user:cursor',
      userId,
      userName: user?.name || 'Unknown',
      timestamp: Date.now(),
      payload: { cursor },
    }, userId);
  }

  /**
   * Handle selection updates
   */
  private handleSelectionUpdate(room: CollaborationRoom, userId: string, selection: SelectionRange): void {
    room.selections.set(userId, selection);
    
    const user = room.users.get(userId);
    if (user) {
      user.selection = selection;
    }

    this.broadcastToRoom(room.id, {
      type: 'user:selection',
      userId,
      userName: user?.name || 'Unknown',
      timestamp: Date.now(),
      payload: { selection },
    }, userId);
  }

  /**
   * Handle finding lock requests
   */
  private handleFindingLock(room: CollaborationRoom, userId: string, event: CollaborationEvent): void {
    const { findingId } = event.payload;
    
    // Check if already locked by someone else
    const existingLock = room.locks.get(findingId);
    if (existingLock && existingLock.userId !== userId && existingLock.expiresAt > Date.now()) {
      // Lock denied
      this.sendToUser(userId, {
        type: 'finding:lock',
        userId: 'system',
        userName: 'System',
        timestamp: Date.now(),
        payload: {
          findingId,
          success: false,
          lockedBy: existingLock.userName,
        },
      });
      return;
    }

    // Grant lock
    const lock: FindingLock = {
      findingId,
      userId,
      userName: event.userName,
      lockedAt: Date.now(),
      expiresAt: Date.now() + this.lockTimeout,
    };

    room.locks.set(findingId, lock);

    this.broadcastToRoom(room.id, {
      type: 'finding:lock',
      userId,
      userName: event.userName,
      timestamp: Date.now(),
      payload: {
        findingId,
        success: true,
        lock,
      },
    });

    // Auto-expire lock
    setTimeout(() => {
      const currentLock = room.locks.get(findingId);
      if (currentLock && currentLock.userId === userId) {
        this.handleFindingUnlock(room, userId, findingId);
      }
    }, this.lockTimeout);
  }

  /**
   * Handle finding unlock
   */
  private handleFindingUnlock(room: CollaborationRoom, userId: string, findingId: string): void {
    const lock = room.locks.get(findingId);
    
    // Only owner can unlock
    if (lock && lock.userId === userId) {
      room.locks.delete(findingId);
      
      this.broadcastToRoom(room.id, {
        type: 'finding:unlock',
        userId,
        userName: lock.userName,
        timestamp: Date.now(),
        payload: { findingId },
      });
    }
  }

  /**
   * Handle finding updates (collaborative editing)
   */
  private handleFindingUpdate(room: CollaborationRoom, userId: string, event: CollaborationEvent): void {
    const { findingId, field, value, operation } = event.payload;
    
    // Verify user has lock
    const lock = room.locks.get(findingId);
    if (!lock || lock.userId !== userId) {
      this.sendToUser(userId, {
        type: 'finding:update',
        userId: 'system',
        userName: 'System',
        timestamp: Date.now(),
        payload: {
          findingId,
          success: false,
          error: 'You must lock the finding before editing',
        },
      });
      return;
    }

    // Broadcast update to all users
    this.broadcastToRoom(room.id, {
      type: 'finding:update',
      userId,
      userName: event.userName,
      timestamp: Date.now(),
      payload: {
        findingId,
        field,
        value,
        operation,
        success: true,
      },
    });
  }

  /**
   * Handle finding assignment
   */
  private handleFindingAssign(room: CollaborationRoom, userId: string, event: CollaborationEvent): void {
    const { findingId, assigneeId, assigneeName } = event.payload;

    this.broadcastToRoom(room.id, {
      type: 'finding:assign',
      userId,
      userName: event.userName,
      timestamp: Date.now(),
      payload: {
        findingId,
        assigneeId,
        assigneeName,
        assignedBy: event.userName,
      },
    });
  }

  /**
   * Handle finding status change
   */
  private handleFindingStatus(room: CollaborationRoom, userId: string, event: CollaborationEvent): void {
    const { findingId, status, previousStatus } = event.payload;

    this.broadcastToRoom(room.id, {
      type: 'finding:status',
      userId,
      userName: event.userName,
      timestamp: Date.now(),
      payload: {
        findingId,
        status,
        previousStatus,
        changedBy: event.userName,
      },
    });
  }

  /**
   * Handle adding comments
   */
  private handleCommentAdd(room: CollaborationRoom, userId: string, event: CollaborationEvent): void {
    const { findingId, content, parentCommentId } = event.payload;
    const user = room.users.get(userId);

    if (parentCommentId) {
      // Add reply to existing comment
      const comments = room.comments.get(findingId) || [];
      const parentComment = comments.find(c => c.id === parentCommentId);
      
      if (parentComment) {
        const reply: CommentReply = {
          id: `reply-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          userId,
          userName: user?.name || 'Unknown',
          content,
          createdAt: Date.now(),
        };
        
        parentComment.replies.push(reply);

        this.broadcastToRoom(room.id, {
          type: 'comment:add',
          userId,
          userName: user?.name || 'Unknown',
          timestamp: Date.now(),
          payload: {
            findingId,
            parentCommentId,
            reply,
          },
        });
      }
    } else {
      // Add new comment
      const comment: Comment = {
        id: `comment-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        findingId,
        userId,
        userName: user?.name || 'Unknown',
        userAvatar: user?.avatar,
        content,
        createdAt: Date.now(),
        resolved: false,
        replies: [],
      };

      const comments = room.comments.get(findingId) || [];
      comments.push(comment);
      room.comments.set(findingId, comments);

      this.broadcastToRoom(room.id, {
        type: 'comment:add',
        userId,
        userName: user?.name || 'Unknown',
        timestamp: Date.now(),
        payload: { comment },
      });
    }
  }

  /**
   * Handle editing comments
   */
  private handleCommentEdit(room: CollaborationRoom, userId: string, event: CollaborationEvent): void {
    const { findingId, commentId, content } = event.payload;
    
    const comments = room.comments.get(findingId) || [];
    const comment = comments.find(c => c.id === commentId);
    
    if (comment && comment.userId === userId) {
      comment.content = content;
      comment.updatedAt = Date.now();

      this.broadcastToRoom(room.id, {
        type: 'comment:edit',
        userId,
        userName: event.userName,
        timestamp: Date.now(),
        payload: {
          findingId,
          commentId,
          content,
          updatedAt: comment.updatedAt,
        },
      });
    }
  }

  /**
   * Handle deleting comments
   */
  private handleCommentDelete(room: CollaborationRoom, userId: string, event: CollaborationEvent): void {
    const { findingId, commentId } = event.payload;
    
    const comments = room.comments.get(findingId) || [];
    const index = comments.findIndex(c => c.id === commentId && c.userId === userId);
    
    if (index !== -1) {
      comments.splice(index, 1);
      room.comments.set(findingId, comments);

      this.broadcastToRoom(room.id, {
        type: 'comment:delete',
        userId,
        userName: event.userName,
        timestamp: Date.now(),
        payload: { findingId, commentId },
      });
    }
  }

  /**
   * Handle resolving comments
   */
  private handleCommentResolve(room: CollaborationRoom, userId: string, event: CollaborationEvent): void {
    const { findingId, commentId } = event.payload;
    const user = room.users.get(userId);
    
    const comments = room.comments.get(findingId) || [];
    const comment = comments.find(c => c.id === commentId);
    
    if (comment) {
      comment.resolved = true;
      comment.resolvedBy = user?.name || 'Unknown';

      this.broadcastToRoom(room.id, {
        type: 'comment:resolve',
        userId,
        userName: user?.name || 'Unknown',
        timestamp: Date.now(),
        payload: {
          findingId,
          commentId,
          resolvedBy: user?.name || 'Unknown',
        },
      });
    }
  }

  /**
   * Handle sync requests
   */
  private handleSyncRequest(room: CollaborationRoom, userId: string): void {
    this.sendToUser(userId, {
      type: 'sync:response',
      userId: 'system',
      userName: 'System',
      timestamp: Date.now(),
      payload: {
        users: Array.from(room.users.values()),
        locks: Array.from(room.locks.values()),
        comments: this.getAllComments(room),
        cursors: Array.from(room.cursors.entries()),
        selections: Array.from(room.selections.entries()),
      },
    });
  }

  /**
   * Handle user disconnect
   */
  private handleDisconnect(roomId: string, userId: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    const user = room.users.get(userId);

    // Remove user from room
    room.users.delete(userId);
    room.cursors.delete(userId);
    room.selections.delete(userId);
    this.userSockets.delete(userId);

    // Release any locks held by user
    for (const [findingId, lock] of room.locks.entries()) {
      if (lock.userId === userId) {
        room.locks.delete(findingId);
      }
    }

    // Notify others
    this.broadcastToRoom(roomId, {
      type: 'user:leave',
      userId,
      userName: user?.name || 'Unknown',
      timestamp: Date.now(),
      payload: { userId },
    });

    // Clean up empty rooms
    if (room.users.size === 0) {
      this.rooms.delete(roomId);
    }
  }

  /**
   * Create a new collaboration room
   */
  private createRoom(roomId: string): CollaborationRoom {
    const [projectId, scanId] = roomId.split(':');
    
    const room: CollaborationRoom = {
      id: roomId,
      projectId: projectId || roomId,
      scanId: scanId || 'default',
      users: new Map(),
      locks: new Map(),
      comments: new Map(),
      cursors: new Map(),
      selections: new Map(),
    };

    this.rooms.set(roomId, room);
    return room;
  }

  /**
   * Send event to specific user
   */
  private sendToUser(userId: string, event: CollaborationEvent): void {
    const ws = this.userSockets.get(userId);
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(event));
    }
  }

  /**
   * Broadcast event to all users in room
   */
  private broadcastToRoom(roomId: string, event: CollaborationEvent, excludeUserId?: string): void {
    const room = this.rooms.get(roomId);
    if (!room) return;

    for (const userId of room.users.keys()) {
      if (userId !== excludeUserId) {
        this.sendToUser(userId, event);
      }
    }
  }

  /**
   * Get all comments in room
   */
  private getAllComments(room: CollaborationRoom): Record<string, Comment[]> {
    const result: Record<string, Comment[]> = {};
    for (const [findingId, comments] of room.comments.entries()) {
      result[findingId] = comments;
    }
    return result;
  }

  /**
   * Get room stats
   */
  getRoomStats(roomId: string): { users: number; locks: number; comments: number } | null {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    let totalComments = 0;
    for (const comments of room.comments.values()) {
      totalComments += comments.length;
    }

    return {
      users: room.users.size,
      locks: room.locks.size,
      comments: totalComments,
    };
  }
}

// Export singleton instance
export const collaborationService = new CollaborationService();
