import type { OrdemServicoStatus } from './ordem-servico'

export const transicoesPermitidas: Record<OrdemServicoStatus, OrdemServicoStatus[]> = {
  aguardando_avaliacao: ['orcamento_enviado'],
  orcamento_enviado: ['aprovado', 'aguardando_avaliacao'],
  aprovado: ['em_execucao', 'aguardando_peca'],
  em_execucao: ['aguardando_peca', 'pronto'],
  aguardando_peca: ['em_execucao'],
  pronto: ['entregue', 'em_execucao'],
  entregue: [],
}

export function podeAlterarStatus(atual: OrdemServicoStatus, proximo: OrdemServicoStatus) {
  return transicoesPermitidas[atual].includes(proximo)
}

export function exigirTransicaoValida(atual: OrdemServicoStatus, proximo: OrdemServicoStatus) {
  if (!podeAlterarStatus(atual, proximo)) {
    throw new Error(`Transição de status inválida: ${atual} → ${proximo}`)
  }
}
