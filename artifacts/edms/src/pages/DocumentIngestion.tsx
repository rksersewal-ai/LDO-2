import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, X, FileText, File, FileImage, AlertCircle,
  CheckCircle2, ChevronRight, GitBranch, Loader2, ArrowLeft,
  Scan, Hash, ToggleRight,
} from 'lucide-react';
import { MOCK_DOCUMENTS } from '../lib/mock';
import { GlassCard, Badge, Button, Input, Select, PageHeader } from '../components/ui/Shared';
import { PLNumberSelect } from '../components/ui/PLNumberSelect';
import { Switch } from '../components/ui/switch';
import { usePLItems } from '../hooks/usePLItems';
import { toast } from 'sonner';

const DOC_TYPES = ['Drawing', 'Specification', 'Test Report', 'Certificate', 'Procedure', 'CAD Model', 'Datasheet'] as const;
const CATEGORIES = ['Electrical Schema', 'Specification', 'CAD Output', 'Test Report', 'Certificate', 'Calibration Log', 'Procedure', 'Maintenance Manual', 'Financial / Yield'] as const;

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  lastModified: number;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIconColor(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['pdf'].includes(ext || '')) return 'text-rose-400';
  if (['png', 'jpg', 'jpeg', 'svg'].includes(ext || '')) return 'text-purple-400';
  if (['xlsx', 'xls', 'csv'].includes(ext || '')) return 'text-green-400';
  if (['docx', 'doc'].includes(ext || '')) return 'text-blue-400';
  if (['dwg', 'dxf'].includes(ext || '')) return 'text-amber-400';
  return 'text-teal-400';
}

function FileIcon({ name, className = "w-5 h-5" }: { name: string; className?: string }) {
  const ext = name.split('.').pop()?.toLowerCase();
  if (['png', 'jpg', 'jpeg', 'svg'].includes(ext || '')) return <FileImage className={className} />;
  if (['xlsx', 'xls', 'csv', 'docx', 'doc'].includes(ext || '')) return <File className={className} />;
  return <FileText className={className} />;
}

export default function DocumentIngestion() {
  const navigate = useNavigate();
  const dropRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: plItems, loading: plItemsLoading } = usePLItems();

  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Form state
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState<string>('');
  const [revision, setRevision] = useState('');
  const [category, setCategory] = useState<string>('');
  const [plNumber, setPlNumber] = useState('');
  const [ocrEnabled, setOcrEnabled] = useState(true);

  const handleFileDrop = useCallback((file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error('File too large. Maximum 50 MB allowed.');
      return;
    }
    setUploadedFile({ name: file.name, size: file.size, type: file.type, lastModified: file.lastModified });
    if (!docName) {
      setDocName(file.name.replace(/\.[^.]+$/, ''));
    }
    const ext = file.name.split('.').pop()?.toUpperCase() ?? '';
    if (!docType) {
      if (['PDF', 'DOCX'].includes(ext)) setDocType('Specification');
      if (['PNG', 'JPG', 'SVG', 'DWG'].includes(ext)) setDocType('Drawing');
      if (['XLSX', 'CSV'].includes(ext)) setDocType('Datasheet');
    }
  }, [docName, docType]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  }, []);

  const onDragLeave = useCallback(() => setIsDraggingOver(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFileDrop(file);
  }, [handleFileDrop]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileDrop(file);
  }, [handleFileDrop]);

  function validate(): boolean {
    const errs: Record<string, string> = {};
    if (!uploadedFile) errs.file = 'Please select a file to upload';
    if (!docName.trim()) errs.docName = 'Document name is required';
    if (!docType) errs.docType = 'Please select a document type';
    if (!revision.trim()) errs.revision = 'Revision is required (e.g. A.0)';
    if (!category) errs.category = 'Please select a category';
    if (plNumber && !/^\d{8}$/.test(plNumber.trim())) {
      errs.plNumber = 'PL number must be exactly 8 digits';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const yearSuffix = String(Math.floor(Math.random() * 9000) + 1000);
    const newDoc = {
      id: `DOC-${now.getFullYear()}-${yearSuffix}`,
      name: docName.trim(),
      type: docType,
      size: uploadedFile ? formatFileSize(uploadedFile.size) : '0 B',
      revision: revision.trim(),
      status: 'In Review' as const,
      author: 'Current User',
      owner: 'Uploads',
      date: dateStr,
      linkedPL: plNumber ? `PL-${plNumber}` : 'N/A',
      ocrStatus: ocrEnabled ? 'Processing' : 'Not Required',
      ocrConfidence: null,
      category,
      lifecycle: 'Draft',
      pages: 1,
      tags: [docType, category],
    };
    MOCK_DOCUMENTS.unshift(newDoc as typeof MOCK_DOCUMENTS[0]);

    setIsSubmitting(false);
    toast.success(`Document "${docName}" ingested successfully`, { description: ocrEnabled ? 'OCR processing queued' : undefined });
    navigate('/documents');
  }

  const ext = uploadedFile ? uploadedFile.name.split('.').pop()?.toUpperCase() ?? '' : '';

  return (
    <div className="space-y-5 max-w-[1200px] mx-auto">
      <PageHeader
        title="Ingest Document"
        subtitle="Upload a document, set metadata, link to a PL record, and optionally trigger OCR"
        breadcrumb={
          <nav className="flex items-center gap-1.5 text-xs text-slate-500">
            <button onClick={() => navigate('/documents')} className="hover:text-teal-400 transition-colors flex items-center gap-1">
              <FileText className="w-3 h-3" /> Document Hub
            </button>
            <ChevronRight className="w-3 h-3" />
            <span className="text-slate-300">Ingest Document</span>
          </nav>
        }
        actions={
          <Button variant="secondary" size="sm" onClick={() => navigate('/documents')}>
            <ArrowLeft className="w-3.5 h-3.5" /> Cancel
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-5">
        {/* Left: File upload zone */}
        <div className="space-y-4">
          <GlassCard className="p-5">
            <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Upload className="w-4 h-4 text-teal-500" /> File Upload
            </h2>

            {/* Drop zone */}
            <div
              ref={dropRef}
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              onClick={() => !uploadedFile && fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl transition-all duration-200 ${
                isDraggingOver
                  ? 'border-teal-400/70 bg-teal-500/10'
                  : uploadedFile
                  ? 'border-teal-500/30 bg-teal-500/5'
                  : 'border-slate-700/60 hover:border-teal-500/40 hover:bg-teal-500/5 cursor-pointer'
              }`}
            >
              <input ref={fileInputRef} type="file" className="hidden" onChange={onFileInput} />

              <AnimatePresence mode="wait">
                {!uploadedFile ? (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="py-14 flex flex-col items-center text-center px-6"
                  >
                    <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center mb-4 transition-all ${isDraggingOver ? 'bg-teal-500/20 border-teal-400/50' : 'bg-slate-800/60 border-slate-700/50'}`}>
                      <Upload className={`w-6 h-6 ${isDraggingOver ? 'text-teal-400' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-sm font-medium text-slate-300 mb-1">
                      {isDraggingOver ? 'Drop to upload' : 'Drag & drop your file here'}
                    </p>
                    <p className="text-xs text-slate-500 mb-4">or click to browse your computer</p>
                    <div className="flex flex-wrap gap-1.5 justify-center mb-3">
                      {['PDF', 'DOCX', 'PNG', 'JPG', 'XLSX', 'DWG', 'DXF'].map(t => (
                        <span key={t} className="px-2 py-0.5 bg-slate-800/60 border border-slate-700/50 rounded-md text-[10px] font-mono text-slate-400">{t}</span>
                      ))}
                    </div>
                    <p className="text-[11px] text-slate-600">Maximum file size: 50 MB</p>
                  </motion.div>
                ) : (
                  <motion.div
                    key="file"
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="p-5 flex items-center gap-4"
                  >
                    <div className={`w-12 h-12 rounded-xl bg-slate-900/60 border border-white/5 flex flex-col items-center justify-center gap-0.5 shrink-0 ${getFileIconColor(uploadedFile.name)}`}>
                      <FileIcon name={uploadedFile.name} className="w-5 h-5" />
                      <span className="text-[8px] font-mono font-bold">{ext}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{uploadedFile.name}</p>
                      <p className="text-xs text-slate-500">{formatFileSize(uploadedFile.size)} · {ext} file</p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <CheckCircle2 className="w-3 h-3 text-teal-400" />
                        <span className="text-xs text-teal-400">Ready to ingest</span>
                      </div>
                    </div>
                    <button
                      onClick={e => { e.stopPropagation(); setUploadedFile(null); }}
                      className="shrink-0 p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-700/60 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {errors.file && (
              <p className="flex items-center gap-1.5 text-xs text-rose-400 mt-1.5">
                <AlertCircle className="w-3.5 h-3.5" />{errors.file}
              </p>
            )}

            {/* Supported formats info */}
            <div className="mt-4 p-3 bg-slate-900/40 rounded-xl border border-white/5">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-2">Supported Document Types</p>
              <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-500">
                {[
                  ['Engineering Drawings', 'PDF, DWG, DXF'],
                  ['Specifications', 'PDF, DOCX'],
                  ['Test Reports', 'PDF'],
                  ['CAD Models', 'STP, IGES'],
                  ['Images & Renders', 'PNG, JPG, SVG'],
                  ['Data / Reports', 'XLSX, CSV'],
                ].map(([type, fmts]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-slate-400">{type}</span>
                    <span className="font-mono text-slate-600">{fmts}</span>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>
        </div>

        {/* Right: Metadata form */}
        <GlassCard className="p-5">
          <h2 className="text-sm font-semibold text-slate-300 mb-5 flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-teal-500" /> Document Metadata
          </h2>

          <div className="space-y-4">
            {/* Document Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Document Name <span className="text-rose-400">*</span>
              </label>
              <Input
                placeholder="e.g. Bogie Frame Stress Analysis Report"
                value={docName}
                onChange={e => { setDocName(e.target.value); setErrors(p => ({ ...p, docName: '' })); }}
                className="w-full"
              />
              {errors.docName && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.docName}</p>}
            </div>

            {/* Type + Revision row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Document Type <span className="text-rose-400">*</span>
                </label>
                <Select
                  value={docType}
                  onChange={e => { setDocType(e.target.value); setErrors(p => ({ ...p, docType: '' })); }}
                  className="w-full"
                >
                  <option value="">Select type...</option>
                  {DOC_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
                {errors.docType && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.docType}</p>}
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  Revision <span className="text-rose-400">*</span>
                </label>
                <Input
                  placeholder="A.0"
                  value={revision}
                  onChange={e => { setRevision(e.target.value); setErrors(p => ({ ...p, revision: '' })); }}
                  className="w-full font-mono"
                />
                {errors.revision && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.revision}</p>}
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                Category <span className="text-rose-400">*</span>
              </label>
              <Select
                value={category}
                onChange={e => { setCategory(e.target.value); setErrors(p => ({ ...p, category: '' })); }}
                className="w-full"
              >
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              {errors.category && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.category}</p>}
            </div>

            {/* PL Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5"><Hash className="w-3 h-3 text-teal-500" /> Link to PL Number</span>
              </label>
              <PLNumberSelect
                value={plNumber}
                onChange={(next) => {
                  setPlNumber(next);
                  setErrors(p => ({ ...p, plNumber: '' }));
                }}
                plItems={plItems}
                loading={plItemsLoading}
                placeholder="Search and select a linked PL..."
                helperText="Link the uploaded document to an existing PL record when the file belongs to a controlled component or assembly."
              />
              {errors.plNumber && <p className="text-xs text-rose-400 mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.plNumber}</p>}
            </div>

            {/* OCR toggle */}
            <div className="p-3.5 bg-slate-900/40 rounded-xl border border-white/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scan className="w-4 h-4 text-teal-500" />
                  <div>
                    <p className="text-xs font-semibold text-slate-300">Initiate OCR Processing</p>
                    <p className="text-[10px] text-slate-500">Extract text and metadata from document</p>
                  </div>
                </div>
                <Switch
                  checked={ocrEnabled}
                  onCheckedChange={setOcrEnabled}
                  aria-label="Toggle OCR processing"
                />
              </div>
              {ocrEnabled && (
                <div className="mt-2.5 pt-2.5 border-t border-white/5 flex items-center gap-1.5 text-[11px] text-teal-400">
                  <ToggleRight className="w-3 h-3" />
                  OCR will begin immediately after upload
                </div>
              )}
            </div>

            {/* Submit */}
            <div className="pt-2 space-y-2">
              <Button
                className="w-full py-2.5"
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Ingesting Document...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Ingest Document</>
                )}
              </Button>
              <p className="text-[10px] text-center text-slate-600">
                Document will be set to <span className="text-amber-400">In Review</span> status after ingestion
              </p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Status indicators */}
      <GlassCard className="p-4">
        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 mb-3">Ingestion Checklist</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'File Selected', done: !!uploadedFile },
            { label: 'Name & Type Set', done: !!(docName && docType) },
            { label: 'Revision Specified', done: !!revision },
            { label: 'Category Chosen', done: !!category },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-2">
              {item.done ? (
                <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border-2 border-slate-600 shrink-0" />
              )}
              <span className={`text-xs ${item.done ? 'text-teal-300' : 'text-slate-500'}`}>{item.label}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
