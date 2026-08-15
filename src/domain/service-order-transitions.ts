import type { ServiceOrderStatus } from './service-order'

export const allowedServiceOrderTransitions: Record<
  ServiceOrderStatus,
  readonly ServiceOrderStatus[]
> = {
  awaiting_evaluation: ['quote_sent'],
  quote_sent: ['approved', 'awaiting_evaluation'],
  approved: ['in_progress'],
  in_progress: ['waiting_for_part', 'ready'],
  waiting_for_part: ['in_progress'],
  ready: ['delivered', 'in_progress'],
  delivered: [],
}

export function canTransitionServiceOrder(
  from: ServiceOrderStatus,
  to: ServiceOrderStatus,
): boolean {
  return allowedServiceOrderTransitions[from].includes(to)
}

export function assertServiceOrderTransition(
  from: ServiceOrderStatus,
  to: ServiceOrderStatus,
): void {
  if (!canTransitionServiceOrder(from, to)) {
    throw new Error(`Transição de OS inválida: ${from} -> ${to}`)
  }
}

export function isTerminalServiceOrderStatus(status: ServiceOrderStatus): boolean {
  return allowedServiceOrderTransitions[status].length === 0
}
