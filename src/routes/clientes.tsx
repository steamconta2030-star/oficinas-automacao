import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { listarClientes, modoDados } from '../data/repository'
import type { Cliente } from '../domain/entities'

export const Route = createFileRoute('/clientes')({ component: Clientes })

function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')

  useEffect(() => {
    let ativo = true
    void listarClientes()
      .then((dados) => { if (ativo) setClientes(dados) })
      .catch((error) => { if (ativo) setErro(error instanceof Error ? error.message : 'Não foi possível carregar os clientes.') })
      .finally(() => { if (ativo) setCarregando(false) })
    return () => { ativo = false }
  }, [])

  return (
    <>
      <header className="page-header"><div><span className="eyebrow">CADASTRO</span><h1>Clientes</h1><p>Histórico centralizado dos clientes vinculados às ordens de serviço.</p></div></header>
      <div className="demo-banner">{modoDados === 'demo' ? 'Modo demonstração: clientes derivados das OS deste navegador.' : 'Modo conectado: clientes carregados do Supabase.'}</div>
      {erro ? <section className="empty-state"><div className="empty-icon">!</div><h2>Não foi possível carregar</h2><p>{erro}</p></section> : carregando ? <section className="empty-state"><div className="empty-icon">...</div><h2>Carregando clientes</h2></section> : clientes.length === 0 ? <section className="empty-state"><div className="empty-icon">CL</div><h2>Nenhum cliente cadastrado</h2><p>O primeiro cliente será criado junto com a abertura de uma OS, evitando trabalho duplicado na recepção.</p></section> : <section className="client-list">{clientes.map((cliente) => <article className="client-row" key={cliente.id}><div><strong>{cliente.nome}</strong><span>{cliente.telefone}</span></div>{cliente.email && <small>{cliente.email}</small>}</article>)}</section>}
    </>
  )
}
