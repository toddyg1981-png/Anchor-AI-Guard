/**
 * Real-Time Collaboration Panel - WORLD FIRST
 * Google Docs-style presence and collaboration for security findings
 */

import React, { useState } from 'react';
import { useCollaboration, CollaborationUser, Comment, FindingLock } from '../hooks/useCollaboration';

// Types
interface CollaborationPanelProps {
  roomId: string;
  userId: string;
  userName: string;
  currentFindingId?: string;
  onFindingUpdate?: (findingId: string, field: string, value: any) => void;
}

// Presence Avatars Component
const PresenceAvatars: React.FC<{ users: CollaborationUser[]; currentUserId: string }> = ({ users, currentUserId }) => {
  const otherUsers = users.filter(u => u.id !== currentUserId);
  const displayUsers = otherUsers.slice(0, 5);
  const remaining = otherUsers.length - 5;

  return (
    <div className="flex items-center -space-x-2">
      {displayUsers.map(user => (
        <div
          key={user.id}
          className="relative"
          title={`${user.name} is viewing`}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium border-2 border-gray-900"
            style={{ backgroundColor: user.color }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div 
            className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-gray-900"
            style={{ backgroundColor: '#22c55e' }}
          />
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs border-2 border-gray-900">
          +{remaining}
        </div>
      )}
    </div>
  );
};

// Live Cursor Component (for future use with real-time cursor tracking)
const LiveCursor: React.FC<{ user: CollaborationUser; position: { x: number; y: number } }> = ({ user, position }) => {
  return (
    <div
      className="absolute pointer-events-none z-50 transition-all duration-75"
      style={{ left: position.x, top: position.y }}
    >
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <path
          d="M5.65376 12.4563L5.65376 12.4563L5.65343 12.4563C5.65324 12.4563 5.65315 12.4563 5.65307 12.4562L2.88379 19.0412L2.88379 19.0412C2.68419 19.5251 2.93724 20.0638 3.42118 20.2634C3.90512 20.463 4.44375 20.21 4.64336 19.7261L4.64336 19.7261L7.41263 13.1411L7.41265 13.1411C7.41285 13.1406 7.41294 13.1403 7.41303 13.14L14.5 5L5.65376 12.4563Z"
          fill={user.color}
          stroke="white"
          strokeWidth="1"
        />
      </svg>
      <div
        className="ml-4 px-2 py-1 rounded text-xs text-white whitespace-nowrap"
        style={{ backgroundColor: user.color }}
      >
        {user.name}
      </div>
    </div>
  );
};

// Comment Thread Component
const CommentThread: React.FC<{
  comment: Comment;
  currentUserId: string;
  onReply: (content: string) => void;
  onEdit: (content: string) => void;
  onDelete: () => void;
  onResolve: () => void;
}> = ({ comment, currentUserId, onReply, onEdit, onDelete, onResolve }) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [editContent, setEditContent] = useState(comment.content);

  const handleReply = () => {
    if (replyContent.trim()) {
      onReply(replyContent);
      setReplyContent('');
      setIsReplying(false);
    }
  };

  const handleEdit = () => {
    if (editContent.trim()) {
      onEdit(editContent);
      setIsEditing(false);
    }
  };

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className={`border-l-2 ${comment.resolved ? 'border-green-500 opacity-60' : 'border-cyan-500'} pl-3 py-2`}>
      <div className="flex items-start gap-2">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
          style={{ backgroundColor: '#6366f1' }}
        >
          {comment.userName.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-white">{comment.userName}</span>
            <span className="text-xs text-gray-500">{formatTime(comment.createdAt)}</span>
            {comment.resolved && (
              <span className="text-xs bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded">
                Resolved
              </span>
            )}
          </div>
          
          {isEditing ? (
            <div className="mt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                aria-label="Edit comment"
                placeholder="Edit your comment..."
                className="w-full bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm text-white text-sm rounded-xl px-2 py-1 border border-cyan-500/30 focus:border-pink-500/50 focus:ring-2 focus:ring-pink-500/20 outline-none resize-none transition-all"
                rows={2}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleEdit}
                  className="text-xs bg-cyan-500 text-white px-2 py-1 rounded hover:bg-cyan-600"
                >
                  Save
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-300 mt-1">{comment.content}</p>
          )}

          {!comment.resolved && (
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={() => setIsReplying(!isReplying)}
                className="text-xs text-gray-400 hover:text-cyan-400"
              >
                Reply
              </button>
              {comment.userId === currentUserId && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-xs text-gray-400 hover:text-cyan-400"
                  >
                    Edit
                  </button>
                  <button
                    onClick={onDelete}
                    className="text-xs text-gray-400 hover:text-red-400"
                  >
                    Delete
                  </button>
                </>
              )}
              <button
                onClick={onResolve}
                className="text-xs text-gray-400 hover:text-green-400"
              >
                Resolve
              </button>
            </div>
          )}

          {/* Replies */}
          {comment.replies.length > 0 && (
            <div className="mt-3 space-y-2 border-l border-gray-700 pl-3">
              {comment.replies.map(reply => (
                <div key={reply.id} className="flex items-start gap-2">
                  <div
                    className="w-5 h-5 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0"
                    style={{ backgroundColor: '#8b5cf6' }}
                  >
                    {reply.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">{reply.userName}</span>
                      <span className="text-xs text-gray-500">{formatTime(reply.createdAt)}</span>
                    </div>
                    <p className="text-xs text-gray-300">{reply.content}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Reply input */}
          {isReplying && (
            <div className="mt-2">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="Write a reply..."
                className="w-full bg-gray-800 text-white text-sm rounded px-2 py-1 border border-gray-700 focus:border-cyan-500 outline-none resize-none"
                rows={2}
              />
              <div className="flex gap-2 mt-1">
                <button
                  onClick={handleReply}
                  className="text-xs bg-cyan-500 text-white px-2 py-1 rounded hover:bg-cyan-600"
                >
                  Reply
                </button>
                <button
                  onClick={() => setIsReplying(false)}
                  className="text-xs text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Finding Lock Indicator
const LockIndicator: React.FC<{ lock: FindingLock | undefined; currentUserId: string }> = ({ lock, currentUserId }) => {
  if (!lock) return null;

  const isMyLock = lock.userId === currentUserId;
  const remainingTime = Math.max(0, Math.floor((lock.expiresAt - Date.now()) / 1000));

  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isMyLock ? 'bg-cyan-500/20 text-cyan-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
      <span className="text-xs">
        {isMyLock ? `You're editing (${remainingTime}s)` : `Locked by ${lock.userName}`}
      </span>
    </div>
  );
};

// Main Collaboration Panel
export const CollaborationPanel: React.FC<CollaborationPanelProps> = ({
  roomId,
  userId,
  userName,
  currentFindingId,
  onFindingUpdate
}) => {
  const [collabState, collabActions] = useCollaboration({
    roomId,
    userId,
    userName,
    onFindingUpdate,
    onUserJoin: (user) => {
      console.log(`👋 ${user.name} joined the room`);
    },
    onUserLeave: (leftUserId) => {
      console.log(`👋 User ${leftUserId} left the room`);
    },
  });

  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState<'team' | 'comments'>('team');

  const currentLock = currentFindingId ? collabActions.isLocked(currentFindingId) : undefined;
  const currentComments = currentFindingId ? collabActions.getComments(currentFindingId) : [];

  const handleAddComment = () => {
    if (newComment.trim() && currentFindingId) {
      collabActions.addComment(currentFindingId, newComment);
      setNewComment('');
    }
  };

  const handleLockToggle = async () => {
    if (!currentFindingId) return;
    
    if (currentLock?.userId === userId) {
      collabActions.unlockFinding(currentFindingId);
    } else if (!currentLock) {
      const success = await collabActions.lockFinding(currentFindingId);
      if (!success) {
        console.log('Failed to acquire lock');
      }
    }
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${collabState.connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="text-sm font-medium text-white">
            {collabState.connected ? 'Live Collaboration' : 'Reconnecting...'}
          </span>
        </div>
        <PresenceAvatars users={collabState.users} currentUserId={userId} />
      </div>

      {/* Lock status for current finding */}
      {currentFindingId && (
        <div className="px-4 py-2 border-b border-gray-700 flex items-center justify-between">
          <LockIndicator lock={currentLock} currentUserId={userId} />
          <button
            onClick={handleLockToggle}
            disabled={currentLock && currentLock.userId !== userId}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              currentLock?.userId === userId
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : currentLock
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-cyan-500 text-white hover:bg-cyan-600'
            }`}
          >
            {currentLock?.userId === userId ? 'Release Lock' : currentLock ? 'Locked' : 'Start Editing'}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'team'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Team ({collabState.users.length})
        </button>
        <button
          onClick={() => setActiveTab('comments')}
          className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'comments'
              ? 'text-cyan-400 border-b-2 border-cyan-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Comments ({currentComments.length})
        </button>
      </div>

      {/* Content */}
      <div className="max-h-80 overflow-y-auto">
        {activeTab === 'team' ? (
          <div className="p-4 space-y-3">
            {collabState.users.map(user => (
              <div key={user.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                  style={{ backgroundColor: user.color }}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">
                    {user.name}
                    {user.id === userId && <span className="text-gray-500 ml-2">(you)</span>}
                  </div>
                  <div className="text-xs text-gray-500">
                    {user.cursor?.findingId
                      ? `Viewing finding ${user.cursor.findingId.slice(0, 8)}...`
                      : 'In dashboard'}
                  </div>
                </div>
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: Date.now() - user.lastActive < 30000 ? '#22c55e' : '#eab308' }}
                  title={Date.now() - user.lastActive < 30000 ? 'Active' : 'Away'}
                />
              </div>
            ))}
            {collabState.users.length === 0 && (
              <p className="text-gray-500 text-sm text-center py-4">No team members online</p>
            )}
          </div>
        ) : (
          <div className="p-4 space-y-4">
            {currentComments.map(comment => (
              <CommentThread
                key={comment.id}
                comment={comment}
                currentUserId={userId}
                onReply={(content) => collabActions.replyToComment(currentFindingId!, comment.id, content)}
                onEdit={(content) => collabActions.editComment(currentFindingId!, comment.id, content)}
                onDelete={() => collabActions.deleteComment(currentFindingId!, comment.id)}
                onResolve={() => collabActions.resolveComment(currentFindingId!, comment.id)}
              />
            ))}
            {currentComments.length === 0 && currentFindingId && (
              <p className="text-gray-500 text-sm text-center py-4">No comments yet. Start the discussion!</p>
            )}
            {!currentFindingId && (
              <p className="text-gray-500 text-sm text-center py-4">Select a finding to view comments</p>
            )}
          </div>
        )}
      </div>

      {/* Comment input */}
      {activeTab === 'comments' && currentFindingId && (
        <div className="p-4 border-t border-gray-700">
          <div className="flex gap-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment..."
              className="flex-1 bg-gray-800 text-white text-sm rounded-lg px-3 py-2 border border-gray-700 focus:border-cyan-500 outline-none resize-none"
              rows={2}
            />
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              aria-label="Send comment"
              title="Send"
              className="px-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white rounded-xl hover:from-pink-500 hover:to-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/25 hover:shadow-pink-500/25"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Export LiveCursor for future real-time cursor tracking feature
export { LiveCursor };
export default CollaborationPanel;
