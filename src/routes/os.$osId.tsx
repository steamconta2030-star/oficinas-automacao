import { useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { enviarOrcamentoDemo, obterOrdemDemo, salvarOrcamentoDemo } from '../data/demo-store'
import { calcularTotalOrcamento, type OrcamentoItem } from '../domain/entities'
import { ordemServicoStatusLabel } from '../domain/ordem-servico'

export const Route = createFileRoute('/os/$osId')({ component: DetalheOS })

function money(value: number) { return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) }

function DetalheOS() {
  const { osId } = Route.useParams()
  const [, rerender] = useState(0)
  const registro = obterOrdemDemo(osId)
  if (!registro) return <section className="empty-state"><h2>OS não encontrada</h2><Link to="/os/">Voltar para ordens</Link></section>

  const { ordem, cliente, item, orcamento } = registro
  const itens = orcamento?.itens ?? []
  const total = calcularTotalOrcamento(itens)

  function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const novoItem: OrcamentoItem = {
      id: '',
      tipo: String(form.get('tipo')) as 'peca' | 'servico',
      descricao: String(form.get('descricao')),
      quantidade: Number(form.get('quantidade')),
      valorUnitario: Number(form.get('valor')),
    }
    salvarOrcamentoDemo(osId, [...itens, novoItem])
    event.currentTarget.reset()
    rerender((n) => n + 1)
  }

  function enviar() {
    enviarOrcamentoDemo(osId)
    rerender((n) => n + 1)
  }

  return <>
    <header className="page-header"><div><span className="eyebrow">OS #{ordem.numero}</span><h1>{cliente?.nome ?? 'Cliente não identificado'}</h1><p>{item?.descricao ?? 'Item não identificado'} · {item?.identificacao ?? 'Sem identificação'}</p></div><span className="status-chip">{ordemServicoStatusLabel[ordem.status]}</span></header>
    <div className="demo-banner">Fluxo local para validação. Aprovação ainda não grava em banco externo.</div>
    <section className="detail-grid"><article className="panel"><span className="eyebrow">PROBLEMA RELATADO</span><p>{ordem.problemaRelatado}</p><dl><div><dt>Contato</dt><dd>{cliente?.telefone ?? 'Não informado'}</dd></div><div><dt>Item</dt><dd>{item?.identificacao ?? 'Não informado'}</dd></div></dl></article>
    <article className="panel"><span className="eyebrow">ORÇAMENTO</span><h2>{money(total)}</h2><p>Status: <strong>{orcamento?.status ?? 'rascunho'}</strong></p>{orcamento?.status === 'enviado' && <Link className="secondary-action" to="/orcamento/$token" params={{ token: orcamento.tokenPublico }}>Abrir link do cliente</Link>}</article></section>
    <section className="panel wide-panel"><div className="section-title"><div><span className="eyebrow">ITENS</span><h2>Peças e serviços</h2></div>{(orcamento?.status ?? 'rascunho') === 'rascunho' && itens.length > 0 && <button className="primary-action" onClick={enviar}>Enviar orçamento</button>}</div>
      {itens.map((orcamentoItem) => <div className="budget-row" key={orcamentoItem.id}><span>{orcamentoItem.tipo === 'peca' ? 'Peça' : 'Serviço'}</span><strong>{orcamentoItem.descricao}</strong><span>{orcamentoItem.quantidade} × {money(orcamentoItem.valorUnitario)}</span><b>{money(orcamentoItem.quantidade * orcamentoItem.valorUnitario)}</b></div>)}
      {(orcamento?.status ?? 'rascunho') === 'rascunho' && <form className="inline-form" onSubmit={addItem}><select name="tipo" defaultValue="servico"><option value="servico">Serviço</option><option value="peca">Peça</option></select><input name="descricao" placeholder="Descrição" required /><input name="quantidade" type="number" min="1" step="1" defaultValue="1" required /><input name="valor" type="number" min="0" step="0.01" placeholder="Valor" required /><button type="submit">Adicionar</button></form>}
    </section>
  </>
}
