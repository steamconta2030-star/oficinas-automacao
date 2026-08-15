import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import { Bot, ClipboardList, Gauge, Users, Wrench } from 'lucide-react'
import type { ReactNode } from 'react'
import '../styles/index.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'Oficinas Automação' },
      { name: 'description', content: 'Gestão enxuta de ordens de serviço para pequenas oficinas.' },
    ],
  }),
  component: RootComponent,
})

function RootComponent() {
  return (
    <RootDocument>
      <div className="app-shell">
        <aside className="sidebar">
          <Link to="/" className="brand">
            <div className="brand-mark"><Wrench size={22} /></div>
            <div><strong>Oficinas</strong><span>Automação</span></div>
          </Link>
          <nav>
            <Link to="/" activeOptions={{ exact: true }}><Gauge size={19} /> Visão geral</Link>
            <Link to="/os"><ClipboardList size={19} /> Ordens de serviço</Link>
            <Link to="/clientes"><Users size={19} /> Clientes</Link>
            <span className="nav-disabled"><Bot size={19} /> Automações <small>Onda 3</small></span>
          </nav>
          <div className="sidebar-note">Onda 1<br /><span>Núcleo da OS em construção segura.</span></div>
        </aside>
        <main className="content"><Outlet /></main>
      </div>
    </RootDocument>
  )
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  )
}
