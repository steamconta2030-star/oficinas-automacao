import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { criarOrdemDemo } from '../data/demo-store'

export const Route = createFileRoute('/os/nova')({ component: NovaOS })

function NovaOS() {
  const navigate = useNavigate()
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
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
    const ordem = criarOrdemDemo(input)
    void navigate({ to: '/os/$osId', params: { osId: ordem.id } })
  }

  return (
    <>
      <header className="page-header"><div><span className="eyebrow">NOVA ORDEM</span><h1>Abertura de OS</h1><p>Fluxo curto para recepção: cliente, item e problema relatado.</p></div></header>
      <div className="demo-banner">Modo de demonstração seguro: os dados ficam apenas neste navegador até a conexão autenticada com o Supabase.</div>
      <form className="form-card" onSubmit={handleSubmit}>
        <fieldset><legend>1. Cliente</legend><div className="form-grid"><label>Nome<input name="clienteNome" placeholder="Nome do cliente" required /></label><label>WhatsApp<input name="telefone" inputMode="tel" placeholder="(31) 99999-9999" required /></label></div></fieldset>
        <fieldset><legend>2. Item atendido</legend><div className="form-grid"><label>Tipo<select name="tipo" defaultValue="veiculo"><option value="veiculo">Veículo</option><option value="movel">Móvel</option><option value="equipamento">Equipamento</option><option value="outro">Outro</option></select></label><label>Identificação<input name="identificacao" placeholder="Placa, modelo ou nº de série" required /></label><label className="full-field">Descrição<input name="descricao" placeholder="Ex.: Fiat Strada 1.3 2023" required /></label></div></fieldset>
        <fieldset><legend>3. Problema relatado</legend><label>Relato do cliente<textarea name="problema" rows={5} placeholder="Registre com as palavras do cliente o motivo da entrada." required /></label></fieldset>
        {error && <p className="form-error">{error}</p>}
        <div className="form-footer"><span>Nenhum dado real será enviado para serviços externos nesta etapa.</span><button type="submit" disabled={saving}>{saving ? 'Criando...' : 'Criar ordem de serviço'}</button></div>
      </form>
    </>
  )
}
