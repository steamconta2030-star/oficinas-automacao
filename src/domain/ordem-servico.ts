export const ordemServicoStatuses = [
  'aguardando_avaliacao',
  'orcamento_enviado',
  'aprovado',
  'em_execucao',
  'aguardando_peca',
  'pronto',
  'entregue',
] as const

export type OrdemServicoStatus = (typeof ordemServicoStatuses)[number]

export const ordemServicoStatusLabel: Record<OrdemServicoStatus, string> = {
  aguardando_avaliacao: 'Aguardando avaliação',
  orcamento_enviado: 'Orçamento enviado',
  aprovado: 'Aprovado',
  em_execucao: 'Em execução',
  aguardando_peca: 'Aguardando peça',
  pronto: 'Pronto',
  entregue: 'Entregue',
}
