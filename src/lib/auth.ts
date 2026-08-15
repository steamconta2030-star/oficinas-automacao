import type { Session, User } from '@supabase/supabase-js'
import { getSupabaseClient, supabaseConfigurado } from './supabase'

export type PapelUsuario = 'dono' | 'recepcao' | 'tecnico'

export type PerfilUsuario = {
  id: string
  nome: string
  papel: PapelUsuario
  ativo: boolean
}

export type SessaoInterna = {
  session: Session
  user: User
  perfil: PerfilUsuario
}

export async function entrar(email: string, senha: string): Promise<SessaoInterna> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase ainda não está configurado neste ambiente.')

  const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password: senha })
  if (error || !data.session || !data.user) throw error ?? new Error('Não foi possível iniciar a sessão.')

  const perfil = await obterPerfil(data.user.id)
  if (!perfil.ativo) {
    await supabase.auth.signOut()
    throw new Error('Este usuário está desativado.')
  }

  return { session: data.session, user: data.user, perfil }
}

export async function sair() {
  const supabase = getSupabaseClient()
  if (!supabase) return
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function obterPerfil(userId: string): Promise<PerfilUsuario> {
  const supabase = getSupabaseClient()
  if (!supabase) throw new Error('Supabase ainda não está configurado neste ambiente.')

  const { data, error } = await supabase
    .from('perfis')
    .select('id,nome,papel,ativo')
    .eq('id', userId)
    .single()

  if (error || !data) throw error ?? new Error('Perfil interno não encontrado.')
  return data as PerfilUsuario
}

export async function obterSessaoInterna(): Promise<SessaoInterna | null> {
  if (!supabaseConfigurado()) return null
  const supabase = getSupabaseClient()
  if (!supabase) return null

  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) return null

  const perfil = await obterPerfil(session.user.id)
  if (!perfil.ativo) return null
  return { session, user: session.user, perfil }
}

export function podeVerFinanceiro(papel: PapelUsuario) {
  return papel === 'dono'
}

export function podeGerenciarOperacao(papel: PapelUsuario) {
  return papel === 'dono' || papel === 'recepcao'
}
