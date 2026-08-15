import type { Orcamento, OrcamentoItem } from './entities'
import { calcularTotalOrcamento } from './entities'

export function validarItensOrcamento(itens: OrcamentoItem[]) {
  if (itens.length === 0) throw new Error('O orçamento precisa ter ao menos um item.')

  for (const item of itens) {
    if (!item.descricao.trim()) throw new Error('Todo item precisa de descrição.')
    if (!Number.isInteger(item.quantidade) || item.quantidade <= 0) {
      throw new Error('A quantidade precisa ser inteira e maior que zero.')
    }
    if (!Number.isFinite(item.valorUnitario) || item.valorUnitario < 0) {
      throw new Error('O valor unitário precisa ser válido e não pode ser negativo.')
    }
  }

  return calcularTotalOrcamento(itens)
}

export function podeEditarOrcamento(orcamento: Orcamento) {
  return orcamento.status === 'rascunho'
}

export function exigirOrcamentoEditavel(orcamento: Orcamento) {
  if (!podeEditarOrcamento(orcamento)) {
    throw new Error('Orçamento enviado ou decidido não pode ser alterado silenciosamente.')
  }
}
