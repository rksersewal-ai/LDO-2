export type DocumentStatus = 'indexed' | 'ocr_pending' | 'processing' | 'error'

export interface Document {
  id: string
  title: string
  file_type: string
  status: DocumentStatus
  file_path: string
  ocr_status: 'none' | 'pending' | 'completed' | 'failed'
  metadata: Record<string, string>
  created_at: string
  updated_at: string
}

export interface DocumentUploadPayload {
  file: File
  title?: string
  metadata?: Record<string, string>
}

export interface DocumentListResponse {
  items: Document[]
  total: number
  page: number
  per_page: number
}

export interface DocumentFilters {
  status?: DocumentStatus
  file_type?: string
  search?: string
  page?: number
  per_page?: number
}
