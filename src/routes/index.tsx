import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, CircleDollarSign, ClipboardCheck, Clock3, Package, Plus, Wrench } from 'lucide-react'
import { listarOrdens, modoDados, type OrdemCompleta } from '../data/repository'
import { obterSessaoInterna, podeGerenciarOperacao, type SessaoInterna } from '../lib/auth'
import { supabaseConfigurado } from '../lib/supabase'

export const Route = createFileRoute('/')({ component: Dashboard })

const statusLabel = {
  aguardando_avaliacao: 'Aguardando avaliação',
  orcamento_enviado: 'Aguardando aprovação',
  aprovado: 'Aprovado',
  em_execucao: 'Em execução',
  aguardando_peca: 'Aguardando peça',
  pronto: 'Pronto',
  entregue: 'Entregue',
} as const

function Dashboard() {
  const configurado = supabaseConfigurado()
  const [ordens, setOrdens] = useState<OrdemCompleta[]>([])
  const [sessao, setSessao] = useState<SessaoInterna | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    void Promise.all([
      listarOrdens(),
      configurado ? obterSessaoInterna() : Promise.resolve(null),
    ])
      .then(([registros, sessaoAtual]) => {
        if (!ativo) return
        setOrdens(registros)
        setSessao(sessaoAtual)
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar o painel.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => { ativo = false }
  }, [configurado])

  const podeCriar = !configurado || (sessao ? podeGerenciarOperacao(sessao.perfil.papel) : false)
  const abertas = ordens.filter(({ ordem }) => ordem.status !== 'entregue').length
  const aguardandoAprovacao = ordens.filter(({ ordem }) => ordem.status === 'orcamento_enviado').length
  const aguardandoPeca = ordens.filter(({ ordem }) => ordem.status === 'aguardando_peca').length
  const prontas = ordens.filter(({ ordem }) => ordem.status === 'pronto').length
  const recentes = ordens.slice(0, 5)

  const indicadores = [
    { label: 'OS abertas', valor: String(abertas), icon: Wrench, detalhe: 'Em qualquer etapa antes da entrega' },
    { label: 'Aguardando aprovação', valor: String(aguardandoAprovacao), icon: Clock3, detalhe: 'Orçamentos enviados ao cliente' },
    { label: 'Aguardando peça', valor: String(aguardandoPeca), icon: Package, detalhe: 'Serviços parados por material' },
    { label: 'Prontas para entrega', valor: String(prontas), icon: ClipboardCheck, detalhe: 'Serviços finalizados' },
  ]

  if (carregando) {
    return <section className="empty-state"><div className="empty-icon">OS</div><h2>Carregando operação</h2><p>Atualizando os indicadores da oficina.</p></section>
  }

  return (
    <>
      <header className="topbar">
        <div><span className="eyebrow">PAINEL OPERACIONAL</span><h1>Visão geral</h1></div>
        <div className="dashboard-actions">
          <span className="status"><span /> {modoDados === 'demo' ? 'Modo demonstração' : 'Supabase conectado'}</span>
          {podeCriar && <Link className="primary-action" to="/os/nova"><Plus size={17} /> Nova OS</Link>}
        </div>
      </header>

      {erro && <p className="form-error">{erro}</p>}

      <section className="ops-summary">
        <div>
          <span className="eyebrow">FLUXO DO DIA</span>
          <h2>{abertas === 0 ? 'A operação começa com a primeira ordem de serviço.' : `${abertas} ${abertas === 1 ? 'serviço está' : 'serviços estão'} em andamento.`}</h2>
          <p>Use este painel para enxergar rapidamente onde cada serviço está parado e o que precisa de ação da equipe.</p>
        </div>
        <div className="summary-side">
          <span>Prioridade agora</span>
          <strong>{aguardandoAprovacao > 0 ? `${aguardandoAprovacao} aguardando cliente` : aguardandoPeca > 0 ? `${aguardandoPeca} aguardando peça` : prontas > 0 ? `${prontas} pronta(s) para entrega` : 'Nenhuma pendência crítica'}</strong>
          <Link to="/os">Abrir operação <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section className="section-block compact-section">
        <div className="section-heading">
          <div><span className="eyebrow">STATUS DA OFICINA</span><h3>Indicadores operacionais</h3></div>
          <p>{modoDados === 'demo' ? 'Indicadores calculados com os dados locais deste navegador.' : 'Indicadores calculados com os registros persistidos no Supabase.'}</p>
        </div>
        <div className="metric-grid">
          {indicadores.map(({ label, valor, icon: Icon, detalhe }) => (
            <article className="metric-card operational-card" key={label}>
              <div className="metric-icon"><Icon size={19} /></div>
              <strong>{valor.padStart(2, '0')}</strong>
              <span>{label}</span>
              <small>{detalhe}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="dashboard-grid section-block compact-section">
        <article className="panel recent-panel">
          <div className="section-title"><div><span className="eyebrow">MOVIMENTAÇÃO</span><h2>Ordens recentes</h2></div><Link className="text-link" to="/os">Ver todas <ArrowRight size={14} /></Link></div>
          {recentes.length === 0 ? (
            <div className="dashboard-empty">
              <div className="empty-icon">OS</div>
              <div><strong>Nenhuma OS criada ainda</strong><p>Quando a primeira ordem for aberta, ela aparecerá aqui.</p></div>
              {podeCriar && <Link className="secondary-action" to="/os/nova">Criar primeira OS</Link>}
            </div>
          ) : (
            <div className="recent-list">
              {recentes.map(({ ordem, cliente, item }) => (
                <Link className="recent-row" key={ordem.id} to="/os/$osId" params={{ osId: ordem.id }}>
                  <div className="os-number">#{String(ordem.numero).padStart(4, '0')}</div>
                  <div className="recent-main"><strong>{cliente?.nome ?? 'Cliente não identificado'}</strong><span>{item?.identificacao ?? item?.descricao ?? 'Item não identificado'}</span></div>
                  <span className={`status-badge status-${ordem.status}`}>{statusLabel[ordem.status]}</span>
                  <ArrowRight size={16} />
                </Link>
              ))}
            </div>
          )}
        </article>

        <aside className="panel action-panel">
          <span className="eyebrow">ATALHOS</span>
          <h2>Ações rápidas</h2>
          <p>{podeCriar ? 'Os caminhos mais usados na recepção ficam sempre à mão.' : 'Seu perfil técnico está focado na execução e consulta das ordens.'}</p>
          <div className="quick-actions">
            {podeCriar && <Link to="/os/nova"><Plus size={18} /><span><strong>Abrir nova OS</strong><small>Cliente, item e problema relatado</small></span></Link>}
            <Link to="/os"><Wrench size={18} /><span><strong>Ver operação</strong><small>Acompanhar todas as ordens</small></span></Link>
          </div>
          <div className="finance-placeholder"><CircleDollarSign size={18} /><div><span>Financeiro</span><strong>Entra após cobrança Pix</strong></div></div>
        </aside>
      </section>
    </>
  )
}
