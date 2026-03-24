import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { GlassCard, Badge, Button } from '../components/ui/Shared';
import { MOCK_PL_RECORDS } from '../lib/mock';
import { getPLRecord, PL_DATABASE } from '../lib/bomData';
import {
  ArrowLeft, FileText, AlertCircle, History, FileSearch, DatabaseBackup,
  Box, Layers, Cpu, Shield, Package, Hash, Weight, Building2,
  User, Calendar, Activity, FileImage, ArrowUpDown, Repeat,
  ChevronRight, Download, Printer, Link as LinkIcon, Tag,
  AlertTriangle, ExternalLink, CheckCircle, Clock
} from 'lucide-react';

function NodeIcon({ type, className = "w-5 h-5" }: { type: string; className?: string }) {
  if (type === 'assembly') return <Box className={`${className} text-blue-400`} />;
  if (type === 'sub-assembly') return <Layers className={`${className} text-indigo-400`} />;
  return <Cpu className={`${className} text-slate-400`} />;
}

function tagColor(tag: string) {
  const t = tag.toLowerCase();
  if (t.includes('safety')) return 'bg-rose-900/50 text-rose-300 border-rose-500/30';
  if (t.includes('high voltage')) return 'bg-amber-900/50 text-amber-300 border-amber-500/30';
  if (t.includes('electrical') || t.includes('electronics')) return 'bg-blue-900/50 text-blue-300 border-blue-500/30';
  if (t.includes('rotating') || t.includes('precision')) return 'bg-purple-900/50 text-purple-300 border-purple-500/30';
  return 'bg-slate-800 text-slate-400 border-slate-700';
}

function statusBadgeVariant(status: string): "default" | "success" | "warning" | "danger" | "processing" {
  if (['Approved', 'Released', 'Active', 'Production', 'Implemented'].includes(status)) return 'success';
  if (['In Review', 'Preliminary', 'In Development', 'Prototyping', 'Pending'].includes(status)) return 'warning';
  if (['Obsolete', 'Superseded', 'End of Life', 'Cancelled'].includes(status)) return 'danger';
  return 'default';
}

export default function PLDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'documents' | 'drawings' | 'whereUsed' | 'changes' | 'effectivity'>('overview');

  const plRecord = id ? getPLRecord(id) : undefined;
  const legacyPL = !plRecord ? MOCK_PL_RECORDS.find(r => r.id === `PL-${id}` || r.id === id) : undefined;

  if (plRecord) {
    const tabs = [
      { id: 'overview', label: 'Overview' },
      { id: 'documents', label: `Linked Documents (${plRecord.linkedDocuments.length})` },
      { id: 'drawings', label: `Drawings (${plRecord.linkedDrawings.length})` },
      { id: 'whereUsed', label: 'Where Used' },
      { id: 'changes', label: 'Change History' },
      { id: 'effectivity', label: 'Effectivity' },
    ] as const;

    return (
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div>
          <button onClick={() => navigate('/pl')} className="flex items-center gap-2 text-slate-500 hover:text-teal-300 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to PL Knowledge Hub
          </button>
          <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <NodeIcon type={plRecord.type} className="w-6 h-6" />
                <h1 className="text-2xl font-bold text-white">{plRecord.name}</h1>
                <Badge variant={statusBadgeVariant(plRecord.lifecycleState)}>{plRecord.lifecycleState}</Badge>
                {plRecord.safetyVital && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-rose-900/50 border border-rose-500/30 rounded-full text-xs text-rose-300">
                    <Shield className="w-3 h-3" /> Safety Vital
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-sm font-mono pl-9 flex items-center gap-2">
                <Hash className="w-3.5 h-3.5" />PL {plRecord.plNumber} · Rev {plRecord.revision} · {plRecord.type}
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="secondary"><Download className="w-4 h-4" /> Export</Button>
              <Button variant="secondary"><Printer className="w-4 h-4" /> Print</Button>
              <Button><AlertCircle className="w-4 h-4" /> Create Case</Button>
            </div>
          </div>
        </div>

        <div className="flex gap-1 border-b border-slate-700/50 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 px-4 py-2.5 text-xs font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab.id ? 'border-teal-500 text-teal-300' : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              <GlassCard className="p-6">
                <h2 className="text-base font-bold text-white mb-3">Description</h2>
                <p className="text-sm text-slate-300 leading-relaxed">{plRecord.description}</p>
              </GlassCard>
              <GlassCard className="p-6">
                <h2 className="text-base font-bold text-white mb-4">Properties</h2>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Hash, label: 'PL Number', value: plRecord.plNumber, mono: true },
                    { icon: Activity, label: 'Type', value: plRecord.type },
                    { icon: User, label: 'Owner', value: plRecord.owner },
                    { icon: Building2, label: 'Department', value: plRecord.department },
                    { icon: Package, label: 'Source', value: plRecord.source },
                    { icon: Weight, label: 'Weight', value: plRecord.weight ?? '—' },
                    { icon: Calendar, label: 'Created', value: plRecord.createdDate },
                    { icon: Calendar, label: 'Last Modified', value: plRecord.lastModified },
                  ].map(f => (
                    <div key={f.label} className="flex items-start gap-3">
                      <f.icon className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">{f.label}</p>
                        <p className={`text-sm font-medium text-slate-200 ${f.mono ? 'font-mono' : ''}`}>{f.value}</p>
                      </div>
                    </div>
                  ))}
                  {plRecord.supplier && (
                    <div className="flex items-start gap-3">
                      <Building2 className="w-4 h-4 text-slate-500 mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs text-slate-500">Supplier</p>
                        <p className="text-sm font-medium text-slate-200">{plRecord.supplier}</p>
                        {plRecord.supplierPartNo && <p className="text-xs text-slate-500 font-mono">{plRecord.supplierPartNo}</p>}
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="space-y-4">
              <GlassCard className="p-5">
                <h3 className="text-sm font-bold text-white mb-3">Tags & Classification</h3>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {plRecord.tags.map(tag => (
                    <span key={tag} className={`px-2 py-0.5 border text-xs rounded-full ${tagColor(tag)}`}>{tag}</span>
                  ))}
                </div>
                <div className="text-xs text-slate-500 mb-1">Classification</div>
                <p className="text-xs text-slate-300">{plRecord.classification}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <h3 className="text-sm font-bold text-white mb-3">Quick Stats</h3>
                <div className="space-y-2">
                  {[
                    { label: 'Documents', value: plRecord.linkedDocuments.length },
                    { label: 'Drawings', value: plRecord.linkedDrawings.length },
                    { label: 'Where Used', value: plRecord.whereUsed.length },
                    { label: 'Changes', value: plRecord.changeHistory.length },
                    { label: 'Alternates', value: plRecord.alternates.length },
                  ].map(s => (
                    <div key={s.label} className="flex justify-between text-sm">
                      <span className="text-slate-500">{s.label}</span>
                      <span className="text-teal-400 font-semibold">{s.value}</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <GlassCard className="p-6">
            <h2 className="text-base font-bold text-white mb-4">Linked Documents</h2>
            <div className="space-y-3">
              {plRecord.linkedDocuments.map(doc => (
                <div key={doc.docId} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-teal-500/30 cursor-pointer transition-all" onClick={() => navigate(`/documents/${doc.docId}`)}>
                  <FileText className="w-9 h-9 p-2 rounded-lg bg-teal-500/10 text-teal-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-200">{doc.title}</p>
                    <div className="flex gap-3 text-xs text-slate-500 mt-0.5">
                      <span className="font-mono text-teal-400">{doc.docId}</span>
                      <span>{doc.type}</span>
                      <span>Rev {doc.revision}</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={statusBadgeVariant(doc.status)}>{doc.status}</Badge>
                    <ExternalLink className="w-4 h-4 text-slate-600 hover:text-teal-400 transition-colors" />
                  </div>
                </div>
              ))}
              {plRecord.linkedDocuments.length === 0 && <p className="text-slate-500 text-sm">No documents linked to this PL record.</p>}
            </div>
          </GlassCard>
        )}

        {activeTab === 'drawings' && (
          <GlassCard className="p-6">
            <h2 className="text-base font-bold text-white mb-4">Linked Drawings</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700/50 text-slate-400">
                    <th className="pb-3 text-left font-semibold pl-4">Drawing ID</th>
                    <th className="pb-3 text-left font-semibold">Title</th>
                    <th className="pb-3 text-left font-semibold">Sheet</th>
                    <th className="pb-3 text-left font-semibold">Rev</th>
                    <th className="pb-3 text-left font-semibold">Format</th>
                    <th className="pb-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/30">
                  {plRecord.linkedDrawings.map(d => (
                    <tr key={d.drawingId} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 pl-4 font-mono text-xs text-teal-400">{d.drawingId}</td>
                      <td className="py-3 text-slate-200 text-sm">{d.title}</td>
                      <td className="py-3 text-slate-400 text-xs">{d.sheetNo}</td>
                      <td className="py-3 font-mono text-xs text-slate-300">{d.revision}</td>
                      <td className="py-3 text-slate-400 text-xs">{d.format}</td>
                      <td className="py-3"><Badge variant={statusBadgeVariant(d.status)}>{d.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {plRecord.linkedDrawings.length === 0 && <p className="text-slate-500 text-sm mt-4">No drawings linked to this PL record.</p>}
            </div>
          </GlassCard>
        )}

        {activeTab === 'whereUsed' && (
          <GlassCard className="p-6">
            <h2 className="text-base font-bold text-white mb-4">Where Used</h2>
            {plRecord.whereUsed.length > 0 ? (
              <div className="space-y-3">
                {plRecord.whereUsed.map((u, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 cursor-pointer hover:border-teal-500/30 transition-all" onClick={() => navigate(`/pl/${u.parentPL}`)}>
                    <Box className="w-8 h-8 p-1.5 rounded-lg bg-blue-500/10 text-blue-400 shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-200">{u.parentName}</p>
                      <p className="text-xs text-slate-500 font-mono">{u.parentPL} · Find No. {u.findNumber}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Quantity</p>
                      <p className="text-lg font-bold text-teal-400">{u.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">This is a top-level assembly and is not used in any parent assemblies.</p>
            )}
          </GlassCard>
        )}

        {activeTab === 'changes' && (
          <GlassCard className="p-6">
            <h2 className="text-base font-bold text-white mb-4">Change History</h2>
            {plRecord.changeHistory.length > 0 ? (
              <div className="space-y-4">
                {plRecord.changeHistory.map((c, i) => (
                  <div key={c.changeId} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${c.status === 'Implemented' ? 'bg-teal-500/10 border-teal-500/30 text-teal-300' : 'bg-amber-500/10 border-amber-500/30 text-amber-300'}`}>{c.type.slice(0, 1)}</div>
                      {i < plRecord.changeHistory.length - 1 && <div className="w-px flex-1 bg-slate-700/50 mt-2" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-xs text-teal-400">{c.changeId}</span>
                        <span className="text-xs px-1.5 py-0.5 bg-slate-800 rounded text-slate-400">{c.type}</span>
                        <Badge variant={statusBadgeVariant(c.status)}>{c.status}</Badge>
                      </div>
                      <p className="text-sm font-medium text-slate-200">{c.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{c.author} · {c.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-sm">No change history recorded for this PL record.</p>
            )}
          </GlassCard>
        )}

        {activeTab === 'effectivity' && (
          <GlassCard className="p-6">
            <h2 className="text-base font-bold text-white mb-4">Effectivity</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(plRecord.effectivity).filter(([, v]) => v).map(([key, value]) => (
                <div key={key} className="bg-slate-800/30 rounded-xl p-4">
                  <p className="text-xs text-slate-500 mb-1 capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-sm font-medium text-slate-200">{String(value)}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        )}
      </div>
    );
  }

  // Legacy PL
  if (legacyPL) {
    return (
      <div className="space-y-6 max-w-[1200px] mx-auto">
        <button onClick={() => navigate('/pl')} className="flex items-center gap-2 text-slate-500 hover:text-teal-300 text-sm mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to PL Knowledge Hub
        </button>
        <div className="flex items-center gap-3 mb-2">
          <DatabaseBackup className="w-6 h-6 text-slate-400" />
          <h1 className="text-2xl font-bold text-white">{legacyPL.title}</h1>
          <Badge variant={legacyPL.status === 'Active' ? 'success' : legacyPL.status === 'Obsolete' ? 'danger' : 'warning'}>{legacyPL.status}</Badge>
        </div>
        <p className="text-slate-400 text-sm font-mono">{legacyPL.id} · {legacyPL.lifecycle}</p>
        <GlassCard className="p-6">
          <p className="text-slate-300">{legacyPL.description}</p>
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div><p className="text-xs text-slate-500">Owner</p><p className="text-sm text-slate-200">{legacyPL.owner}</p></div>
            <div><p className="text-xs text-slate-500">Last Updated</p><p className="text-sm text-slate-200">{legacyPL.lastUpdated}</p></div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-[60vh]">
      <GlassCard className="p-12 text-center max-w-md">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">PL Record Not Found</h2>
        <p className="text-slate-400 text-sm mb-4">No PL record with ID <span className="font-mono text-teal-400">{id}</span> exists.</p>
        <Button onClick={() => navigate('/pl')}>
          <ArrowLeft className="w-4 h-4" /> Back to PL Knowledge Hub
        </Button>
      </GlassCard>
    </div>
  );
}
