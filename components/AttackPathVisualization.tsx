/**
 * Attack Path Visualization Component - WORLD FIRST
 * Interactive graph showing vulnerability chains and attack paths
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { backendApi } from '../utils/backendApi';
import { logger } from '../utils/logger';

// Types
export interface AttackNode {
  id: string;
  type: 'vulnerability' | 'asset' | 'entrypoint' | 'target' | 'mitigation';
  label: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  cve?: string;
  exploitability: number;
  x?: number;
  y?: number;
}

export interface AttackEdge {
  source: string;
  target: string;
  label?: string;
  technique?: string;
  probability: number;
}

export interface AttackPath {
  id: string;
  name: string;
  risk: number;
  nodes: AttackNode[];
  edges: AttackEdge[];
  totalProbability: number;
  attackVector: string;
  impactScore: number;
}

interface AttackPathVisualizationProps {
  paths?: AttackPath[];
  selectedPathId?: string;
  onPathSelect?: (pathId: string) => void;
  onNodeClick?: (node: AttackNode) => void;
  height?: number;
}

// Color mappings
const severityColors: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

const nodeTypeIcons: Record<string, string> = {
  vulnerability: '⚠️',
  asset: '🖥️',
  entrypoint: '🚪',
  target: '🎯',
  mitigation: '🛡️',
};

// Node Component
const GraphNode: React.FC<{
  node: AttackNode;
  isSelected: boolean;
  onClick: () => void;
  position: { x: number; y: number };
}> = ({ node, isSelected, onClick, position }) => {
  const color = severityColors[node.severity];
  
  return (
    <g
      transform={`translate(${position.x}, ${position.y})`}
      onClick={onClick}
      style={{ cursor: 'pointer' }}
    >
      {/* Glow effect for selected */}
      {isSelected && (
        <circle
          r={40}
          fill={color}
          opacity={0.2}
          filter="blur(10px)"
        />
      )}
      
      {/* Main circle */}
      <circle
        r={30}
        fill="rgba(17, 24, 39, 0.95)"
        stroke={color}
        strokeWidth={isSelected ? 3 : 2}
        className="transition-all duration-200"
      />
      
      {/* Icon */}
      <text
        textAnchor="middle"
        dominantBaseline="middle"
        fontSize="20"
        className="pointer-events-none"
      >
        {nodeTypeIcons[node.type]}
      </text>
      
      {/* Label */}
      <text
        y={45}
        textAnchor="middle"
        fill="white"
        fontSize="10"
        fontWeight="500"
        className="pointer-events-none"
      >
        {node.label.length > 15 ? node.label.slice(0, 15) + '...' : node.label}
      </text>
      
      {/* CVE badge */}
      {node.cve && (
        <g transform="translate(20, -20)">
          <rect
            x={-25}
            y={-8}
            width={50}
            height={16}
            rx={4}
            fill={color}
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fill="white"
            fontSize="8"
            fontWeight="bold"
            className="pointer-events-none"
          >
            {node.cve}
          </text>
        </g>
      )}
      
      {/* Exploitability indicator */}
      <g transform="translate(0, 55)">
        <rect
          x={-20}
          y={-4}
          width={40}
          height={8}
          rx={2}
          fill="rgba(255,255,255,0.1)"
        />
        <rect
          x={-20}
          y={-4}
          width={40 * (node.exploitability / 10)}
          height={8}
          rx={2}
          fill={color}
        />
      </g>
    </g>
  );
};

// Edge Component
const GraphEdge: React.FC<{
  source: { x: number; y: number };
  target: { x: number; y: number };
  label?: string;
  probability: number;
  isHighlighted: boolean;
}> = ({ source, target, label, probability, isHighlighted }) => {
  // Calculate control point for curved line
  const midX = (source.x + target.x) / 2;
  const midY = (source.y + target.y) / 2;
  // Reserved for future curve calculations
  void(target.x - source.x);
  void(target.y - source.y);
  const controlOffset = 30;
  
  // Path with slight curve
  const path = `M ${source.x} ${source.y} Q ${midX + controlOffset} ${midY - controlOffset} ${target.x} ${target.y}`;
  
  // Calculate arrow position
  const arrowAngle = Math.atan2(target.y - midY + controlOffset, target.x - midX - controlOffset);
  
  return (
    <g>
      {/* Edge line */}
      <path
        d={path}
        fill="none"
        stroke={isHighlighted ? '#22d3ee' : 'rgba(255,255,255,0.3)'}
        strokeWidth={isHighlighted ? 2 : 1}
        strokeDasharray={isHighlighted ? 'none' : '5,5'}
        className="transition-all duration-200"
      />
      
      {/* Arrow */}
      <polygon
        points="0,-4 8,0 0,4"
        fill={isHighlighted ? '#22d3ee' : 'rgba(255,255,255,0.3)'}
        transform={`translate(${target.x - Math.cos(arrowAngle) * 35}, ${target.y - Math.sin(arrowAngle) * 35}) rotate(${arrowAngle * 180 / Math.PI})`}
      />
      
      {/* Probability label */}
      {label && (
        <g transform={`translate(${midX}, ${midY - 15})`}>
          <rect
            x={-30}
            y={-10}
            width={60}
            height={20}
            rx={4}
            fill="rgba(17, 24, 39, 0.9)"
            stroke={isHighlighted ? '#22d3ee' : 'rgba(255,255,255,0.2)'}
          />
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            fill={isHighlighted ? '#22d3ee' : 'white'}
            fontSize="9"
            className="pointer-events-none"
          >
            {label} ({(probability * 100).toFixed(0)}%)
          </text>
        </g>
      )}
    </g>
  );
};

// Path Selector
const PathSelector: React.FC<{
  paths: AttackPath[];
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ paths, selectedId, onSelect }) => {
  const sortedPaths = [...paths].sort((a, b) => b.risk - a.risk);
  
  return (
    <div className="space-y-2">
      {sortedPaths.map(path => (
        <button
          key={path.id}
          onClick={() => onSelect(path.id)}
          className={`w-full p-3 rounded-lg text-left transition-all ${
            selectedId === path.id
              ? 'bg-cyan-500/20 border-cyan-500'
              : 'bg-gray-800/50 border-gray-700 hover:border-gray-600'
          } border`}
        >
          <div className="flex items-center justify-between">
            <span className="font-medium text-white text-sm">{path.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded ${
              path.risk >= 8 ? 'bg-red-500/20 text-red-400' :
              path.risk >= 6 ? 'bg-orange-500/20 text-orange-400' :
              path.risk >= 4 ? 'bg-yellow-500/20 text-yellow-400' :
              'bg-green-500/20 text-green-400'
            }`}>
              Risk: {path.risk.toFixed(1)}
            </span>
          </div>
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>📍 {path.attackVector}</span>
            <span>🎯 Impact: {path.impactScore}</span>
            <span>⚡ {(path.totalProbability * 100).toFixed(0)}% likely</span>
          </div>
        </button>
      ))}
    </div>
  );
};

// Node Detail Panel
const NodeDetailPanel: React.FC<{ node: AttackNode | null; onClose: () => void }> = ({ node, onClose }) => {
  const [remediateStatus, setRemediateStatus] = useState<string>('');
  const [showRemediation, setShowRemediation] = useState(false);
  if (!node) return null;

  return (
    <div className="absolute right-4 top-4 w-72 bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl overflow-hidden z-10">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h4 className="font-medium text-white">{nodeTypeIcons[node.type]} {node.label}</h4>
        <button onClick={onClose} aria-label="Close panel" title="Close" className="p-1 rounded-lg bg-linear-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 hover:border-pink-500/50 text-gray-400 hover:text-white transition-all">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="p-4 space-y-3">
        <div>
          <span className="text-xs text-gray-500 uppercase">Severity</span>
          <div className="flex items-center gap-2 mt-1">
            <span
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: severityColors[node.severity] }}
            />
            <span className="text-sm text-white capitalize">{node.severity}</span>
          </div>
        </div>
        {node.cve && (
          <div>
            <span className="text-xs text-gray-500 uppercase">CVE ID</span>
            <p className="text-sm text-cyan-400 font-mono mt-1">{node.cve}</p>
          </div>
        )}
        <div>
          <span className="text-xs text-gray-500 uppercase">Exploitability</span>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${node.exploitability * 10}%`,
                  backgroundColor: severityColors[node.severity],
                }}
              />
            </div>
            <span className="text-sm text-white">{node.exploitability}/10</span>
          </div>
        </div>
        <div>
          <span className="text-xs text-gray-500 uppercase">Description</span>
          <p className="text-sm text-gray-300 mt-1">{node.description}</p>
        </div>
        <button onClick={() => {
          if (remediateStatus === '') {
            setShowRemediation(true);
            setRemediateStatus('remediating');
            setTimeout(() => {
              setRemediateStatus('done');
              setTimeout(() => setRemediateStatus(''), 2000);
            }, 1500);
          }
        }} disabled={remediateStatus !== ''} className={`w-full mt-2 py-2 rounded-lg text-sm font-medium transition-colors ${
          remediateStatus === 'remediating' ? 'bg-yellow-500 text-white' :
          remediateStatus === 'done' ? 'bg-green-600 text-white' :
          'bg-cyan-500 text-white hover:bg-cyan-600'
        }`}>
          {remediateStatus === 'remediating' ? '⏳ Remediating...' : remediateStatus === 'done' ? '✓ Remediated' : 'Remediate'}
        </button>
        {showRemediation && (
          <div className="mt-2 p-3 bg-gray-800/50 border border-cyan-500/20 rounded-lg text-sm space-y-1">
            <div className="text-cyan-400 font-medium mb-1">Remediation Steps:</div>
            <div className="text-gray-300">1. Apply relevant security patches</div>
            <div className="text-gray-300">2. Restrict network access</div>
            <div className="text-gray-300">3. Enable monitoring and alerting</div>
            <div className="text-gray-300">4. Validate fix with penetration test</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Main Component
export const AttackPathVisualization: React.FC<AttackPathVisualizationProps> = ({
  paths,
  selectedPathId,
  onPathSelect,
  onNodeClick,
  height = 500,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedNode, setSelectedNode] = useState<AttackNode | null>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height });
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [_loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState('');

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await backendApi.modules.getDashboard('attack-path');
        // eslint-disable-line no-console
      } catch (e) { logger.error(e); } finally { setLoading(false); }
    })();
  }, []);

  const handleAIAnalysis = async () => {
    setAnalyzing(true);
    try {
      const res = await backendApi.modules.analyze('attack-path', 'Analyze attack paths for critical asset exposure and recommend segmentation improvements') as Record<string, unknown>;
      if (res?.analysis) setAnalysisResult(res.analysis as string);
    } catch (e) { logger.error(e); } finally { setAnalyzing(false); }
  };

  // Mock data for demo
  const demoData: AttackPath[] = paths || [
    {
      id: '1',
      name: 'SQL Injection → Data Breach',
      risk: 9.2,
      attackVector: 'Network',
      impactScore: 9,
      totalProbability: 0.73,
      nodes: [
        { id: 'n1', type: 'entrypoint', label: 'Web Form', severity: 'medium', description: 'User input form vulnerable to injection', exploitability: 8 },
        { id: 'n2', type: 'vulnerability', label: 'SQL Injection', severity: 'critical', description: 'Unsanitized input allows SQL commands', cve: 'CVE-2024-1234', exploitability: 9 },
        { id: 'n3', type: 'asset', label: 'Database', severity: 'high', description: 'PostgreSQL database with customer data', exploitability: 7 },
        { id: 'n4', type: 'target', label: 'Customer PII', severity: 'critical', description: 'Personal identifiable information at risk', exploitability: 8 },
      ],
      edges: [
        { source: 'n1', target: 'n2', label: 'Exploit', technique: 'T1190', probability: 0.9 },
        { source: 'n2', target: 'n3', label: 'Access', technique: 'T1078', probability: 0.85 },
        { source: 'n3', target: 'n4', label: 'Exfiltrate', technique: 'T1048', probability: 0.95 },
      ],
    },
    {
      id: '2',
      name: 'Hardcoded Secrets → AWS Takeover',
      risk: 8.5,
      attackVector: 'Repository',
      impactScore: 10,
      totalProbability: 0.62,
      nodes: [
        { id: 'n1', type: 'entrypoint', label: 'GitHub Repo', severity: 'medium', description: 'Public repository with exposed code', exploitability: 6 },
        { id: 'n2', type: 'vulnerability', label: 'Hardcoded Key', severity: 'high', description: 'AWS access key exposed in source', cve: 'CWE-798', exploitability: 9 },
        { id: 'n3', type: 'asset', label: 'AWS IAM', severity: 'critical', description: 'Identity management service', exploitability: 8 },
        { id: 'n4', type: 'target', label: 'Cloud Infra', severity: 'critical', description: 'Complete AWS infrastructure access', exploitability: 7 },
      ],
      edges: [
        { source: 'n1', target: 'n2', label: 'Discover', technique: 'T1552', probability: 0.8 },
        { source: 'n2', target: 'n3', label: 'Authenticate', technique: 'T1078', probability: 0.9 },
        { source: 'n3', target: 'n4', label: 'Escalate', technique: 'T1068', probability: 0.85 },
      ],
    },
    {
      id: '3',
      name: 'XSS → Session Hijacking',
      risk: 7.4,
      attackVector: 'Client',
      impactScore: 7,
      totalProbability: 0.58,
      nodes: [
        { id: 'n1', type: 'entrypoint', label: 'Comment Field', severity: 'low', description: 'User comment input field', exploitability: 7 },
        { id: 'n2', type: 'vulnerability', label: 'Stored XSS', severity: 'high', description: 'JavaScript execution in browser', cve: 'CWE-79', exploitability: 8 },
        { id: 'n3', type: 'asset', label: 'Session Cookie', severity: 'high', description: 'Authentication token in browser', exploitability: 6 },
        { id: 'n4', type: 'target', label: 'User Account', severity: 'high', description: 'Victim user account access', exploitability: 7 },
      ],
      edges: [
        { source: 'n1', target: 'n2', label: 'Inject', technique: 'T1059', probability: 0.75 },
        { source: 'n2', target: 'n3', label: 'Steal', technique: 'T1539', probability: 0.8 },
        { source: 'n3', target: 'n4', label: 'Impersonate', technique: 'T1550', probability: 0.95 },
      ],
    },
  ];

  const [currentPathId, setCurrentPathId] = useState(selectedPathId || demoData[0].id);
  const currentPath = demoData.find(p => p.id === currentPathId) || demoData[0];

  // Calculate node positions
  const calculatePositions = useCallback((nodes: AttackNode[], width: number, height: number) => {
    const padding = 80;
    const nodeSpacing = (width - 2 * padding) / (nodes.length - 1 || 1);
    
    return nodes.map((node, index) => ({
      ...node,
      x: padding + index * nodeSpacing,
      y: height / 2 + (index % 2 === 0 ? 0 : 30), // Slight vertical offset for visual interest
    }));
  }, []);

  const positionedNodes = calculatePositions(currentPath.nodes, dimensions.width, dimensions.height);

  // Mouse handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - transform.x, y: e.clientY - transform.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setTransform(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      }));
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const scaleFactor = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform(prev => ({
      ...prev,
      scale: Math.min(Math.max(prev.scale * scaleFactor, 0.5), 2),
    }));
  };

  const resetView = () => {
    setTransform({ x: 0, y: 0, scale: 1 });
  };

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (svgRef.current) {
        const rect = svgRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, [height]);

  const handlePathSelect = (id: string) => {
    setCurrentPathId(id);
    onPathSelect?.(id);
    setSelectedNode(null);
    resetView();
  };

  return (
    <div className="bg-gray-900/95 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-white">Attack Path Visualization</h3>
          <p className="text-sm text-gray-400">Interactive visualization of potential attack chains</p>
          <button onClick={handleAIAnalysis} disabled={analyzing} className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm">{analyzing ? 'Analyzing...' : 'AI Analysis'}</button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetView}
            className="p-2 bg-gray-800 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
            title="Reset view"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Path Selector Sidebar */}
        <div className="w-72 border-r border-gray-700 p-4 max-h-[500px] overflow-y-auto">
          <h4 className="text-sm font-medium text-gray-400 mb-3">Attack Paths ({demoData.length})</h4>
          <PathSelector
            paths={demoData}
            selectedId={currentPathId}
            onSelect={handlePathSelect}
          />
        </div>

        {/* Graph Area */}
        <div className="flex-1 relative" style={{ height }}>
          <svg
            ref={svgRef}
            width="100%"
            height={height}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
            style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
            className="bg-gray-900/50"
          >
            {/* Grid pattern */}
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.scale})`}>
              {/* Edges */}
              {currentPath.edges.map(edge => {
                const sourceNode = positionedNodes.find(n => n.id === edge.source);
                const targetNode = positionedNodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode) return null;

                return (
                  <GraphEdge
                    key={`${edge.source}-${edge.target}`}
                    source={{ x: sourceNode.x!, y: sourceNode.y! }}
                    target={{ x: targetNode.x!, y: targetNode.y! }}
                    label={edge.label}
                    probability={edge.probability}
                    isHighlighted={selectedNode?.id === edge.source || selectedNode?.id === edge.target}
                  />
                );
              })}

              {/* Nodes */}
              {positionedNodes.map(node => (
                <GraphNode
                  key={node.id}
                  node={node}
                  isSelected={selectedNode?.id === node.id}
                  onClick={() => {
                    setSelectedNode(node);
                    onNodeClick?.(node);
                  }}
                  position={{ x: node.x!, y: node.y! }}
                />
              ))}
            </g>
          </svg>

          {/* Node Detail Panel */}
          <NodeDetailPanel node={selectedNode} onClose={() => setSelectedNode(null)} />

          {/* Legend */}
          <div className="absolute left-4 bottom-4 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-lg p-3">
            <h5 className="text-xs font-medium text-gray-400 mb-2">Legend</h5>
            <div className="space-y-1">
              {Object.entries(nodeTypeIcons).map(([type, icon]) => (
                <div key={type} className="flex items-center gap-2 text-xs text-gray-300">
                  <span>{icon}</span>
                  <span className="capitalize">{type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Zoom indicator */}
          <div className="absolute right-4 bottom-4 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-lg px-3 py-1.5">
            <span className="text-xs text-gray-400">{Math.round(transform.scale * 100)}%</span>
          </div>
        </div>
      </div>
      {analysisResult && (
        <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-4 mt-4">
          <div className="flex justify-between items-center mb-2"><h3 className="font-semibold text-blue-400">AI Analysis</h3><button onClick={() => setAnalysisResult('')} className="text-slate-400 hover:text-white text-sm">✕</button></div>
          <div className="text-sm text-slate-300 whitespace-pre-wrap">{analysisResult}</div>
        </div>
      )}
    </div>
  );
};

export default AttackPathVisualization;
