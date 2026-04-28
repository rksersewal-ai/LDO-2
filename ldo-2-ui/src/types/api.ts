export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiError {
  message: string
  code?: string
  details?: Record<string, string[]>
}

export interface OCRJob {
  id: string
  document_id: string
  status: 'queued' | 'processing' | 'completed' | 'failed'
  progress: number
  created_at: string
  completed_at?: string
  results?: OCRResult[]
}

export interface OCRResult {
  page: number
  text: string
  confidence: number
  bounding_boxes?: BoundingBox[]
}

export interface BoundingBox {
  x: number
  y: number
  width: number
  height: number
  text: string
}

export interface AuditLog {
  id: string
  action: string
  entity_type: string
  entity_id: string
  user: string
  timestamp: string
  details?: Record<string, string>
}

export interface DeduplicationResult {
  id: string
  original_document_id: string
  duplicate_document_id: string
  similarity_score: number
  status: 'pending' | 'resolved' | 'dismissed'
  detected_at: string
}
