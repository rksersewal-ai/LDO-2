import { z } from 'zod'

export const documentUploadSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  file_type: z.string().optional(),
  metadata: z.record(z.string()).optional(),
})

export const documentUpdateSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  metadata: z.record(z.string()).optional(),
})

export type DocumentUploadSchema = z.infer<typeof documentUploadSchema>
export type DocumentUpdateSchema = z.infer<typeof documentUpdateSchema>
