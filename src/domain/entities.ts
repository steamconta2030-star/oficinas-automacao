import type { OrdemServicoStatus } from './ordem-servico'

export type Cliente = {
  id: string
  nome: string
  telefone: string
  email?: string
  createdAt: string
}

export type ItemAtendido = {
  id: string
  clienteId: string
  tipo: 'veiculo' | 'movel' | 'equipamento' | 'outro'
  identificacao: string
  descricao: string
}

export type OrdemServico = {
  id: string
  numero: number
  clienteId: string
  itemId: string
  problemaRelatado: string
  status: OrdemServicoStatus
  tecnicoId?: string
  createdAt: string
  updatedAt: string
}

export type OrcamentoItem = {
  id: string
  tipo: 'peca' | 'servico'
  descricao: string
  quantidade: number
  valorUnitario: number
}

export type Orcamento = {
  id: string
  ordemServicoId: string
  itens: OrcamentoItem[]
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado'
  tokenPublico: string
  enviadoEm?: string
  decididoEm?: string
}

export function calcularTotalOrcamento(itens: OrcamentoItem[]) {
  return itens.reduce((total, item) => total + item.quantidade * item.valorUnitario, 0)
}
