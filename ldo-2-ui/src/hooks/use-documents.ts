'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { documentsApi } from '@/lib/api/documents'
import { QUERY_KEYS, QUERY_STALE_TIME } from '@/lib/constants'
import { DocumentFilters } from '@/types/document'

export function useDocuments(filters?: DocumentFilters) {
  const { data, isLoading, error } = useQuery({
    queryKey: [...QUERY_KEYS.documents, filters],
    queryFn: () => documentsApi.list(filters),
    staleTime: QUERY_STALE_TIME,
  })

  return {
    documents: data?.items ?? [],
    total: data?.total ?? 0,
    isLoading,
    error,
  }
}

export function useDocument(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.document(id),
    queryFn: () => documentsApi.get(id),
    staleTime: QUERY_STALE_TIME,
    enabled: !!id,
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => documentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.documents }),
  })
}
