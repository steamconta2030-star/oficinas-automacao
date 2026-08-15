import { describe, expect, it } from 'vitest'
import type { Orcamento, OrcamentoItem } from './entities'
import { exigirOrcamentoEditavel, podeEditarOrcamento, validarItensOrcamento } from './orcamento'

const itemBase: OrcamentoItem = {
  id: 'item-1',
  tipo: 'servico',
  descricao: 'Troca da bieleta',
  quantidade: 1,
  valorUnitario: 120,
}

function orcamento(status: Orcamento['status']): Orcamento {
  return {
    id: 'orc-1',
    ordemServicoId: 'os-1',
    status,
    tokenPublico: 'token',
    itens: [itemBase],
  }
}

describe('orçamento', () => {
  it('calcula e valida itens válidos', () => {
    expect(validarItensOrcamento([itemBase, { ...itemBase, id: 'item-2', quantidade: 2, valorUnitario: 85 }])).toBe(290)
  })

  it('rejeita quantidade não inteira no fluxo atual', () => {
    expect(() => validarItensOrcamento([{ ...itemBase, quantidade: 1.5 }])).toThrow('inteira')
  })

  it('permite valor zero, mas nunca valor negativo', () => {
    expect(validarItensOrcamento([{ ...itemBase, valorUnitario: 0 }])).toBe(0)
    expect(() => validarItensOrcamento([{ ...itemBase, valorUnitario: -1 }])).toThrow('negativo')
  })

  it('só permite edição enquanto está em rascunho', () => {
    expect(podeEditarOrcamento(orcamento('rascunho'))).toBe(true)
    expect(podeEditarOrcamento(orcamento('enviado'))).toBe(false)
    expect(() => exigirOrcamentoEditavel(orcamento('aprovado'))).toThrow()
  })
})
