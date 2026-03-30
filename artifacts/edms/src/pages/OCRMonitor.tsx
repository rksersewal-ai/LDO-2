import { useEffect, useState } from 'react';
import { GlassCard, Badge, Button } from '../components/ui/Shared';
import { MOCK_OCR_JOBS } from '../lib/mockExtended';
import { ServerCog, RefreshCw, FileText, X, CheckCircle, Clock, XCircle, SkipForward, AlertCircle } from 'lucide-react';
import { useSearchParams } from 'react-router';

interface OcrJobRecord {
  id: string;
  document: string;
  filename: string;
  status: string;
  confidence: number | null;
  pages: number;
  startTime: string | null;
  endTime: string | null;
  extractedRefs: number;
  failureReason?: string;
}

const statusIcon = (s: string) => {
  if (s === 'Completed') return <CheckCircle className="w-4 h-4 text-teal-500" />;
  if (s === 'Processing') return <Clock className="w-4 h-4 text-blue-400 animate-pulse" />;
  if (s === 'Failed') return <XCircle className="w-4 h-4 text-rose-500" />;
  return <SkipForward className="w-4 h-4 text-slate-500" />;
};
const statusVariant = (s: string) => {
  if (s === 'Completed') return 'success' as const;
  if (s === 'Processing') return 'processing' as const;
  if (s === 'Failed') return 'danger' as const;
  return 'default' as const;
};

export default function OCRMonitor() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filter, setFilter] = useState<string>('All');
  const [selectedJob, setSelectedJob] = useState<OcrJobRecord | null>(null);
  const [jobs, setJobs] = useState<OcrJobRecord[]>([...MOCK_OCR_JOBS]);

  const filtered = filter === 'All' ? jobs : jobs.filter(j => j.status === filter);
  const completed = jobs.filter(j => j.status === 'Completed').length;
  const failed = jobs.filter(j => j.status === 'Failed').length;
  const processing = jobs.filter(j => j.status === 'Processing').length;

  useEffect(() => {
    const requestedJobId = searchParams.get('id');
    const requestedDocumentId = searchParams.get('document');
    const match = jobs.find((job) => job.id === requestedJobId)
      ?? jobs.find((job) => job.document === requestedDocumentId)
      ?? null;
    setSelectedJob(match);
  }, [jobs, searchParams]);

  const updateSelectedJob = (job: OcrJobRecord | null) => {
    setSelectedJob(job);
    const next = new URLSearchParams(searchParams);
    if (job) {
      next.set('id', job.id);
      next.set('document', job.document);
    } else {
      next.delete('id');
      next.delete('document');
    }
    setSearchParams(next, { replace: true });
  };

  const handleRetry = (id: string) => {
    setJobs(prev => prev.map(j => j.id === id ? { ...j, status: 'Processing', confidence: null } : j));
    updateSelectedJob(null);
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">OCR Monitor</h1>
        <p className="text-slate-400 text-sm">Pipeline monitoring, job tracking, and extraction oversight.</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Completed', value: completed, color: 'text-teal-400 bg-teal-500/10' },
          { label: 'Processing', value: processing, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Failed', value: failed, color: 'text-rose-400 bg-rose-500/10' },
          { label: 'Total Jobs', value: jobs.length, color: 'text-slate-300 bg-slate-700/30' },
        ].map(s => (
          <GlassCard key={s.label} className="p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${s.color} flex items-center justify-center`}>
              <ServerCog className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-slate-400">{s.label}</div>
            </div>
          </GlassCard>
        ))}
      </div>

      <div className={`grid gap-6 ${selectedJob ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        <GlassCard className="p-4">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <div className="flex gap-2">
              {['All', 'Completed', 'Processing', 'Failed', 'Skipped'].map(s => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    filter === s ? 'bg-teal-500/20 border-teal-500/40 text-teal-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <Button variant="secondary" className="ml-auto"><RefreshCw className="w-4 h-4" /> Refresh</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b border-slate-700/50 text-slate-400">
                  <th className="pb-3 pl-4 font-semibold">Job ID</th>
                  <th className="pb-3 font-semibold">Document</th>
                  <th className="pb-3 font-semibold">Filename</th>
                  <th className="pb-3 font-semibold">Status</th>
                  <th className="pb-3 font-semibold">Confidence</th>
                  <th className="pb-3 font-semibold">Pages</th>
                  <th className="pb-3 font-semibold">Start Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/30">
                {filtered.map(job => (
                  <tr
                    key={job.id}
                    className={`hover:bg-slate-800/30 cursor-pointer transition-colors group ${selectedJob?.id === job.id ? 'bg-slate-800/30' : ''}`}
                    onClick={() => updateSelectedJob(job)}
                  >
                    <td className="py-3 pl-4 font-mono text-xs text-teal-400">{job.id}</td>
                    <td className="py-3 font-mono text-xs text-blue-400">{job.document}</td>
                    <td className="py-3 text-slate-300 text-xs">{job.filename}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        {statusIcon(job.status)}
                        <Badge variant={statusVariant(job.status)}>{job.status}</Badge>
                      </div>
                    </td>
                    <td className="py-3">
                      {job.confidence !== null ? (
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${job.confidence >= 90 ? 'bg-teal-500' : job.confidence >= 70 ? 'bg-amber-500' : 'bg-rose-500'}`}
                              style={{ width: `${job.confidence}%` }}
                            />
                          </div>
                          <span className="text-xs text-slate-300">{job.confidence}%</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-600">—</span>
                      )}
                    </td>
                    <td className="py-3 text-slate-400 text-xs">{job.pages}</td>
                    <td className="py-3 text-slate-500 text-xs">{job.startTime ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {selectedJob && (
          <GlassCard className="p-6 self-start">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-white">Job Detail</h2>
              <button onClick={() => updateSelectedJob(null)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 mb-4">
              {[
                { label: 'Job ID', value: selectedJob.id },
                { label: 'Document', value: selectedJob.document },
                { label: 'Filename', value: selectedJob.filename },
                { label: 'Status', value: selectedJob.status },
                { label: 'Pages', value: String(selectedJob.pages) },
                { label: 'Start Time', value: selectedJob.startTime ?? '—' },
                { label: 'End Time', value: selectedJob.endTime ?? '—' },
                { label: 'References Found', value: String(selectedJob.extractedRefs) },
              ].map(f => (
                <div key={f.label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{f.label}</span>
                  <span className="text-slate-200 font-mono text-xs font-medium">{f.value}</span>
                </div>
              ))}
            </div>
            {'failureReason' in selectedJob && selectedJob.failureReason && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl mb-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5" />
                  <p className="text-xs text-rose-300">{selectedJob.failureReason}</p>
                </div>
              </div>
            )}
            {selectedJob.status === 'Failed' && (
              <Button onClick={() => handleRetry(selectedJob.id)}>
                <RefreshCw className="w-4 h-4" /> Retry Job
              </Button>
            )}
          </GlassCard>
        )}
      </div>
    </div>
  );
}
