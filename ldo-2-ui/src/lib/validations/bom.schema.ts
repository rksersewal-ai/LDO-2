import { z } from 'zod'

export const bomCreateSchema = z.object({
  part_number: z.string().min(1, 'Part number is required').max(100),
  description: z.string().min(1, 'Description is required').max(500),
  quantity: z.number().int().positive('Quantity must be a positive integer'),
  parent_id: z.string().optional(),
  document_id: z.string().optional(),
  locomotive_config_id: z.string().min(1, 'Locomotive config is required'),
})

export type BomCreateSchema = z.infer<typeof bomCreateSchema>
