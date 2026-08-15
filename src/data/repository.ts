import { getSupabaseClient, supabaseConfigurado } from '../lib/supabase'
import type { Cliente, ItemAtendido, OrdemServico } from '../domain/entities'
import { criarOrdemDemo, listarOrdensDemo, obterOrdemDemo } from './demo-store'

export type NovaOrdemInput = {
  clienteNome: string
  telefone: string
  tipo: ItemAtendido['tipo']
  identificacao: string
  descricao: string
  problema: string
}

export type OrdemCompleta = {
  ordem: OrdemServico
  cliente?: Cliente
  item?: ItemAtendido
}

export const modoDados = supabaseConfigurado() ? 'supabase' : 'demo'

export async function listarOrdens(): Promise<OrdemCompleta[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return listarOrdensDemo()

  const { data, error } = await supabase
    .from('ordens_servico')
    .select('id,numero,problema_relatado,status,tecnico_id,created_at,updated_at,clientes(id,nome,telefone,email,created_at),itens_atendidos(id,tipo,identificacao,descricao,cliente_id,created_at)')
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map((row: any) => ({
    ordem: {
      id: row.id,
      numero: Number(row.numero),
      clienteId: row.clientes.id,
      itemId: row.itens_atendidos.id,
      problemaRelatado: row.problema_relatado,
      status: row.status,
      tecnicoId: row.tecnico_id ?? undefined,
      criadoEm: row.created_at,
      atualizadoEm: row.updated_at,
    },
    cliente: {
      id: row.clientes.id,
      nome: row.clientes.nome,
      telefone: row.clientes.telefone,
      email: row.clientes.email ?? undefined,
      criadoEm: row.clientes.created_at,
    },
    item: {
      id: row.itens_atendidos.id,
      clienteId: row.itens_atendidos.cliente_id,
      tipo: row.itens_atendidos.tipo,
      identificacao: row.itens_atendidos.identificacao,
      descricao: row.itens_atendidos.descricao,
      criadoEm: row.itens_atendidos.created_at,
    },
  }))
}

export async function obterOrdem(id: string): Promise<OrdemCompleta | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return obterOrdemDemo(id) ?? null

  const ordens = await listarOrdens()
  return ordens.find(({ ordem }) => ordem.id === id) ?? null
}

export async function criarOrdem(input: NovaOrdemInput): Promise<OrdemCompleta> {
  const supabase = getSupabaseClient()
  if (!supabase) return criarOrdemDemo(input)

  const { data: cliente, error: clienteError } = await supabase
    .from('clientes')
    .insert({ nome: input.clienteNome.trim(), telefone: input.telefone.trim() })
    .select('id,nome,telefone,email,created_at')
    .single()
  if (clienteError) throw clienteError

  const { data: item, error: itemError } = await supabase
    .from('itens_atendidos')
    .insert({ cliente_id: cliente.id, tipo: input.tipo, identificacao: input.identificacao.trim(), descricao: input.descricao.trim() })
    .select('id,cliente_id,tipo,identificacao,descricao,created_at')
    .single()
  if (itemError) throw itemError

  const { data: ordem, error: ordemError } = await supabase
    .from('ordens_servico')
    .insert({ cliente_id: cliente.id, item_id: item.id, problema_relatado: input.problema.trim() })
    .select('id,numero,cliente_id,item_id,problema_relatado,status,tecnico_id,created_at,updated_at')
    .single()
  if (ordemError) throw ordemError

  await supabase.from('os_status_historico').insert({ ordem_servico_id: ordem.id, status: ordem.status, alterado_por: (await supabase.auth.getUser()).data.user?.id })

  return {
    ordem: { id: ordem.id, numero: Number(ordem.numero), clienteId: ordem.cliente_id, itemId: ordem.item_id, problemaRelatado: ordem.problema_relatado, status: ordem.status, tecnicoId: ordem.tecnico_id ?? undefined, criadoEm: ordem.created_at, atualizadoEm: ordem.updated_at },
    cliente: { id: cliente.id, nome: cliente.nome, telefone: cliente.telefone, email: cliente.email ?? undefined, criadoEm: cliente.created_at },
    item: { id: item.id, clienteId: item.cliente_id, tipo: item.tipo, identificacao: item.identificacao, descricao: item.descricao, criadoEm: item.created_at },
  }
}
