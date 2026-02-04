/**
 * Real-Time Collaboration Hook - WORLD FIRST
 * React hook for collaborative security review
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// Types
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

export interface CollaborationState {
  connected: boolean;
  users: CollaborationUser[];
  locks: FindingLock[];
  comments: Record<string, Comment[]>;
  cursors: Map<string, CursorPosition>;
  selections: Map<string, SelectionRange>;
}

export interface CollaborationActions {
  // Presence
  updateCursor: (cursor: CursorPosition) => void;
  updateSelection: (selection: SelectionRange) => void;
  
  // Locking
  lockFinding: (findingId: string) => Promise<boolean>;
  unlockFinding: (findingId: string) => void;
  isLocked: (findingId: string) => FindingLock | undefined;
  canEdit: (findingId: string) => boolean;
  
  // Editing
  updateFinding: (findingId: string, field: string, value: any) => void;
  assignFinding: (findingId: string, assigneeId: string, assigneeName: string) => void;
  updateStatus: (findingId: string, status: string) => void;
  
  // Comments
  addComment: (findingId: string, content: string) => void;
  replyToComment: (findingId: string, commentId: string, content: string) => void;
  editComment: (findingId: string, commentId: string, content: string) => void;
  deleteComment: (findingId: string, commentId: string) => void;
  resolveComment: (findingId: string, commentId: string) => void;
  getComments: (findingId: string) => Comment[];
  
  // Sync
  requestSync: () => void;
}

interface UseCollaborationOptions {
  roomId: string;
  userId: string;
  userName: string;
  onUserJoin?: (user: CollaborationUser) => void;
  onUserLeave?: (userId: string) => void;
  onFindingUpdate?: (findingId: string, field: string, value: any) => void;
  onCommentAdd?: (comment: Comment) => void;
}

export function useCollaboration(options: UseCollaborationOptions): [CollaborationState, CollaborationActions] {
  const { roomId, userId, userName, onUserJoin, onUserLeave, onFindingUpdate, onCommentAdd } = options;
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingLockResolvers = useRef<Map<string, (success: boolean) => void>>(new Map());
  
  const [state, setState] = useState<CollaborationState>({
    connected: false,
    users: [],
    locks: [],
    comments: {},
    cursors: new Map(),
    selections: new Map(),
  });

  // WebSocket connection
  useEffect(() => {
    const connect = () => {
      const wsUrl = `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/collaboration`;
      const ws = new WebSocket(`${wsUrl}?roomId=${roomId}&userId=${userId}&userName=${encodeURIComponent(userName)}`);
      
      ws.onopen = () => {
        setState(prev => ({ ...prev, connected: true }));
        console.log('🔗 Connected to collaboration room:', roomId);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleEvent(data);
        } catch (error) {
          console.error('Failed to parse collaboration event:', error);
        }
      };

      ws.onclose = () => {
        setState(prev => ({ ...prev, connected: false }));
        console.log('🔌 Disconnected from collaboration room');
        
        // Reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(connect, 3000);
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [roomId, userId, userName]);

  // Handle incoming events
  const handleEvent = useCallback((event: any) => {
    switch (event.type) {
      case 'sync:response':
        setState(prev => ({
          ...prev,
          users: event.payload.users,
          locks: event.payload.locks,
          comments: event.payload.comments,
          cursors: new Map(event.payload.cursors),
          selections: new Map(event.payload.selections),
        }));
        break;

      case 'user:join':
        setState(prev => ({
          ...prev,
          users: [...prev.users.filter(u => u.id !== event.payload.user.id), event.payload.user],
        }));
        onUserJoin?.(event.payload.user);
        break;

      case 'user:leave':
        setState(prev => ({
          ...prev,
          users: prev.users.filter(u => u.id !== event.payload.userId),
        }));
        onUserLeave?.(event.payload.userId);
        break;

      case 'user:cursor':
        setState(prev => {
          const newCursors = new Map(prev.cursors);
          newCursors.set(event.userId, event.payload.cursor);
          return { ...prev, cursors: newCursors };
        });
        break;

      case 'user:selection':
        setState(prev => {
          const newSelections = new Map(prev.selections);
          newSelections.set(event.userId, event.payload.selection);
          return { ...prev, selections: newSelections };
        });
        break;

      case 'finding:lock':
        if (event.payload.success) {
          setState(prev => ({
            ...prev,
            locks: [...prev.locks.filter(l => l.findingId !== event.payload.lock.findingId), event.payload.lock],
          }));
          
          // Resolve pending lock promise
          const resolver = pendingLockResolvers.current.get(event.payload.lock?.findingId || event.payload.findingId);
          if (resolver) {
            resolver(true);
            pendingLockResolvers.current.delete(event.payload.lock?.findingId || event.payload.findingId);
          }
        } else {
          const resolver = pendingLockResolvers.current.get(event.payload.findingId);
          if (resolver) {
            resolver(false);
            pendingLockResolvers.current.delete(event.payload.findingId);
          }
        }
        break;

      case 'finding:unlock':
        setState(prev => ({
          ...prev,
          locks: prev.locks.filter(l => l.findingId !== event.payload.findingId),
        }));
        break;

      case 'finding:update':
        if (event.payload.success) {
          onFindingUpdate?.(event.payload.findingId, event.payload.field, event.payload.value);
        }
        break;

      case 'comment:add':
        if (event.payload.comment) {
          setState(prev => {
            const findingId = event.payload.comment.findingId;
            const existing = prev.comments[findingId] || [];
            return {
              ...prev,
              comments: {
                ...prev.comments,
                [findingId]: [...existing, event.payload.comment],
              },
            };
          });
          onCommentAdd?.(event.payload.comment);
        } else if (event.payload.reply) {
          // Handle reply
          setState(prev => {
            const findingId = event.payload.findingId;
            const comments = [...(prev.comments[findingId] || [])];
            const parentIndex = comments.findIndex(c => c.id === event.payload.parentCommentId);
            if (parentIndex !== -1) {
              comments[parentIndex] = {
                ...comments[parentIndex],
                replies: [...comments[parentIndex].replies, event.payload.reply],
              };
            }
            return {
              ...prev,
              comments: { ...prev.comments, [findingId]: comments },
            };
          });
        }
        break;

      case 'comment:edit':
        setState(prev => {
          const findingId = event.payload.findingId;
          const comments = (prev.comments[findingId] || []).map(c =>
            c.id === event.payload.commentId
              ? { ...c, content: event.payload.content, updatedAt: event.payload.updatedAt }
              : c
          );
          return {
            ...prev,
            comments: { ...prev.comments, [findingId]: comments },
          };
        });
        break;

      case 'comment:delete':
        setState(prev => {
          const findingId = event.payload.findingId;
          const comments = (prev.comments[findingId] || []).filter(c => c.id !== event.payload.commentId);
          return {
            ...prev,
            comments: { ...prev.comments, [findingId]: comments },
          };
        });
        break;

      case 'comment:resolve':
        setState(prev => {
          const findingId = event.payload.findingId;
          const comments = (prev.comments[findingId] || []).map(c =>
            c.id === event.payload.commentId
              ? { ...c, resolved: true, resolvedBy: event.payload.resolvedBy }
              : c
          );
          return {
            ...prev,
            comments: { ...prev.comments, [findingId]: comments },
          };
        });
        break;
    }
  }, [onUserJoin, onUserLeave, onFindingUpdate, onCommentAdd]);

  // Send event helper
  const sendEvent = useCallback((type: string, payload: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type,
        userId,
        userName,
        timestamp: Date.now(),
        payload,
      }));
    }
  }, [userId, userName]);

  // Actions
  const actions: CollaborationActions = {
    updateCursor: useCallback((cursor: CursorPosition) => {
      sendEvent('user:cursor', cursor);
    }, [sendEvent]),

    updateSelection: useCallback((selection: SelectionRange) => {
      sendEvent('user:selection', selection);
    }, [sendEvent]),

    lockFinding: useCallback((findingId: string): Promise<boolean> => {
      return new Promise((resolve) => {
        pendingLockResolvers.current.set(findingId, resolve);
        sendEvent('finding:lock', { findingId });
        
        // Timeout after 5 seconds
        setTimeout(() => {
          if (pendingLockResolvers.current.has(findingId)) {
            pendingLockResolvers.current.delete(findingId);
            resolve(false);
          }
        }, 5000);
      });
    }, [sendEvent]),

    unlockFinding: useCallback((findingId: string) => {
      sendEvent('finding:unlock', { findingId });
    }, [sendEvent]),

    isLocked: useCallback((findingId: string): FindingLock | undefined => {
      return state.locks.find(l => l.findingId === findingId);
    }, [state.locks]),

    canEdit: useCallback((findingId: string): boolean => {
      const lock = state.locks.find(l => l.findingId === findingId);
      return !lock || lock.userId === userId;
    }, [state.locks, userId]),

    updateFinding: useCallback((findingId: string, field: string, value: any) => {
      sendEvent('finding:update', { findingId, field, value });
    }, [sendEvent]),

    assignFinding: useCallback((findingId: string, assigneeId: string, assigneeName: string) => {
      sendEvent('finding:assign', { findingId, assigneeId, assigneeName });
    }, [sendEvent]),

    updateStatus: useCallback((findingId: string, status: string) => {
      sendEvent('finding:status', { findingId, status });
    }, [sendEvent]),

    addComment: useCallback((findingId: string, content: string) => {
      sendEvent('comment:add', { findingId, content });
    }, [sendEvent]),

    replyToComment: useCallback((findingId: string, commentId: string, content: string) => {
      sendEvent('comment:add', { findingId, content, parentCommentId: commentId });
    }, [sendEvent]),

    editComment: useCallback((findingId: string, commentId: string, content: string) => {
      sendEvent('comment:edit', { findingId, commentId, content });
    }, [sendEvent]),

    deleteComment: useCallback((findingId: string, commentId: string) => {
      sendEvent('comment:delete', { findingId, commentId });
    }, [sendEvent]),

    resolveComment: useCallback((findingId: string, commentId: string) => {
      sendEvent('comment:resolve', { findingId, commentId });
    }, [sendEvent]),

    getComments: useCallback((findingId: string): Comment[] => {
      return state.comments[findingId] || [];
    }, [state.comments]),

    requestSync: useCallback(() => {
      sendEvent('sync:request', {});
    }, [sendEvent]),
  };

  return [state, actions];
}
