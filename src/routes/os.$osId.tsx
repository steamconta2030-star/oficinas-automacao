import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { adicionarItemOrcamentoDemo, buscarOrdemDemo, enviarOrcamentoDemo } from '../data/demo-store'
import { calcularTotalOrcamento } from '../domain/entities'
import { ordemServicoStatusLabel } from '../domain/ordem-servico'

export const Route = createFileRoute('/os/$osId')({ component: DetalheOS })

function money(value: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) }

function DetalheOS() {
  const { osId } = Route.useParams()
  const [, rerender] = useState(0)
  const ordem = buscarOrdemDemo(osId)
  if (!ordem) return <section className="empty-state"><h2>OS não encontrada</h2><Link to="/os/">Voltar para ordens</Link></section>

  const total = calcularTotalOrcamento(ordem.orcamento.itens)
  function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); const form = new FormData(event.currentTarget)
    adicionarItemOrcamentoDemo(osId, { tipo: String(form.get('tipo')) as 'peca' | 'servico', descricao: String(form.get('descricao')), quantidade: Number(form.get('quantidade')), valorUnitario: Number(form.get('valor')) })
    event.currentTarget.reset(); rerender((n) => n + 1)
  }
  function enviar() { enviarOrcamentoDemo(osId); rerender((n) => n + 1) }

  return <>
    <header className="page-header"><div><span className="eyebrow">OS #{ordem.numero}</span><h1>{ordem.cliente.nome}</h1><p>{ordem.item.descricao} · {ordem.item.identificacao}</p></div><span className="status-chip">{ordemServicoStatusLabel[ordem.status]}</span></header>
    <div className="demo-banner">Fluxo local para validação. Aprovação ainda não grava em banco externo.</div>
    <section className="detail-grid"><article className="panel"><span className="eyebrow">PROBLEMA RELATADO</span><p>{ordem.problemaRelatado}</p><dl><div><dt>Contato</dt><dd>{ordem.cliente.telefone}</dd></div><div><dt>Item</dt><dd>{ordem.item.identificacao}</dd></div></dl></article>
    <article className="panel"><span className="eyebrow">ORÇAMENTO</span><h2>{money(total)}</h2><p>Status: <strong>{ordem.orcamento.status}</strong></p>{ordem.orcamento.status === 'enviado' && <Link className="secondary-action" to="/orcamento/$token" params={{ token: ordem.orcamento.tokenPublico }}>Abrir link do cliente</Link>}</article></section>
    <section className="panel wide-panel"><div className="section-title"><div><span className="eyebrow">ITENS</span><h2>Peças e serviços</h2></div>{ordem.orcamento.status === 'rascunho' && ordem.orcamento.itens.length > 0 && <button className="primary-action" onClick={enviar}>Enviar orçamento</button>}</div>
      {ordem.orcamento.itens.map((item) => <div className="budget-row" key={item.id}><span>{item.tipo === 'peca' ? 'Peça' : 'Serviço'}</span><strong>{item.descricao}</strong><span>{item.quantidade} × {money(item.valorUnitario)}</span><b>{money(item.quantidade * item.valorUnitario)}</b></div>)}
      {ordem.orcamento.status === 'rascunho' && <form className="inline-form" onSubmit={addItem}><select name="tipo" defaultValue="servico"><option value="servico">Serviço</option><option value="peca">Peça</option></select><input name="descricao" placeholder="Descrição" required /><input name="quantidade" type="number" min="1" step="1" defaultValue="1" required /><input name="valor" type="number" min="0" step="0.01" placeholder="Valor" required /><button type="submit">Adicionar</button></form>}
    </section>
  </>
}
