export const APP_NAME = 'LDO-2'
export const APP_VERSION = '2.0.0'
export const APP_DESCRIPTION = 'Locomotive Document Organization System'

export const DOCUMENT_STATUSES = ['indexed', 'ocr_pending', 'processing', 'error'] as const
export const LOCOMOTIVE_TYPES = ['WAG9', 'WAP7'] as const
export const FILE_TYPES = ['PDF', 'DOCX', 'DWG', 'PNG', 'JPG', 'JPEG', 'TIFF'] as const

export const MAX_FILE_SIZE_MB = 50
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024

export const QUERY_STALE_TIME = 5 * 60 * 1000 // 5 minutes
export const QUERY_KEYS = {
  documents: ['documents'] as const,
  document: (id: string) => ['documents', id] as const,
  bom: ['bom'] as const,
  bomItem: (id: string) => ['bom', id] as const,
  ocrJobs: ['ocr-jobs'] as const,
  ocrJob: (id: string) => ['ocr-jobs', id] as const,
  configurations: ['configurations'] as const,
  auditLogs: ['audit-logs'] as const,
} as const
