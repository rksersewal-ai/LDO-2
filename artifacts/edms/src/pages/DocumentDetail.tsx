import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { GlassCard, Badge, Button } from '../components/ui/Shared';
import { MOCK_DOCUMENTS } from '../lib/mock';
import { MOCK_OCR_JOBS } from '../lib/mockExtended';
import {
  FileText, ArrowLeft, Download, Eye, Edit3, History,
  FileSearch, Link as LinkIcon, Tag, User, Calendar,
  CheckCircle, AlertCircle, Clock, FileImage, Shield,
  ChevronRight, ExternalLink, Hash, Layers
} from 'lucide-react';

const statusVariant = (s: string) => {
  if (s === 'Approved') return 'success' as const;
  if (s === 'In Review') return 'warning' as const;
  if (s === 'Obsolete' || s === 'Draft') return 'danger' as const;
  return 'default' as const;
};

const ocrVariant = (s: string) => {
  if (s === 'Completed') return 'success' as const;
  if (s === 'Processing') return 'processing' as const;
  if (s === 'Failed') return 'danger' as const;
  return 'default' as const;
};

export default function DocumentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const doc = MOCK_DOCUMENTS.find(d => d.id === id);
  const ocrJob = MOCK_OCR_JOBS.find(j => j.document === id);
  const [activeTab, setActiveTab] = useState<'overview' | 'preview' | 'ocr' | 'history'>('overview');

  if (!doc) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <GlassCard className="p-12 text-center max-w-md">
          <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Document Not Found</h2>
          <p className="text-slate-400 text-sm mb-4">No document with ID <span className="font-mono text-teal-400">{id}</span> exists.</p>
          <Button onClick={() => navigate('/documents')}>
            <ArrowLeft className="w-4 h-4" /> Back to Document Hub
          </Button>
        </GlassCard>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'preview', label: 'Preview', icon: Eye },
    { id: 'ocr', label: 'OCR Data', icon: FileSearch },
    { id: 'history', label: 'History', icon: History },
  ] as const;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate('/documents')}
          className="flex items-center gap-2 text-slate-500 hover:text-teal-300 text-sm mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Document Hub
        </button>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <FileText className="w-6 h-6 text-teal-400" />
              <h1 className="text-2xl font-bold text-white">{doc.name}</h1>
              <Badge variant={statusVariant(doc.status)}>{doc.status}</Badge>
            </div>
            <p className="text-slate-400 text-sm font-mono pl-9">{doc.id} · Rev {doc.revision} · {doc.type}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary"><Download className="w-4 h-4" /> Download</Button>
            <Button variant="secondary"><Edit3 className="w-4 h-4" /> Edit</Button>
            <Button><Eye className="w-4 h-4" /> Full View</Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-slate-700/50">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab.id
                  ? 'border-teal-500 text-teal-300'
                  : 'border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <GlassCard className="p-6">
              <h2 className="text-base font-bold text-white mb-4">Document Properties</h2>
              <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                {[
                  { label: 'Document ID', value: doc.id, mono: true },
                  { label: 'Revision', value: doc.revision, mono: true },
                  { label: 'File Type', value: doc.type },
                  { label: 'File Size', value: doc.size },
                  { label: 'Author', value: doc.author },
                  { label: 'Owner', value: doc.owner },
                  { label: 'Category', value: doc.category },
                  { label: 'Last Updated', value: doc.date },
                  { label: 'Pages', value: String(doc.pages) },
                  { label: 'Lifecycle', value: doc.lifecycle },
                ].map(field => (
                  <div key={field.label}>
                    <p className="text-xs text-slate-500 mb-0.5">{field.label}</p>
                    <p className={`text-sm font-medium text-slate-200 ${field.mono ? 'font-mono' : ''}`}>{field.value}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h2 className="text-base font-bold text-white mb-4">Tags</h2>
              <div className="flex flex-wrap gap-2">
                {doc.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-800/50 border border-slate-700/50 text-slate-300 text-sm rounded-full">
                    <Tag className="w-3 h-3 inline mr-1 text-teal-400" />{tag}
                  </span>
                ))}
              </div>
            </GlassCard>
          </div>

          <div className="space-y-4">
            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileSearch className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">OCR Status</h3>
              </div>
              <Badge variant={ocrVariant(doc.ocrStatus)} className="mb-3">{doc.ocrStatus}</Badge>
              {doc.ocrConfidence !== null && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                    <span>Confidence</span>
                    <span className="text-teal-300 font-bold">{doc.ocrConfidence}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-teal-500 to-emerald-500"
                      style={{ width: `${doc.ocrConfidence}%` }}
                    />
                  </div>
                </div>
              )}
              {ocrJob?.failureReason && (
                <div className="mt-3 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                  <p className="text-xs text-rose-300">{ocrJob.failureReason}</p>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <LinkIcon className="w-4 h-4 text-teal-400" />
                <h3 className="text-sm font-bold text-white">Linked Records</h3>
              </div>
              <div className="space-y-2">
                {doc.linkedPL && doc.linkedPL !== 'N/A' && (
                  <button
                    onClick={() => navigate(`/pl/${doc.linkedPL.replace('PL-', '')}`)}
                    className="w-full flex items-center gap-2 p-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 text-left transition-colors"
                  >
                    <Layers className="w-3.5 h-3.5 text-blue-400" />
                    <span className="text-xs font-mono text-blue-400">{doc.linkedPL}</span>
                    <ExternalLink className="w-3 h-3 text-slate-600 ml-auto" />
                  </button>
                )}
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'preview' && (
        <GlassCard className="p-12 text-center">
          <div className="w-20 h-20 rounded-2xl bg-slate-800/60 border border-slate-700/50 flex items-center justify-center mx-auto mb-4">
            <FileImage className="w-10 h-10 text-teal-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Document Preview</h2>
          <p className="text-slate-400 text-sm mb-6">
            Preview is not available for this file type ({doc.type}) in demo mode.<br />
            In production, documents render in an embedded viewer with pan, zoom, and annotation support.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="secondary"><Download className="w-4 h-4" /> Download Original</Button>
            <Button><Eye className="w-4 h-4" /> Open in Full Viewer</Button>
          </div>
        </GlassCard>
      )}

      {activeTab === 'ocr' && (
        <GlassCard className="p-6">
          <h2 className="text-base font-bold text-white mb-4">OCR Extraction Results</h2>
          {ocrJob ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Job ID', value: ocrJob.id },
                  { label: 'Status', value: ocrJob.status },
                  { label: 'Pages Processed', value: String(ocrJob.pages) },
                  { label: 'References Extracted', value: String(ocrJob.extractedRefs) },
                ].map(f => (
                  <div key={f.label} className="bg-slate-800/30 rounded-xl p-3">
                    <p className="text-xs text-slate-500 mb-1">{f.label}</p>
                    <p className="text-sm font-medium text-slate-200 font-mono">{f.value}</p>
                  </div>
                ))}
              </div>
              {ocrJob.failureReason && (
                <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-rose-300">Processing Failed</p>
                      <p className="text-xs text-rose-400 mt-1">{ocrJob.failureReason}</p>
                    </div>
                  </div>
                </div>
              )}
              {ocrJob.extractedRefs > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-2">Detected References</h3>
                  <div className="space-y-2">
                    {['PL 38100000 — WAP7 Locomotive (Page 1)', 'PL 38110000 — Bogie Assembly (Page 2)', 'DWG-BOG-ASM-001 (Page 3)', 'RDSO Spec E-1234 (Page 5)'].map(ref => (
                      <div key={ref} className="flex items-center gap-2 p-2 rounded-lg bg-slate-800/30 border border-slate-700/30">
                        <Hash className="w-3.5 h-3.5 text-teal-400" />
                        <span className="text-xs text-slate-300">{ref}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-slate-400">No OCR job found for this document.</p>
          )}
        </GlassCard>
      )}

      {activeTab === 'history' && (
        <GlassCard className="p-6">
          <h2 className="text-base font-bold text-white mb-4">Version & Change History</h2>
          <div className="space-y-4">
            {[
              { rev: doc.revision, action: 'Current Revision', user: doc.author, date: doc.date, note: 'Active version' },
              { rev: 'B.0', action: 'Revision Released', user: 'S. Patel', date: '2026-01-15', note: 'Updated thermal limits to match IEC 60076-2 standard.' },
              { rev: 'A.4', action: 'Document Created', user: 'J. Halloway', date: '2025-08-20', note: 'Initial document upload and OCR processing.' },
            ].map((h, i) => (
              <div key={i} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-8 h-8 rounded-full bg-slate-800 border border-teal-500/30 flex items-center justify-center text-xs font-mono text-teal-300">{h.rev}</div>
                  {i < 2 && <div className="w-px flex-1 bg-slate-700/50 mt-2" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-sm font-semibold text-slate-200">{h.action}</span>
                    {i === 0 && <Badge variant="success">Current</Badge>}
                  </div>
                  <p className="text-xs text-slate-400">{h.user} · {h.date}</p>
                  <p className="text-sm text-slate-400 mt-1">{h.note}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}
    </div>
  );
}
