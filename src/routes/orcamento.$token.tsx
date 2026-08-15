import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { buscarPorTokenDemo, decidirOrcamentoDemo } from '../data/demo-store'
import { calcularTotalOrcamento } from '../domain/entities'

export const Route = createFileRoute('/orcamento/$token')({ component: OrcamentoPublico })
function money(value: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) }

function OrcamentoPublico() {
  const { token } = Route.useParams(); const [, rerender] = useState(0)
  const ordem = buscarPorTokenDemo(token)
  if (!ordem || ordem.orcamento.status === 'rascunho') return <main className="public-page"><section className="public-card"><h1>Orçamento indisponível</h1><p>Confira se o link recebido está correto ou solicite um novo link à oficina.</p></section></main>
  const total = calcularTotalOrcamento(ordem.orcamento.itens)
  const decidido = ordem.orcamento.status === 'aprovado' || ordem.orcamento.status === 'recusado'
  function decidir(decisao: 'aprovado' | 'recusado') { decidirOrcamentoDemo(token, decisao); rerender((n) => n + 1) }
  return <main className="public-page"><section className="public-card"><span className="eyebrow">ORÇAMENTO · OS #{ordem.numero}</span><h1>{ordem.cliente.nome}</h1><p>{ordem.item.descricao} · {ordem.item.identificacao}</p><div className="public-items">{ordem.orcamento.itens.map((item) => <div key={item.id}><span>{item.descricao}<small>{item.quantidade} × {money(item.valorUnitario)}</small></span><strong>{money(item.quantidade * item.valorUnitario)}</strong></div>)}</div><div className="public-total"><span>Total</span><strong>{money(total)}</strong></div>{decidido ? <div className="decision-result">Orçamento {ordem.orcamento.status === 'aprovado' ? 'aprovado' : 'recusado'} em {new Date(ordem.orcamento.decididoEm!).toLocaleString('pt-BR')}.</div> : <div className="decision-actions"><button className="approve" onClick={() => decidir('aprovado')}>Aprovar orçamento</button><button className="reject" onClick={() => decidir('recusado')}>Recusar</button></div>}<p className="public-note">Demonstração local: esta decisão ainda não possui validade operacional até a conexão segura com o backend.</p></section></main>
}
