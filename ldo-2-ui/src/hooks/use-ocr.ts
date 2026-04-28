'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ocrApi } from '@/lib/api/ocr'
import { QUERY_KEYS, QUERY_STALE_TIME } from '@/lib/constants'

export function useOcrJobs() {
  const { data, isLoading } = useQuery({
    queryKey: QUERY_KEYS.ocrJobs,
    queryFn: ocrApi.listJobs,
    staleTime: QUERY_STALE_TIME,
    refetchInterval: 10000, // poll every 10s for job status
  })
  return { jobs: data ?? [], isLoading }
}

export function useOcrJob(jobId: string) {
  return useQuery({
    queryKey: QUERY_KEYS.ocrJob(jobId),
    queryFn: () => ocrApi.getJob(jobId),
    enabled: !!jobId,
    refetchInterval: 5000,
  })
}

export function useCreateOcrJob() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (documentId: string) => ocrApi.createJob(documentId),
    onSuccess: () => qc.invalidateQueries({ queryKey: QUERY_KEYS.ocrJobs }),
  })
}
