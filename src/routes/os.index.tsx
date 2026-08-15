import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { listarOrdens, modoDados, type OrdemCompleta } from '../data/repository'
import { ordemServicoStatusLabel } from '../domain/ordem-servico'

export const Route = createFileRoute('/os/')({ component: OrdensServico })

function OrdensServico() {
  const [registros, setRegistros] = useState<OrdemCompleta[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    void listarOrdens()
      .then((dados) => { if (ativo) setRegistros(dados) })
      .catch((error) => { if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar as ordens.') })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  return (
    <>
      <header className="page-header"><div><span className="eyebrow">OPERAÇÃO</span><h1>Ordens de serviço</h1><p>Acompanhe o ciclo completo do serviço sem perder autorizações ou histórico.</p></div><Link to="/os/nova" className="primary-action"><Plus size={17} /> Nova OS</Link></header>
      <div className="demo-banner">{modoDados === 'demo' ? 'Modo demonstração: registros locais, isolados do banco de produção.' : 'Modo conectado: registros persistidos no Supabase com RLS.'}</div>
      {erro ? <section className="empty-state"><div className="empty-icon">!</div><h2>Não foi possível carregar</h2><p>{erro}</p></section> : carregando ? <section className="empty-state"><div className="empty-icon">...</div><h2>Carregando ordens</h2></section> : registros.length === 0 ? (
        <section className="empty-state"><div className="empty-icon">OS</div><h2>Nenhuma ordem criada</h2><p>Crie a primeira OS para validar o fluxo de atendimento.</p><Link to="/os/nova" className="secondary-action">Criar primeira OS</Link></section>
      ) : (
        <section className="os-list">{registros.map(({ ordem, cliente, item }) => <Link key={ordem.id} to="/os/$osId" params={{ osId: ordem.id }} className="os-row"><div><strong>OS #{ordem.numero}</strong><span>{cliente?.nome ?? 'Cliente não identificado'} · {item?.identificacao ?? 'Item não identificado'}</span></div><span className="status-chip">{ordemServicoStatusLabel[ordem.status]}</span></Link>)}</section>
      )}
    </>
  )
}
