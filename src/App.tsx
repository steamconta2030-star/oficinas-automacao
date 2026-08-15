import { Bot, Car, Gauge, PackageSearch, Settings, Users, Wrench } from 'lucide-react'

const modules = [
  { title: 'Ordens de serviço', description: 'Acompanhe entrada, diagnóstico, execução e entrega.', icon: Wrench },
  { title: 'Clientes e veículos', description: 'Histórico centralizado de clientes e veículos.', icon: Car },
  { title: 'Estoque', description: 'Peças, movimentações e alertas de reposição.', icon: PackageSearch },
  { title: 'Automações', description: 'Fluxos automáticos para reduzir tarefas repetitivas.', icon: Bot },
]

function App() {
  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Wrench size={22} /></div>
          <div><strong>Oficinas</strong><span>Automação</span></div>
        </div>
        <nav>
          <a className="active" href="#dashboard"><Gauge size={19} /> Visão geral</a>
          <a href="#modulos"><Wrench size={19} /> Operação</a>
          <a href="#clientes"><Users size={19} /> Clientes</a>
          <a href="#automacoes"><Bot size={19} /> Automações</a>
          <a href="#configuracoes"><Settings size={19} /> Configurações</a>
        </nav>
        <div className="sidebar-note">Base v0.1<br /><span>Pronta para evolução em ondas.</span></div>
      </aside>

      <section className="content" id="dashboard">
        <header className="topbar">
          <div><span className="eyebrow">PAINEL OPERACIONAL</span><h1>Bom trabalho.</h1></div>
          <div className="status"><span /> Sistema em estruturação</div>
        </header>

        <section className="hero">
          <div>
            <span className="pill">Fundação criada</span>
            <h2>Uma oficina organizada começa com processos visíveis.</h2>
            <p>Esta é a primeira camada da plataforma. A partir daqui, cada módulo será desenvolvido com regras reais de operação e automações úteis.</p>
            <button type="button">Iniciar configuração</button>
          </div>
          <div className="hero-card">
            <div className="metric"><span>Módulos planejados</span><strong>04</strong></div>
            <div className="metric"><span>Stack</span><strong>React + TS</strong></div>
            <div className="metric"><span>Arquitetura</span><strong>Modular</strong></div>
          </div>
        </section>

        <section id="modulos" className="section-block">
          <div className="section-heading"><div><span className="eyebrow">PRÓXIMAS CAMADAS</span><h3>Estrutura da operação</h3></div><p>Os cards abaixo representam a direção inicial, não funcionalidades fictícias.</p></div>
          <div className="module-grid">
            {modules.map(({ title, description, icon: Icon }) => (
              <article className="module-card" key={title}>
                <div className="icon-box"><Icon size={22} /></div>
                <h4>{title}</h4><p>{description}</p><span className="tag">Planejado</span>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
