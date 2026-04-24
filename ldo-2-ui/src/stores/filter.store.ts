import { create } from 'zustand'
import { DocumentFilters } from '@/types/document'

interface FilterState {
  documentFilters: DocumentFilters
  setDocumentFilters: (filters: Partial<DocumentFilters>) => void
  resetDocumentFilters: () => void
}

const defaultFilters: DocumentFilters = { page: 1, per_page: 20 }

export const useFilterStore = create<FilterState>()((set) => ({
  documentFilters: defaultFilters,
  setDocumentFilters: (filters) =>
    set((state) => ({ documentFilters: { ...state.documentFilters, ...filters } })),
  resetDocumentFilters: () => set({ documentFilters: defaultFilters }),
}))
