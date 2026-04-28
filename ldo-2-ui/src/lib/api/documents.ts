import { apiClient } from './client'
import { Document, DocumentFilters, DocumentListResponse, DocumentUploadPayload } from '@/types/document'

export const documentsApi = {
  list: async (filters?: DocumentFilters): Promise<DocumentListResponse> => {
    const { data } = await apiClient.get('/documents', { params: filters })
    return data
  },

  get: async (id: string): Promise<Document> => {
    const { data } = await apiClient.get(`/documents/${id}`)
    return data
  },

  upload: async (payload: DocumentUploadPayload, onProgress?: (pct: number) => void): Promise<Document> => {
    const form = new FormData()
    form.append('file', payload.file)
    if (payload.title) form.append('title', payload.title)
    if (payload.metadata) form.append('metadata', JSON.stringify(payload.metadata))
    const { data } = await apiClient.post('/documents/upload', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded * 100) / e.total))
      },
    })
    return data
  },

  update: async (id: string, payload: Partial<Document>): Promise<Document> => {
    const { data } = await apiClient.put(`/documents/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/documents/${id}`)
  },

  download: (id: string): string => `${process.env.NEXT_PUBLIC_API_URL}/documents/${id}/download`,
}
