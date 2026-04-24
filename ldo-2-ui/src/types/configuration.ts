export type LocomotiveType = 'WAG9' | 'WAP7'

export interface LocomotiveConfig {
  id: string
  type: LocomotiveType
  serial_number: string
  description?: string
  components: string[]
  status: 'active' | 'draft' | 'archived'
  created_at: string
  updated_at: string
}

export interface ConfigCreatePayload {
  type: LocomotiveType
  serial_number: string
  description?: string
}
