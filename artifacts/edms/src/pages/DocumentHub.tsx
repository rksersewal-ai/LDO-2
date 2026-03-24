import { useState } from 'react';
import { useNavigate } from 'react-router';
import { GlassCard, Badge, Button, Input } from '../components/ui/Shared';
import { MOCK_DOCUMENTS } from '../lib/mock';
import {
  FileText, Search, Filter, Upload, Download, Eye,
  SortAsc, Grid, List, ChevronRight, FileImage, File
} from 'lucide-react';

const statusVariant = (s: string) => {
  if (s === 'Approved') return 'success' as const;
  if (s === 'In Review') return 'warning' as const;
  if (s === 'Obsolete') return 'danger' as const;
  if (s === 'Draft') return 'default' as const;
  return 'default' as const;
};

const ocrVariant = (s: string) => {
  if (s === 'Completed') return 'success' as const;
  if (s === 'Processing') return 'processing' as const;
  if (s === 'Failed') return 'danger' as const;
  return 'default' as const;
};

const FileIcon = ({ type }: { type: string }) => {
  if (type === 'PNG' || type === 'JPG') return <FileImage className="w-5 h-5 text-purple-400" />;
  if (type === 'XLSX') return <File className="w-5 h-5 text-green-400" />;
  if (type === 'DOCX') return <File className="w-5 h-5 text-blue-400" />;
  return <FileText className="w-5 h-5 text-teal-400" />;
};

export default function DocumentHub() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  const filtered = MOCK_DOCUMENTS.filter(d => {
    const matchSearch = !search ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.id.toLowerCase().includes(search.toLowerCase()) ||
      d.linkedPL?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'All' || d.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Document Hub</h1>
          <p className="text-slate-400 text-sm">
            Manage, search, and track all engineering documents linked to PL records.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary"><Upload className="w-4 h-4" /> Upload</Button>
          <Button><FileText className="w-4 h-4" /> New Document</Button>
        </div>
      </div>

      <GlassCard className="p-4">
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Search documents by name, ID, or linked PL..."
              className="pl-9 w-full"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['All', 'Approved', 'In Review', 'Draft', 'Obsolete'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 rounded-xl text-xs font-medium border transition-colors ${
                  statusFilter === s
                    ? 'bg-teal-500/20 border-teal-500/40 text-teal-300'
                    : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex gap-1 border border-slate-700 rounded-xl overflow-hidden">
            <button onClick={() => setViewMode('table')} className={`px-3 py-2 text-xs transition-colors ${viewMode === 'table' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-500 hover:text-slate-300'}`}>
              <List className="w-4 h-4" />
            </button>
            <button onClick={() => setViewMode('grid')} className={`px-3 py-2 text-xs transition-colors ${viewMode === 'grid' ? 'bg-teal-500/20 text-teal-300' : 'text-slate-500 hover:text-slate-300'}`}>
              <Grid className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="text-xs text-slate-500 mb-3 font-medium">
          Showing <span className="text-teal-400">{filtered.length}</span> of {MOCK_DOCUMENTS.length} documents
        </div>

        {viewMode === 'table' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400">
                  <th className="pb-3 pl-4 font-semibold w-40">Document ID</th>
                  <th className="pb-3 font-semibold">Name</th>
                  <th className="pb-3 font-semibold">Type</th>
                  <th className="pb-3 font-semibold">Rev</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">OCR</th>
                  <th className="pb-3 font-semibold">Linked PL</th>
                  <th className="pb-3 font-semibold">Updated</th>
                  <th className="pb-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filtered.map(doc => (
                  <tr
                    key={doc.id}
                    className="hover:bg-slate-800/30 cursor-pointer transition-colors group"
                    onClick={() => navigate(`/documents/${doc.id}`)}
                  >
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-2">
                        <FileIcon type={doc.type} />
                        <span className="font-mono text-teal-400 text-xs">{doc.id}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="text-slate-200 font-medium">{doc.name}</span>
                      <div className="text-xs text-slate-500">{doc.author} · {doc.size}</div>
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded-md text-xs">{doc.type}</span>
                    </td>
                    <td className="py-3 text-slate-400 font-mono text-xs">{doc.revision}</td>
                    <td className="py-3">
                      <Badge variant={statusVariant(doc.status)}>{doc.status}</Badge>
                    </td>
                    <td className="py-3">
                      <Badge variant={ocrVariant(doc.ocrStatus)}>{doc.ocrStatus}</Badge>
                    </td>
                    <td className="py-3 font-mono text-xs text-slate-400">{doc.linkedPL}</td>
                    <td className="py-3 text-slate-500 text-xs">{doc.date}</td>
                    <td className="py-3">
                      <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-teal-400 transition-colors" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <FileText className="w-10 h-10 mx-auto mb-2 opacity-30" />
                <p>No documents match the current filters</p>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(doc => (
              <div
                key={doc.id}
                className="p-4 rounded-xl bg-slate-800/30 border border-slate-700/50 hover:border-teal-500/40 cursor-pointer transition-all group"
                onClick={() => navigate(`/documents/${doc.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-800 border border-slate-700/50 flex items-center justify-center">
                    <FileIcon type={doc.type} />
                  </div>
                  <Badge variant={statusVariant(doc.status)}>{doc.status}</Badge>
                </div>
                <p className="text-sm font-medium text-slate-200 mb-1 line-clamp-2">{doc.name}</p>
                <p className="text-xs font-mono text-teal-400 mb-2">{doc.id}</p>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{doc.type} · {doc.size}</span>
                  <span>Rev {doc.revision}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
}
