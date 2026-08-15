import { useEffect, useMemo, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { enviarOrcamento, obterOrdem, salvarOrcamento, type OrdemCompleta } from '../data/repository'
import { calcularTotalOrcamento, type OrcamentoItem } from '../domain/entities'
import { ordemServicoStatusLabel } from '../domain/ordem-servico'
import { obterSessaoInterna, podeGerenciarOperacao, type SessaoInterna } from '../lib/auth'
import { supabaseConfigurado } from '../lib/supabase'

export const Route = createFileRoute('/os/$osId')({ component: DetalheOS })

function money(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
}

function parseDecimalInput(value: FormDataEntryValue | null) {
  return Number(String(value ?? '').trim().replace(',', '.'))
}

function DetalheOS() {
  const { osId } = Route.useParams()
  const [registro, setRegistro] = useState<OrdemCompleta | null>(null)
  const [sessao, setSessao] = useState<SessaoInterna | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const configurado = supabaseConfigurado()
  const podeEditar = !configurado || (sessao ? podeGerenciarOperacao(sessao.perfil.papel) : false)

  useEffect(() => {
    let ativo = true
    setCarregando(true)
    setErro('')

    void Promise.all([
      obterOrdem(osId),
      configurado ? obterSessaoInterna() : Promise.resolve(null),
    ])
      .then(([ordem, sessaoAtual]) => {
        if (!ativo) return
        setRegistro(ordem)
        setSessao(sessaoAtual)
      })
      .catch((error) => {
        if (!ativo) return
        setErro(error instanceof Error ? error.message : 'Não foi possível carregar a OS.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => { ativo = false }
  }, [configurado, osId])

  const itens = registro?.orcamento?.itens ?? []
  const total = useMemo(() => calcularTotalOrcamento(itens), [itens])
  const statusOrcamento = registro?.orcamento?.status ?? 'rascunho'
  const editavel = podeEditar && statusOrcamento === 'rascunho'

  async function recarregar() {
    const atualizado = await obterOrdem(osId)
    setRegistro(atualizado)
  }

  async function addItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editavel) return

    const form = new FormData(event.currentTarget)
    const novoItem: OrcamentoItem = {
      id: '',
      tipo: String(form.get('tipo')) as 'peca' | 'servico',
      descricao: String(form.get('descricao')).trim(),
      quantidade: parseDecimalInput(form.get('quantidade')),
      valorUnitario: parseDecimalInput(form.get('valor')),
    }

    if (!novoItem.descricao || !Number.isInteger(novoItem.quantidade) || novoItem.quantidade <= 0 || !Number.isFinite(novoItem.valorUnitario) || novoItem.valorUnitario < 0) {
      setErro('Use quantidade inteira maior que zero e informe um valor válido.')
      return
    }

    setErro('')
    setSalvando(true)
    try {
      await salvarOrcamento(osId, [...itens, novoItem])
      event.currentTarget.reset()
      const quantidade = event.currentTarget.elements.namedItem('quantidade')
      if (quantidade instanceof HTMLInputElement) quantidade.value = '1'
      await recarregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível salvar o orçamento.')
    } finally {
      setSalvando(false)
    }
  }

  async function enviar() {
    if (!editavel || itens.length === 0) return
    setErro('')
    setSalvando(true)
    try {
      await enviarOrcamento(osId)
      await recarregar()
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível enviar o orçamento.')
    } finally {
      setSalvando(false)
    }
  }

  if (carregando) {
    return <section className="empty-state"><div className="empty-icon">OS</div><h2>Carregando ordem</h2><p>Buscando dados da ordem e do orçamento.</p></section>
  }

  if (erro && !registro) {
    return <section className="empty-state"><div className="empty-icon">!</div><h2>Não foi possível abrir a OS</h2><p>{erro}</p><Link to="/os/" className="secondary-action">Voltar para ordens</Link></section>
  }

  if (!registro) {
    return <section className="empty-state"><div className="empty-icon">OS</div><h2>OS não encontrada</h2><Link to="/os/" className="secondary-action">Voltar para ordens</Link></section>
  }

  const { ordem, cliente, item, orcamento } = registro

  return (
    <>
      <header className="page-header">
        <div>
          <span className="eyebrow">OS #{ordem.numero}</span>
          <h1>{cliente?.nome ?? 'Cliente não identificado'}</h1>
          <p>{item?.descricao ?? 'Item não identificado'} · {item?.identificacao ?? 'Sem identificação'}</p>
        </div>
        <span className="status-chip">{ordemServicoStatusLabel[ordem.status]}</span>
      </header>

      <div className="demo-banner">
        {configurado
          ? podeEditar
            ? 'Dados conectados ao Supabase. Orçamentos enviados ficam bloqueados para edição.'
            : 'Perfil técnico: consulta liberada; edição e envio de orçamento ficam com dono/recepção.'
          : 'Modo demonstração: dados armazenados somente neste navegador.'}
      </div>

      {erro && <p className="form-error">{erro}</p>}

      <section className="detail-grid">
        <article className="panel">
          <span className="eyebrow">PROBLEMA RELATADO</span>
          <p>{ordem.problemaRelatado}</p>
          <dl>
            <div><dt>Contato</dt><dd>{cliente?.telefone ?? 'Não informado'}</dd></div>
            <div><dt>Item</dt><dd>{item?.identificacao ?? 'Não informado'}</dd></div>
          </dl>
        </article>
        <article className="panel">
          <span className="eyebrow">ORÇAMENTO</span>
          <h2>{money(total)}</h2>
          <p>Status: <strong>{statusOrcamento}</strong></p>
          {(orcamento?.status === 'enviado' || orcamento?.status === 'aprovado' || orcamento?.status === 'recusado') && (
            <Link className="secondary-action" to="/orcamento/$token" params={{ token: orcamento.tokenPublico }}>Abrir link do cliente</Link>
          )}
        </article>
      </section>

      <section className="panel wide-panel">
        <div className="section-title">
          <div><span className="eyebrow">ITENS</span><h2>Peças e serviços</h2></div>
          {editavel && itens.length > 0 && <button className="primary-action" type="button" onClick={enviar} disabled={salvando}>{salvando ? 'Salvando...' : 'Enviar orçamento'}</button>}
        </div>

        {itens.length === 0 && <p>Nenhuma peça ou serviço adicionado ao orçamento.</p>}
        {itens.map((orcamentoItem) => (
          <div className="budget-row" key={orcamentoItem.id || `${orcamentoItem.tipo}-${orcamentoItem.descricao}`}>
            <span>{orcamentoItem.tipo === 'peca' ? 'Peça' : 'Serviço'}</span>
            <strong>{orcamentoItem.descricao}</strong>
            <span>{orcamentoItem.quantidade} × {money(orcamentoItem.valorUnitario)}</span>
            <b>{money(orcamentoItem.quantidade * orcamentoItem.valorUnitario)}</b>
          </div>
        ))}

        {editavel && (
          <form className="inline-form" onSubmit={addItem}>
            <select name="tipo" defaultValue="servico"><option value="servico">Serviço</option><option value="peca">Peça</option></select>
            <input name="descricao" placeholder="Descrição" required />
            <input name="quantidade" type="number" min="1" step="1" defaultValue="1" inputMode="numeric" aria-label="Quantidade" required />
            <input name="valor" type="text" inputMode="decimal" placeholder="Valor (ex.: 120,00)" aria-label="Valor unitário" required />
            <button type="submit" disabled={salvando}>{salvando ? 'Salvando...' : 'Adicionar'}</button>
          </form>
        )}
      </section>
    </>
  )
}
