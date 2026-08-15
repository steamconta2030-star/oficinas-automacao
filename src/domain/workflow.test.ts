import { describe, expect, it } from 'vitest'
import { podeAlterarStatus } from './workflow'

describe('workflow da ordem de serviço', () => {
  it('permite avançar de avaliação para orçamento enviado', () => {
    expect(podeAlterarStatus('aguardando_avaliacao', 'orcamento_enviado')).toBe(true)
  })

  it('impede saltar diretamente de avaliação para entregue', () => {
    expect(podeAlterarStatus('aguardando_avaliacao', 'entregue')).toBe(false)
  })

  it('não permite alterar uma OS já entregue', () => {
    expect(podeAlterarStatus('entregue', 'em_execucao')).toBe(false)
  })
})
