export const serviceOrderStatuses = [
  'awaiting_evaluation',
  'quote_sent',
  'approved',
  'in_progress',
  'waiting_for_part',
  'ready',
  'delivered',
] as const

export type ServiceOrderStatus = (typeof serviceOrderStatuses)[number]

export const serviceOrderStatusLabel: Record<ServiceOrderStatus, string> = {
  awaiting_evaluation: 'Aguardando avaliação',
  quote_sent: 'Orçamento enviado',
  approved: 'Aprovado',
  in_progress: 'Em execução',
  waiting_for_part: 'Aguardando peça',
  ready: 'Pronto',
  delivered: 'Entregue',
}

export type UserRole = 'owner' | 'reception' | 'technician'

export interface Customer {
  id: string
  name: string
  phone: string
  email?: string
}

export interface ServiceItem {
  id: string
  customerId: string
  type: 'vehicle' | 'furniture' | 'equipment' | 'other'
  identification: string
  description?: string
}

export interface ServiceOrder {
  id: string
  customerId: string
  itemId: string
  technicianId?: string
  reportedProblem: string
  status: ServiceOrderStatus
  createdAt: string
  updatedAt: string
}
