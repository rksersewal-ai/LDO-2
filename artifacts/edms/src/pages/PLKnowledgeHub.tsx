import { useState } from 'react';
import { GlassCard, Badge, Button, Input } from '../components/ui/Shared';
import { MOCK_PL_RECORDS } from '../lib/mock';
import { PL_DATABASE } from '../lib/bomData';
import { Search, Filter, DatabaseBackup, ArrowRight, Layers, Box, Cpu, Shield, Hash } from 'lucide-react';
import { useNavigate } from 'react-router';

function NodeIcon({ type, className = "w-5 h-5" }: { type: string; className?: string }) {
  if (type === 'assembly') return <Box className={`${className} text-blue-400`} />;
  if (type === 'sub-assembly') return <Layers className={`${className} text-indigo-400`} />;
  return <Cpu className={`${className} text-slate-400`} />;
}

export default function PLKnowledgeHub() {
  const navigate = useNavigate();
  const [view, setView] = useState<'bom' | 'legacy'>('bom');
  const [search, setSearch] = useState('');

  const bomPLRecords = Object.values(PL_DATABASE);
  const filteredBom = bomPLRecords.filter(r => !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.plNumber.includes(search));
  const filteredLegacy = MOCK_PL_RECORDS.filter(r => !search || r.title.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">PL Knowledge Hub</h1>
          <p className="text-slate-400 text-sm">Central repository for Product Lifecycle records — all items identified by 8-digit PL number.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center rounded-lg border border-slate-700/50 overflow-hidden">
            <button
              onClick={() => setView('bom')}
              className={`px-3 py-1.5 text-xs transition-colors ${view === 'bom' ? 'bg-teal-500/15 text-teal-300' : 'text-slate-500 hover:text-slate-300'}`}
            >
              BOM PL Records ({bomPLRecords.length})
            </button>
            <button
              onClick={() => setView('legacy')}
              className={`px-3 py-1.5 text-xs transition-colors ${view === 'legacy' ? 'bg-teal-500/15 text-teal-300' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Legacy Records ({MOCK_PL_RECORDS.length})
            </button>
          </div>
          <Button>Create PL Record</Button>
        </div>
      </div>

      <GlassCard className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1 max-w-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-teal-500" />
            <Input
              placeholder="Search PL records by ID, name, or classification..."
              className="pl-12 w-full py-3 text-base bg-slate-900/80"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <Button variant="secondary" className="py-3"><Filter className="w-5 h-5" /> Filters</Button>
        </div>

        {view === 'bom' ? (
          <div className="space-y-3">
            {filteredBom.map(pl => (
              <div
                key={pl.plNumber}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-teal-500/30 cursor-pointer transition-all group"
                onClick={() => navigate(`/pl/${pl.plNumber}`)}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${pl.type === 'assembly' ? 'bg-blue-500/10' : 'bg-indigo-500/10'}`}>
                  <NodeIcon type={pl.type} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-sm font-semibold text-slate-200">{pl.name}</span>
                    {pl.safetyVital && <Shield className="w-3.5 h-3.5 text-rose-400" title="Safety Vital" />}
                    <Badge variant={pl.lifecycleState === 'Production' || pl.lifecycleState === 'Active' ? 'success' : pl.lifecycleState === 'In Development' || pl.lifecycleState === 'Prototyping' ? 'warning' : 'danger'}>{pl.lifecycleState}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono text-teal-400 flex items-center gap-1"><Hash className="w-3 h-3" />{pl.plNumber}</span>
                    <span>{pl.type}</span>
                    <span>{pl.department}</span>
                    <span>Rev {pl.revision}</span>
                    <span>{pl.source}</span>
                  </div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    {pl.tags.slice(0, 4).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-slate-800 text-slate-400 text-[10px] rounded">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs text-slate-500">{pl.linkedDocuments.length} docs</span>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                </div>
              </div>
            ))}
            {filteredBom.length === 0 && (
              <div className="text-center py-10 text-slate-500">
                <DatabaseBackup className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No BOM PL records match the search</p>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLegacy.map(pl => (
              <div
                key={pl.id}
                className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-teal-500/30 cursor-pointer transition-all group"
                onClick={() => navigate(`/pl/${pl.id.replace('PL-', '')}`)}
              >
                <div className="w-10 h-10 rounded-lg bg-slate-700/30 flex items-center justify-center">
                  <DatabaseBackup className="w-5 h-5 text-slate-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-sm font-semibold text-slate-200">{pl.title}</span>
                    <Badge variant={pl.status === 'Active' ? 'success' : pl.status === 'In Development' ? 'warning' : 'danger'}>{pl.status}</Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono text-teal-400">{pl.id}</span>
                    <span>{pl.lifecycle}</span>
                    <span>{pl.owner}</span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors shrink-0" />
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
