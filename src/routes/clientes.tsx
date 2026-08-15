import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/clientes')({ component: Clientes })

function Clientes() {
  return <><header className="page-header"><div><span className="eyebrow">CADASTRO</span><h1>Clientes</h1><p>O histórico do cliente ficará ligado aos itens atendidos e às ordens de serviço.</p></div></header><section className="empty-state"><div className="empty-icon">CL</div><h2>Cadastro preparado</h2><p>Clientes serão persistidos junto com a primeira OS para evitar cadastro duplicado e trabalho desnecessário na recepção.</p></section></>
}
