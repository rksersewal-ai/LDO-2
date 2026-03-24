import { useState } from 'react';
import { GlassCard, Badge, Button, Input } from '../components/ui/Shared';
import { MOCK_WORK_LEDGER } from '../lib/mockExtended';
import { Plus, Filter, FileSearch, Briefcase, ChevronRight, X, FileText, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

const statusVariant = (s: string) => {
  if (s === 'Complete') return 'success' as const;
  if (s === 'In Progress') return 'processing' as const;
  if (s === 'Pending' || s === 'Pending Verification') return 'warning' as const;
  return 'default' as const;
};

const priorityColor = (p: string) => {
  if (p === 'High') return 'text-rose-400';
  if (p === 'Low') return 'text-slate-500';
  return 'text-slate-300';
};

export default function WorkLedger() {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [selectedWork, setSelectedWork] = useState<typeof MOCK_WORK_LEDGER[0] | null>(null);
  const [search, setSearch] = useState('');

  const filtered = MOCK_WORK_LEDGER
    .filter(w => !statusFilter || w.status === statusFilter)
    .filter(w => !search || w.title.toLowerCase().includes(search.toLowerCase()) || w.id.toLowerCase().includes(search.toLowerCase()) || w.assignee.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Work Ledger</h1>
          <p className="text-slate-400 text-sm">Track, create, and manage work records across the organization.</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus className="w-4 h-4" /> New Work Record</Button>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Filter by ID, title, assignee..."
              className="pl-9 w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 ml-auto flex-wrap">
            {['Complete', 'In Progress', 'Pending', 'Pending Verification'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(statusFilter === s ? null : s)}
                className={`px-3 py-1 rounded-lg text-xs border transition-colors font-medium ${
                  statusFilter === s ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400">
                <th className="pb-3 pl-4 font-semibold">Work ID</th>
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold">Priority</th>
                <th className="pb-3 font-semibold">Assignee</th>
                <th className="pb-3 font-semibold">Linked PL</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {filtered.map(w => (
                <tr
                  key={w.id}
                  className={`hover:bg-slate-800/30 cursor-pointer transition-colors group ${selectedWork?.id === w.id ? 'bg-slate-800/30' : ''}`}
                  onClick={() => setSelectedWork(w)}
                >
                  <td className="py-3 pl-4 font-mono text-xs text-teal-400">{w.id}</td>
                  <td className="py-3 text-slate-200 font-medium max-w-xs truncate">{w.title}</td>
                  <td className="py-3 text-slate-400 text-xs">{w.type}</td>
                  <td className="py-3"><Badge variant={statusVariant(w.status)}>{w.status}</Badge></td>
                  <td className={`py-3 text-xs font-semibold ${priorityColor(w.priority)}`}>{w.priority}</td>
                  <td className="py-3 text-slate-300 text-xs">{w.assignee}</td>
                  <td className="py-3 font-mono text-xs text-blue-400">{w.linkedPL}</td>
                  <td className="py-3 text-slate-500 text-xs">{w.date}</td>
                  <td className="py-3"><ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" /></td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <Briefcase className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p>No work records match the current filters</p>
            </div>
          )}
        </div>
      </GlassCard>

      {selectedWork && (
        <GlassCard className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-bold text-white">{selectedWork.title}</h2>
                <Badge variant={statusVariant(selectedWork.status)}>{selectedWork.status}</Badge>
              </div>
              <span className="font-mono text-xs text-teal-400">{selectedWork.id}</span>
            </div>
            <button onClick={() => setSelectedWork(null)} className="text-slate-500 hover:text-white transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Type', value: selectedWork.type },
              { label: 'Priority', value: selectedWork.priority },
              { label: 'Assignee', value: selectedWork.assignee },
              { label: 'Date', value: selectedWork.date },
            ].map(f => (
              <div key={f.label}>
                <p className="text-xs text-slate-500 mb-0.5">{f.label}</p>
                <p className="text-sm text-slate-200 font-medium">{f.value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-3">
            {selectedWork.linkedDoc && (
              <button
                onClick={() => navigate(`/documents/${selectedWork.linkedDoc}`)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 text-sm transition-colors"
              >
                <FileText className="w-4 h-4 text-teal-400" />
                <span className="font-mono text-teal-400 text-xs">{selectedWork.linkedDoc}</span>
              </button>
            )}
            {selectedWork.linkedPL && selectedWork.linkedPL !== 'N/A' && (
              <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 text-sm transition-colors">
                <LinkIcon className="w-4 h-4 text-blue-400" />
                <span className="font-mono text-blue-400 text-xs">{selectedWork.linkedPL}</span>
              </button>
            )}
          </div>
        </GlassCard>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="p-6 w-full max-w-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">New Work Record</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs text-slate-400 mb-1 block">Title</label><Input className="w-full" placeholder="Work record title" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-slate-400 mb-1 block">Type</label>
                  <select className="w-full bg-slate-950/50 border border-teal-500/20 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none">
                    {['Inspection', 'Calibration', 'Review', 'Reporting', 'Audit'].map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div><label className="text-xs text-slate-400 mb-1 block">Priority</label>
                  <select className="w-full bg-slate-950/50 border border-teal-500/20 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none">
                    {['Normal', 'High', 'Low'].map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>
              <div><label className="text-xs text-slate-400 mb-1 block">Assignee</label><Input className="w-full" placeholder="Name or username" /></div>
              <div><label className="text-xs text-slate-400 mb-1 block">Linked PL Number</label><Input className="w-full" placeholder="e.g. PL-55092" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button className="flex-1" onClick={() => setShowForm(false)}>Create Record</Button>
              <Button variant="secondary" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
}
