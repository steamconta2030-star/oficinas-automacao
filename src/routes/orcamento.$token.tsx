import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { decidirOrcamentoDemo, obterOrcamentoPublicoDemo } from '../data/demo-store'
import { calcularTotalOrcamento } from '../domain/entities'

export const Route = createFileRoute('/orcamento/$token')({ component: OrcamentoPublico })

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function OrcamentoPublico() {
  const { token } = Route.useParams()
  const [, rerender] = useState(0)
  const dados = obterOrcamentoPublicoDemo(token)

  if (!dados || !dados.ordem || !dados.cliente || !dados.item || dados.orcamento.status === 'rascunho') {
    return (
      <main className="public-page">
        <section className="public-card">
          <h1>Orçamento indisponível</h1>
          <p>Confira se o link recebido está correto ou solicite um novo link à oficina.</p>
        </section>
      </main>
    )
  }

  const { ordem, cliente, item, orcamento } = dados
  const total = calcularTotalOrcamento(orcamento.itens)
  const decidido = orcamento.status === 'aprovado' || orcamento.status === 'recusado'

  function decidir(decisao: 'aprovado' | 'recusado') {
    decidirOrcamentoDemo(token, decisao)
    rerender((n) => n + 1)
  }

  return (
    <main className="public-page">
      <section className="public-card">
        <span className="eyebrow">ORÇAMENTO · OS #{ordem.numero}</span>
        <h1>{cliente.nome}</h1>
        <p>{item.descricao} · {item.identificacao}</p>
        <div className="public-items">
          {orcamento.itens.map((orcamentoItem) => (
            <div key={orcamentoItem.id}>
              <span>{orcamentoItem.descricao}<small>{orcamentoItem.quantidade} × {money(orcamentoItem.valorUnitario)}</small></span>
              <strong>{money(orcamentoItem.quantidade * orcamentoItem.valorUnitario)}</strong>
            </div>
          ))}
        </div>
        <div className="public-total"><span>Total</span><strong>{money(total)}</strong></div>
        {decidido ? (
          <div className="decision-result">Orçamento {orcamento.status === 'aprovado' ? 'aprovado' : 'recusado'} em {new Date(orcamento.decididoEm!).toLocaleString('pt-BR')}.</div>
        ) : (
          <div className="decision-actions">
            <button className="approve" onClick={() => decidir('aprovado')}>Aprovar orçamento</button>
            <button className="reject" onClick={() => decidir('recusado')}>Recusar</button>
          </div>
        )}
        <p className="public-note">Demonstração local: esta decisão ainda não possui validade operacional até a conexão segura com o backend.</p>
      </section>
    </main>
  )
}
