import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { listarOrdens, modoDados, type OrdemCompleta } from '../data/repository'
import { ordemServicoStatusLabel } from '../domain/ordem-servico'
import { obterSessaoInterna, podeGerenciarOperacao, type SessaoInterna } from '../lib/auth'
import { supabaseConfigurado } from '../lib/supabase'

export const Route = createFileRoute('/os/')({ component: OrdensServico })

function OrdensServico() {
  const configurado = supabaseConfigurado()
  const [registros, setRegistros] = useState<OrdemCompleta[]>([])
  const [sessao, setSessao] = useState<SessaoInterna | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    void Promise.all([
      listarOrdens(),
      configurado ? obterSessaoInterna() : Promise.resolve(null),
    ])
      .then(([dados, sessaoAtual]) => {
        if (!ativo) return
        setRegistros(dados)
        setSessao(sessaoAtual)
      })
      .catch((error) => {
        if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar as ordens.')
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })
    return () => { ativo = false }
  }, [configurado])

  const podeCriar = !configurado || (sessao ? podeGerenciarOperacao(sessao.perfil.papel) : false)

  return (
    <>
      <header className="page-header">
        <div><span className="eyebrow">OPERAÇÃO</span><h1>Ordens de serviço</h1><p>Acompanhe o ciclo completo do serviço sem perder autorizações ou histórico.</p></div>
        {podeCriar && <Link to="/os/nova" className="primary-action"><Plus size={17} /> Nova OS</Link>}
      </header>
      <div className="demo-banner">{modoDados === 'demo' ? 'Modo demonstração: registros locais, isolados do banco de produção.' : podeCriar ? 'Modo conectado: operação liberada para seu perfil.' : 'Perfil técnico: consulta das ordens liberada; abertura de OS fica com dono/recepção.'}</div>
      {erro ? (
        <section className="empty-state"><div className="empty-icon">!</div><h2>Não foi possível carregar</h2><p>{erro}</p></section>
      ) : carregando ? (
        <section className="empty-state"><div className="empty-icon">...</div><h2>Carregando ordens</h2></section>
      ) : registros.length === 0 ? (
        <section className="empty-state"><div className="empty-icon">OS</div><h2>Nenhuma ordem criada</h2><p>{podeCriar ? 'Crie a primeira OS para iniciar a operação.' : 'Ainda não existem ordens disponíveis para consulta.'}</p>{podeCriar && <Link to="/os/nova" className="secondary-action">Criar primeira OS</Link>}</section>
      ) : (
        <section className="os-list">{registros.map(({ ordem, cliente, item }) => <Link key={ordem.id} to="/os/$osId" params={{ osId: ordem.id }} className="os-row"><div><strong>OS #{ordem.numero}</strong><span>{cliente?.nome ?? 'Cliente não identificado'} · {item?.identificacao ?? 'Item não identificado'}</span></div><span className="status-chip">{ordemServicoStatusLabel[ordem.status]}</span></Link>)}</section>
      )}
    </>
  )
}
