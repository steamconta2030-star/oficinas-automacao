import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowRight, CircleDollarSign, ClipboardCheck, Clock3, Wrench } from 'lucide-react'

export const Route = createFileRoute('/')({ component: Dashboard })

const indicadores = [
  { label: 'OS abertas', valor: '—', icon: Wrench },
  { label: 'Aguardando aprovação', valor: '—', icon: Clock3 },
  { label: 'Prontas', valor: '—', icon: ClipboardCheck },
  { label: 'Faturamento', valor: '—', icon: CircleDollarSign },
]

function Dashboard() {
  return (
    <>
      <header className="topbar"><div><span className="eyebrow">PAINEL OPERACIONAL</span><h1>Visão geral</h1></div><span className="status"><span /> Onda 1</span></header>
      <section className="hero compact-hero">
        <div><span className="pill">Ordem de Serviço no centro</span><h2>Da entrada à autorização, sem depender da memória.</h2><p>O primeiro fluxo conecta cliente, item atendido, OS e orçamento. Integrações externas só entram depois desta base estar validada.</p><Link className="primary-action" to="/os">Ver ordens de serviço <ArrowRight size={17} /></Link></div>
      </section>
      <section className="section-block">
        <div className="section-heading"><div><span className="eyebrow">OPERAÇÃO</span><h3>Indicadores</h3></div><p>Os números aparecem quando o banco for conectado. Não usamos dados fictícios no painel.</p></div>
        <div className="metric-grid">{indicadores.map(({ label, valor, icon: Icon }) => <article className="metric-card" key={label}><Icon size={20} /><span>{label}</span><strong>{valor}</strong></article>)}</div>
      </section>
    </>
  )
}
