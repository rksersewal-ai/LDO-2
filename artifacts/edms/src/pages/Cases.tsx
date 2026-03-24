import { useState } from 'react';
import { GlassCard, Badge, Button, Input } from '../components/ui/Shared';
import { MOCK_CASES } from '../lib/mockExtended';
import { ShieldAlert, FileSearch, FileText, ArrowLeft, X, Clock, User, Calendar, Link as LinkIcon } from 'lucide-react';
import { useNavigate } from 'react-router';

const statusVariant = (s: string) => {
  if (s === 'Closed') return 'success' as const;
  if (s === 'Open') return 'danger' as const;
  if (s === 'In Progress') return 'warning' as const;
  return 'default' as const;
};

export default function Cases() {
  const navigate = useNavigate();
  const [selectedCase, setSelectedCase] = useState<typeof MOCK_CASES[0] | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filtered = MOCK_CASES
    .filter(c => statusFilter === 'All' || c.status === statusFilter)
    .filter(c => !search || c.title.toLowerCase().includes(search.toLowerCase()) || c.id.toLowerCase().includes(search.toLowerCase()));

  if (selectedCase) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <div className="flex items-center gap-4">
          <Button variant="ghost" className="px-2" onClick={() => setSelectedCase(null)}><ArrowLeft className="w-4 h-4" /></Button>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h1 className="text-2xl font-bold text-white">{selectedCase.title}</h1>
              <Badge variant={statusVariant(selectedCase.status)}>{selectedCase.status}</Badge>
              <Badge variant={selectedCase.severity === 'High' ? 'danger' : selectedCase.severity === 'Medium' ? 'warning' : 'default'}>{selectedCase.severity}</Badge>
            </div>
            <p className="text-sm text-slate-400 mt-1 font-mono pl-8">{selectedCase.id} · Updated {selectedCase.updated}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Case Description</h2>
              <p className="text-slate-300 leading-relaxed">{selectedCase.description}</p>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-lg font-bold text-white mb-4">Linked Documents</h2>
              {selectedCase.linkedDocs.length > 0 ? (
                <div className="space-y-2">
                  {selectedCase.linkedDocs.map(docId => (
                    <div
                      key={docId}
                      className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-teal-500/30 cursor-pointer transition-colors"
                      onClick={() => navigate(`/documents/${docId}`)}
                    >
                      <FileText className="w-4 h-4 text-teal-500" />
                      <span className="text-sm text-teal-400 font-mono">{docId}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-500">No documents linked to this case.</p>
              )}
            </GlassCard>
          </div>

          <div className="space-y-4">
            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-white mb-4">Case Metadata</h3>
              <div className="space-y-3">
                {[
                  { icon: User, label: 'Assignee', value: selectedCase.assignee },
                  { icon: Calendar, label: 'Created', value: selectedCase.created },
                  { icon: Clock, label: 'Updated', value: selectedCase.updated },
                  { icon: LinkIcon, label: 'Linked PL', value: selectedCase.linkedPL },
                ].map(f => (
                  <div key={f.label} className="flex items-center gap-3">
                    <f.icon className="w-4 h-4 text-slate-500 shrink-0" />
                    <div>
                      <p className="text-xs text-slate-500">{f.label}</p>
                      <p className="text-sm text-slate-200">{f.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-5">
              <h3 className="text-sm font-bold text-white mb-3">Actions</h3>
              <div className="space-y-2">
                <Button className="w-full justify-start">Update Status</Button>
                <Button variant="secondary" className="w-full justify-start">Add Comment</Button>
                <Button variant="secondary" className="w-full justify-start">Link Document</Button>
                {selectedCase.status !== 'Closed' && (
                  <Button variant="danger" className="w-full justify-start">Close Case</Button>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Cases</h1>
          <p className="text-slate-400 text-sm">Engineering discrepancy and compliance case management.</p>
        </div>
        <Button><ShieldAlert className="w-4 h-4" /> New Case</Button>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="relative flex-1 min-w-48">
          <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <Input
            placeholder="Search cases by ID, title..."
            className="pl-9 w-full"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {['All', 'Open', 'In Progress', 'Closed'].map(s => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                statusFilter === s ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map(c => (
          <GlassCard
            key={c.id}
            className="p-5 hover:border-teal-500/40 cursor-pointer transition-all group"
            onClick={() => setSelectedCase(c)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span className="font-mono text-xs text-teal-400">{c.id}</span>
                <Badge variant={statusVariant(c.status)}>{c.status}</Badge>
                <Badge variant={c.severity === 'High' ? 'danger' : c.severity === 'Medium' ? 'warning' : 'default'}>{c.severity}</Badge>
              </div>
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-2">{c.title}</h3>
            <p className="text-xs text-slate-400 line-clamp-2 mb-3">{c.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1"><User className="w-3 h-3" />{c.assignee}</span>
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Updated {c.updated}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {filtered.length === 0 && (
        <GlassCard className="p-12 text-center">
          <ShieldAlert className="w-10 h-10 mx-auto mb-2 opacity-30 text-slate-400" />
          <p className="text-slate-500">No cases match the current filters</p>
        </GlassCard>
      )}
    </div>
  );
}
