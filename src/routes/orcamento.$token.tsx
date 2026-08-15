import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { decidirOrcamentoPublico, obterOrcamentoPublico, type OrcamentoPublico as OrcamentoPublicoData } from '../data/repository'
import { calcularTotalOrcamento } from '../domain/entities'

export const Route = createFileRoute('/orcamento/$token')({ component: OrcamentoPublico })

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function OrcamentoPublico() {
  const { token } = Route.useParams()
  const [dados, setDados] = useState<OrcamentoPublicoData | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [decidindo, setDecidindo] = useState(false)
  const [erro, setErro] = useState('')

  async function carregar() {
    setCarregando(true)
    setErro('')
    try { setDados(await obterOrcamentoPublico(token)) }
    catch (error) { setErro(error instanceof Error ? error.message : 'Não foi possível carregar o orçamento.') }
    finally { setCarregando(false) }
  }

  useEffect(() => { void carregar() }, [token])

  async function decidir(decisao: 'aprovado' | 'recusado') {
    setDecidindo(true)
    setErro('')
    try { await decidirOrcamentoPublico(token, decisao); await carregar() }
    catch (error) { setErro(error instanceof Error ? error.message : 'Não foi possível registrar sua decisão.') }
    finally { setDecidindo(false) }
  }

  if (carregando) return <main className="public-page"><section className="public-card"><h1>Carregando orçamento</h1><p>Aguarde enquanto buscamos os dados enviados pela oficina.</p></section></main>
  if (!dados) return <main className="public-page"><section className="public-card"><h1>Orçamento indisponível</h1><p>{erro || 'Confira se o link recebido está correto ou solicite um novo link à oficina.'}</p></section></main>

  const { ordem, cliente, item, orcamento } = dados
  const total = calcularTotalOrcamento(orcamento.itens)
  const decidido = orcamento.status === 'aprovado' || orcamento.status === 'recusado'

  return <main className="public-page"><section className="public-card">
    <span className="eyebrow">ORÇAMENTO · OS #{ordem.numero}</span><h1>{cliente.nome}</h1><p>{item.descricao} · {item.identificacao}</p>
    <div className="public-items">{orcamento.itens.map((orcamentoItem) => <div key={orcamentoItem.id}><span>{orcamentoItem.descricao}<small>{orcamentoItem.quantidade} × {money(orcamentoItem.valorUnitario)}</small></span><strong>{money(orcamentoItem.quantidade * orcamentoItem.valorUnitario)}</strong></div>)}</div>
    <div className="public-total"><span>Total</span><strong>{money(total)}</strong></div>
    {erro && <p className="form-error login-error">{erro}</p>}
    {decidido ? <div className="decision-result">Orçamento {orcamento.status === 'aprovado' ? 'aprovado' : 'recusado'}{orcamento.decididoEm ? ` em ${new Date(orcamento.decididoEm).toLocaleString('pt-BR')}` : ''}.</div> : <div className="decision-actions"><button className="approve" disabled={decidindo} onClick={() => void decidir('aprovado')}>{decidindo ? 'Registrando...' : 'Aprovar orçamento'}</button><button className="reject" disabled={decidindo} onClick={() => void decidir('recusado')}>Recusar</button></div>}
    <p className="public-note">Sua decisão é registrada com data e hora e não exige login.</p>
  </section></main>
}
