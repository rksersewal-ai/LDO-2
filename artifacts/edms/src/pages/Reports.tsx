import { useState } from 'react';
import { GlassCard, Badge, Button } from '../components/ui/Shared';
import { MOCK_REPORTS, MOCK_WORK_LEDGER } from '../lib/mockExtended';
import { MOCK_DOCUMENTS } from '../lib/mock';
import { BarChart3, Download, FileText, X } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const COLORS = ['#14b8a6', '#f59e0b', '#64748b', '#ef4444'];

const docStatusData = [
  { name: 'Approved', value: MOCK_DOCUMENTS.filter(d => d.status === 'Approved').length },
  { name: 'In Review', value: MOCK_DOCUMENTS.filter(d => d.status === 'In Review').length },
  { name: 'Draft', value: MOCK_DOCUMENTS.filter(d => d.status === 'Draft').length },
  { name: 'Obsolete', value: MOCK_DOCUMENTS.filter(d => d.status === 'Obsolete').length },
];

const workByType = [
  { type: 'Inspection', count: 1 }, { type: 'Calibration', count: 1 }, { type: 'Review', count: 1 },
  { type: 'Reporting', count: 1 }, { type: 'Audit', count: 1 },
];

export default function Reports() {
  const [selectedReport, setSelectedReport] = useState<typeof MOCK_REPORTS[0] | null>(null);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Reports</h1>
        <p className="text-slate-400 text-sm">Operational summaries, analytics, and exportable reports.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MOCK_REPORTS.map(r => (
          <GlassCard
            key={r.id}
            className="p-5 hover:border-teal-500/40 cursor-pointer transition-all"
            onClick={() => setSelectedReport(r)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
                <BarChart3 className="w-5 h-5" />
              </div>
              <Badge variant={r.status === 'Ready' ? 'success' : 'processing'}>{r.status}</Badge>
            </div>
            <h3 className="text-sm font-semibold text-slate-200 mb-1">{r.name}</h3>
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{r.description}</p>
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="px-2 py-0.5 bg-slate-800 rounded-md text-slate-400">{r.category}</span>
              <span>Generated {r.generated}</span>
            </div>
          </GlassCard>
        ))}
      </div>

      {selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <GlassCard className="w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-white">{selectedReport.name}</h2>
              <button onClick={() => setSelectedReport(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-sm text-slate-400 mb-4">{selectedReport.description}</p>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {[
                { label: 'Category', value: selectedReport.category },
                { label: 'Status', value: selectedReport.status },
                { label: 'Generated', value: selectedReport.generated },
                { label: 'ID', value: selectedReport.id },
              ].map(f => (
                <div key={f.label} className="bg-slate-800/30 rounded-lg p-3">
                  <p className="text-xs text-slate-500 mb-1">{f.label}</p>
                  <p className="text-sm text-slate-200 font-medium">{f.value}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button className="flex-1"><Download className="w-4 h-4" /> Download PDF</Button>
              <Button variant="secondary" className="flex-1"><Download className="w-4 h-4" /> Export CSV</Button>
            </div>
          </GlassCard>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h2 className="text-base font-bold text-white mb-4">Document Status Distribution</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={docStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name} (${value})`} labelLine={false}>
                {docStatusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '12px', color: '#e2e8f0' }} />
            </PieChart>
          </ResponsiveContainer>
        </GlassCard>

        <GlassCard className="p-6">
          <h2 className="text-base font-bold text-white mb-4">Work Records by Type</h2>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={workByType}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(71, 85, 105, 0.3)" />
              <XAxis dataKey="type" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '12px', color: '#e2e8f0' }} />
              <Bar dataKey="count" fill="#14b8a6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>
    </div>
  );
}
