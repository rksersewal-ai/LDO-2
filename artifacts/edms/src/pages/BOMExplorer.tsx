import { useState, useCallback } from 'react';
import { GlassCard, Badge, Button, Input } from '../components/ui/Shared';
import { INITIAL_BOM_TREE, findNode, searchTree, countNodes, PL_DATABASE, cloneTree } from '../lib/bomData';
import type { BOMNode } from '../lib/bomData';
import {
  Component, Search, ChevronRight, ChevronDown, Box, Layers, Cpu,
  Shield, Plus, Minus, Hash, AlertCircle, ZoomIn, List, GitBranch,
  Database, ArrowRight, X, Eye
} from 'lucide-react';
import { useNavigate } from 'react-router';

function NodeIcon({ type }: { type: string }) {
  if (type === 'assembly') return <Box className="w-4 h-4 text-blue-400" />;
  if (type === 'sub-assembly') return <Layers className="w-4 h-4 text-indigo-400" />;
  return <Cpu className="w-4 h-4 text-slate-400" />;
}

function tagColor(tag: string) {
  const t = tag.toLowerCase();
  if (t.includes('safety vital')) return 'bg-rose-900/40 text-rose-300 border-rose-500/30';
  if (t.includes('high voltage')) return 'bg-amber-900/40 text-amber-300 border-amber-500/30';
  if (t.includes('electrical') || t.includes('electronics')) return 'bg-blue-900/40 text-blue-300 border-blue-500/30';
  return 'bg-slate-800 text-slate-400 border-slate-700';
}

function BOMTreeNode({
  node,
  level,
  isExpanded,
  toggleExpand,
  selectedId,
  onSelect,
  searchMatches,
}: {
  node: BOMNode;
  level: number;
  isExpanded: boolean;
  toggleExpand: (id: string) => void;
  selectedId: string | null;
  onSelect: (node: BOMNode) => void;
  searchMatches: Set<string>;
}) {
  const hasChildren = node.children.length > 0;
  const plRecord = PL_DATABASE[node.id];
  const isMatch = searchMatches.size > 0 && searchMatches.has(node.id);
  const isSelected = selectedId === node.id;

  return (
    <div>
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer transition-all group ${
          isSelected ? 'bg-teal-500/15 border border-teal-500/25' : 'hover:bg-slate-800/40'
        } ${isMatch ? 'ring-1 ring-teal-500/50' : ''}`}
        style={{ marginLeft: `${level * 20}px` }}
        onClick={() => { onSelect(node); if (hasChildren) toggleExpand(node.id); }}
      >
        <div className="flex items-center gap-1 shrink-0 w-6">
          {hasChildren ? (
            <button onClick={e => { e.stopPropagation(); toggleExpand(node.id); }} className="text-slate-500 hover:text-teal-400 transition-colors">
              {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          ) : (
            <div className="w-3.5 h-3.5 ml-0.5 rounded-full border border-slate-700 bg-slate-800" />
          )}
        </div>
        <NodeIcon type={node.type} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-slate-200 truncate">{node.name}</span>
            {plRecord?.safetyVital && <Shield className="w-3 h-3 text-rose-400 shrink-0" title="Safety Vital" />}
            <span className="font-mono text-[10px] text-teal-400 shrink-0">{node.id}</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 mt-0.5">
            <span>Rev {node.revision}</span>
            <span>Qty: {node.quantity}</span>
            <span>{node.unitOfMeasure}</span>
            {node.tags.slice(0, 2).map(tag => (
              <span key={tag} className={`px-1 py-0.5 border rounded text-[9px] ${tagColor(tag)}`}>{tag}</span>
            ))}
          </div>
        </div>
        {hasChildren && (
          <span className="text-[10px] text-slate-600 shrink-0">{node.children.length}</span>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children.map(child => (
            <BOMTreeNode
              key={child.id}
              node={child}
              level={level + 1}
              isExpanded={isExpanded}
              toggleExpand={toggleExpand}
              selectedId={selectedId}
              onSelect={onSelect}
              searchMatches={searchMatches}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function RecursiveTree({ nodes, level, expanded, toggleExpand, selectedId, onSelect, searchMatches }: {
  nodes: BOMNode[]; level: number; expanded: Set<string>; toggleExpand: (id: string) => void;
  selectedId: string | null; onSelect: (node: BOMNode) => void; searchMatches: Set<string>;
}) {
  return (
    <>
      {nodes.map(node => (
        <div key={node.id}>
          <BOMTreeNode
            node={node}
            level={level}
            isExpanded={expanded.has(node.id)}
            toggleExpand={toggleExpand}
            selectedId={selectedId}
            onSelect={onSelect}
            searchMatches={searchMatches}
          />
          {node.children.length > 0 && expanded.has(node.id) && (
            <RecursiveTree
              nodes={node.children}
              level={level + 1}
              expanded={expanded}
              toggleExpand={toggleExpand}
              selectedId={selectedId}
              onSelect={onSelect}
              searchMatches={searchMatches}
            />
          )}
        </div>
      ))}
    </>
  );
}

export default function BOMExplorer() {
  const navigate = useNavigate();
  const [bom] = useState(INITIAL_BOM_TREE);
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['38100000']));
  const [selectedNode, setSelectedNode] = useState<BOMNode | null>(null);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'flat'>('tree');

  const searchMatches = search.trim() ? searchTree(bom, search) : new Set<string>();
  const stats = countNodes(bom);

  const toggleExpand = useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandAll = () => {
    const allIds = new Set<string>();
    function collect(nodes: BOMNode[]) { for (const n of nodes) { allIds.add(n.id); collect(n.children); } }
    collect(bom);
    setExpanded(allIds);
  };

  const collapseAll = () => setExpanded(new Set(['38100000']));

  const plRecord = selectedNode ? PL_DATABASE[selectedNode.id] : null;

  return (
    <div className="space-y-4 max-w-[1400px] mx-auto h-[calc(100vh-160px)] flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">BOM Explorer</h1>
          <p className="text-slate-400 text-sm">WAP7 Locomotive Product Structure — Drag & Drop Hierarchy Editor</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 text-xs border border-slate-700 rounded-lg overflow-hidden">
            <button onClick={() => setViewMode('tree')} className={`px-3 py-1.5 flex items-center gap-1 ${viewMode === 'tree' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-500 hover:text-slate-300'}`}>
              <GitBranch className="w-3.5 h-3.5" /> Tree
            </button>
            <button onClick={() => setViewMode('flat')} className={`px-3 py-1.5 flex items-center gap-1 ${viewMode === 'flat' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-500 hover:text-slate-300'}`}>
              <List className="w-3.5 h-3.5" /> Flat
            </button>
          </div>
          <Button variant="secondary"><Plus className="w-4 h-4" /> Add Node</Button>
          <Button variant="secondary" onClick={() => navigate('/pl')}>
            <Database className="w-4 h-4" /> PL Hub
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex gap-4 text-xs">
        {[
          { label: 'Total Nodes', value: stats.total },
          { label: 'Assemblies', value: stats.assemblies },
          { label: 'Parts', value: stats.parts },
        ].map(s => (
          <GlassCard key={s.label} className="px-3 py-2 flex items-center gap-2">
            <span className="text-slate-400">{s.label}</span>
            <span className="font-bold text-teal-400">{s.value}</span>
          </GlassCard>
        ))}
      </div>

      <div className="flex-1 flex gap-4 min-h-0">
        {/* Tree Panel */}
        <GlassCard className="flex flex-col" style={{ width: selectedNode ? '55%' : '100%', transition: 'width 0.3s ease' }}>
          <div className="p-4 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <Input
                  placeholder="Search by name, PL number, or tag..."
                  className="pl-9 w-full"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-1">
                <button onClick={expandAll} className="px-2 py-1 text-xs text-slate-400 hover:text-teal-300 border border-slate-700 rounded-lg transition-colors">
                  Expand All
                </button>
                <button onClick={collapseAll} className="px-2 py-1 text-xs text-slate-400 hover:text-teal-300 border border-slate-700 rounded-lg transition-colors">
                  Collapse
                </button>
              </div>
            </div>
            {search && searchMatches.size > 0 && (
              <p className="text-xs text-teal-400 mt-2">{searchMatches.size} nodes match "{search}"</p>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-0.5 custom-scrollbar">
            <RecursiveTree
              nodes={bom}
              level={0}
              expanded={expanded}
              toggleExpand={toggleExpand}
              selectedId={selectedNode?.id ?? null}
              onSelect={setSelectedNode}
              searchMatches={searchMatches}
            />
          </div>
        </GlassCard>

        {/* Detail Panel */}
        {selectedNode && (
          <GlassCard className="flex-1 flex flex-col min-w-0">
            <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
              <div className="flex items-center gap-2">
                <NodeIcon type={selectedNode.type} />
                <h2 className="text-sm font-bold text-white truncate">{selectedNode.name}</h2>
              </div>
              <button onClick={() => setSelectedNode(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* BOM Properties */}
              <div>
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">BOM Properties</h3>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'PL Number', value: selectedNode.id, mono: true },
                    { label: 'Revision', value: selectedNode.revision, mono: true },
                    { label: 'Type', value: selectedNode.type },
                    { label: 'Quantity', value: String(selectedNode.quantity) },
                    { label: 'Find No.', value: selectedNode.findNumber },
                    { label: 'Unit', value: selectedNode.unitOfMeasure },
                  ].map(f => (
                    <div key={f.label}>
                      <p className="text-[10px] text-slate-500">{f.label}</p>
                      <p className={`text-xs font-medium text-slate-200 ${f.mono ? 'font-mono text-teal-400' : ''}`}>{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tags */}
              {selectedNode.tags.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-1">
                    {selectedNode.tags.map(tag => (
                      <span key={tag} className={`px-1.5 py-0.5 border rounded text-[10px] ${tagColor(tag)}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* PL Record Info */}
              {plRecord && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">PL Record</h3>
                  <div className="p-3 bg-slate-800/30 rounded-xl border border-slate-700/50 space-y-2">
                    {plRecord.safetyVital && (
                      <div className="flex items-center gap-2 text-rose-400 text-xs">
                        <Shield className="w-3.5 h-3.5" /> Safety Vital Item
                      </div>
                    )}
                    <div><p className="text-[10px] text-slate-500">Owner</p><p className="text-xs text-slate-200">{plRecord.owner}</p></div>
                    <div><p className="text-[10px] text-slate-500">Department</p><p className="text-xs text-slate-200">{plRecord.department}</p></div>
                    <div><p className="text-[10px] text-slate-500">Lifecycle</p><p className="text-xs text-teal-300">{plRecord.lifecycleState}</p></div>
                    {plRecord.weight && <div><p className="text-[10px] text-slate-500">Weight</p><p className="text-xs text-slate-200">{plRecord.weight}</p></div>}
                    {plRecord.supplier && <div><p className="text-[10px] text-slate-500">Supplier</p><p className="text-xs text-slate-200">{plRecord.supplier}</p></div>}
                  </div>
                </div>
              )}

              {/* Children */}
              {selectedNode.children.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Children ({selectedNode.children.length})</h3>
                  <div className="space-y-1">
                    {selectedNode.children.map(c => (
                      <div key={c.id} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 cursor-pointer transition-colors" onClick={() => setSelectedNode(c)}>
                        <NodeIcon type={c.type} />
                        <span className="text-xs text-slate-300 flex-1 truncate">{c.name}</span>
                        <span className="font-mono text-[10px] text-teal-400">{c.id}</span>
                        <span className="text-[10px] text-slate-500">×{c.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button className="w-full" onClick={() => navigate(`/pl/${selectedNode.id}`)}>
                <Eye className="w-4 h-4" /> Open PL Record
              </Button>
            </div>
          </GlassCard>
        )}
      </div>
    </div>
  );
}
