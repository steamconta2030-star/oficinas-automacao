import { Link, createFileRoute } from '@tanstack/react-router'
import { Plus, Search } from 'lucide-react'

export const Route = createFileRoute('/os/')({ component: OrdensServico })

function OrdensServico() {
  return (
    <>
      <header className="page-header"><div><span className="eyebrow">OPERAÇÃO</span><h1>Ordens de serviço</h1><p>Acompanhe o ciclo completo do serviço sem perder autorizações ou histórico.</p></div><Link to="/os/nova" className="primary-action"><Plus size={17} /> Nova OS</Link></header>
      <div className="toolbar"><label className="search-box"><Search size={17} /><input aria-label="Buscar ordem de serviço" placeholder="Buscar por OS, cliente ou identificação" disabled /></label><span className="helper-text">Busca será habilitada com a conexão de dados.</span></div>
      <section className="empty-state"><div className="empty-icon">OS</div><h2>Nenhuma ordem carregada</h2><p>A estrutura está pronta para receber dados reais do Supabase. Até a conexão, a interface permanece vazia em vez de simular registros.</p><Link to="/os/nova" className="secondary-action">Preparar nova OS</Link></section>
    </>
  )
}
