import { useEffect, useState } from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { criarOrdem, modoDados } from '../data/repository'
import { obterSessaoInterna, podeGerenciarOperacao } from '../lib/auth'
import { supabaseConfigurado } from '../lib/supabase'

export const Route = createFileRoute('/os/nova')({ component: NovaOS })

function NovaOS() {
  const navigate = useNavigate()
  const configurado = supabaseConfigurado()
  const [autorizado, setAutorizado] = useState(!configurado)
  const [checkingPermission, setCheckingPermission] = useState(configurado)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!configurado) return
    let ativo = true
    void obterSessaoInterna()
      .then((sessao) => {
        if (!ativo) return
        setAutorizado(Boolean(sessao && podeGerenciarOperacao(sessao.perfil.papel)))
      })
      .catch(() => {
        if (ativo) setAutorizado(false)
      })
      .finally(() => {
        if (ativo) setCheckingPermission(false)
      })
    return () => { ativo = false }
  }, [configurado])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!autorizado) return
    setError('')
    const form = new FormData(event.currentTarget)
    const input = {
      clienteNome: String(form.get('clienteNome') ?? ''),
      telefone: String(form.get('telefone') ?? ''),
      tipo: String(form.get('tipo') ?? 'veiculo') as 'veiculo' | 'movel' | 'equipamento' | 'outro',
      identificacao: String(form.get('identificacao') ?? ''),
      descricao: String(form.get('descricao') ?? ''),
      problema: String(form.get('problema') ?? ''),
    }
    if (!input.clienteNome.trim() || !input.telefone.trim() || !input.identificacao.trim() || !input.descricao.trim() || !input.problema.trim()) {
      setError('Preencha todos os campos obrigatórios.')
      return
    }

    setSaving(true)
    try {
      const criada = await criarOrdem(input)
      await navigate({ to: '/os/$osId', params: { osId: criada.ordem.id } })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar a ordem de serviço.')
      setSaving(false)
    }
  }

  if (checkingPermission) {
    return <section className="empty-state"><div className="empty-icon">OS</div><h2>Verificando permissão</h2><p>Validando seu perfil antes de abrir uma nova ordem.</p></section>
  }

  if (!autorizado) {
    return <section className="empty-state"><div className="empty-icon">!</div><h2>Abertura de OS restrita</h2><p>Seu perfil pode consultar e executar ordens, mas novas OS são abertas por dono ou recepção.</p><Link to="/os" className="secondary-action">Voltar para ordens</Link></section>
  }

  return (
    <>
      <header className="page-header"><div><span className="eyebrow">NOVA ORDEM</span><h1>Abertura de OS</h1><p>Fluxo curto para recepção: cliente, item e problema relatado.</p></div></header>
      <div className="demo-banner">{modoDados === 'demo' ? 'Modo demonstração: os dados ficam apenas neste navegador.' : 'Modo conectado: a OS será persistida com segurança no Supabase.'}</div>
      <form className="form-card" onSubmit={handleSubmit}>
        <fieldset><legend>1. Cliente</legend><div className="form-grid"><label>Nome<input name="clienteNome" placeholder="Nome do cliente" required /></label><label>WhatsApp<input name="telefone" inputMode="tel" placeholder="(31) 99999-9999" required /></label></div></fieldset>
        <fieldset><legend>2. Item atendido</legend><div className="form-grid"><label>Tipo<select name="tipo" defaultValue="veiculo"><option value="veiculo">Veículo</option><option value="movel">Móvel</option><option value="equipamento">Equipamento</option><option value="outro">Outro</option></select></label><label>Identificação<input name="identificacao" placeholder="Placa, modelo ou nº de série" required /></label><label className="full-field">Descrição<input name="descricao" placeholder="Ex.: Fiat Strada 1.3 2023" required /></label></div></fieldset>
        <fieldset><legend>3. Problema relatado</legend><label>Relato do cliente<textarea name="problema" rows={5} placeholder="Registre com as palavras do cliente o motivo da entrada." required /></label></fieldset>
        {error && <p className="form-error">{error}</p>}
        <div className="form-footer"><span>{modoDados === 'demo' ? 'Nenhum dado será enviado para serviços externos.' : 'A criação usa uma operação atômica no banco.'}</span><button type="submit" disabled={saving}>{saving ? 'Criando...' : 'Criar ordem de serviço'}</button></div>
      </form>
    </>
  )
}
