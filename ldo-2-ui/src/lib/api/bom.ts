import { apiClient } from './client'
import { BOMItem, BOMCreatePayload } from '@/types/bom'

export const bomApi = {
  list: async (): Promise<BOMItem[]> => {
    const { data } = await apiClient.get('/bom')
    return data
  },

  get: async (id: string): Promise<BOMItem> => {
    const { data } = await apiClient.get(`/bom/${id}`)
    return data
  },

  create: async (payload: BOMCreatePayload): Promise<BOMItem> => {
    const { data } = await apiClient.post('/bom', payload)
    return data
  },

  update: async (id: string, payload: Partial<BOMItem>): Promise<BOMItem> => {
    const { data } = await apiClient.put(`/bom/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/bom/${id}`)
  },
}
