'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bomApi } from '@/lib/api/bom'
import { QUERY_KEYS, QUERY_STALE_TIME } from '@/lib/constants'
import { BOMCreatePayload } from '@/types/bom'

export function useBom() {
  const { data, isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.bom,
    queryFn: bomApi.list,
    staleTime: QUERY_STALE_TIME,
  })
  return { bom: data ?? [], isLoading, error }
}

export function useBomItem(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.bomItem(id),
    queryFn: () => bomApi.get(id),
    staleTime: QUERY_STALE_TIME,
    enabled: !!id,
  })
}

export function useCreateBomItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: BOMCreatePayload) => bomApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.bom }),
  })
}
