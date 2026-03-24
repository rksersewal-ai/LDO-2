import { useState } from 'react';
import { GlassCard, Badge, Button, Input } from '../components/ui/Shared';
import { MOCK_AUDIT_EXTENDED } from '../lib/mockExtended';
import { FileSearch, Filter, X, AlertCircle, AlertTriangle, Info } from 'lucide-react';

const severityVariant = (s: string) => {
  if (s === 'Critical') return 'danger' as const;
  if (s === 'Warning') return 'warning' as const;
  return 'default' as const;
};
const severityIcon = (s: string) => {
  if (s === 'Critical') return <AlertCircle className="w-3.5 h-3.5 text-rose-400" />;
  if (s === 'Warning') return <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />;
  return <Info className="w-3.5 h-3.5 text-slate-400" />;
};

export default function AuditLog() {
  const [moduleFilter, setModuleFilter] = useState<string>('All');
  const [severityFilter, setSeverityFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<typeof MOCK_AUDIT_EXTENDED[0] | null>(null);

  const modules = ['All', ...Array.from(new Set(MOCK_AUDIT_EXTENDED.map(e => e.module)))];
  const filtered = MOCK_AUDIT_EXTENDED
    .filter(e => moduleFilter === 'All' || e.module === moduleFilter)
    .filter(e => severityFilter === 'All' || e.severity === severityFilter)
    .filter(e => !search || e.action.includes(search.toUpperCase()) || e.user.includes(search) || e.entity.includes(search));

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Audit Log</h1>
        <p className="text-slate-400 text-sm">System-wide event traceability and investigation workspace.</p>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <FileSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search events by user, entity, action..."
              className="pl-9 w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            value={moduleFilter}
            onChange={e => setModuleFilter(e.target.value)}
            className="bg-slate-950/50 border border-teal-500/20 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none"
          >
            {modules.map(m => <option key={m}>{m}</option>)}
          </select>
          <select
            value={severityFilter}
            onChange={e => setSeverityFilter(e.target.value)}
            className="bg-slate-950/50 border border-teal-500/20 text-slate-200 text-sm rounded-xl px-3 py-2 focus:outline-none"
          >
            {['All', 'Critical', 'Warning', 'Info'].map(s => <option key={s}>{s}</option>)}
          </select>
          <Button variant="secondary"><Filter className="w-4 h-4" /> More Filters</Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-700/50 text-slate-400">
                <th className="pb-3 pl-4 font-semibold">Event ID</th>
                <th className="pb-3 font-semibold">Severity</th>
                <th className="pb-3 font-semibold">Action</th>
                <th className="pb-3 font-semibold">Module</th>
                <th className="pb-3 font-semibold">Entity</th>
                <th className="pb-3 font-semibold">User</th>
                <th className="pb-3 font-semibold">IP Address</th>
                <th className="pb-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/30">
              {filtered.map(event => (
                <tr
                  key={event.id}
                  className={`hover:bg-slate-800/30 cursor-pointer transition-colors ${selectedEvent?.id === event.id ? 'bg-slate-800/30' : ''}`}
                  onClick={() => setSelectedEvent(selectedEvent?.id === event.id ? null : event)}
                >
                  <td className="py-3 pl-4 font-mono text-xs text-teal-400">{event.id}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      {severityIcon(event.severity)}
                      <Badge variant={severityVariant(event.severity)}>{event.severity}</Badge>
                    </div>
                  </td>
                  <td className="py-3 font-mono text-xs text-slate-300">{event.action}</td>
                  <td className="py-3 text-slate-400 text-xs">{event.module}</td>
                  <td className="py-3 font-mono text-xs text-blue-400">{event.entity}</td>
                  <td className="py-3 text-slate-300 text-xs">{event.user}</td>
                  <td className="py-3 font-mono text-xs text-slate-500">{event.ip}</td>
                  <td className="py-3 text-slate-500 text-xs">{event.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedEvent && (
          <div className="mt-4 p-4 bg-slate-800/30 rounded-xl border border-teal-500/20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white">Event Detail: {selectedEvent.id}</h3>
              <button onClick={() => setSelectedEvent(null)} className="text-slate-500 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Object.entries(selectedEvent).map(([k, v]) => (
                <div key={k}>
                  <p className="text-xs text-slate-500 mb-0.5 capitalize">{k}</p>
                  <p className="text-xs font-mono text-slate-200">{String(v)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
