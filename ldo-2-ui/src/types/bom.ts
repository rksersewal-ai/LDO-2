export interface BOMItem {
  id: string
  part_number: string
  description: string
  quantity: number
  parent_id: string | null
  document_id: string | null
  locomotive_config_id: string
  created_at: string
  children?: BOMItem[]
}

export interface BOMCreatePayload {
  part_number: string
  description: string
  quantity: number
  parent_id?: string
  document_id?: string
  locomotive_config_id: string
}
