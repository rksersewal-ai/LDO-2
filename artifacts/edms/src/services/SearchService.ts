import type { SearchScope, SearchResult } from '../lib/types';
export type { SearchResult };
import apiClient from './ApiClient';
import { DocumentService } from './DocumentService';
import { PLService } from './PLService';
import { WorkLedgerService } from './WorkLedgerService';
import { CaseService } from './CaseService';

export interface CrossEntityResults {
  documents: SearchResult[];
  plItems: SearchResult[];
  work: SearchResult[];
  cases: SearchResult[];
  total: number;
}

function contains(text: string | undefined | null, q: string): boolean {
  return Boolean(text?.toLowerCase().includes(q));
}

function snippet(text: string | undefined | null, query: string): string | undefined {
  if (!text) return undefined;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const matchIndex = lowerText.indexOf(lowerQuery);

  if (matchIndex < 0) {
    return undefined;
  }

  const start = Math.max(0, matchIndex - 40);
  const end = Math.min(text.length, matchIndex + lowerQuery.length + 80);
  return `...${text.slice(start, end)}...`;
}

function mapBackendResults(
  response: Awaited<ReturnType<typeof apiClient.search>>,
  query: string,
): CrossEntityResults {
  const documents = response.documents.map((doc: any) => ({
    type: 'document' as const,
    id: String(doc.id),
    title: doc.name || String(doc.id),
    subtitle: String(doc.id),
    status: doc.status,
    matchField: 'Document',
    snippet: snippet(doc.extracted_text || doc.description, query),
    date: doc.updated_at || doc.created_at || doc.date,
  }));

  const plItems = response.pl_items.map((item: any) => ({
    type: 'pl' as const,
    id: String(item.id),
    title: item.name || String(item.id),
    subtitle: item.part_number || String(item.id),
    status: item.status,
    matchField: 'PL Item',
    snippet: snippet(item.description, query),
    date: item.last_updated || item.created_at,
  }));

  const work = response.work_records.map((record: any) => ({
    type: 'work' as const,
    id: String(record.id),
    title: record.description || String(record.id),
    subtitle: record.eoffice_number || String(record.id),
    status: record.status,
    matchField: 'Work Record',
    snippet: snippet(record.remarks || record.description, query),
    date: record.updated_at || record.created_at || record.date,
  }));

  const cases = response.cases.map((caseRecord: any) => ({
    type: 'case' as const,
    id: String(caseRecord.id),
    title: caseRecord.title || String(caseRecord.id),
    subtitle: caseRecord.pl_reference || String(caseRecord.id),
    status: caseRecord.status,
    matchField: 'Case',
    snippet: snippet(caseRecord.description || caseRecord.resolution, query),
    date: caseRecord.opened_at || caseRecord.closed_at,
  }));

  return {
    documents,
    plItems,
    work,
    cases,
    total: response.total,
  };
}

async function searchLocally(
  query: string,
  scope?: SearchScope,
): Promise<CrossEntityResults> {
  const q = query.trim().toLowerCase();

  if (!q) {
    return { documents: [], plItems: [], work: [], cases: [], total: 0 };
  }

  const [docs, pls, works, cases] = await Promise.all([
    DocumentService.getAll(),
    PLService.getAll(),
    WorkLedgerService.getAll(),
    CaseService.getAll(),
  ]);

  const documents: SearchResult[] = (!scope || scope === 'ALL' || scope === 'DOCUMENTS')
    ? docs
        .filter(d =>
          contains(d.documentNumber, q) ||
          contains(d.title, q) ||
          d.tags.some(t => contains(t, q)) ||
          d.linkedPlNumbers.some(pl => contains(pl, q)) ||
          contains(d.ocrText, q) ||
          contains(d.agency, q)
        )
        .map(d => ({
          type: 'document' as const,
          id: d.id,
          title: d.title,
          subtitle: d.documentNumber,
          status: d.status,
          matchField: contains(d.ocrText, q) ? 'OCR Text' : contains(d.title, q) ? 'Title' : 'Metadata',
          snippet: snippet(d.ocrText, q),
          date: d.updatedAt || d.createdAt,
        }))
    : [];

  const plItems: SearchResult[] = (!scope || scope === 'ALL' || scope === 'PL')
    ? pls
        .filter(p =>
          contains(p.plNumber, q) ||
          contains(p.name, q) ||
          contains(p.description, q) ||
          p.drawingNumbers.some(d => contains(d, q)) ||
          p.specNumbers.some(s => contains(s, q))
        )
        .map(p => ({
          type: 'pl' as const,
          id: p.id,
          title: p.name,
          subtitle: p.plNumber,
          status: p.status,
          matchField: contains(p.plNumber, q) ? 'PL Number' : 'Description',
          date: p.updatedAt || p.createdAt,
        }))
    : [];

  const work: SearchResult[] = (!scope || scope === 'ALL' || scope === 'WORK')
    ? works
        .filter(w =>
          contains(w.id, q) ||
          contains(w.workType, q) ||
          contains(w.referenceNumber, q) ||
          contains(w.description, q) ||
          contains(w.plNumber, q) ||
          contains(w.eOfficeNumber, q) ||
          contains(w.userName, q)
        )
        .map(w => ({
          type: 'work' as const,
          id: w.id,
          title: w.description,
          subtitle: w.id,
          status: w.status,
          matchField: contains(w.id, q) ? 'Work ID' : contains(w.plNumber, q) ? 'PL Number' : 'Description',
          date: w.createdAt || w.date,
        }))
    : [];

  const caseResults: SearchResult[] = (!scope || scope === 'ALL' || scope === 'CASES')
    ? cases
        .filter(c =>
          contains(c.caseNumber, q) ||
          contains(c.title, q) ||
          contains(c.plNumber, q) ||
          contains(c.type, q) ||
          contains(c.vendorName, q) ||
          contains(c.tenderNumber, q)
        )
        .map(c => ({
          type: 'case' as const,
          id: c.id,
          title: c.title,
          subtitle: c.caseNumber,
          status: c.status,
          matchField: contains(c.caseNumber, q) ? 'Case Number' : 'Title',
          date: c.updatedAt || c.createdAt,
        }))
    : [];

  return {
    documents,
    plItems,
    work,
    cases: caseResults,
    total: documents.length + plItems.length + work.length + caseResults.length,
  };
}

export const SearchService = {
  async searchAll(
    query: string,
    scope?: SearchScope,
    signal?: AbortSignal,
  ): Promise<CrossEntityResults> {
    const q = query.trim();

    if (!q) {
      return { documents: [], plItems: [], work: [], cases: [], total: 0 };
    }

    try {
      const response = await apiClient.search(q, scope, { signal });
      return mapBackendResults(response, q);
    } catch (error) {
      if (
        (error instanceof DOMException && error.name === 'AbortError') ||
        (typeof error === 'object' && error !== null && 'code' in error && error.code === 'ERR_CANCELED')
      ) {
        throw error;
      }

      if (import.meta.env.VITE_ENABLE_DEV_MOCK_API === 'true') {
        return searchLocally(q, scope);
      }

      throw error;
    }
  },
};
