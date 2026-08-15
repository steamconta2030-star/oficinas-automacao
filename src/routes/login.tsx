import { useState } from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { entrar } from '../lib/auth'
import { supabaseConfigurado } from '../lib/supabase'

export const Route = createFileRoute('/login')({ component: Login })

function Login() {
  const navigate = useNavigate()
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const configurado = supabaseConfigurado()

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!configurado) return
    const form = new FormData(event.currentTarget)
    setErro('')
    setEnviando(true)
    try {
      await entrar(String(form.get('email') ?? ''), String(form.get('senha') ?? ''))
      await navigate({ to: '/' })
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível entrar.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <main className="public-page">
      <form className="public-card" onSubmit={handleSubmit}>
        <span className="eyebrow">ACESSO INTERNO</span>
        <h1>Oficina Automação</h1>
        <p>Entre com o usuário cadastrado para acessar a operação da oficina.</p>
        {!configurado && <div className="decision-result">Modo demonstração ativo. Configure o Supabase para habilitar o login real.</div>}
        <div className="login-fields">
          <label>E-mail<input name="email" type="email" autoComplete="email" required disabled={!configurado} /></label>
          <label>Senha<input name="senha" type="password" autoComplete="current-password" required disabled={!configurado} /></label>
        </div>
        {erro && <p className="form-error login-error">{erro}</p>}
        <button className="approve login-button" type="submit" disabled={!configurado || enviando}>{enviando ? 'Entrando...' : 'Entrar'}</button>
        <p className="public-note">No modo real, permissões são definidas pelos papéis dono, recepção e técnico.</p>
      </form>
    </main>
  )
}
