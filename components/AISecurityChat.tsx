/**
 * AI Security Chat Interface - WORLD FIRST
 * Natural language interface for security queries
 */

import React, { useState, useRef, useEffect, useCallback } from 'react';

// Types
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  intent?: QueryIntent;
  results?: QueryResult[];
  suggestions?: string[];
  isStreaming?: boolean;
}

export interface QueryIntent {
  type: 'search' | 'analyze' | 'explain' | 'fix' | 'compare' | 'report' | 'general';
  confidence: number;
  entities: {
    vulnerabilities?: string[];
    files?: string[];
    severities?: string[];
    timeframes?: string[];
    technologies?: string[];
  };
}

export interface QueryResult {
  type: 'finding' | 'file' | 'code' | 'metric' | 'action';
  id?: string;
  title: string;
  description?: string;
  severity?: string;
  score?: number;
  codeSnippet?: string;
  language?: string;
  actionUrl?: string;
}

interface AISecurityChatProps {
  projectId?: string;
  onResultClick?: (result: QueryResult) => void;
  onActionExecute?: (action: string, params: any) => void;
  initialMessages?: ChatMessage[];
}

// Suggested queries for quick access
const SUGGESTED_QUERIES = [
  'Show me all critical vulnerabilities',
  'What are the most common security issues?',
  'Explain SQL injection and how to fix it',
  'Which files have the most security issues?',
  'Generate a security report for this week',
  'How do I fix hardcoded secrets?',
  'Compare security between main and develop branches',
  'What CVEs affect my dependencies?',
];

// Intent Icons
const intentIcons: Record<string, string> = {
  search: '🔍',
  analyze: '📊',
  explain: '💡',
  fix: '🔧',
  compare: '⚖️',
  report: '📋',
  general: '💬',
};

// Message Bubble Component
const MessageBubble: React.FC<{
  message: ChatMessage;
  onResultClick?: (result: QueryResult) => void;
}> = ({ message, onResultClick }) => {
  const isUser = message.role === 'user';
  
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] ${isUser ? 'order-2' : 'order-1'}`}>
        {/* Avatar */}
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
            isUser ? 'bg-cyan-500' : 'bg-gradient-to-br from-purple-500 to-pink-500'
          }`}>
            {isUser ? (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            ) : (
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            )}
          </div>

          <div className="flex-1">
            {/* Intent Badge */}
            {message.intent && !isUser && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm">{intentIcons[message.intent.type]}</span>
                <span className="text-xs text-gray-400 capitalize">{message.intent.type}</span>
                <span className="text-xs text-gray-500">
                  ({Math.round(message.intent.confidence * 100)}% confidence)
                </span>
              </div>
            )}

            {/* Message Content */}
            <div className={`rounded-2xl px-4 py-3 ${
              isUser 
                ? 'bg-cyan-500 text-white rounded-tr-md' 
                : 'bg-gray-800 text-gray-100 rounded-tl-md'
            }`}>
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              
              {/* Streaming indicator */}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 bg-cyan-400 animate-pulse ml-1" />
              )}
            </div>

            {/* Results */}
            {message.results && message.results.length > 0 && (
              <div className="mt-3 space-y-2">
                {message.results.map((result, idx) => (
                  <button
                    key={idx}
                    onClick={() => onResultClick?.(result)}
                    className="w-full text-left p-3 bg-gray-800/50 hover:bg-gray-800 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-all group"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {result.severity && (
                            <span className={`w-2 h-2 rounded-full ${
                              result.severity === 'critical' ? 'bg-red-500' :
                              result.severity === 'high' ? 'bg-orange-500' :
                              result.severity === 'medium' ? 'bg-yellow-500' :
                              'bg-green-500'
                            }`} />
                          )}
                          <span className="text-sm font-medium text-white truncate">
                            {result.title}
                          </span>
                        </div>
                        {result.description && (
                          <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                            {result.description}
                          </p>
                        )}
                      </div>
                      <svg className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 flex-shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    {/* Code snippet */}
                    {result.codeSnippet && (
                      <pre className="mt-2 p-2 bg-gray-900 rounded text-xs text-gray-300 overflow-x-auto">
                        <code>{result.codeSnippet}</code>
                      </pre>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Suggestions */}
            {message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {message.suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-cyan-400 rounded-full border border-gray-700 hover:border-cyan-500/50 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {/* Timestamp */}
            <p className={`text-xs text-gray-500 mt-2 ${isUser ? 'text-right' : ''}`}>
              {new Date(message.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Input Component with suggestions
const ChatInput: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  onSuggestionClick: (suggestion: string) => void;
  isLoading: boolean;
  showSuggestions: boolean;
}> = ({ value, onChange, onSubmit, onSuggestionClick, isLoading, showSuggestions }) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  return (
    <div className="border-t border-gray-700 p-4">
      {/* Quick suggestions */}
      {showSuggestions && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUERIES.slice(0, 4).map((query, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick(query)}
                className="text-xs px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-full border border-gray-700 hover:border-cyan-500/50 transition-all"
              >
                {query}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex items-end gap-3">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about security issues, vulnerabilities, or get recommendations..."
            className="w-full bg-gray-800 text-white rounded-xl px-4 py-3 pr-12 border border-gray-700 focus:border-cyan-500 outline-none resize-none transition-colors"
            rows={1}
            style={{ minHeight: '48px', maxHeight: '150px' }}
          />
          <button
            onClick={onSubmit}
            disabled={!value.trim() || isLoading}
            className="absolute right-2 bottom-2 p-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Main Component
export const AISecurityChat: React.FC<AISecurityChatProps> = ({
  projectId: _projectId,
  onResultClick,
  onActionExecute: _onActionExecute,
  initialMessages,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages || [
    {
      id: 'welcome',
      role: 'assistant',
      content: "👋 Hi! I'm your AI Security Assistant. I can help you find vulnerabilities, explain security concepts, suggest fixes, and generate reports. What would you like to know?",
      timestamp: Date.now(),
      suggestions: ['Show critical issues', 'Explain XSS attacks', 'Generate weekly report'],
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Simulate AI response (in production, this would call the actual AI service)
  const simulateResponse = useCallback(async (query: string): Promise<ChatMessage> => {
    // Simulate intent classification
    const detectIntent = (q: string): QueryIntent => {
      const lowerQ = q.toLowerCase();
      
      if (lowerQ.includes('show') || lowerQ.includes('find') || lowerQ.includes('list')) {
        return { type: 'search', confidence: 0.92, entities: { severities: ['critical', 'high'] } };
      }
      if (lowerQ.includes('explain') || lowerQ.includes('what is') || lowerQ.includes('how does')) {
        return { type: 'explain', confidence: 0.88, entities: {} };
      }
      if (lowerQ.includes('fix') || lowerQ.includes('remediate') || lowerQ.includes('solve')) {
        return { type: 'fix', confidence: 0.91, entities: {} };
      }
      if (lowerQ.includes('report') || lowerQ.includes('summary') || lowerQ.includes('generate')) {
        return { type: 'report', confidence: 0.89, entities: {} };
      }
      if (lowerQ.includes('compare') || lowerQ.includes('difference')) {
        return { type: 'compare', confidence: 0.87, entities: {} };
      }
      
      return { type: 'general', confidence: 0.75, entities: {} };
    };

    const intent = detectIntent(query);

    // Generate response based on intent
    let content = '';
    let results: QueryResult[] = [];
    let suggestions: string[] = [];

    switch (intent.type) {
      case 'search':
        content = "I found several vulnerabilities matching your query. Here are the most relevant findings:";
        results = [
          {
            type: 'finding',
            id: 'f1',
            title: 'SQL Injection in user authentication',
            description: 'Unsanitized user input passed directly to database query in auth.ts line 45',
            severity: 'critical',
            codeSnippet: 'const query = `SELECT * FROM users WHERE id = ${userId}`;',
          },
          {
            type: 'finding',
            id: 'f2',
            title: 'Hardcoded AWS credentials',
            description: 'AWS access key exposed in configuration file config/aws.ts',
            severity: 'critical',
          },
          {
            type: 'finding',
            id: 'f3',
            title: 'Cross-Site Scripting (XSS) vulnerability',
            description: 'User input rendered without sanitization in CommentComponent.tsx',
            severity: 'high',
          },
        ];
        suggestions = ['Show fixes for these', 'Export to report', 'Assign to team'];
        break;

      case 'explain':
        content = `**SQL Injection** is a code injection technique that exploits security vulnerabilities in an application's database layer.

**How it works:**
1. Attacker inserts malicious SQL code through user input
2. The application includes this input in SQL queries without proper sanitization
3. The database executes the malicious code

**Impact:**
- Unauthorized data access
- Data modification or deletion
- Authentication bypass
- Complete database takeover

**Prevention:**
- Use parameterized queries (prepared statements)
- Implement input validation
- Use ORM frameworks properly
- Apply principle of least privilege`;
        suggestions = ['Show SQL injection in my code', 'How to fix it?', 'More examples'];
        break;

      case 'fix':
        content = "Here's how to fix the SQL injection vulnerability:";
        results = [
          {
            type: 'code',
            title: 'Recommended Fix',
            description: 'Replace string interpolation with parameterized query',
            codeSnippet: `// Before (vulnerable)
const query = \`SELECT * FROM users WHERE id = \${userId}\`;

// After (secure)
const query = 'SELECT * FROM users WHERE id = $1';
const result = await db.query(query, [userId]);`,
            language: 'typescript',
          },
        ];
        suggestions = ['Apply this fix', 'Show more fixes', 'Create PR with fix'];
        break;

      case 'report':
        content = `📊 **Security Report Summary**

**Time Period:** Last 7 days

**Findings:**
- 🔴 Critical: 3
- 🟠 High: 12
- 🟡 Medium: 28
- 🟢 Low: 45

**Top Issues:**
1. Dependency vulnerabilities (18)
2. Hardcoded secrets (8)
3. Input validation (15)

**Trend:** ↑ 15% improvement from last week

**Recommendations:**
1. Update lodash to version 4.17.21
2. Rotate exposed AWS credentials
3. Implement CSP headers`;
        suggestions = ['Export as PDF', 'Send to team', 'View detailed breakdown'];
        break;

      default:
        content = "I understand you're asking about security. Could you be more specific? For example:\n\n- \"Show me critical vulnerabilities\"\n- \"Explain how XSS works\"\n- \"How do I fix hardcoded secrets?\"\n- \"Generate a security report\"";
        suggestions = SUGGESTED_QUERIES.slice(0, 4);
    }

    return {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: Date.now(),
      intent,
      results,
      suggestions,
    };
  }, []);

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add streaming placeholder
    const streamingId = `streaming-${Date.now()}`;
    setMessages(prev => [...prev, {
      id: streamingId,
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
      isStreaming: true,
    }]);

    // Simulate API delay and streaming
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const response = await simulateResponse(userMessage.content);
    
    // Replace streaming message with actual response
    setMessages(prev => prev.map(msg => 
      msg.id === streamingId ? response : msg
    ));
    
    setIsLoading(false);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl overflow-hidden flex flex-col h-[600px]">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">AI Security Assistant</h3>
            <p className="text-xs text-green-400 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              Online • Powered by Claude
            </p>
          </div>
        </div>
        <button aria-label="Refresh chat" title="Refresh" className="p-2 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 backdrop-blur-sm border border-cyan-500/30 hover:border-pink-500/50 transition-all hover:shadow-lg hover:shadow-pink-500/20 text-gray-400 hover:text-white">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <MessageBubble
            key={message.id}
            message={message}
            onResultClick={onResultClick}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        value={inputValue}
        onChange={setInputValue}
        onSubmit={handleSubmit}
        onSuggestionClick={handleSuggestionClick}
        isLoading={isLoading}
        showSuggestions={messages.length <= 1}
      />
    </div>
  );
};

export default AISecurityChat;
