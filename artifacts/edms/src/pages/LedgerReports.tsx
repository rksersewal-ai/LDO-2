import { useState } from 'react';
import { GlassCard, Button } from '../components/ui/Shared';
import { MOCK_WORK_LEDGER } from '../lib/mockExtended';
import { FileBarChart, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const byStatus = [
  { status: 'Complete', count: MOCK_WORK_LEDGER.filter(w => w.status === 'Complete').length },
  { status: 'In Progress', count: MOCK_WORK_LEDGER.filter(w => w.status === 'In Progress').length },
  { status: 'Pending', count: MOCK_WORK_LEDGER.filter(w => w.status === 'Pending').length },
  { status: 'Verification', count: MOCK_WORK_LEDGER.filter(w => w.status === 'Pending Verification').length },
];

const byType = [
  { type: 'Inspection', count: 1 }, { type: 'Calibration', count: 1 }, { type: 'Review', count: 1 },
  { type: 'Reporting', count: 1 }, { type: 'Audit', count: 1 },
];

export default function LedgerReports() {
  const [period, setPeriod] = useState('This Month');
  const total = MOCK_WORK_LEDGER.length;
  const completed = MOCK_WORK_LEDGER.filter(w => w.status === 'Complete').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Work Ledger Reports</h1>
          <p className="text-slate-400 text-sm">Summary views and operational reporting for work records.</p>
        </div>
        <div className="flex gap-3">
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="bg-slate-950/50 border border-teal-500/20 text-slate-200 text-sm rounded-xl px-4 py-2 focus:outline-none"
          >
            <option>This Week</option><option>This Month</option><option>This Quarter</option><option>Custom</option>
          </select>
          <Button variant="secondary"><Download className="w-4 h-4" /> Export</Button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: total, color: 'text-white' },
          { label: 'Completed', value: completed, color: 'text-teal-400' },
          { label: 'Open', value: total - completed, color: 'text-amber-400' },
          { label: 'Completion Rate', value: `${Math.round((completed / total) * 100)}%`, color: 'text-white' },
        ].map(s => (
          <GlassCard key={s.label} className="p-5">
            <div className="text-xs text-slate-400 mb-1">{s.label}</div>
            <div className={`text-3xl font-bold ${s.color}`}>{s.value}</div>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-base font-bold text-white mb-4">Records by Status</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byStatus}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
              <XAxis dataKey="status" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '12px', color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-base font-bold text-white mb-4">Records by Type</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={byType}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
              <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '12px', color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <GlassCard className="p-6">
        <h2 className="text-base font-bold text-white mb-4">Work Records Summary</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700/50 text-slate-400">
              <th className="pb-3 text-left font-semibold pl-4">ID</th>
              <th className="pb-3 text-left font-semibold">Title</th>
              <th className="pb-3 text-left font-semibold">Type</th>
              <th className="pb-3 text-left font-semibold">Status</th>
              <th className="pb-3 text-left font-semibold">Assignee</th>
              <th className="pb-3 text-left font-semibold">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/30">
            {MOCK_WORK_LEDGER.map(w => (
              <tr key={w.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-3 pl-4 font-mono text-xs text-teal-400">{w.id}</td>
                <td className="py-3 text-slate-200 text-xs">{w.title}</td>
                <td className="py-3 text-slate-400 text-xs">{w.type}</td>
                <td className="py-3 text-slate-300 text-xs">{w.status}</td>
                <td className="py-3 text-slate-400 text-xs">{w.assignee}</td>
                <td className="py-3 text-slate-500 text-xs">{w.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </GlassCard>
    </div>
  );
}
