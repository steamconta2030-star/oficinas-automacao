import { HeadContent, Link, Outlet, Scripts, createRootRoute, useLocation, useNavigate } from '@tanstack/react-router'
import { Bot, ClipboardList, Gauge, LogOut, Users, Wrench } from 'lucide-react'
import { useEffect, useState, type ReactNode } from 'react'
import { obterSessaoInterna, sair, type SessaoInterna } from '../lib/auth'
import { supabaseConfigurado } from '../lib/supabase'
import '../styles/index.css'
import '../styles/auth.css'

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
  notFoundComponent: NotFoundPage,
})

function RootComponent() {
  const location = useLocation()
  const rotaPublica = location.pathname === '/login' || location.pathname.startsWith('/orcamento/')

  return (
    <RootDocument>
      {rotaPublica ? <Outlet /> : <InternalShell />}
    </RootDocument>
  )
}

function NotFoundPage() {
  return (
    <RootDocument>
      <main className="public-page">
        <section className="public-card">
          <span className="eyebrow">ERRO 404</span>
          <h1>Página não encontrada</h1>
          <p>O endereço informado não existe ou foi alterado.</p>
          <Link className="secondary-action" to="/">Voltar para a visão geral</Link>
        </section>
      </main>
    </RootDocument>
  )
}

function InternalShell() {
  const navigate = useNavigate()
  const configurado = supabaseConfigurado()
  const [sessao, setSessao] = useState<SessaoInterna | null>(null)
  const [carregando, setCarregando] = useState(configurado)

  useEffect(() => {
    if (!configurado) return
    let ativo = true

    void obterSessaoInterna()
      .then((resultado) => {
        if (!ativo) return
        if (!resultado) {
          void navigate({ to: '/login' })
          return
        }
        setSessao(resultado)
      })
      .finally(() => {
        if (ativo) setCarregando(false)
      })

    return () => { ativo = false }
  }, [configurado, navigate])

  async function handleSair() {
    await sair()
    setSessao(null)
    await navigate({ to: '/login' })
  }

  if (carregando) {
    return <main className="session-loading"><div className="brand-mark"><Wrench size={22} /></div><span>Carregando operação...</span></main>
  }

  if (configurado && !sessao) return null

  return (
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
        <div className="sidebar-account">
          {sessao ? (
            <>
              <div><strong>{sessao.perfil.nome}</strong><span>{sessao.perfil.papel}</span></div>
              <button type="button" onClick={handleSair} aria-label="Sair"><LogOut size={16} /></button>
            </>
          ) : (
            <div><strong>Modo demonstração</strong><span>Dados locais no navegador</span></div>
          )}
        </div>
        <div className="sidebar-note">Onda 2<br /><span>{configurado ? 'Supabase e autenticação em validação.' : 'Fallback demo ativo até configurar o Supabase.'}</span></div>
      </aside>
      <main className="content"><Outlet /></main>
    </div>
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
