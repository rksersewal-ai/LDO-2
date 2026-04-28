import { apiClient } from './client'
import { OCRJob } from '@/types/api'

export const ocrApi = {
  createJob: async (documentId: string): Promise<OCRJob> => {
    const { data } = await apiClient.post('/ocr/jobs', { document_id: documentId })
    return data
  },

  listJobs: async (): Promise<OCRJob[]> => {
    const { data } = await apiClient.get('/ocr/jobs')
    return data
  },

  getJob: async (jobId: string): Promise<OCRJob> => {
    const { data } = await apiClient.get(`/ocr/jobs/${jobId}`)
    return data
  },

  getResults: async (jobId: string): Promise<OCRJob> => {
    const { data } = await apiClient.get(`/ocr/jobs/${jobId}/results`)
    return data
  },
}
