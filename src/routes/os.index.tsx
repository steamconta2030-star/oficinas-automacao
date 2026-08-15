import { Link, createFileRoute } from '@tanstack/react-router'
import { Plus } from 'lucide-react'
import { listarOrdensDemo } from '../data/demo-store'
import { ordemServicoStatusLabel } from '../domain/ordem-servico'

export const Route = createFileRoute('/os/')({ component: OrdensServico })

function OrdensServico() {
  const registros = listarOrdensDemo()
  return (
    <>
      <header className="page-header"><div><span className="eyebrow">OPERAÇÃO</span><h1>Ordens de serviço</h1><p>Acompanhe o ciclo completo do serviço sem perder autorizações ou histórico.</p></div><Link to="/os/nova" className="primary-action"><Plus size={17} /> Nova OS</Link></header>
      <div className="demo-banner">Modo demonstração: registros locais, isolados do banco de produção.</div>
      {registros.length === 0 ? (
        <section className="empty-state"><div className="empty-icon">OS</div><h2>Nenhuma ordem criada</h2><p>Crie a primeira OS para validar o fluxo de atendimento.</p><Link to="/os/nova" className="secondary-action">Criar primeira OS</Link></section>
      ) : (
        <section className="os-list">{registros.map(({ ordem, cliente, item }) => <Link key={ordem.id} to="/os/$osId" params={{ osId: ordem.id }} className="os-row"><div><strong>OS #{ordem.numero}</strong><span>{cliente?.nome ?? 'Cliente não identificado'} · {item?.identificacao ?? 'Item não identificado'}</span></div><span className="status-chip">{ordemServicoStatusLabel[ordem.status]}</span></Link>)}</section>
      )}
    </>
  )
}
