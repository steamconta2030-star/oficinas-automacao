import type { Customer, ServiceOrder } from './service-order'

export interface ValidationResult {
  valid: boolean
  errors: readonly string[]
}

function result(errors: string[]): ValidationResult {
  return { valid: errors.length === 0, errors }
}

export function validateCustomer(customer: Customer): ValidationResult {
  const errors: string[] = []

  if (!customer.id.trim()) errors.push('Cliente precisa de um identificador.')
  if (!customer.name.trim()) errors.push('Nome do cliente é obrigatório.')
  if (!customer.phone.trim()) errors.push('Telefone do cliente é obrigatório.')
  if (customer.email !== undefined && !customer.email.trim()) {
    errors.push('E-mail informado não pode ser vazio.')
  }

  return result(errors)
}

export function validateServiceOrder(order: ServiceOrder): ValidationResult {
  const errors: string[] = []

  if (!order.id.trim()) errors.push('OS precisa de um identificador.')
  if (!order.customerId.trim()) errors.push('OS precisa estar vinculada a um cliente.')
  if (!order.itemId.trim()) errors.push('OS precisa estar vinculada a um item.')
  if (!order.reportedProblem.trim()) errors.push('Problema relatado é obrigatório.')
  if (!order.createdAt.trim()) errors.push('Data de criação é obrigatória.')
  if (!order.updatedAt.trim()) errors.push('Data de atualização é obrigatória.')

  return result(errors)
}
